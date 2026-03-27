import os

file_path = 'index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all existing links
content = content.replace('href="image-compress.html"', 'href="tools/image-compressor/index.html"')
content = content.replace('href="image-resize.html"', 'href="tools/image-resizer/index.html"')
content = content.replace('href="background-remover.html"', 'href="tools/background-remover/index.html"')
content = content.replace('href="format-converter.html"', 'href="tools/format-converter/index.html"')
content = content.replace('href="image-to-pdf.html"', 'href="tools/image-to-pdf/index.html"')
content = content.replace('href="passport-photo.html"', 'href="tools/passport-photo-maker/index.html"')
content = content.replace('href="pdf-to-image.html"', 'href="tools/pdf-to-image/index.html"')
content = content.replace('href="photo-collage.html"', 'href="tools/photo-collage-maker/index.html"')
content = content.replace('href="color-palette.html"', 'href="tools/color-palette-generator/index.html"')
content = content.replace('href="add-watermark.html"', 'href="tools/add-watermark/index.html"')
content = content.replace('href="heic-to-jpg.html"', 'href="tools/heic-to-jpg/index.html"')
content = content.replace('href="webp-converter.html"', 'href="tools/webp-converter/index.html"')
content = content.replace('href="social-pack.html"', 'href="tools/social-media-pack/index.html"')
content = content.replace('href="signature-generator.html"', 'href="tools/signature-generator/index.html"')

# Structure the tools block based on categories:
# The user wants "Tool categories: Image Tools, PDF Tools, Developer Tools, Text Tools, Utility Tools"
# I should re-structure the "Core Tool Suite" section to use categories.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
