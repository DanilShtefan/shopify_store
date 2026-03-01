from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для регистрации нового пользователя.
    Принимает: username, password, password2 (подтверждение), email, имя, фамилию.
    Проверяет, что пароли совпадают.
    """
    password = serializers.CharField(
        write_only=True,  # Пароль не вернётся в ответе API
        required=True,
        validators=[validate_password],
        error_messages={
            'required': 'Введите пароль',
        }
    )
    password2 = serializers.CharField(write_only=True, required=True)  # Подтверждение пароля

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},  # Имя необязательно
            'last_name': {'required': False},   # Фамилия необязательно
            'email': {
                'required': True,        # Email обязателен
                'error_messages': {
                    'required': 'Введите email',
                    'invalid': 'Введите корректный email',
                }
            },
            'username': {
                'error_messages': {
                    'required': 'Введите имя пользователя',
                    'unique': 'Пользователь с таким именем уже существует',
                }
            },
        }

    def validate(self, attrs):
        """Проверка: пароли должны совпадать"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                'password2': 'Пароли не совпадают!'
            })
        return attrs

    def create(self, validated_data):
        """Создание пользователя с хешированным паролем"""
        validated_data.pop('password2')  # Удаляем поле подтверждения
        user = User.objects.create_user(**validated_data)  # create_user сам хеширует пароль
        return user

    def validate_password(self, value):
        """Перевод ошибок пароля на русский"""
        try:
            validate_password(value)
        except Exception as e:
            errors = []
            for error in e.exceptions if hasattr(e, 'exceptions') else [e]:
                msg = str(error)
                if 'too short' in msg:
                    errors.append('Пароль должен содержать минимум 8 символов')
                elif 'too common' in msg:
                    errors.append('Пароль слишком простой')
                elif 'entirely numeric' in msg:
                    errors.append('Пароль не может состоять только из цифр')
                else:
                    errors.append(msg)
            raise serializers.ValidationError(errors)
        return value


class LoginSerializer(TokenObtainPairSerializer):
    """
    Сериализатор для логина.
    Наследуется от TokenObtainPairSerializer — это стандартный класс JWT для получения токенов.
    Возвращает пару токенов: access (для запросов) и refresh (для обновления access).
    """
    username = serializers.CharField(label='Имя пользователя')
    password = serializers.CharField(label='Пароль', write_only=True)

    @classmethod
    def get_token(cls, user):
        """Добавляем в токен дополнительную информацию о пользователе"""
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token

    def validate(self):
        """Переопределяем метод для русских ошибок"""
        try:
            return super().validate()
        except serializers.ValidationError as e:
            # Переводим ошибки
            error_msg = str(e.detail) if hasattr(e, 'detail') else str(e)
            if 'No active account' in error_msg or 'user' in error_msg.lower():
                raise serializers.ValidationError('Пользователь не найден')
            if 'password' in error_msg.lower() or 'wrong' in error_msg.lower():
                raise serializers.ValidationError('Неверный пароль')
            raise serializers.ValidationError('Неверное имя пользователя или пароль')


class UserSerializer(serializers.ModelSerializer):
    """
    Сериализатор для отображения данных пользователя.
    Используется в API профиля — возвращает id, username, email, имя, фамилию.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'email': {'required': True},
            'username': {'required': True},
        }


class OrderItemSerializer(serializers.Serializer):
    """Сериализатор для позиции заказа"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """Сериализатор для создания заказа"""
    address_id = serializers.IntegerField(required=True)
    phone = serializers.CharField(max_length=20, required=True)
    email = serializers.EmailField(required=True)
    comment = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemSerializer(many=True)
    
    def validate_address_id(self, value):
        """Проверка существования адреса"""
        from .models import Address
        try:
            address = Address.objects.get(id=value)
            # Проверяем, что адрес принадлежит пользователю
            if address.user != self.context['request'].user:
                raise serializers.ValidationError('Адрес не найден')
        except Address.DoesNotExist:
            raise serializers.ValidationError('Адрес не найден')
        return value
    
    def validate_items(self, items):
        """Проверка наличия товаров на складе"""
        from .models import Product, CartItem, Cart
        
        if not items:
            raise serializers.ValidationError('Корзина пуста')
        
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'])
                if product.stock < item['quantity']:
                    raise serializers.ValidationError(
                        f'Товар "{product.name}" недоступен в количестве {item["quantity"]}. На складе: {product.stock}'
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f'Товар не найден')
        
        return items