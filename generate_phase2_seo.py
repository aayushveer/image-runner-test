# -*- coding: utf-8 -*-
import re
import json

tools_data = [
    {
        "file": "image-compress.html",
        "title": "Compress Images Online for Free",
        "intro": "Reduce your image file sizes by up to 90% without losing quality. Image Runner's Image Compressor uses smart lossy compression to decrease the byte size of your JPG, PNG, and WebP files. Perfect for optimizing website load times, saving storage space, or sending large photos via email.",
        "steps": [
            "Click on 'Select Images' to upload one or multiple photos.",
            "Adjust the compression quality slider to balance file size and visual quality.",
            "Compare the original and compressed sizes in real-time.",
            "Click 'Download All' to save your compressed images instantly."
        ],
        "faqs": [
            {"q": "Will my images lose quality if I compress them?", "a": "Our brilliant AI compression algorithm removes hidden data and optimizes colors so you reduce file size by up to 90% with almost zero visible difference to the human eye."},
            {"q": "Is the image compressor secure? Do you store my photos?", "a": "Yes, 100% secure! Image Runner processes all compression locally in your browser. Your files are NEVER uploaded to any external servers, ensuring maximum privacy."},
            {"q": "Can I compress multiple images at once?", "a": "Absolutely. You can batch compress multiple images simultaneously, saving you precious time."}
        ]
    },
    {
        "file": "image-resize.html",
        "title": "Resize Images Online Quickly",
        "intro": "Need to change the dimensions of your photo? Image Runner's free Image Resizer lets you scale your pictures by pixels or percentage instantly. Whether it is for an Instagram post, a website header, or a strict document upload requirement, you get perfect dimensions in one click.",
        "steps": [
            "Upload your photo by dragging and dropping it into the tool.",
            "Choose 'By Pixels' or 'By Percentage' to set your new dimensions.",
            "Toggle 'Keep Aspect Ratio' to avoid stretching or distorting your image.",
            "Click 'Resize Image' and download your perfectly scaled photo."
        ],
        "faqs": [
            {"q": "How do I resize an image without losing quality?", "a": "Downsizing an image will always retain high sharpness. When enlarging, some blur can occur, but our tool uses optimized nearest-neighbor and bilinear interpolations to keep blurring to a minimum."},
            {"q": "Can I resize images for social media?", "a": "Yes! You can define the exact pixel height and width required by Instagram, Facebook, YouTube, or Twitter."},
            {"q": "Is it free to resize photos?", "a": "Yes, completely free with no watermarks and no limits on how many photos you can resize."}
        ]
    },
    {
        "file": "merge-pdf.html",
        "title": "Merge PDF Files Online Securely",
        "intro": "Combine multiple PDF documents into a single, easy-to-share file. Image Runner provides a fast, browser-based PDF merger that is 100% private. No software installations or expensive subscriptions needed. Organize reports, invoices, or assignments in seconds.",
        "steps": [
            "Drag and drop the PDF files you want to combine.",
            "Drag the thumbnails to rearrange them in your preferred order.",
            "Click 'Merge PDFs' to process them instantly.",
            "Download your newly combined PDF document."
        ],
        "faqs": [
            {"q": "Is it safe to merge confidential PDFs?", "a": "Yes! Unlike other PDF tools that upload your sensitive documents to a cloud server, Image Runner merges your PDFs locally in your browser. Nobody else can see your files."},
            {"q": "How many PDFs can I merge at once?", "a": "You can merge dozens of PDFs at the same time, restricted only by the memory available in your web browser."},
            {"q": "Can I rearrange the pages before merging?", "a": "Yes, after uploading, simply drag and drop the file thumbnails into the exact order you want them to appear in the merged document."}
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
                    <a href="image-to-pdf.html" class="seo-related-item">Image to PDF</a>
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
