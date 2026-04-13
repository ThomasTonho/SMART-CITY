import django_filters
from .models import *


class UsuarioFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name='nome', lookup_expr='icontains')
    telefone = django_filters.CharFilter(field_name='telefone', lookup_expr='icontains')
    tipo = django_filters.CharFilter(field_name='tipo', lookup_expr='iexact')

    class Meta:
        model = Usuario
        fields = ['nome', 'telefone', 'tipo']

class LocaisFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name='nome', lookup_expr='icontains')

    class Meta:
        model = Locais
        fields = ['nome']

class ResponsaveisFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name='nome', lookup_expr='icontains')

    class Meta:
        model = Responsaveis
        fields = ['nome']

class AmbientesFilter(django_filters.FilterSet):
    local = django_filters.CharFilter(field_name='local__nome', lookup_expr='icontains')
    responsavel = django_filters.CharFilter(field_name='responsavel__nome', lookup_expr='icontains')
    descricao = django_filters.CharFilter(field_name='descricao', lookup_expr='icontains')

    class Meta:
        model = Ambientes
        fields = ['local', 'responsavel', 'descricao']

class MicrocontroladoresFilter(django_filters.FilterSet):
    modelo = django_filters.CharFilter(field_name='modelo', lookup_expr='icontains')
    mac_address = django_filters.CharFilter(field_name='mac_address', lookup_expr='icontains')
    latitude = django_filters.NumberFilter(field_name='latitude')
    longitude = django_filters.NumberFilter(field_name='longitude')
    status = django_filters.BooleanFilter(field_name='status')
    ambiente = django_filters.CharFilter(field_name='ambiente__descricao', lookup_expr='icontains')

    class Meta:
        model = Microcontroladores
        fields = ['modelo', 'mac_address', 'latitude', 'longitude', 'status', 'ambiente']

