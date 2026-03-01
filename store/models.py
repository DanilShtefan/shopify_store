from django.db import models
from django.utils.text import slugify

# Create your models here.

class Category(models.Model):
    """
    Категория товаров.
    Поддерживает иерархию (родительские и дочерние категории).
    """
    name = models.CharField(max_length=100, verbose_name="Название")
    slug = models.SlugField(unique=True, blank=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Описание")
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name="Родительская категория"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['name']
    
    def __str__(self):
        # Показываем иерархию в названии
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_products_count(self):
        """Получить количество товаров в категории"""
        return self.products.count()


class Product(models.Model):
    """"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        null=True,
        blank=True,
        verbose_name="Категория"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_main_image(self):
        """Получить главное изображение (первое по порядку)"""
        main_image = self.images.filter(is_main=True).first()
        if main_image:
            return main_image.image_url
        first_image = self.images.first()
        if first_image:
            return first_image.image_url
        return ""

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"


class ProductImage(models.Model):
    """Изображение товара"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

    class Meta:
        ordering = ['is_main', 'created_at']
        verbose_name = "Изображение товара"
        verbose_name_plural = "Изображения товаров"

class Cart(models.Model):
    """Корзина покупателя"""
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart #{self.id}"
    
    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())
    
    def get_items_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Элемент корзины"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    def get_subtotal(self):
        return float(self.product.price) * self.quantity


class Wishlist(models.Model):
    """Избранное покупателя"""
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wishlist #{self.id}"


class WishlistItem(models.Model):
    """Элемент избранного"""
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product')
        verbose_name = "Избранный товар"
        verbose_name_plural = "Избранные товары"

    def __str__(self):
        return self.product.name


class FailedLoginAttempt(models.Model):
    """
    Отслеживание неудачных попыток входа для защиты от брутфорса.
    Блокировка происходит по username и/или IP адресу.
    """
    username = models.CharField(max_length=150, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    failed_attempts = models.PositiveIntegerField(default=1)
    last_attempt = models.DateTimeField(auto_now=True)
    locked_until = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        verbose_name = "Неудачная попытка входа"
        verbose_name_plural = "Неудачные попытки входа"
        ordering = ['-last_attempt']

    def __str__(self):
        return f"{self.username} - {self.failed_attempts} попыток"

    def is_locked(self):
        """Проверка, заблокирован ли аккаунт сейчас"""
        if not self.locked_until:
            return False
        from django.utils import timezone
        return timezone.now() < self.locked_until

    def get_lockout_remaining(self):
        """Оставшееся время блокировки в секундах"""
        if not self.locked_until:
            return 0
        from django.utils import timezone
        delta = self.locked_until - timezone.now()
        return max(0, int(delta.total_seconds()))


class Address(models.Model):
    """Адрес доставки пользователя"""
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='addresses',
        verbose_name="Пользователь"
    )
    
    # Тип адреса
    ADDRESS_TYPE_CHOICES = [
        ('apartment', 'Квартира'),
        ('house', 'Частный дом'),
    ]
    address_type = models.CharField(
        max_length=20,
        choices=ADDRESS_TYPE_CHOICES,
        default='apartment',
        verbose_name="Тип адреса"
    )
    
    # Полный адрес одной строкой (от DaData)
    address_full = models.TextField(
        verbose_name="Адрес",
        help_text="Введите адрес через автозаполнение",
        default=''
    )
    
    # Структурированные поля (заполняются автоматически из DaData)
    postal_code = models.CharField(
        max_length=20,
        verbose_name="Почтовый индекс"
    )
    city = models.CharField(
        max_length=100,
        verbose_name="Город"
    )
    street = models.CharField(
        max_length=200,
        verbose_name="Улица"
    )
    house = models.CharField(
        max_length=20,
        verbose_name="Дом"
    )
    apartment = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Квартира/Офис"
    )
    
    # Телефон для связи
    phone = models.CharField(
        max_length=20,
        verbose_name="Телефон для связи"
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name="Адрес по умолчанию"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата добавления"
    )

    class Meta:
        verbose_name = "Адрес"
        verbose_name_plural = "Адреса"
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.city}, {self.street}, {self.house}"


class OrderStatus(models.TextChoices):
    """Статусы заказа"""
    PENDING = 'pending', 'Ожидает подтверждения'
    CONFIRMED = 'confirmed', 'Подтверждён'
    PROCESSING = 'processing', 'В обработке'
    SHIPPED = 'shipped', 'Отправлен'
    DELIVERED = 'delivered', 'Доставлен'
    CANCELLED = 'cancelled', 'Отменён'


class Order(models.Model):
    """Заказ покупателя"""
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name="Пользователь"
    )
    order_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Номер заказа"
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        verbose_name="Статус"
    )
    
    # Адрес доставки
    shipping_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders',
        verbose_name="Адрес доставки"
    )
    shipping_address_snapshot = models.TextField(
        blank=True,
        verbose_name="Копия адреса на момент заказа"
    )
    
    # Контакты
    phone = models.CharField(
        max_length=20,
        verbose_name="Телефон"
    )
    email = models.EmailField(
        verbose_name="Email"
    )
    
    # Суммы
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Сумма товаров"
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Стоимость доставки"
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Итого"
    )
    
    # Комментарий
    comment = models.TextField(
        blank=True,
        verbose_name="Комментарий к заказу"
    )
    
    # Даты
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Дата обновления"
    )

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ #{self.order_number} ({self.user.username})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Генерируем номер заказа: ORD-YYYYMMDD-XXXX
            from datetime import datetime
            date_str = datetime.now().strftime('%Y%m%d')
            last_order = Order.objects.filter(
                order_number__startswith=f'ORD-{date_str}-'
            ).order_by('-order_number').first()
            
            if last_order:
                last_num = int(last_order.order_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.order_number = f'ORD-{date_str}-{new_num:04d}'
        
        # Сохраняем копию адреса
        if self.shipping_address and not self.shipping_address_snapshot:
            addr = self.shipping_address
            self.shipping_address_snapshot = (
                f"{addr.city}, {addr.street}, {addr.house}"
                f"{', ' + addr.apartment if addr.apartment else ''}"
            )
        
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Позиция заказа"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Заказ"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name="Товар"
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name="Количество"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Цена на момент заказа"
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Сумма"
    )

    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    def save(self, *args, **kwargs):
        self.subtotal = float(self.price) * self.quantity
        super().save(*args, **kwargs)
