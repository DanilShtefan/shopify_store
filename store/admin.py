from django.contrib import admin
from .models import Product

@admin.register(Product)
class AdminProduct(admin.ModelAdmin):
    list_display = ("id", "name", "price", "stock", "created_at")
    list_editable = ("price", "stock")
    search_fields = ("name", "description")
    list_filter = ("stock", "created_at")
    ordering = ('-created_at',)