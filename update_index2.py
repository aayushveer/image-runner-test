import os
import re

file_path = 'index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the link replacements
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

# We also need to add categorized sections instead of just the "Core Tool Suite" list
categories_html = """        <section id="tools" class="tools">
            <div class="container">
                <h2 class="reveal" style="font-size: 32px; margin-bottom: 12px;">Tools Collection</h2>
                <p class="reveal" style="font-size: 16px;">Explore our categorized utility tools designed to make your workflows easier.</p>
                
                <h3 style="margin-top: 40px; margin-bottom: 16px; font-size: 22px; color: #1e293b;">📸 Image Tools</h3>
                <div class="grid" style="margin-bottom: 24px;">
                    <a class="card reveal" href="tools/image-compressor/index.html"><div class="icon">🗜️</div><h3>Image Compress</h3><p>Reduce image size while preserving quality.</p></a>
                    <a class="card reveal" href="tools/background-remover/index.html"><div class="icon">✂️</div><h3>Background Remover</h3><p>AI cutout with hair-edge refine.</p></a>
                    <a class="card reveal" href="tools/image-resizer/index.html"><div class="icon">📐</div><h3>Image Resize</h3><p>Set exact dimensions easily.</p></a>
                    <a class="card reveal" href="tools/format-converter/index.html"><div class="icon">🔄</div><h3>Format Converter</h3><p>Convert JPG, PNG, WebP locally.</p></a>
                    <a class="card reveal" href="tools/photo-collage-maker/index.html"><div class="icon">🖼️</div><h3>Photo Collage</h3><p>Build beautiful multi-photo layouts.</p></a>
                    <a class="card reveal" href="tools/add-watermark/index.html"><div class="icon">🛡️</div><h3>Watermark Tool</h3><p>Fast batch process text & logos.</p></a>
                </div>

                <h3 style="margin-top: 40px; margin-bottom: 16px; font-size: 22px; color: #1e293b;">📄 PDF Tools</h3>
                <div class="grid" style="margin-bottom: 24px;">
                    <a class="card reveal" href="tools/image-to-pdf/index.html"><div class="icon">📄</div><h3>Image to PDF</h3><p>Merge multiple images into a PDF.</p></a>
                    <a class="card reveal" href="tools/pdf-to-image/index.html"><div class="icon">🧩</div><h3>PDF to Image</h3><p>Extract existing pages of a PDF.</p></a>
                </div>

                <h3 style="margin-top: 40px; margin-bottom: 16px; font-size: 22px; color: #1e293b;">💻 Developer & Design Tools</h3>
                <div class="grid" style="margin-bottom: 24px;">
                    <a class="card reveal" href="tools/color-palette-generator/index.html"><div class="icon">🎨</div><h3>Color Palette Picker</h3><p>Find visual HEX/RGB/HSL from images.</p></a>
                </div>

                <h3 style="margin-top: 40px; margin-bottom: 16px; font-size: 22px; color: #1e293b;">📝 Text Tools</h3>
                <div class="grid" style="margin-bottom: 24px;">
                    <!-- Placeholder for future Text tool -->
                    <a class="card reveal" href="javascript:void(0)" style="opacity: 0.6; cursor: default;"><div class="icon">📝</div><h3>Word Counter (Coming Soon)</h3><p>Real-time text metrics and stats.</p></a>
                </div>

                <h3 style="margin-top: 40px; margin-bottom: 16px; font-size: 22px; color: #1e293b;">🧰 Utility Tools</h3>
                <div class="grid" style="margin-bottom: 24px;">
                    <a class="card reveal" href="tools/passport-photo-maker/index.html"><div class="icon">🪪</div><h3>Passport Photo</h3><p>Standard formats for global visas.</p></a>
                    <a class="card reveal" href="tools/signature-generator/index.html"><div class="icon">✍️</div><h3>Signature Generator</h3><p>Draw digital signature visually.</p></a>
                </div>

                <!-- Trust signals -->
                <div class="why" style="margin-top: 60px;">
                    <div class="pill reveal"><h4>100% Private</h4><p>Client-side processing. Files stay on your device.</p></div>
                    <div class="pill reveal"><h4>No Signup</h4><p>Open tool, upload file, download result.</p></div>
                    <div class="pill reveal"><h4>Cross Device</h4><p>Works on mobile, tablet & desktop.</p></div>
                    <div class="pill reveal"><h4>Production Ready</h4><p>Optimized for real-world workflows.</p></div>
                </div>
            </div>
        </section>"""

content = re.sub(r'<section id="tools" class="tools">.*?</section>\s*<section class="workflows">', categories_html + '\n\n        <section class="workflows">', content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html categories and links!")
