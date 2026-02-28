"""
Management command для очистки старых записей о неудачных попытках входа.
Запускается через: python manage.py cleanup_failed_attempts
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from store.models import FailedLoginAttempt
from django.conf import settings


class Command(BaseCommand):
    help = 'Очистка старых записей о неудачных попытках входа'

    def handle(self, *args, **kwargs):
        self.stdout.write('Очистка старых записей FailedLoginAttempt...')
        
        # Получаем время блокировки из настроек
        lockout_time = settings.ACCOUNT_LOCKOUT.get('LOCKOUT_TIME', 900)  # 15 минут по умолчанию
        
        # Удаляем записи, где блокировка истекла более чем 2 * lockout_time назад
        cleanup_threshold = timezone.now() - timedelta(seconds=lockout_time * 2)
        
        # Находим все записи, где last_attempt старше порога
        old_attempts = FailedLoginAttempt.objects.filter(last_attempt__lt=cleanup_threshold)
        count = old_attempts.count()
        
        if count > 0:
            old_attempts.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Удалено {count} старых записей')
            )
        else:
            self.stdout.write('Нет старых записей для удаления')
        
        # Также можно очистить разблокированные записи с 0 попыток
        cleared_attempts = FailedLoginAttempt.objects.filter(
            locked_until__isnull=True,
            failed_attempts=0
        )
        cleared_count = cleared_attempts.count()
        
        if cleared_count > 0:
            cleared_attempts.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Удалено {cleared_count} пустых записей')
            )
        
        self.stdout.write(self.style.SUCCESS('Очистка завершена'))
