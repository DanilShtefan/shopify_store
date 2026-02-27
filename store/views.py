from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Product, Cart, CartItem, Wishlist, WishlistItem, ProductImage

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