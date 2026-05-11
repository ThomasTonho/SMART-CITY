import csv

from django.core.management.base import CommandError

from api.models import (
    Ambientes,
    Historicos,
    Locais,
    Microcontroladores,
    Responsaveis,
    Sensores,
    Usuario,
)

MODEL_CHOICES = [
    "usuario",
    "local",
    "responsavel",
    "ambiente",
    "microcontrolador",
    "sensor",
    "historico",
]


def parse_bool(value):
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "t", "yes", "y", "sim", "s"}:
        return True
    if normalized in {"0", "false", "f", "no", "n", "nao"}:
        return False
    raise ValueError(f"Valor booleano invalido: {value}")


def import_row(model_name, row):
    if model_name == "usuario":
        nome = row["nome"].strip()
        tipo = row["tipo"].strip().upper()
        telefone = row.get("telefone") or None
        _, created = Usuario.objects.update_or_create(
            nome=nome,
            defaults={"tipo": tipo, "telefone": telefone},
        )
        return "created" if created else "updated"

    if model_name == "local":
        nome = row["nome"].strip()
        _, created = Locais.objects.get_or_create(nome=nome)
        return "created" if created else "skipped"

    if model_name == "responsavel":
        nome = row["nome"].strip()
        _, created = Responsaveis.objects.get_or_create(nome=nome)
        return "created" if created else "skipped"

    if model_name == "ambiente":
        local = Locais.objects.get(id=int(row["local_id"]))
        responsavel = Responsaveis.objects.get(id=int(row["responsavel_id"]))
        descricao = row.get("descricao") or None
        _, created = Ambientes.objects.update_or_create(
            local=local,
            responsavel=responsavel,
            defaults={"descricao": descricao},
        )
        return "created" if created else "updated"

    if model_name == "microcontrolador":
        ambiente = Ambientes.objects.get(id=int(row["ambiente_id"]))
        defaults = {
            "modelo": row["modelo"].strip(),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "status": parse_bool(row["status"]),
            "ambiente": ambiente,
        }
        _, created = Microcontroladores.objects.update_or_create(
            mac_address=row["mac_address"].strip(),
            defaults=defaults,
        )
        return "created" if created else "updated"

    if model_name == "sensor":
        mic = Microcontroladores.objects.get(id=int(row["mic_id"]))
        _, created = Sensores.objects.update_or_create(
            tipo_sensor=row["tipo_sensor"].strip().upper(),
            unidade_medida=row["unidade_medida"].strip().upper(),
            mic=mic,
            defaults={"status": parse_bool(row["status"])},
        )
        return "created" if created else "updated"

    if model_name == "historico":
        sensor = Sensores.objects.get(id=int(row["sensor_id"]))
        Historicos.objects.create(
            sensor=sensor,
            valor=float(row["valor"]),
        )
        return "created"

    raise CommandError(f"Modelo nao suportado: {model_name}")


def import_csv_reader(model_name, reader):
    if model_name not in MODEL_CHOICES:
        raise CommandError(f"Modelo nao suportado: {model_name}")
    if not reader.fieldnames:
        raise CommandError("CSV sem cabecalho.")

    imported = 0
    updated = 0
    skipped = 0
    errors = 0
    errors_list = []

    for line_number, row in enumerate(reader, start=2):
        try:
            outcome = import_row(model_name, row)
            if outcome == "created":
                imported += 1
            elif outcome == "updated":
                updated += 1
            else:
                skipped += 1
        except Exception as exc:  # noqa: BLE001
            errors += 1
            errors_list.append(f"Linha {line_number}: {exc}")

    return {
        "created": imported,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
        "errors_list": errors_list,
    }


def import_csv_content(model_name, content, delimiter=","):
    reader = csv.DictReader(content.splitlines(), delimiter=delimiter)
    return import_csv_reader(model_name, reader)
