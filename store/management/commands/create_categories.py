"""
Скрипт для создания тестовых категорий.
Запуск: python manage.py create_categories
"""
import sys
import io
from django.core.management.base import BaseCommand
from store.models import Category, Product

# Исправление кодировки для Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


class Command(BaseCommand):
    help = 'Создание тестовых категорий для товаров'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('\n[CREATE] Создание категорий...\n'))

        # Корневые категории
        electronics = self.create_category('Электроника', 'electronics', 'Гаджеты и электронные устройства')
        clothing = self.create_category('Одежда', 'clothing', 'Мужская, женская и детская одежда')
        home = self.create_category('Дом и сад', 'home-garden', 'Всё для дома, сада и огорода')
        sports = self.create_category('Спорт', 'sports', 'Спортивные товары и инвентарь')
        books = self.create_category('Книги', 'books', 'Художественная и учебная литература')

        # Подкатегории электроники
        phones = self.create_category('Смартфоны', 'phones', 'Мобильные телефоны', electronics)
        laptops = self.create_category('Ноутбуки', 'laptops', 'Ноутбуки и ультрабуки', electronics)
        tablets = self.create_category('Планшеты', 'tablets', 'Планшетные компьютеры', electronics)
        cameras = self.create_category('Фотоаппараты', 'cameras', 'Цифровые камеры', electronics)

        # Подкатегории одежды
        men = self.create_category('Мужская', 'men', 'Мужская одежда', clothing)
        women = self.create_category('Женская', 'women', 'Женская одежда', clothing)
        kids = self.create_category('Детская', 'kids', 'Детская одежда', clothing)

        # Подкатегории дома
        furniture = self.create_category('Мебель', 'furniture', 'Домашняя мебель', home)
        kitchen = self.create_category('Кухня', 'kitchen', 'Посуда и кухонные принадлежности', home)
        garden = self.create_category('Сад', 'garden', 'Садовый инвентарь', home)

        self.stdout.write('\n' + self.style.SUCCESS('===>>> ГОТОВО!'))
        self.stdout.write(self.style.SUCCESS(f'Всего категорий: {Category.objects.count()}\n'))

        # Показываем все категории
        self.show_categories()

        # Предлагаем назначить товары
        self.assign_products()

    def create_category(self, name, slug, description='', parent=None):
        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'description': description,
                'parent': parent,
            }
        )
        if created:
            prefix = '  [+] ' if parent is None else '      - '
            self.stdout.write(f'{prefix}{category}')
        else:
            prefix = '  [~] ' if parent is None else '      - '
            self.stdout.write(f'{prefix}{category} (уже существует)')
        return category

    def show_categories(self):
        self.stdout.write('\n>>> СПИСОК КАТЕГОРИЙ:')
        self.stdout.write('=' * 60)
        
        root_categories = Category.objects.filter(parent__isnull=True)
        for cat in root_categories:
            count = cat.get_products_count()
            self.stdout.write(f'[*] {cat.name} ({cat.slug}) — товаров: {count}')
            
            children = cat.children.all()
            for child in children:
                child_count = child.get_products_count()
                self.stdout.write(f'    -> {child.name} ({child.slug}) — товаров: {child_count}')
        
        self.stdout.write('=' * 60)

    def assign_products(self):
        products = Product.objects.filter(category__isnull=True)
        
        if products.count() == 0:
            self.stdout.write(self.style.WARNING('\n[WARN] Нет товаров без категории'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'\n[INFO] Найдено товаров без категории: {products.count()}'))
        self.stdout.write('Назначаю случайные категории...\n')

        categories = list(Category.objects.filter(parent__isnull=True))
        
        for i, product in enumerate(products):
            category = categories[i % len(categories)]
            product.category = category
            product.save()
            self.stdout.write(f'  {product.name[:30]:<30} -> {category.name}')

        self.stdout.write(self.style.SUCCESS(f'\n===>>> Назначено товаров: {products.count()}\n'))
