import os
import shutil

# Map top-level HTML files to their tool directories
TOOLS_MAP = {
    'background-remover.html': 'background-remover',
    'color-palette.html': 'color-palette-generator',
    'format-converter.html': 'format-converter',
    'image-resize.html': 'image-resizer',
    'image-to-pdf.html': 'image-to-pdf',
    'passport-photo.html': 'passport-photo-maker',
    'pdf-to-image.html': 'pdf-to-image',
    'photo-collage.html': 'photo-collage-maker',
    'add-watermark.html': 'add-watermark',
    'heic-to-jpg.html': 'heic-to-jpg',
    'webp-converter.html': 'webp-converter',
    'social-pack.html': 'social-media-pack',
    'signature-generator.html': 'signature-generator',
}

def generate_seo_content(tool_key, tool_dir):
    name = tool_key.replace('.html', '').replace('-', ' ').title()
    return f"""    <!-- SEO Content Section -->
    <section class="seo-content" style="padding: 60px 0; background: #fff;">
        <div class="container" style="max-width: 800px; margin: 0 auto; color: #334155; line-height: 1.6;">
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">About the {name} Tool</h2>
                <p>Welcome to our free online {name} tool. We built this utility to solve your everyday tasks directly in the browser. Using advanced client-side processing, this tool ensures complete privacy as your files never leave your device.</p>
            </div>
            
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">How to Use the {name}</h2>
                <ol style="padding-left: 20px; line-height: 1.8;">
                    <li><strong>Upload your files:</strong> Select your file or drag and drop it into the designated dropzone area.</li>
                    <li><strong>Adjust settings:</strong> Use the intuitive UI parameters to configure the output to your exact liking.</li>
                    <li><strong>Process:</strong> Click the processing button to let the client-side magic happen instantly.</li>
                    <li><strong>Download:</strong> Your newly generated files are immediately available for download.</li>
                </ol>
            </div>

            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Frequently Asked Questions</h2>
                <div style="margin-bottom: 20px;">
                    <strong style="color: #0f172a;">Is this {name} tool free to use?</strong>
                    <p style="margin-top: 5px;">Yes, it is 100% free with no hidden fees or watermark limitations.</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <strong style="color: #0f172a;">Is my data private?</strong>
                    <p style="margin-top: 5px;">Absolutely. All processing occurs locally right in your web browser. Nothing is sent to our servers.</p>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Related Tools</h2>
                <ul style="list-style: none; padding: 0; display: flex; gap: 15px; flex-wrap: wrap;">
                    <li><a href="../image-compressor/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Image Compressor</a></li>
                    <li><a href="../image-resizer/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Image Resizer</a></li>
                    <li><a href="../format-converter/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Format Converter</a></li>
                    <li><a href="../background-remover/index.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Background Remover</a></li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Trust Badges & Testimonials Section -->"""

def process_file(html_file, tool_dir):
    if not os.path.exists(html_file):
        print(f"File {html_file} does not exist, skipping.")
        return
        
    out_dir = os.path.join('tools', tool_dir)
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'index.html')
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Paths replacement
    content = content.replace('href="css/', 'href="../../css/')
    content = content.replace('src="js/', 'src="../../js/')
    
    # Navigation linking replacement
    content = content.replace('href="index.html"', 'href="../../index.html"')
    for key, mapped_dir in TOOLS_MAP.items():
        if key == html_file:
            content = content.replace(f'href="{key}"', 'href="index.html"')
        else:
            content = content.replace(f'href="{key}"', f'href="../{mapped_dir}/index.html"')
    content = content.replace('href="image-compress.html"', 'href="../image-compressor/index.html"')
    
    # Inject SEO content if possible
    # Some pages might not have it exactly like 'Trust Badges & Testimonials Section', let's attach before Footer
    seo_content = generate_seo_content(html_file, tool_dir)
    
    if '<!-- Footer -->' in content:
        content = content.replace('<!-- Footer -->', seo_content + '\n\n    <!-- Footer -->')
        
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Migrated {html_file} -> {out_file}")

def main():
    if not os.path.exists('tools'):
        os.makedirs('tools')
        
    for file, directory in TOOLS_MAP.items():
        process_file(file, directory)
        
if __name__ == '__main__':
    main()
