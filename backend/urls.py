
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CatalogViewSet, CirculationViewSet, AuthViewSet, PatronViewSet, CirculationRuleViewSet, LibraryEventViewSet, SystemAlertViewSet, SystemConfigViewSet

router = DefaultRouter()
router.register(r'catalog', CatalogViewSet, basename='catalog')
router.register(r'circulation', CirculationViewSet, basename='circulation')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'patrons', PatronViewSet, basename='patrons')
router.register(r'system-config', SystemConfigViewSet, basename='system-config')

# Admin & Config Routes
router.register(r'circulation/rules', CirculationRuleViewSet, basename='circulation-rules')
router.register(r'events', LibraryEventViewSet, basename='events')
router.register(r'alerts', SystemAlertViewSet, basename='alerts')

urlpatterns = [
    path('api/', include(router.urls)),
]
