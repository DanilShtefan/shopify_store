from django.core.management.base import BaseCommand
from store.models import Product, Category, ProductImage
import random
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Генерация тестовых товаров с изображениями'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=1000,
            help='Количество товаров для создания'
        )
        parser.add_argument(
            '--images-per-product',
            type=int,
            default=3,
            help='Количество изображений для каждого товара'
        )

    def handle(self, *args, **kwargs):
        count = kwargs['count']
        images_per_product = kwargs['images_per_product']
        
        # Получаем все категории
        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write('Error: Сначала создайте категории!')
            return

        self.stdout.write(f'Creating {count} products with {images_per_product} images each...')
        
        # Названия товаров
        adjectives = [
            'Cool', 'Stylish', 'Quality', 'Reliable', 'Modern',
            'Elegant', 'Practical', 'Universal', 'Exclusive', 'Premium',
            'Eco', 'Innovative', 'Classic', 'Bright', 'Fashion'
        ]
        
        nouns = [
            'Product', 'Item', 'Article', 'Model', 'Gadget',
            'Accessory', 'Set', 'Kit', 'Device', 'Tool'
        ]

        # Пути к изображениям (заглушки)
        image_templates = [
            'https://picsum.photos/seed/{seed}/800/800.jpg',
            'https://picsum.photos/seed/{seed}/800/600.jpg',
            'https://picsum.photos/seed/{seed}/600/800.jpg',
        ]

        products = []
        for i in range(1, count + 1):
            cat = random.choice(categories)
            adj = random.choice(adjectives)
            noun = random.choice(nouns)
            name = f'{adj} {noun} #{i}'
            
            products.append(Product(
                name=name,
                slug=slugify(name) or f'product-{i}',
                description=f'Description for "{name}". Great choice for your needs.',
                price=round(random.uniform(10, 500), 2),
                stock=random.randint(0, 150),
                category=cat,
            ))
        
        # Bulk create товаров
        created_products = Product.objects.bulk_create(products, batch_size=100)
        
        self.stdout.write(f'Created {len(created_products)} products. Now adding images...')
        
        # Создаём изображения для каждого товара
        all_images = []
        for idx, product in enumerate(created_products):
            for img_idx in range(images_per_product):
                seed = f'{product.id}-{img_idx}'
                img_url = image_templates[img_idx % len(image_templates)].format(seed=seed)
                
                all_images.append(ProductImage(
                    product=product,
                    image_url=img_url,
                    is_main=(img_idx == 0),  # Первое изображение - главное
                ))
        
        # Bulk create изображений
        ProductImage.objects.bulk_create(all_images, batch_size=500)
        
        total_images = len(created_products) * images_per_product
        self.stdout.write(self.style.SUCCESS(f'Successfully created {count} products with {total_images} images!'))
        self.stdout.write(f'Categories used: {len(categories)}')
        self.stdout.write(f'Images per product: {images_per_product}')
