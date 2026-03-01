"""
Middleware для JWT аутентификации через httpOnly cookie.
"""
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser as DjangoAnonymousUser

User = get_user_model()


class JWTAuthMiddleware:
    """
    Middleware для аутентификации через JWT токен в httpOnly cookie.

    Читает access токен из cookie 'access_token' и устанавливает request.user.
    Работает вместе с Django SessionMiddleware для поддержки обоих методов.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Получаем пользователя из токена в cookie
        jwt_user = self._get_user_from_cookie(request)

        # Если пользователь найден через JWT, используем его
        # Иначе Django AuthenticationMiddleware установит пользователя из сессии
        if not jwt_user.is_anonymous:
            request.user = jwt_user
            # Кэшируем, чтобы AuthenticationMiddleware не перезаписал
            request._cached_user = jwt_user

        response = self.get_response(request)
        return response

    def _get_user_from_cookie(self, request):
        """Извлекает пользователя из JWT токена в cookie."""

        def get_user():
            access_token = request.COOKIES.get('access_token')

            if not access_token:
                return DjangoAnonymousUser()

            try:
                # Проверяем валидность токена
                token = AccessToken(access_token)
                user_id = token.payload.get('user_id')

                if not user_id:
                    return DjangoAnonymousUser()

                user = User.objects.get(pk=user_id)

                # Проверяем, активен ли пользователь
                if not user.is_active:
                    return DjangoAnonymousUser()

                return user

            except (TokenError, InvalidToken, User.DoesNotExist):
                return DjangoAnonymousUser()

        return SimpleLazyObject(get_user)
