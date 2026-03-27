import os

file_path = 'tools/image-compressor/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS/JS paths
content = content.replace('href="css/', 'href="../../css/')
content = content.replace('src="js/', 'src="../../js/')

# Fix Navigation links
content = content.replace('href="index.html"', 'href="../../index.html"')
content = content.replace('href="image-resize.html"', 'href="../image-resizer/index.html"')
content = content.replace('href="image-compress.html"', 'href="index.html"')
content = content.replace('href="passport-photo.html"', 'href="../passport-photo-maker/index.html"')
content = content.replace('href="format-converter.html"', 'href="../format-converter/index.html"')
content = content.replace('href="color-palette.html"', 'href="../color-palette-generator/index.html"')

# Add SEO sections before Trust Badges
seo_content = """    <!-- SEO Content Section -->
    <section class="seo-content" style="padding: 60px 0; background: #fff;">
        <div class="container" style="max-width: 800px; margin: 0 auto; color: #334155; line-height: 1.6;">
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">About the Image Compressor Tool</h2>
                <p>Welcome to our free online image compressor. This powerful tool is designed to compress your JPG, PNG, and WebP images up to 90% without losing quality. It operates entirely in your browser using advanced client-side algorithms. Your files never leave your device, ensuring 100% privacy and lightning-fast processing.</p>
            </div>
            
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">How to Use the Image Compressor</h2>
                <ol style="padding-left: 20px; line-height: 1.8;">
                    <li><strong>Upload your images:</strong> Click the upload button or drag and drop your photos into the dropzone.</li>
                    <li><strong>Choose compression level:</strong> Select between 'Low' (best quality), 'Recommended' (balanced), or 'Maximum' (smallest file size).</li>
                    <li><strong>Fine-tune quality:</strong> Use the quality slider if you want custom compression percentage.</li>
                    <li><strong>Compress:</strong> Click the 'Compress Images' button to start processing.</li>
                    <li><strong>Download:</strong> Save the compressed images individually or as a ZIP file.</li>
                </ol>
            </div>

            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Frequently Asked Questions</h2>
                <div style="margin-bottom: 20px;">
                    <strong style="color: #0f172a;">Does compressing images reduce their quality?</strong>
                    <p style="margin-top: 5px;">Our smart compression algorithms preserve structural quality while dramatically reducing file size. For the best balance, use the 'Recommended' mode.</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <strong style="color: #0f172a;">Is my data private?</strong>
                    <p style="margin-top: 5px;">Yes! All processing happens locally in your web browser. We do not upload your images to any server, guaranteeing complete privacy.</p>
                </div>
                <div>
                    <strong style="color: #0f172a;">How many images can I compress at once?</strong>
                    <p style="margin-top: 5px;">You can bulk select up to 20 images at a time for fast batch processing. Downloading them as a ZIP is highly recommended for convenience.</p>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Related Tools</h2>
                <ul style="list-style: none; padding: 0; display: flex; gap: 15px; flex-wrap: wrap;">
                    <li><a href="../image-resizer/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Image Resizer</a></li>
                    <li><a href="../format-converter/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Format Converter</a></li>
                    <li><a href="../background-remover/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Background Remover</a></li>
                    <li><a href="../pdf-to-image/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">PDF to Image</a></li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Trust Badges & Testimonials Section -->"""

content = content.replace('    <!-- Trust Badges & Testimonials Section -->', seo_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete")
