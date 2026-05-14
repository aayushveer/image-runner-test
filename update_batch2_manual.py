# -*- coding: utf-8 -*-
import re
import json

# 1. Update High-Quality Meta Descriptions
meta_updates = {
    'passport-photo.html': 'Create passport size photos online for free. Auto face center & white background for Aadhaar, PAN, and Visa. Print multiple photos on A4 paper easily.',
    'background-remover.html': 'Remove backgrounds from images online for free. AI-powered tool automatically cuts out subjects with pixel-perfect accuracy. 100% private and secure.',
    'heic-to-jpg.html': 'Convert HEIC to JPG online for free. Easily change iPhone HEIC photos to high-quality JPG format in your browser. Fast, secure, and private.',
    'pdf-to-image.html': 'Convert PDF to JPG or PNG images online for free. Extract pages from your PDF as high-quality pictures instantly. 100% private browser processing.',
    'webp-converter.html': 'Convert WebP images to JPG or PNG for free. Convert from WebP or to WebP format instantly with our secure, fast, browser-based image converter.'
}

for filepath, new_desc in meta_updates.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        # Find and replace meta description
        content = re.sub(
            r'<meta name="description" content="[^"]*">',
            f'<meta name="description" content="{new_desc}">',
            content
        )
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated Meta for {filepath}")
    except Exception as e:
        pass


# 2. Inject High-Quality SEO Content for the 3 that don't have it
seo_content_data = [
    {
        "file": "heic-to-jpg.html",
        "title": "Convert HEIC to JPG Online",
        "intro": "Apple's HEIC format saves space, but it is often not supported by Windows, older Androids, or web forms. Image Runner's HEIC to JPG converter allows you to instantly change your iPhone photos into widely accepted JPG formats right in your browser, maintaining original photo quality.",
        "steps": [
            "Click 'Select HEIC' or drag your iPhone photos into the box.",
            "Select your target output format (JPG or PNG).",
            "Click 'Convert' to process the photo instantly.",
            "Download the newly converted image to your device."
        ],
        "faqs": [
            {"q": "Does converting HEIC to JPG reduce image quality?", "a": "No, our tool extracts the raw image data to create a maximum quality JPG file, preserving the original resolution and colors of your iPhone photo."},
            {"q": "Is it safe to upload my personal photos?", "a": "Yes! All conversions happen directly via standard browser APIs. We never upload your personal images to any external cloud, ensuring 100% data privacy."},
            {"q": "Can I convert HEIC on a Windows PC?", "a": "Absolutely. Since the tool runs in your web browser, it works perfectly on Windows, Mac, Linux, and Android devices without needing extra HEVC codecs."}
        ]
    },
    {
        "file": "pdf-to-image.html",
        "title": "Convert PDF to Image (JPG/PNG)",
        "intro": "Need to post a PDF page on social media or insert it into a presentation? Image Runner's PDF to Image tool extracts every page of your PDF and converts them into high-resolution JPG or PNG pictures. Completely free and secure.",
        "steps": [
            "Upload the PDF document you want to convert.",
            "Select your preferred image format and quality settings.",
            "Wait a few seconds for the browser to render the pages.",
            "Download your converted images individually."
        ],
        "faqs": [
            {"q": "Will the text remain clear after converting PDF to JPG?", "a": "Yes, we use advanced vector rendering to ensure that all text, charts, and graphics from your PDF are converted into ultra-sharp, high-resolution images."},
            {"q": "Do you add any watermarks to the converted images?", "a": "No! Our tool is 100% free and we never add any watermarks or branding to your exported images."},
            {"q": "Are my business PDFs safe?", "a": "Completely secure. The PDF rendering process happens strictly in your local internet browser. Your sensitive documents never leave your computer."}
        ]
    },
    {
        "file": "webp-converter.html",
        "title": "Convert WebP to JPG or PNG",
        "intro": "WebP is fantastic for website speed, but many traditional software programs don't support it. Image Runner's WebP Converter acts as a two-way street: convert your WebP downloads into standard JPGs, or turn your heavy PNGs into next-gen WebP images to speed up your website.",
        "steps": [
            "Upload your WebP image (or upload a JPG/PNG to convert TO WebP).",
            "Select your desired output format from the dropdown.",
            "Adjust the quality slider if you want to optimize file size.",
            "Click 'Convert' and save the new photo."
        ],
        "faqs": [
            {"q": "Why can't I open WebP images on my computer?", "a": "WebP is a modern web format created by Google. Many default desktop image viewers do not support it natively yet, which is why converting them to JPG or PNG is often necessary."},
            {"q": "Can I convert images to WebP to speed up my site?", "a": "Yes! Our tool works both ways. You can upload bulky JPG or PNG files and convert them into WebP format to dramatically reduce your website's load times."},
            {"q": "Is there a file size limit?", "a": "No strict file size limits exist on our end, as the tool processes the files directly using your browser's memory and CPU."}
        ]
    }
]

def inject_seo(data):
    filepath = data['file']
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return

    if 'seo-content.css' not in content:
        content = content.replace('</head>', '    <link rel="stylesheet" href="css/seo-content.css">\\n</head>')
        
    schema_entities = []
    faq_html = ""
    for faq in data['faqs']:
        schema_entities.append({
            "@type": "Question",
            "name": faq['q'],
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq['a']
            }
        })
        faq_html += f'''
                <details class="seo-faq">
                    <summary>{faq['q']}</summary>
                    <div class="seo-faq-content">{faq['a']}</div>
                </details>'''

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": schema_entities
    }
    schema_script = f'    <script type="application/ld+json">\\n    {json.dumps(schema, indent=4)}\\n    </script>\\n'
    if '"@type": "FAQPage"' not in content:
        content = content.replace('</head>', schema_script + '</head>')
        
    steps_html = "".join([f"<li>{step}</li>" for step in data['steps']])
    seo_html = f'''
    <!-- SEO Content Section -->
    <section class="seo-content">
        <div class="seo-container">
            <article class="seo-article">
                <h2 class="seo-heading">{data['title']}</h2>
                <p class="seo-text">{data['intro']}</p>
                <p class="seo-text"><strong>100% Free - No Sign-up - Browser-based Privacy</strong></p>
            </article>

            <article class="seo-article">
                <h2 class="seo-subheading">How to Use the Tool</h2>
                <ol class="seo-list">
                    {steps_html}
                </ol>
            </article>

            <article class="seo-article">
                <h2 class="seo-subheading">Frequently Asked Questions</h2>
                {faq_html}
            </article>
            
            <div class="seo-related">
                <h3 class="seo-subheading">Try Our Other Free Tools</h3>
                <div class="seo-related-grid">
                    <a href="image-compress.html" class="seo-related-item">Compress Image</a>
                    <a href="image-resize.html" class="seo-related-item">Resize Image</a>
                    <a href="passport-photo.html" class="seo-related-item">Passport Photo Maker</a>
                    <a href="pdf-to-image.html" class="seo-related-item">PDF to Image </a>
                    <a href="webp-converter.html" class="seo-related-item">WebP Converter</a>
                    <a href="background-remover.html" class="seo-related-item">Background Remover</a>
                </div>
            </div>
        </div>
    </section>
'''

    if 'class="seo-content"' not in content:
        content = content.replace('</main>', '</main>\\n' + seo_html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Injected Content into {filepath}")

for tool in seo_content_data:
    inject_seo(tool)
