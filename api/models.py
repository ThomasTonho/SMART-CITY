from django.db import models

class Usuario(models.Model):
    TIPO_CHOICES = [
        ('ADMIN', 'Admin'),
        ('USER', 'User')
    ]
    nome = models.CharField(max_length=100)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    tipo = models.CharField(choices=TIPO_CHOICES)

class Locais(models.Model):
    nome = models.CharField(max_length=100)

class Responsaveis(models.Model):
    nome = models.CharField(max_length=100)

class Ambientes(models.Model):
    local = models.ForeignKey(Locais, on_delete=models.CASCADE)
    responsavel = models.ForeignKey(Responsaveis, on_delete=models.CASCADE)
    descricao = models.TextField(blank=True, null=True)

class Microcontroladores(models.Model):
    modelo = models.CharField(max_length=100)
    mac_address = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.BooleanField()
    ambiente = models.ForeignKey(Ambientes, on_delete=models.CASCADE)

class Sensores(models.Model):
    sensor = models.CharField(max_length=100)
    unidade_medida = models.CharField(max_length=100)
    mic = models.ForeignKey(Microcontroladores, on_delete=models.CASCADE)
    status = models.BooleanField()

class Historicos(models.Model):
    sensor = models.ForeignKey(Sensores, on_delete=models.CASCADE)
    valor = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)