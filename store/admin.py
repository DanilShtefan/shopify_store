from django.contrib import admin
from .models import Product, ProductImage

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