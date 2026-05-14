# -*- coding: utf-8 -*-
import re
import json

tools_data = [
    {
        "file": "compress-pdf.html",
        "title": "Compress PDF Files Online",
        "intro": "Reduce the size of your PDF files without losing quality. Our free PDF Compressor makes it easy to shrink large documents so they fit into email attachments seamlessly. Perfect for optimizing resumes, reports, and scan files, Image Runner guarantees fast and fully secure processing directly in your browser.",
        "steps": [
            "Upload your PDF by clicking 'Select PDF' or dragging it onto the page.",
            "Choose your desired compression level (Low, Medium, or High).",
            "Click the 'Compress PDF' button.",
            "Download your optimized PDF instantly."
        ],
        "faqs": [
            {"q": "Will compressing my PDF make the text blurry?", "a": "No, our smart PDF compressor optimizes the images and embedded fonts inside the document while keeping text crisp and readable."},
            {"q": "Are my files uploaded to a server?", "a": "Absolutely not. Your PDF files are compressed entirely within your web browser. No files are uploaded to our servers, ensuring total privacy."},
            {"q": "Is there a limit to how many PDFs I can compress?", "a": "There are no daily limits! You can compress as many PDF documents as you need for free."}
        ]
    },
    {
        "file": "image-to-pdf.html",
        "title": "Convert Image to PDF Online",
        "intro": "Easantly combine your JPG, PNG, and WebP images into a single PDF document. Image Runner's Image to PDF converter is 100% free and requires no software installation. Whether you are compiling a portfolio, creating a presentation, or scanning receipts to PDF, we make the process instant and strictly private.",
        "steps": [
            "Drag and drop your images into the upload box.",
            "Sort the images by dragging them into your desired order.",
            "Adjust PDF settings like page size and margin if needed.",
            "Click 'Convert to PDF' and download your new file."
        ],
        "faqs": [
            {"q": "Can I convert multiple images into a single PDF?", "a": "Yes! You can upload multiple JPGs or PNGs at the same time and we will merge them all together into one continuous PDF document."},
            {"q": "Does this tool work on my mobile phone?", "a": "Yes, Image Runner is fully optimized for mobile devices. You can convert photos directly from your iPhone or Android camera roll."},
            {"q": "Will my images lose quality during the PDF conversion?", "a": "No, we preserve the original resolution and quality of your images when embedding them into the PDF pages."}
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
                    <a href="merge-pdf.html" class="seo-related-item">Merge PDF</a>
                    <a href="compress-pdf.html" class="seo-related-item">Compress PDF</a>
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
    print(f"Updated {filepath}")

for tool in tools_data:
    inject_seo(tool)
