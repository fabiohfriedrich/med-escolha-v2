from __future__ import annotations

import re
import zipfile
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
WORKSPACE_ROOT = PROJECT_ROOT.parents[1]
CONTENT_DIR = PROJECT_ROOT / "content" / "kit-top3"
OUTPUT_DIR = PROJECT_ROOT / "assets" / "downloads" / "kit-top3"
PUBLIC_DIR = PROJECT_ROOT / "public" / "products"

NAVY = colors.HexColor("#0B1F44")
BLUE = colors.HexColor("#1E4D8C")
TEAL = colors.HexColor("#16B8A6")
TEAL_DARK = colors.HexColor("#087F76")
YELLOW = colors.HexColor("#FFBF00")
INK = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#64748B")
LINE = colors.HexColor("#D6E0EA")
PAPER = colors.HexColor("#F4F7FB")
WHITE = colors.white

MODULES = [
    ("00", "00-comece-por-aqui.md", "00-comece-por-aqui.pdf", "COMECE POR AQUI", "14 dias para tirar seu Top 3 do papel"),
    ("01", "01-entrevista-com-especialistas.md", "01-entrevista-com-especialistas.pdf", "ESPECIALISTAS", "Perguntas melhores. Respostas mais úteis."),
    ("02", "02-checklist-observacao-da-rotina.md", "02-checklist-observacao-da-rotina.pdf", "ROTINA REAL", "Observe o trabalho, não só o caso marcante"),
    ("03", "03-conversa-com-residentes.md", "03-conversa-com-residentes.pdf", "RESIDÊNCIA", "Separe a especialidade do programa"),
    ("04", "04-matriz-decisao-top3.md", "04-matriz-decisao-top3.pdf", "MATRIZ TOP 3", "Compare evidências, não fantasias"),
]


def register_fonts() -> None:
    font_dir = WORKSPACE_ROOT / "marca" / "Hank Font"
    pdfmetrics.registerFont(TTFont("Hank", str(font_dir / "HankRnd-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Hank-Bold", str(font_dir / "HankRnd-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("Hank-Black", str(font_dir / "HankRnd-Black.ttf")))


class FormTextField(Flowable):
    def __init__(self, name: str, height: float = 17 * mm, multiline: bool = True):
        super().__init__()
        self.name = name
        self.width = 170 * mm
        self.height = height
        self.multiline = multiline

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        return avail_width, self.height

    def draw(self) -> None:
        self.canv.setFillColor(colors.white)
        self.canv.setStrokeColor(LINE)
        self.canv.roundRect(0, 0, self.width, self.height, 3 * mm, fill=1, stroke=1)
        absolute_x, absolute_y = self.canv.absolutePosition(1.5 * mm, 1.5 * mm)
        self.canv.acroForm.textfield(
            name=self.name,
            x=absolute_x,
            y=absolute_y,
            width=self.width - 3 * mm,
            height=self.height - 3 * mm,
            borderWidth=0,
            fillColor=colors.white,
            textColor=INK,
            fontName="Helvetica",
            fontSize=9,
            fieldFlags="multiline" if self.multiline else "",
            forceBorder=False,
        )


class Cover(Flowable):
    def __init__(self, number: str, title: str, subtitle: str):
        super().__init__()
        self.number = number
        self.title = title
        self.subtitle = subtitle
        self.width = 180 * mm
        self.height = 247 * mm

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        self.height = avail_height
        return avail_width, avail_height

    def draw(self) -> None:
        canvas = self.canv
        canvas.setFillColor(NAVY)
        canvas.roundRect(0, 0, self.width, self.height, 8 * mm, fill=1, stroke=0)
        canvas.setFillColor(TEAL)
        canvas.roundRect(0, self.height - 12 * mm, self.width * 0.72, 12 * mm, 5 * mm, fill=1, stroke=0)
        canvas.setFillColor(YELLOW)
        canvas.circle(self.width - 15 * mm, 14 * mm, 3.5 * mm, fill=1, stroke=0)

        canvas.setFillColor(colors.Color(1, 1, 1, alpha=0.08))
        canvas.setFont("Hank-Black", 118)
        canvas.drawRightString(self.width - 10 * mm, self.height - 68 * mm, "3")

        canvas.setFillColor(TEAL)
        canvas.setFont("Hank-Bold", 11)
        canvas.drawString(12 * mm, self.height - 22 * mm, f"MÓDULO {self.number}")

        canvas.setFillColor(WHITE)
        canvas.setFont("Hank-Black", 26)
        title_lines = self.title.split(" ")
        line = ""
        y = self.height - 92 * mm
        for word in title_lines:
            candidate = f"{line} {word}".strip()
            if canvas.stringWidth(candidate, "Hank-Black", 26) > self.width - 30 * mm and line:
                canvas.drawString(12 * mm, y, line)
                y -= 11 * mm
                line = word
            else:
                line = candidate
        if line:
            canvas.drawString(12 * mm, y, line)

        y -= 15 * mm
        canvas.setFillColor(colors.HexColor("#BFECE7"))
        canvas.setFont("Hank", 14)
        for subtitle_line in wrap_canvas_text(canvas, self.subtitle, "Hank", 14, self.width - 30 * mm):
            canvas.drawString(12 * mm, y, subtitle_line)
            y -= 7 * mm

        canvas.setStrokeColor(colors.Color(1, 1, 1, alpha=0.22))
        canvas.line(12 * mm, 29 * mm, self.width - 12 * mm, 29 * mm)
        canvas.setFillColor(WHITE)
        canvas.setFont("Hank-Bold", 11)
        canvas.drawString(12 * mm, 20 * mm, "KIT VALIDE SEU TOP 3")
        canvas.setFillColor(colors.HexColor("#B8C8DC"))
        canvas.setFont("Hank", 9)
        canvas.drawString(12 * mm, 14 * mm, "Med Escolha 2.0  |  por Amo Medicina")


def wrap_canvas_text(canvas, text: str, font_name: str, font_size: int, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and canvas.stringWidth(candidate, font_name, font_size) > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Hank",
            fontSize=9.6,
            leading=13.6,
            textColor=INK,
            spaceAfter=3.5 * mm,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Hank-Black",
            fontSize=17,
            leading=20,
            textColor=NAVY,
            spaceBefore=5 * mm,
            spaceAfter=3 * mm,
            keepWithNext=1,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName="Hank-Bold",
            fontSize=12.5,
            leading=15,
            textColor=TEAL_DARK,
            spaceBefore=3.5 * mm,
            spaceAfter=2 * mm,
            keepWithNext=1,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName="Hank",
            fontSize=9.3,
            leading=12.5,
            textColor=INK,
            leftIndent=5 * mm,
            firstLineIndent=-3 * mm,
            spaceAfter=1.6 * mm,
        ),
        "field_label": ParagraphStyle(
            "FieldLabel",
            parent=base["BodyText"],
            fontName="Hank-Bold",
            fontSize=8.5,
            leading=11,
            textColor=NAVY,
            spaceBefore=1.5 * mm,
            spaceAfter=1.2 * mm,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Hank",
            fontSize=7.5,
            leading=9.5,
            textColor=MUTED,
            alignment=TA_LEFT,
        ),
        "callout": ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontName="Hank-Bold",
            fontSize=10,
            leading=14,
            textColor=NAVY,
            backColor=colors.HexColor("#E7F8F6"),
            borderColor=colors.HexColor("#B4E7E1"),
            borderWidth=0.7,
            borderPadding=8,
            borderRadius=5,
            spaceBefore=2 * mm,
            spaceAfter=4 * mm,
        ),
    }


def safe_markup(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r'"([^"]+)"', r'<i>"\1"</i>', text)
    return text


def is_field_prompt(text: str) -> bool:
    prompt_prefixes = (
        "Especialidade",
        "Data",
        "Tempo",
        "Cidade",
        "Vínculo",
        "Cenário",
        "Duração",
        "Minha",
        "O que",
        "Quem",
        "Três",
        "Duas",
        "Um ",
        "Uma ",
        "Hor",
        "Pacientes",
        "Interrupções",
        "Trabalho invisível",
        "Carga",
        "Supervisão",
        "Custos",
        "Diferenças",
        "Retrato",
        "Evidências",
        "Incertezas",
    )
    return text.endswith(":") and text.startswith(prompt_prefixes)


def markdown_story(source: Path, styles: dict[str, ParagraphStyle], field_prefix: str) -> list[Flowable]:
    lines = source.read_text(encoding="utf-8").splitlines()
    story: list[Flowable] = []
    field_index = 0
    paragraph: list[str] = []
    table_lines: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            story.append(Paragraph(safe_markup(" ".join(paragraph)), styles["body"]))
            paragraph = []

    def flush_table() -> None:
        nonlocal table_lines
        if not table_lines:
            return
        rows = [[cell.strip() for cell in line.strip().strip("|").split("|")] for line in table_lines]
        rows = [row for row in rows if not all(re.fullmatch(r":?-+:?", cell) for cell in row)]
        if rows:
            available = 180 * mm
            col_widths = [available / len(rows[0])] * len(rows[0])
            data = [[Paragraph(safe_markup(cell or " "), styles["small"]) for cell in row] for row in rows]
            table = Table(data, colWidths=col_widths, repeatRows=1)
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ]))
            story.extend([Spacer(1, 2 * mm), table, Spacer(1, 4 * mm)])
        table_lines = []

    for raw in lines:
        line = raw.strip()
        if line.startswith("|"):
            flush_paragraph()
            table_lines.append(line)
            continue
        flush_table()
        if not line:
            flush_paragraph()
            continue
        if line.startswith("# "):
            flush_paragraph()
            continue
        if line.startswith("## "):
            flush_paragraph()
            story.append(Paragraph(safe_markup(line[3:]), styles["h2"]))
            continue
        if line.startswith("### "):
            flush_paragraph()
            story.append(Paragraph(safe_markup(line[4:]), styles["h3"]))
            continue
        if line.startswith("- "):
            flush_paragraph()
            item = line[2:]
            if is_field_prompt(item):
                field_index += 1
                story.append(Paragraph(safe_markup(item[:-1]), styles["field_label"]))
                story.append(FormTextField(f"{field_prefix}_{field_index}", height=10 * mm, multiline=False))
                story.append(Spacer(1, 2 * mm))
            else:
                story.append(Paragraph(f"• {safe_markup(item)}", styles["bullet"]))
            continue
        if re.match(r"^\d+\. ", line):
            flush_paragraph()
            story.append(Paragraph(safe_markup(line), styles["bullet"]))
            continue
        if is_field_prompt(line):
            flush_paragraph()
            field_index += 1
            story.append(Paragraph(safe_markup(line[:-1]), styles["field_label"]))
            story.append(FormTextField(f"{field_prefix}_{field_index}", height=18 * mm))
            story.append(Spacer(1, 2.5 * mm))
            continue
        if line.startswith('"') and line.endswith('"'):
            flush_paragraph()
            story.append(Paragraph(safe_markup(line), styles["callout"]))
            continue
        paragraph.append(line)

    flush_paragraph()
    flush_table()
    return story


def worksheet(story: list[Flowable], styles: dict[str, ParagraphStyle], prefix: str, title: str, labels: Iterable[str], count: int) -> None:
    for number in range(1, count + 1):
        story.append(PageBreak())
        story.append(Paragraph(f"{title} {number}", styles["h2"]))
        story.append(Paragraph("Use este espaço para registrar evidências sem dados identificáveis de pacientes.", styles["body"]))
        for index, label in enumerate(labels, start=1):
            story.append(Paragraph(label, styles["field_label"]))
            compact = index <= 3
            story.append(FormTextField(f"{prefix}_{number}_{index}", height=(9 if compact else 17) * mm, multiline=not compact))
            story.append(Spacer(1, 1.8 * mm))


def matrix_sheets(story: list[Flowable], styles: dict[str, ParagraphStyle]) -> None:
    criteria = [
        "Rotina comum",
        "Forma de trabalhar",
        "Relação com pacientes",
        "Carga emocional",
        "Estilo de vida",
        "Caminho de formação",
        "Mercado regional",
        "Renda, previsibilidade e risco",
        "Custo de oportunidade",
        "Incertezas abertas",
    ]

    story.append(PageBreak())
    story.append(Paragraph("Nomeie suas três opções", styles["h2"]))
    option_fields = []
    for index in range(1, 4):
        option_fields.append([
            Paragraph(f"Opção {index}", styles["field_label"]),
            FormTextField(f"matriz_opcao_{index}", height=9 * mm, multiline=False),
        ])
    option_table = Table(option_fields, colWidths=[25 * mm, 145 * mm], hAlign="LEFT")
    option_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(option_table)

    for page_index, batch in enumerate((criteria[:5], criteria[5:]), start=1):
        story.append(PageBreak())
        story.append(Paragraph(f"Matriz preenchível, parte {page_index} de 2", styles["h2"]))
        story.append(Paragraph("Use peso de 1 a 3 e compatibilidade de 1 a 5. Em evidência, registre o fato que sustenta sua leitura.", styles["body"]))
        for criterion_index, criterion in enumerate(batch, start=(page_index - 1) * 5 + 1):
            story.append(Paragraph(criterion, styles["h3"]))
            header = ["Peso", "Opção 1", "Opção 2", "Opção 3"]
            fields = [
                FormTextField(f"matriz_{criterion_index}_peso", height=8 * mm, multiline=False),
                FormTextField(f"matriz_{criterion_index}_opcao_1", height=8 * mm, multiline=False),
                FormTextField(f"matriz_{criterion_index}_opcao_2", height=8 * mm, multiline=False),
                FormTextField(f"matriz_{criterion_index}_opcao_3", height=8 * mm, multiline=False),
            ]
            table = Table(
                [[Paragraph(label, styles["small"]) for label in header], fields],
                colWidths=[42.5 * mm] * 4,
                hAlign="LEFT",
            )
            table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]))
            story.append(table)
            story.append(Paragraph("Evidência principal e nível de confiança", styles["field_label"]))
            story.append(FormTextField(f"matriz_{criterion_index}_evidencia", height=10 * mm))
            story.append(Spacer(1, 1.5 * mm))


def footer(canvas, doc) -> None:
    page = canvas.getPageNumber()
    if page == 1:
        return
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.line(15 * mm, 13 * mm, width - 15 * mm, 13 * mm)
    canvas.setFont("Hank", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(15 * mm, 8.5 * mm, "Kit Valide Seu Top 3  |  Med Escolha 2.0")
    canvas.drawRightString(width - 15 * mm, 8.5 * mm, str(page - 1))
    canvas.restoreState()


def create_pdf(number: str, source_name: str, output_name: str, cover_title: str, subtitle: str) -> None:
    styles = build_styles()
    target = OUTPUT_DIR / output_name
    doc = BaseDocTemplate(
        str(target),
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=19 * mm,
        title=f"{cover_title} | Kit Valide Seu Top 3",
        author="Med Escolha 2.0 por Amo Medicina",
        subject=subtitle,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="pages", frames=[frame], onPage=footer)])

    story: list[Flowable] = [Cover(number, cover_title, subtitle), PageBreak()]
    story.extend(markdown_story(CONTENT_DIR / source_name, styles, f"m{number}"))

    if number == "01":
        worksheet(story, styles, "especialista", "Ficha de especialista", [
            "Especialidade, data e contexto profissional",
            "Como é uma semana comum",
            "Pacientes, atividades e ambientes frequentes",
            "Fatos e exemplos concretos",
            "Opiniões pessoais do entrevistado",
            "O que combina comigo e o que me incomoda",
            "Alerta e dúvida para investigar em outra fonte",
        ], 3)
    elif number == "02":
        worksheet(story, styles, "observacao", "Registro de observação", [
            "Especialidade, data, cenário e duração",
            "Minha expectativa antes de observar",
            "Ritmo, interrupções e natureza do trabalho",
            "Fatos observados sem dados de paciente",
            "Minha energia e reação durante a rotina comum",
            "O que combina comigo e o que seria difícil sustentar",
            "Próxima observação necessária",
        ], 3)
    elif number == "03":
        worksheet(story, styles, "residente", "Ficha de residente", [
            "Especialidade, ano, programa e cidade",
            "Retrato da semana e carga real",
            "Supervisão, autonomia e curva de aprendizado",
            "Custos, sono e vida fora da residência",
            "O que pertence à especialidade e o que pertence ao programa",
            "Expectativa quebrada e sinal de alerta",
            "Dúvida para confirmar em outro programa",
        ], 3)
    elif number == "04":
        matrix_sheets(story, styles)

    doc.build(story)


def load_font(size: int, bold: bool = False):
    suffix = "Black" if bold else "Regular"
    return ImageFont.truetype(str(WORKSPACE_ROOT / "marca" / "Hank Font" / f"HankRnd-{suffix}.ttf"), size)


def draw_wrapped(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], font, max_width: int, fill: str, spacing: int = 10) -> int:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), candidate, font=font)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += font.size + spacing
    return y


def create_product_image(size: tuple[int, int], target: Path) -> None:
    width, height = size
    image = Image.new("RGB", size, "#0B1F44")
    draw = ImageDraw.Draw(image)
    scale = min(width / 600, height / 600)
    margin = int(46 * scale)
    draw.rounded_rectangle((0, 0, int(width * 0.74), int(16 * scale)), radius=int(8 * scale), fill="#16B8A6")
    draw.ellipse((width - int(80 * scale), height - int(80 * scale), width - int(42 * scale), height - int(42 * scale)), fill="#FFBF00")
    draw.text((width - int(220 * scale), int(36 * scale)), "3", font=load_font(int(220 * scale), True), fill="#17345E")
    draw.text((margin, int(62 * scale)), "KIT", font=load_font(int(24 * scale), True), fill="#16B8A6")
    y = draw_wrapped(draw, "VALIDE SEU TOP 3", (margin, int(118 * scale)), load_font(int(58 * scale), True), int(width * 0.78), "#FFFFFF", int(7 * scale))
    y += int(28 * scale)
    draw_wrapped(draw, "14 dias para investigar a rotina real das suas três opções.", (margin, y), load_font(int(22 * scale)), int(width * 0.72), "#BFECE7", int(7 * scale))
    draw.line((margin, height - int(90 * scale), width - margin, height - int(90 * scale)), fill="#466181", width=max(1, int(2 * scale)))
    draw.text((margin, height - int(68 * scale)), "MED ESCOLHA 2.0", font=load_font(int(18 * scale), True), fill="#FFFFFF")
    draw.text((margin, height - int(40 * scale)), "por Amo Medicina", font=load_font(int(14 * scale)), fill="#B8C8DC")
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)


def build_zip() -> None:
    zip_path = OUTPUT_DIR / "kit-valide-seu-top3.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for _, _, output_name, _, _ in MODULES:
            archive.write(OUTPUT_DIR / output_name, arcname=output_name)


def main() -> None:
    register_fonts()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for module in MODULES:
        create_pdf(*module)
    build_zip()
    create_product_image((600, 600), PUBLIC_DIR / "kit-top3-hotmart-600x600.png")
    create_product_image((960, 540), PUBLIC_DIR / "kit-top3-card.png")
    print(f"Materiais gerados em {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
