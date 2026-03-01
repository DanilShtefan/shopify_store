from django.contrib import admin
from .models import Product, ProductImage, Cart, CartItem, Wishlist, WishlistItem, FailedLoginAttempt, Category, Order, OrderItem, Address

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_url', 'is_main')

@admin.register(Category)
class AdminCategory(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'get_products_count', 'created_at')
    list_filter = ('parent', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)
    
    def get_products_count(self, obj):
        return obj.get_products_count()
    get_products_count.short_description = 'Товаров'

@admin.register(Product)
class AdminProduct(admin.ModelAdmin):
    list_display = ("id", "name", "category", "price", "stock", "created_at")
    list_editable = ("price", "stock", "category")
    search_fields = ("name", "description")
    list_filter = ("category", "stock", "created_at")
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]

@admin.register(FailedLoginAttempt)
class AdminFailedLoginAttempt(admin.ModelAdmin):
    list_display = ('username', 'ip_address', 'failed_attempts', 'last_attempt', 'locked_until', 'is_locked')
    list_filter = ('locked_until', 'last_attempt')
    search_fields = ('username', 'ip_address')
    readonly_fields = ('username', 'ip_address', 'failed_attempts', 'last_attempt', 'locked_until')
    ordering = ('-last_attempt',)
    
    def is_locked(self, obj):
        return obj.is_locked()
    is_locked.boolean = True
    is_locked.short_description = 'Заблокирован'


# === ЗАКАЗЫ ===

class OrderItemInline(admin.TabularInline):
    """Позиции заказа внутри заказа"""
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'subtotal')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class AdminOrder(admin.ModelAdmin):
    list_display = (
        'order_number',
        'user',
        'status',
        'total',
        'items_count',
        'created_at',
    )
    list_filter = ('status', 'created_at', 'shipping_address__city')
    search_fields = ('order_number', 'user__username', 'user__email', 'phone')
    readonly_fields = (
        'order_number',
        'user',
        'subtotal',
        'shipping_cost',
        'total',
        'created_at',
        'updated_at',
    )
    ordering = ('-created_at',)
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Основное', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Адрес доставки', {
            'fields': ('shipping_address', 'shipping_address_snapshot')
        }),
        ('Контакты', {
            'fields': ('phone', 'email')
        }),
        ('Суммы', {
            'fields': ('subtotal', 'shipping_cost', 'total')
        }),
        ('Комментарий', {
            'fields': ('comment',),
            'classes': ('collapse',)
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = 'Товаров'


@admin.register(OrderItem)
class AdminOrderItem(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'subtotal')
    list_filter = ('order__status', 'product__category')
    search_fields = ('order__order_number', 'product__name')
    readonly_fields = ('order', 'product', 'quantity', 'price', 'subtotal')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Address)
class AdminAddress(admin.ModelAdmin):
    list_display = (
        'user',
        'name',
        'city',
        'street',
        'house',
        'phone',
        'is_default',
    )
    list_filter = ('is_default', 'city')
    search_fields = ('user__username', 'city', 'street', 'phone')
    ordering = ('-is_default', '-created_at')