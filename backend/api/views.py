from datetime import timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, ValidationError
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .filters import *
from .importers import MODEL_CHOICES, import_csv_content
from .models import *
from .serializers import *


def _get_message(data):
    if isinstance(data, dict):
        if "detail" in data:
            return str(data["detail"])
        first_key = next(iter(data), None)
        if first_key is not None:
            value = data[first_key]
            if isinstance(value, list) and value:
                return str(value[0])
            return str(value)
    if isinstance(data, list) and data:
        return str(data[0])
    return "Erro na requisicao."


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    status_code = response.status_code
    data = response.data

    error_code = "ERROR"
    message = _get_message(data)

    if status_code == status.HTTP_400_BAD_REQUEST or isinstance(exc, ValidationError):
        error_code = "BAD_REQUEST"
    elif status_code == status.HTTP_401_UNAUTHORIZED or isinstance(
        exc, (NotAuthenticated, AuthenticationFailed)
    ):
        error_code = "UNAUTHORIZED"
    elif status_code == status.HTTP_404_NOT_FOUND:
        error_code = "NOT_FOUND"
        message = "Recurso nao encontrado."

    response.data = {
        "error": {
            "code": error_code,
            "message": message,
            "status": status_code,
            "details": data,
        }
    }
    return response


class AdminOrReadOnly(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = UsuarioFilter

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
            }
        )


class LocaisViewSet(viewsets.ModelViewSet):
    queryset = Locais.objects.all()
    serializer_class = LocaisSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = LocaisFilter


class ResponsaveisViewSet(viewsets.ModelViewSet):
    queryset = Responsaveis.objects.all()
    serializer_class = ResponsaveisSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResponsaveisFilter


class AmbientesViewSet(viewsets.ModelViewSet):
    queryset = Ambientes.objects.all()
    serializer_class = AmbientesSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AmbientesFilter


class MicrocontroladoresViewSet(viewsets.ModelViewSet):
    queryset = Microcontroladores.objects.all()
    serializer_class = MicrocontroladoresSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MicrocontroladoresFilter


class SensoresViewSet(viewsets.ModelViewSet):
    queryset = Sensores.objects.all()
    serializer_class = SensoresSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = SensoresFilter


class HistoricosViewSet(viewsets.ModelViewSet):
    queryset = Historicos.objects.all().order_by("-timestamp")
    serializer_class = HistoricosSerializer
    permission_classes = [AdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = HistoricosFilter

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def recentes(self, request):
        start = timezone.now() - timedelta(hours=24)
        queryset = self.get_queryset().filter(timestamp__gte=start)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class RegisterViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Usuario cadastrado com sucesso.",
                "username": user.username,
                "tipo": "ADMIN" if user.is_staff else "USER",
            },
            status=status.HTTP_201_CREATED,
        )


class ImportacaoCSVViewSet(viewsets.GenericViewSet):
    permission_classes = [AdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request):
        model_name = (request.data.get("model") or "").strip().lower()
        delimiter = (request.data.get("delimiter") or ",").strip() or ","
        upload = request.FILES.get("file")

        if model_name not in MODEL_CHOICES:
            raise ValidationError({"model": "Modelo invalido para importacao."})
        if not upload:
            raise ValidationError({"file": "Arquivo CSV e obrigatorio."})
        if not upload.name.lower().endswith(".csv"):
            raise ValidationError({"file": "Envie um arquivo com extensao .csv."})

        try:
            content = upload.read().decode("utf-8-sig")
        except UnicodeDecodeError as exc:
            raise ValidationError({"file": "Arquivo precisa estar em UTF-8."}) from exc

        with transaction.atomic():
            result = import_csv_content(model_name, content, delimiter=delimiter)

        return Response(
            {
                "message": "Importacao concluida.",
                "model": model_name,
                **result,
            },
            status=status.HTTP_200_OK,
        )



