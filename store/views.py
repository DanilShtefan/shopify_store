from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
import json
from .models import Product, Cart, CartItem, Wishlist, WishlistItem, ProductImage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import RegisterSerializer, UserSerializer

@csrf_exempt
def product_list(request):
    products = Product.objects.all()
    data = [
        {
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': str(p.price),
            'stock': p.stock,
            'image': p.get_main_image(),
            'images': [
                {'id': img.id, 'url': img.image_url, 'is_main': img.is_main}
                for img in p.images.all()
            ],
            'slug': p.slug,
        }
        for p in products
    ]
    return JsonResponse({'products': data})

@csrf_exempt
def product_search(request):
    """Поиск товаров по названию и описанию"""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return JsonResponse({'products': [], 'query': ''})
    
    products = Product.objects.filter(
        Q(name__icontains=query) | Q(description__icontains=query)
    )[:10]  # Ограничим 10 результатами
    
    data = [
        {
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': str(p.price),
            'stock': p.stock,
            'image': p.get_main_image(),
            'slug': p.slug,
        }
        for p in products
    ]
    return JsonResponse({'products': data, 'query': query})

def product_detail(request, slug):
    try:
        product = Product.objects.get(slug=slug)
        data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': str(product.price),
            'stock': product.stock,
            'image': product.get_main_image(),
            'images': [
                {'id': img.id, 'url': img.image_url, 'is_main': img.is_main}
                for img in product.images.all()
            ],
            'slug': product.slug,
        }
        return JsonResponse(data)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)


# === КОРЗИНА ===

@csrf_exempt
def cart_detail(request, session_id):
    """Получить корзину"""
    try:
        cart = Cart.objects.get(session_id=session_id)
        items = cart.items.select_related('product').all()
        data = {
            'id': cart.id,
            'session_id': cart.session_id,
            'items': [
                {
                    'id': item.id,
                    'product_id': item.product.id,
                    'product_name': item.product.name,
                    'product_slug': item.product.slug,
                    'product_image': item.product.get_main_image(),
                    'quantity': item.quantity,
                    'price': str(item.product.price),
                    'subtotal': str(item.get_subtotal()),
                    'product_stock': item.product.stock,
                }
                for item in items
            ],
            'total': str(cart.get_total()),
            'items_count': cart.get_items_count(),
        }
        return JsonResponse(data)
    except Cart.DoesNotExist:
        return JsonResponse({'error': 'Cart not found'}, status=404)

@csrf_exempt
def cart_add_item(request, session_id):
    """Добавить товар в корзину"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=400)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        product = Product.objects.get(id=product_id)
        
        # ← ПРОВЕРКА: нельзя добавить больше чем на складе
        if quantity > product.stock:
            return JsonResponse({
                'error': f'Недостаточно товара на складе. Доступно: {product.stock}'
            }, status=400)
        
        # ← ПРОВЕРКА: если товар уже в корзине
        cart, _ = Cart.objects.get_or_create(session_id=session_id)
        cart_item = CartItem.objects.filter(cart=cart, product=product).first()
        
        if cart_item:
            # Если уже есть в корзине — проверяем общее количество
            if cart_item.quantity + quantity > product.stock:
                return JsonResponse({
                    'error': f'Недостаточно товара на складе. Доступно: {product.stock}'
                }, status=400)
            cart_item.quantity += quantity
            cart_item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity)
        
        return cart_detail(request, session_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

@csrf_exempt
def cart_update_item(request, session_id, item_id):
    """Обновить количество товара"""
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=400)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        quantity = data.get('quantity', 1)
        
        cart = Cart.objects.get(session_id=session_id)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        
        # ← ПРОВЕРКА: нельзя установить больше чем на складе
        if quantity > cart_item.product.stock:
            return JsonResponse({
                'error': f'Недостаточно товара на складе. Доступно: {cart_item.product.stock}'
            }, status=400)
        
        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        return cart_detail(request, session_id)
    except CartItem.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)
    except Cart.DoesNotExist:
        return JsonResponse({'error': 'Cart not found'}, status=404)

@csrf_exempt
def cart_remove_item(request, session_id, item_id):
    """Удалить товар из корзины"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=400)

    try:
        cart = Cart.objects.get(session_id=session_id)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
        return cart_detail(request, session_id)
    except CartItem.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)
    except Cart.DoesNotExist:
        return JsonResponse({'error': 'Cart not found'}, status=404)


# === ИЗБРАННОЕ ===

@csrf_exempt
def wishlist_detail(request, session_id):
    """Получить избранное"""
    try:
        wishlist = Wishlist.objects.get(session_id=session_id)
        items = wishlist.items.select_related('product').all()
        data = {
            'id': wishlist.id,
            'session_id': wishlist.session_id,
            'items': [
                {
                    'id': item.id,
                    'product_id': item.product.id,
                    'product_name': item.product.name,
                    'product_slug': item.product.slug,
                    'product_image': item.product.get_main_image(),
                    'product_price': str(item.product.price),
                    'product_stock': item.product.stock,
                }
                for item in items
            ],
            'items_count': items.count(),
        }
        return JsonResponse(data)
    except Wishlist.DoesNotExist:
        return JsonResponse({'error': 'Wishlist not found'}, status=404)

@csrf_exempt
def wishlist_add_item(request, session_id):
    """Добавить товар в избранное"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=400)

    try:
        data = json.loads(request.body.decode('utf-8'))
        product_id = data.get('product_id')

        product = Product.objects.get(id=product_id)
        wishlist, _ = Wishlist.objects.get_or_create(session_id=session_id)

        # Проверяем, есть ли уже в избранном
        wishlist_item = WishlistItem.objects.filter(wishlist=wishlist, product=product).first()
        if wishlist_item:
            return JsonResponse({'error': 'Товар уже в избранном'}, status=400)

        WishlistItem.objects.create(wishlist=wishlist, product=product)
        return wishlist_detail(request, session_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

@csrf_exempt
def wishlist_remove_item(request, session_id, item_id):
    """Удалить товар из избранного"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=400)

    try:
        wishlist = Wishlist.objects.get(session_id=session_id)
        wishlist_item = WishlistItem.objects.get(id=item_id, wishlist=wishlist)
        wishlist_item.delete()
        return wishlist_detail(request, session_id)
    except WishlistItem.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)
    except Wishlist.DoesNotExist:
        return JsonResponse({'error': 'Wishlist not found'}, status=404)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Регистрация пользователя + получение токенов.
    Принимает: username, password, password2, email
    Возвращает: access, refresh токены + данные пользователя
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        # Создаём пользователя
        user = serializer.save()
        
        # Генерируем токены
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['email'] = user.email
        
        return Response({
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Логин пользователя.
    Принимает: username, password
    Возвращает: access, refresh токены
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Введите username и пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Проверяем логин/пароль
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Неверный логин или пароль'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Генерируем токены
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    refresh['email'] = user.email
    
    return Response({
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh_view(request):
    """
    Обновление access токена.
    Принимает: refresh токен
    Возвращает: новый access токен
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh токен обязателен'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token)
        })
    except Exception as e:
        return Response(
            {'error': 'Неверный refresh токен'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Получение профиля текущего пользователя.
    Требует авторизации (JWT токен в заголовке).
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)