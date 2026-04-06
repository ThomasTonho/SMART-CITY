from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework import viewsets

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class LocaisViewSet(viewsets.ModelViewSet):
    queryset = Locais.objects.all()
    serializer_class = LocaisSerializer

class ResponsaveisViewSet(viewsets.ModelViewSet):
    queryset = Responsaveis.objects.all()
    serializer_class = ResponsaveisSerializer

class AmbientesViewSet(viewsets.ModelViewSet):
    queryset = Ambientes.objects.all()
    serializer_class = AmbientesSerializer

class MicrocontroladoresViewSet(viewsets.ModelViewSet):
    queryset = Microcontroladores.objects.all()
    serializer_class = MicrocontroladoresSerializer

class SensoresViewSet(viewsets.ModelViewSet):
    queryset = Sensores.objects.all()
    serializer_class = SensoresSerializer

class HistoricosViewSet(viewsets.ModelViewSet):
    queryset = Historicos.objects.all()
    serializer_class = HistoricosSerializer


