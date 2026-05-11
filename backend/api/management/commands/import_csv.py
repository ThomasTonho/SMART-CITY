import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.importers import MODEL_CHOICES, import_csv_reader


class Command(BaseCommand):
    help = "Importa dados de um arquivo CSV para um modelo especifico."

    def add_arguments(self, parser):
        parser.add_argument(
            "--model",
            required=True,
            choices=MODEL_CHOICES,
            help="Modelo de destino da importacao.",
        )
        parser.add_argument("--file", required=True, help="Caminho do arquivo CSV.")
        parser.add_argument(
            "--delimiter",
            default=",",
            help="Delimitador do CSV. Padrao: ','",
        )

    def handle(self, *args, **options):
        model_name = options["model"]
        csv_file = Path(options["file"]).expanduser().resolve()
        delimiter = options["delimiter"]

        if not csv_file.exists() or not csv_file.is_file():
            raise CommandError(f"Arquivo CSV nao encontrado: {csv_file}")

        imported = 0
        skipped = 0
        updated = 0
        errors = 0

        with csv_file.open("r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file, delimiter=delimiter)
            if not reader.fieldnames:
                raise CommandError("CSV sem cabecalho.")

            with transaction.atomic():
                result = import_csv_reader(model_name, reader)
                imported = result["created"]
                updated = result["updated"]
                skipped = result["skipped"]
                errors = result["errors"]
                for error in result["errors_list"]:
                    self.stdout.write(self.style.WARNING(error))

        self.stdout.write(self.style.SUCCESS("Importacao finalizada."))
        self.stdout.write(f"Criados: {imported}")
        self.stdout.write(f"Atualizados: {updated}")
        self.stdout.write(f"Ignorados: {skipped}")
        self.stdout.write(f"Erros: {errors}")

