from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework import viewsets
from .filters import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import  action, permission_classes

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    filterset_class = UsuarioFilter

class LocaisViewSet(viewsets.ModelViewSet):
    queryset = Locais.objects.all()
    serializer_class = LocaisSerializer
    filterset_class = LocaisFilter

class ResponsaveisViewSet(viewsets.ModelViewSet):
    queryset = Responsaveis.objects.all()
    serializer_class = ResponsaveisSerializer
    filterset_class = ResponsaveisFilter

class AmbientesViewSet(viewsets.ModelViewSet):
    queryset = Ambientes.objects.all()
    serializer_class = AmbientesSerializer
    filterset_class = AmbientesFilter

class MicrocontroladoresViewSet(viewsets.ModelViewSet):
    queryset = Microcontroladores.objects.all()
    serializer_class = MicrocontroladoresSerializer
    filterset_class = MicrocontroladoresFilter

class SensoresViewSet(viewsets.ModelViewSet):
    queryset = Sensores.objects.all()
    serializer_class = SensoresSerializer

class HistoricosViewSet(viewsets.ModelViewSet):
    queryset = Historicos.objects.all()
    serializer_class = HistoricosSerializer


