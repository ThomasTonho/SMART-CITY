from rest_framework import serializers
from django.contrib.auth.models import User
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

    def validate(self, attrs):
        sensor = attrs.get('sensor')
        if sensor and not sensor.status:
            raise serializers.ValidationError(
                {"sensor": "Nao e permitido registrar medicao para sensor inativo."}
            )
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=3)
    tipo = serializers.ChoiceField(choices=Usuario.TIPO_CHOICES, write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "tipo"]

    def create(self, validated_data):
        tipo = validated_data.pop("tipo")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        user.is_staff = tipo == "ADMIN"
        user.save(update_fields=["is_staff"])
        Usuario.objects.create(nome=user.username, tipo=tipo)
        return user

