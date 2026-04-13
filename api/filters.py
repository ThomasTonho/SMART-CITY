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

