from django.contrib import admin
from .models import Product, ProductImage, Cart, CartItem, Wishlist, WishlistItem, FailedLoginAttempt

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_url', 'is_main')

@admin.register(Product)
class AdminProduct(admin.ModelAdmin):
    list_display = ("id", "name", "price", "stock", "created_at")
    list_editable = ("price", "stock")
    search_fields = ("name", "description")
    list_filter = ("stock", "created_at")
    ordering = ('-created_at',)
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