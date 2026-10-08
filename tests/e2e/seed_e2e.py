"""Create only synthetic accounts used by the isolated Playwright job."""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from django.contrib.auth import get_user_model


def upsert(username, password):
    user, _ = get_user_model().objects.update_or_create(
        username=username,
        defaults={'is_active': True},
    )
    user.set_password(password)
    user.save()


upsert('qa_e2e_owner', 'QA-E2E-owner-2026!')
upsert('qa_e2e_other', 'QA-E2E-other-2026!')
print('Synthetic E2E accounts ready.')
