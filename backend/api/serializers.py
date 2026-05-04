from rest_framework import serializers
from .models import Usuario, Locais, Responsaveis, Ambientes, Microcontroladores, Sensores, Historicos

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class LocaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locais
        fields = '__all__'

class ResponsaveisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsaveis
        fields = '__all__'

class AmbientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ambientes
        fields = '__all__'

class MicrocontroladoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Microcontroladores
        fields = '__all__'
    
class SensoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensores
        fields = '__all__'
    
class HistoricosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historicos
        fields = '__all__'

