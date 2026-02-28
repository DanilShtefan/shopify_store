"""
Скрипт для создания тестовых товаров.
Запуск: python manage.py create_products
"""
import sys
import io
from django.utils.text import slugify

# Исправление кодировки для Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from django.core.management.base import BaseCommand
from store.models import Category, Product, ProductImage


# Транслитерация для русских названий
def translit_slug(text):
    """Преобразует русский текст в латинский slug"""
    translit_table = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '-', '_': '', '"': '', "'": '',
    }
    
    text = text.lower().strip()
    result = ''
    for char in text:
        result += translit_table.get(char, char)
    
    # Удаляем повторяющиеся дефисы
    while '--' in result:
        result = result.replace('--', '-')
    
    return result.strip('-')


class Command(BaseCommand):
    help = 'Создание тестовых товаров с категориями'

    def handle(self, *args, **kwargs):
        self.stdout.write('>>> Создание тестовых товаров...\n')

        # Получаем категории
        electronics = Category.objects.filter(slug='electronics').first()
        phones = Category.objects.filter(slug='phones').first()
        laptops = Category.objects.filter(slug='laptops').first()
        clothing = Category.objects.filter(slug='clothing').first()
        men = Category.objects.filter(slug='men').first()
        women = Category.objects.filter(slug='women').first()
        home = Category.objects.filter(slug='home-garden').first()
        sports = Category.objects.filter(slug='sports').first()

        # Товары
        products_data = [
            # Электроника - Смартфоны
            {
                'name': 'iPhone 15 Pro',
                'price': 99900,
                'stock': 25,
                'description': 'Флагманский смартфон от Apple с титановым корпусом',
                'category': phones,
                'image': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
            },
            {
                'name': 'Samsung Galaxy S24 Ultra',
                'price': 89900,
                'stock': 30,
                'description': 'Мощный Android смартфон с S Pen',
                'category': phones,
                'image': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
            },
            {
                'name': 'Google Pixel 8 Pro',
                'price': 69900,
                'stock': 15,
                'description': 'Чистый Android и лучшая камера',
                'category': phones,
                'image': 'https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=500',
            },
            
            # Электроника - Ноутбуки
            {
                'name': 'MacBook Pro 16"',
                'price': 249900,
                'stock': 10,
                'description': 'Профессиональный ноутбук с M3 Max',
                'category': laptops,
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
            },
            {
                'name': 'Dell XPS 15',
                'price': 149900,
                'stock': 12,
                'description': 'Премиальный ультрабук на Windows',
                'category': laptops,
                'image': 'https://images.unsplash.com/photo-1588872657578-a3d2af9f8e75?w=500',
            },
            {
                'name': 'ASUS ROG Zephyrus G14',
                'price': 179900,
                'stock': 8,
                'description': 'Игровой ноутбук в компактном корпусе',
                'category': laptops,
                'image': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500',
            },
            
            # Одежда - Мужская
            {
                'name': 'Мужская футболка Basic',
                'price': 1990,
                'stock': 100,
                'description': 'Классическая хлопковая футболка',
                'category': men,
                'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            },
            {
                'name': 'Джинсы Levi\'s 501',
                'price': 8990,
                'stock': 50,
                'description': 'Легендарные прямые джинсы',
                'category': men,
                'image': 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500',
            },
            {
                'name': 'Рубашка Oxford',
                'price': 4990,
                'stock': 40,
                'description': 'Классическая рубашка из оксфордской ткани',
                'category': men,
                'image': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
            },
            
            # Одежда - Женская
            {
                'name': 'Платье летнее',
                'price': 3990,
                'stock': 35,
                'description': 'Лёгкое платье из натурального хлопка',
                'category': women,
                'image': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
            },
            {
                'name': 'Блузка шёлковая',
                'price': 5990,
                'stock': 25,
                'description': 'Элегантная блузка из натурального шёлка',
                'category': women,
                'image': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500',
            },
            {
                'name': 'Юбка карандаш',
                'price': 3490,
                'stock': 30,
                'description': 'Классическая юбка для офиса',
                'category': women,
                'image': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500',
            },
            
            # Дом и сад
            {
                'name': 'Набор постельного белья',
                'price': 4990,
                'stock': 45,
                'description': 'Комплект из 100% хлопка сатин',
                'category': home,
                'image': 'https://images.unsplash.com/photo-1522771753035-4a50423a5a63?w=500',
            },
            {
                'name': 'Торшер современный',
                'price': 7990,
                'stock': 20,
                'description': 'Напольный светильник в стиле минимализм',
                'category': home,
                'image': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
            },
            {
                'name': 'Набор садовых инструментов',
                'price': 2990,
                'stock': 35,
                'description': '5 предметов для ухода за садом',
                'category': home,
                'image': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
            },
            
            # Спорт
            {
                'name': 'Коврик для йоги',
                'price': 1990,
                'stock': 60,
                'description': 'Не скользящий коврик 6мм',
                'category': sports,
                'image': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
            },
            {
                'name': 'Гантели разборные',
                'price': 4990,
                'stock': 25,
                'description': 'Набор до 20 кг с замками',
                'category': sports,
                'image': 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500',
            },
            {
                'name': 'Беговая дорожка',
                'price': 49990,
                'stock': 5,
                'description': 'Домашняя дорожка с 12 программами',
                'category': sports,
                'image': 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500',
            },
        ]

        created_count = 0
        updated_count = 0

        for data in products_data:
            # Генерируем правильный slug на английском
            slug = translit_slug(data['name'])
            
            # Создаём товар без изображения
            product_data = {k: v for k, v in data.items() if k != 'image'}
            product, created = Product.objects.update_or_create(
                slug=slug,
                defaults=product_data
            )
            
            # Добавляем изображение если есть
            if data.get('image') and not product.images.exists():
                ProductImage.objects.create(
                    product=product,
                    image_url=data['image'],
                    is_main=True
                )
            
            if created:
                self.stdout.write(f'[+] Создан: {product.name} ({product.category})')
                created_count += 1
            else:
                self.stdout.write(f'[~] Обновлён: {product.name}')
                updated_count += 1

        self.stdout.write(f'\n===>>> ГОТОВО!')
        self.stdout.write(f'Создано товаров: {created_count}')
        self.stdout.write(f'Обновлено товаров: {updated_count}')
        self.stdout.write(f'Всего товаров: {Product.objects.count()}\n')

        # Показываем статистику по категориям
        self.stdout.write('\n>>> СТАТИСТИКА ПО КАТЕГОРИЯМ:')
        self.stdout.write('=' * 60)
        for cat in Category.objects.filter(parent__isnull=True):
            count = cat.get_products_count()
            if count > 0:
                self.stdout.write(f'{cat.name}: {count} тов.')
        self.stdout.write('=' * 60)
