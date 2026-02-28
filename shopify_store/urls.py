from django.contrib import admin
from django.urls import path
from store.views import (
    product_list,
    product_detail,
    product_search,
    cart_detail,
    cart_add_item,
    cart_update_item,
    cart_remove_item,
    wishlist_detail,
    wishlist_add_item,
    wishlist_remove_item,
    # Категории
    category_list,
    category_detail,
    # Авторизация
    register_view,
    login_view,
    logout_view,
    csrf_token_view,
    token_refresh_view,
    profile_view,
    profile_update_view,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Категории
    path('api/categories/', category_list, name='category_list'),
    path('api/categories/<slug:slug>/', category_detail, name='category_detail'),

    # Товары
    path('api/products/', product_list, name='product_list'),
    path('api/products/<slug:slug>/', product_detail, name='product_detail'),
    path('api/search/', product_search, name='product_search'),

    # Корзина
    path('api/cart/<str:session_id>/', cart_detail, name='cart_detail'),
    path('api/cart/<str:session_id>/add/', cart_add_item, name='cart_add_item'),
    path('api/cart/<str:session_id>/update/<int:item_id>/', cart_update_item, name='cart_update_item'),
    path('api/cart/<str:session_id>/remove/<int:item_id>/', cart_remove_item, name='cart_remove_item'),

    # Избранное
    path('api/wishlist/<str:session_id>/', wishlist_detail, name='wishlist_detail'),
    path('api/wishlist/<str:session_id>/add/', wishlist_add_item, name='wishlist_add_item'),
    path('api/wishlist/<str:session_id>/remove/<int:item_id>/', wishlist_remove_item, name='wishlist_remove_item'),

    # === АВТОРИЗАЦИЯ ===
    path('api/auth/register/', register_view, name='register'),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/csrf/', csrf_token_view, name='csrf_token'),
    path('api/auth/token/refresh/', token_refresh_view, name='token_refresh'),
    path('api/auth/profile/', profile_view, name='profile'),
    path('api/auth/profile/update/', profile_update_view, name='profile_update'),
]
