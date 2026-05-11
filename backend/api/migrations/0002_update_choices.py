from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="usuario",
            name="tipo",
            field=models.CharField(
                choices=[("ADMIN", "Administrador"), ("USER", "Usuario")],
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="sensores",
            name="tipo_sensor",
            field=models.CharField(
                choices=[
                    ("TEMPERATURA", "Temperatura"),
                    ("UMIDADE", "Umidade"),
                    ("LUMINOSIDADE", "Luminosidade"),
                    ("CONTADOR", "Contador"),
                ],
                max_length=100,
            ),
        ),
    ]
