"""Temporary model-level tests until Diana delivers the initial migration.

Never use these settings to run or deploy the application.
"""
from .settings import *  # noqa: F403

MIGRATION_MODULES = {'patients': None}
