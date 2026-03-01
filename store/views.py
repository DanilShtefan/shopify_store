from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
import json
from .models import Product, Cart, CartItem, Wishlist, WishlistItem, ProductImage, FailedLoginAttempt, Category, Address
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import RegisterSerializer, UserSerializer, OrderCreateSerializer
from .models import Order, OrderItem
from django.conf import settings
from django.http import HttpResponse, JsonResponse


def set_jwt_cookies(response, access_token, refresh_token):
    """
    Устанавливает httpOnly cookie с JWT токенами.
    """
    cookie_settings = settings.JWT_AUTH_COOKIE

    # Access token cookie
    access_config = cookie_settings.get('access_token', {})
    response.set_cookie(
        key='access_token',
        value=str(access_token),
        httponly=access_config.get('httponly', True),
        secure=access_config.get('secure', False),
        samesite=access_config.get('samesite', 'Lax'),
        max_age=access_config.get('max_age', 60 * 60),
    )

    # Refresh token cookie
    refresh_config = cookie_settings.get('refresh_token', {})
    response.set_cookie(
        key='refresh_token',
        value=str(refresh_token),
        httponly=refresh_config.get('httponly', True),
        secure=refresh_config.get('secure', False),
        samesite=refresh_config.get('samesite', 'Lax'),
        max_age=refresh_config.get('max_age', 60 * 60 * 24),
    )

    return response


def clear_jwt_cookies(response):
    """
    Удаляет httpOnly cookie с JWT токенами.
    """
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response


def json_response_with_cookies(data, cookies=None, status=200):
    """
    Создаёт JsonResponse с установленными cookie.
    """
    response = JsonResponse(data, status=status)
    if cookies:
        for name, value, options in cookies:
            response.set_cookie(name, value, **options)
    return response

@ensure_csrf_cookie
def category_list(request):
    """Список всех категорий (только корневые, без родителей)"""
    categories = Category.objects.filter(parent__isnull=True)
    data = [
        {
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'products_count': cat.get_products_count(),
            'children': [
                {
                    'id': child.id,
                    'name': child.name,
                    'slug': child.slug,
                    'products_count': child.get_products_count(),
                }
                for child in cat.children.all()
            ]
        }
        for cat in categories
    ]
    return JsonResponse({'categories': data})

@ensure_csrf_cookie
def product_list(request):
    """Список товаров с поддержкой фильтрации по категории и пагинации"""
    category_slug = request.GET.get('category')
    
    # Параметры пагинации
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 12))
    except (ValueError, TypeError):
        page = 1
        per_page = 12
    
    # Ограничения для per_page
    per_page = max(1, min(per_page, 100))  # от 1 до 100
    page = max(1, page)  # не меньше 1
    
    if category_slug:
        try:
            category = Category.objects.get(slug=category_slug)
            # Включаем товары из дочерних категорий
            category_ids = [category.id]
            if category.children.exists():
                category_ids.extend(cat.id for cat in category.children.all())
            products = Product.objects.filter(category_id__in=category_ids)
        except Category.DoesNotExist:
            return JsonResponse({'products': [], 'error': 'Категория не найдена', 'total': 0, 'page': page, 'per_page': per_page, 'total_pages': 0})
    else:
        products = Product.objects.all()
    
    # Получаем общее количество
    total = products.count()
    
    # Пагинация
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    products_page = products[start_idx:end_idx]
    
    # Формируем ответ
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
            'category': {
                'id': p.category.id,
                'name': p.category.name,
                'slug': p.category.slug,
            } if p.category else None,
        }
        for p in products_page
    ]
    
    return JsonResponse({
        'products': data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page,
    })

@ensure_csrf_cookie
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

@ensure_csrf_cookie
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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

# TODO: Вернуть @ensure_csrf_cookie в production!
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
@ensure_csrf_cookie
def register_view(request):
    """
    Регистрация пользователя + установка JWT cookie.
    Принимает: username, password, password2, email
    Возвращает: данные пользователя
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        # Создаём пользователя
        user = serializer.save()

        # Автоматический логин после регистрации
        login(request, user)

        # Генерируем токены
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['email'] = user.email

        access_token = refresh.access_token
        
        # Создаём ответ с данными пользователя
        response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        
        # Устанавливаем cookie с токенами
        set_jwt_cookies(response, access_token, refresh)
        
        return response

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_client_ip(request):
    """Получение IP адреса клиента"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def check_lockout(username, ip_address):
    """
    Проверка блокировки.
    Возвращает (is_locked, remaining_seconds)
    """
    try:
        attempt = FailedLoginAttempt.objects.get(username=username)
        if attempt.is_locked():
            return True, attempt.get_lockout_remaining()
    except FailedLoginAttempt.DoesNotExist:
        pass
    
    return False, 0


def record_failed_attempt(username, ip_address):
    """
    Запись неудачной попытки входа.
    Блокирует после MAX_ATTEMPTS попыток.
    """
    max_attempts = settings.ACCOUNT_LOCKOUT['MAX_ATTEMPTS']
    lockout_time = settings.ACCOUNT_LOCKOUT['LOCKOUT_TIME']
    
    attempt, created = FailedLoginAttempt.objects.get_or_create(
        username=username,
        ip_address=ip_address,
    )
    
    if not created:
        # Проверяем, не истёк ли период блокировки
        if attempt.is_locked():
            return
        
        # Сбрасываем счётчик если прошло достаточно времени
        time_since_last = timezone.now() - attempt.last_attempt
        if time_since_last > timedelta(seconds=lockout_time):
            attempt.failed_attempts = 1
            attempt.locked_until = None
        else:
            attempt.failed_attempts += 1
    
    # Блокируем если превышен лимит
    if attempt.failed_attempts >= max_attempts:
        attempt.locked_until = timezone.now() + timedelta(seconds=lockout_time)
    
    attempt.last_attempt = timezone.now()
    attempt.save()


def reset_failed_attempts(username):
    """Сброс неудачных попыток после успешного входа"""
    try:
        attempt = FailedLoginAttempt.objects.get(username=username)
        attempt.delete()
    except FailedLoginAttempt.DoesNotExist:
        pass


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_view(request):
    """
    Логин пользователя.
    Принимает: username, password
    Возвращает: данные пользователя + устанавливает JWT cookie

    Защита от брутфорса:
    - Блокировка после 5 неудачных попыток
    - Время блокировки: 15 минут
    """
    username = request.data.get('username')
    password = request.data.get('password')
    ip_address = get_client_ip(request)

    if not username or not password:
        return Response(
            {'error': 'Введите username и пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Проверяем блокировку
    is_locked, remaining = check_lockout(username, ip_address)
    if is_locked:
        minutes = remaining // 60
        seconds = remaining % 60
        return Response(
            {
                'error': 'Аккаунт заблокирован после множественных неудачных попыток',
                'locked': True,
                'remaining_seconds': remaining,
                'message': f'Попробуйте через {minutes} мин {seconds} сек'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Проверяем логин/пароль
    user = authenticate(username=username, password=password)

    if user is None:
        # Записываем неудачную попытку
        record_failed_attempt(username, ip_address)

        # Проверяем, не заблокировались ли мы после этой попытки
        is_locked, remaining = check_lockout(username, ip_address)
        if is_locked:
            minutes = remaining // 60
            seconds = remaining % 60
            return Response(
                {
                    'error': 'Превышено максимальное количество попыток',
                    'locked': True,
                    'remaining_seconds': remaining,
                    'message': f'Аккаунт заблокирован. Попробуйте через {minutes} мин {seconds} сек'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {'error': 'Неверный логин или пароль'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Успешный вход — сбрасываем попытки
    reset_failed_attempts(username)

    # Логин пользователя (создаём сессию)
    login(request, user)

    # Генерируем токены
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    refresh['email'] = user.email

    access_token = refresh.access_token
    
    # Создаём ответ с данными пользователя
    response = Response(UserSerializer(user).data)
    
    # Устанавливаем cookie с токенами
    set_jwt_cookies(response, access_token, refresh)
    
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Выход пользователя (очистка сессии и cookie).
    """
    logout(request)
    response = Response({'message': 'Вы успешно вышли'})
    clear_jwt_cookies(response)
    return response


@api_view(['GET'])
@ensure_csrf_cookie
def csrf_token_view(request):
    """
    Получить CSRF токен.
    """
    return Response({'csrfToken': request.META.get('CSRF_COOKIE')})


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def token_refresh_view(request):
    """
    Обновление access токена.
    Получает refresh токен из cookie и устанавливает новый access токен в cookie.
    """
    # Получаем refresh токен из cookie
    refresh_token_str = request.COOKIES.get('refresh_token')

    if not refresh_token_str:
        # Пробуем получить из тела запроса (для обратной совместимости)
        refresh_token_str = request.data.get('refresh')
    
    if not refresh_token_str:
        return Response(
            {'error': 'Refresh токен обязателен'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        refresh = RefreshToken(refresh_token_str)
        access_token = refresh.access_token
        
        response = Response({'access': str(access_token)})
        
        # Обновляем access токен в cookie
        set_jwt_cookies(response, access_token, refresh)
        
        return response
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


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_update_view(request):
    """
    Обновление профиля текущего пользователя.
    Требует авторизации (JWT токен в заголовке).
    """
    user = request.user
    data = request.data.copy()
    
    # Нельзя изменить username на существующий
    if 'username' in data and data['username'] != user.username:
        if User.objects.filter(username=data['username']).exists():
            return Response(
                {'username': 'Пользователь с таким именем уже существует'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    serializer = UserSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# === АДРЕСА ===
from rest_framework import serializers
from django.views.decorators.csrf import csrf_exempt

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'address_full', 'postal_code', 'city', 'street', 'house', 'apartment', 'phone', 'is_default']
        read_only_fields = ['id']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def address_list(request):
    """Получить все адреса текущего пользователя."""
    addresses = Address.objects.filter(user=request.user)
    data = [{
        'id': a.id,
        'address_full': a.address_full,
        'postal_code': a.postal_code,
        'city': a.city,
        'street': a.street,
        'house': a.house,
        'apartment': a.apartment,
        'postal_code': a.postal_code,
        'phone': a.phone,
        'is_default': a.is_default,
    } for a in addresses]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def address_create(request):
    """Добавить новый адрес."""
    serializer = AddressSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def address_update(request, pk):
    """Обновить адрес."""
    try:
        address = Address.objects.get(pk=pk, user=request.user)
    except Address.DoesNotExist:
        return Response({'error': 'Адрес не найден'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = AddressSerializer(address, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def address_delete(request, pk):
    """Удалить адрес."""
    try:
        address = Address.objects.get(pk=pk, user=request.user)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Address.DoesNotExist:
        return Response({'error': 'Адрес не найден'}, status=status.HTTP_404_NOT_FOUND)


# === ЗАКАЗЫ ===
from .forms import OrderItemSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def order_create(request):
    """
    Оформление заказа.
    Принимает: address_id, phone, email, comment, items (список товаров)
    """
    serializer = OrderCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Получаем адрес
        address = Address.objects.get(id=data['address_id'])
        
        # Считаем суммы
        subtotal = 0
        for item in data['items']:
            product = Product.objects.get(id=item['product_id'])
            subtotal += float(product.price) * item['quantity']
        
        # Создаём заказ
        order = Order.objects.create(
            user=request.user,
            shipping_address=address,
            phone=data['phone'],
            email=data['email'],
            comment=data.get('comment', ''),
            subtotal=subtotal,
            shipping_cost=0,  # Можно добавить логику доставки
            total=subtotal,  # subtotal + shipping
        )
        
        # Создаём позиции заказа
        for item in data['items']:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price,
            )
            
            # Уменьшаем количество товара на складе
            product.stock -= item['quantity']
            product.save()
        
        # Очищаем корзину пользователя (если есть)
        from .models import Cart
        try:
            cart = Cart.objects.get(session_id=request.session.session_key)
            cart.items.all().delete()
        except (Cart.DoesNotExist, AttributeError):
            pass
        
        # Возвращаем данные заказа
        return Response({
            'order_number': order.order_number,
            'status': order.status,
            'total': str(order.total),
            'message': 'Заказ успешно оформлен!'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    """Список заказов пользователя"""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    data = [{
        'id': order.id,
        'order_number': order.order_number,
        'status': order.get_status_display(),
        'total': str(order.total),
        'created_at': order.created_at.isoformat(),
        'items_count': order.items.count(),
    } for order in orders]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_number):
    """Детальная информация о заказе"""
    try:
        order = Order.objects.get(order_number=order_number, user=request.user)
        data = {
            'order_number': order.order_number,
            'status': order.get_status_display(),
            'total': str(order.total),
            'subtotal': str(order.subtotal),
            'shipping_cost': str(order.shipping_cost),
            'created_at': order.created_at.isoformat(),
            'shipping_address': order.shipping_address_snapshot,
            'phone': order.phone,
            'email': order.email,
            'comment': order.comment,
            'items': [{
                'product_id': item.product.id,
                'product_name': item.product.name,
                'product_slug': item.product.slug,
                'quantity': item.quantity,
                'price': str(item.price),
                'subtotal': str(item.subtotal),
            } for item in order.items.all()]
        }
        return Response(data)
    except Order.DoesNotExist:
        return Response({'error': 'Заказ не найден'}, status=status.HTTP_404_NOT_FOUND)