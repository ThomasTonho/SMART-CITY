from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()

router.register(r'usuarios', UsuarioViewSet)
router.register(r'locais', LocaisViewSet)
router.register(r'responsaveis', ResponsaveisViewSet)
router.register(r'ambientes', AmbientesViewSet)
router.register(r'microcontroladores', MicrocontroladoresViewSet)
router.register(r'sensores', SensoresViewSet)
router.register(r'historicos', HistoricosViewSet)


urlpatterns = [
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh', TokenRefreshView.as_view(), name='token_refresh'),

    path('', include(router.urls))
]

