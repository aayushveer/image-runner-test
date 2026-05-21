from pathlib import Path

TARGETS = [
    "background-remover.html",
    "image-compress.html",
    "image-resize.html",
    "image-to-pdf.html",
    "passport-photo.html",
    "signature-generator.html",
    "social-pack.html",
    "upload-ready-optimizer.html",
]

for name in TARGETS:
    path = Path(name)
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    if '"@type": "WebApplication"' in text:
        continue

    updated = text.replace('"@type": "SoftwareApplication"', '"@type": "WebApplication"', 1)
    updated = updated.replace('"priceCurrency": "INR"', '"priceCurrency": "USD"')

    if updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"Updated schema type: {name}")
