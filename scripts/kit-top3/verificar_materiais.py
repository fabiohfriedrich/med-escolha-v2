from __future__ import annotations

import zipfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter


PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "assets" / "downloads" / "kit-top3"
PUBLIC_DIR = PROJECT_ROOT / "public" / "products"
PDF_NAMES = [
    "00-comece-por-aqui.pdf",
    "01-entrevista-com-especialistas.pdf",
    "02-checklist-observacao-da-rotina.pdf",
    "03-conversa-com-residentes.pdf",
    "04-matriz-decisao-top3.pdf",
]


def widget_fields(reader: PdfReader) -> list[tuple[str, object, object]]:
    widgets: list[tuple[str, object, object]] = []
    for page in reader.pages:
        for annotation_ref in page.get("/Annots", []):
            annotation = annotation_ref.get_object()
            if annotation.get("/Subtype") != "/Widget":
                continue
            parent = annotation.get("/Parent")
            effective = parent.get_object() if parent else annotation
            widgets.append((str(effective.get("/T", "")), annotation, effective))
    return widgets


def verify_pdf(path: Path) -> tuple[int, int]:
    if not path.exists() or path.stat().st_size < 20_000:
        raise AssertionError(f"PDF ausente ou pequeno demais: {path.name}")
    reader = PdfReader(path)
    if len(reader.pages) < 3:
        raise AssertionError(f"PDF com poucas páginas: {path.name}")
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    for expected in ("Med Escolha 2.0", "KIT VALIDE SEU TOP 3"):
        if expected not in text:
            raise AssertionError(f"Texto obrigatório ausente em {path.name}: {expected}")
    fields = reader.get_fields() or {}
    widgets = widget_fields(reader)
    if not fields or not widgets:
        raise AssertionError(f"Formulários ausentes em {path.name}")
    field_names = set(fields)
    widget_names = {name for name, _, _ in widgets}
    if not widget_names.issubset(field_names):
        raise AssertionError(f"Widgets sem campo canônico em {path.name}")
    for name, widget, _ in widgets:
        appearance = widget.get("/AP")
        if not appearance or not appearance.get("/N"):
            raise AssertionError(f"Campo sem aparência em {path.name}: {name}")
        rect = [float(value) for value in widget.get("/Rect", [])]
        if len(rect) != 4 or rect[0] < 30 or rect[1] < 42 or rect[2] > 565 or rect[3] > 812:
            raise AssertionError(f"Campo fora da área útil em {path.name}: {name} {rect}")
    sample_name = next(iter(fields))
    sample_path = PROJECT_ROOT / "tmp" / "pdfs" / f"teste-preenchimento-{path.stem}.pdf"
    sample_path.parent.mkdir(parents=True, exist_ok=True)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.update_page_form_field_values(None, {sample_name: "Teste de preenchimento"}, auto_regenerate=True)
    with sample_path.open("wb") as stream:
        writer.write(stream)
    filled_reader = PdfReader(sample_path)
    filled_fields = filled_reader.get_fields() or {}
    if filled_fields.get(sample_name, {}).get("/V") != "Teste de preenchimento":
        raise AssertionError(f"Campo não preservou valor em {path.name}: {sample_name}")
    filled_widget = next((item for item in widget_fields(filled_reader) if item[0] == sample_name), None)
    if not filled_widget or not filled_widget[1].get("/AP", {}).get("/N"):
        raise AssertionError(f"Campo preenchido sem aparência em {path.name}: {sample_name}")
    return len(reader.pages), len(fields)


def main() -> None:
    summary = {}
    for name in PDF_NAMES:
        summary[name] = verify_pdf(OUTPUT_DIR / name)

    zip_path = OUTPUT_DIR / "kit-valide-seu-top3.zip"
    with zipfile.ZipFile(zip_path) as archive:
        if archive.namelist() != PDF_NAMES:
            raise AssertionError(f"Conteúdo inesperado no ZIP: {archive.namelist()}")
        if archive.testzip() is not None:
            raise AssertionError("ZIP corrompido")

    with Image.open(PUBLIC_DIR / "kit-top3-hotmart-600x600.png") as image:
        if image.size != (600, 600):
            raise AssertionError(f"Imagem Hotmart com tamanho incorreto: {image.size}")
    with Image.open(PUBLIC_DIR / "kit-top3-card.png") as image:
        if image.size != (960, 540):
            raise AssertionError(f"Imagem do card com tamanho incorreto: {image.size}")

    for name, (pages, fields) in summary.items():
        print(f"OK {name}: {pages} páginas, {fields} campos")
    print("OK ZIP e imagens")


if __name__ == "__main__":
    main()
