#!/usr/bin/env python3
"""Extract opposition card images from oppositions.pdf pages."""

from pathlib import Path
from PIL import Image
import pypdfium2 as pdfium

PDF_PATH = Path(
    "/Users/yasuki/Library/CloudStorage/GoogleDrive-lets6@juku-lets.com/"
    ".shortcut-targets-by-id/1HuCuIY9sBooLJOF5NzhJBLqY5a-cT_wb/"
    "レッツ社員用/20_講座/125_幼児英語_Sprouts/イラスト/picture cards/oppositions/oppositions.pdf"
)
PAGE_OUT = Path("/Users/yasuki/Documents/GitHub/幼児英語/mockup/assets/oppositions_pdf_pages")
CARD_OUT = Path("/Users/yasuki/Documents/GitHub/幼児英語/mockup/assets/oppositions_cards")

PAIRS = {
    "wake_up": (1, 2),
    "sleep": (3, 4),
    "stand_up": (5, 6),
    "sit_down": (7, 8),
    "dirty": (9, 10),
    "clean": (11, 12),
    "long": (13, 14),
    "short": (15, 16),
    "dark": (17, 18),
    "bright": (19, 20),
}


def trim_white(img, threshold=245):
    rgb = img.convert("RGB")
    pix = rgb.load()
    w, h = rgb.size
    left, top, right, bottom = w, h, -1, -1

    for y in range(h):
        for x in range(w):
            r, g, b = pix[x, y]
            if not (r > threshold and g > threshold and b > threshold):
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)

    if right == -1:
        return img

    margin = 16
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(w - 1, right + margin)
    bottom = min(h - 1, bottom + margin)
    return img.crop((left, top, right + 1, bottom + 1))


def render_pages():
    PAGE_OUT.mkdir(parents=True, exist_ok=True)
    pdf = pdfium.PdfDocument(str(PDF_PATH))

    for i in range(len(pdf)):
        page = pdf[i]
        img = page.render(scale=1.8).to_pil()
        img.save(PAGE_OUT / f"page_{i + 1:02d}.png")


def export_cards():
    CARD_OUT.mkdir(parents=True, exist_ok=True)

    for name, (jp_page, en_page) in PAIRS.items():
        for mode, page in (("jp", jp_page), ("en", en_page)):
            img = Image.open(PAGE_OUT / f"page_{page:02d}.png")
            img = trim_white(img)
            target_h = 380
            ratio = target_h / img.height
            img = img.resize((int(img.width * ratio), target_h), Image.LANCZOS)
            img.save(CARD_OUT / f"{name}_{mode}.png")


def main():
    render_pages()
    export_cards()
    print(f"Saved card images to: {CARD_OUT}")


if __name__ == "__main__":
    main()
