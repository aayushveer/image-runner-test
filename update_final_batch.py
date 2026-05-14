import re
import json

seo_content_data = [
    {
        "file": "add-watermark.html",
        "title": "Add Watermark to Images Online",
        "meta": "Protect your photos online. Add text or logo watermarks to your images instantly for free. 100% private, browser-based secure watermark tool.",
        "intro": "Protecting your digital assets is crucial. Image Runner's Watermark Tool allows you to brand your photography, protect your documents, and copyright your artwork safely within your browser.",
        "steps": [
            "Upload the image you want to protect.",
            "Choose a text or logo watermark.",
            "Adjust the opacity, position, and size of the watermark.",
            "Download your branded image securely."
        ],
        "faqs": [
            {"q": "Can I watermark multiple photos?", "a": "You can watermark one photo at a time, but our fast processing allows you to process multiple images quickly back-to-back."},
            {"q": "Is my original photo stored online?", "a": "No, all watermarking happens entirely on your local device. We never upload your images to any cloud servers."}
        ]
    },
    {
        "file": "color-palette.html",
        "title": "Color Palette Generator Online",
        "meta": "Extract beautiful color palettes from any image instantly. Generate hex codes and color schemes directly from your photos for free.",
        "intro": "Need inspiration for your next design project? Upload any photo to the Color Palette Generator and instantly extract the dominant colors, perfectly suited for web design, interior decor, or digital art.",
        "steps": [
            "Upload an image containing colors you love.",
            "Our tool instantly extracts the dominant color scheme.",
            "Click on any color to copy its HEX or RGB code.",
            "Save the palette for your design projects."
        ],
        "faqs": [
            {"q": "How does the color extractor work?", "a": "It uses client-side algorithms to find the most visually dominant and frequent colors in your uploaded picture."},
            {"q": "Are the color codes matching exactly?", "a": "Yes, it provides exact HEX codes based on the precise pixel data from your photograph."}
        ]
    },
    {
        "file": "format-converter.html",
        "title": "Image Format Converter Online",
        "meta": "Convert image formats online for free. Change JPG, PNG, GIF, BMP, and WEBP formats instantly inside your browser. 100% private processing.",
        "intro": "Stuck with an image that won't open or upload? Image Runner's Universal Format Converter quickly changes your photos between JPG, PNG, WEBP, and more without losing quality, directly inside your browser.",
        "steps": [
            "Upload the image file you need to convert.",
            "Select the new format you want (e.g., JPG to PNG).",
            "Click 'Convert' and the process will finish in milliseconds.",
            "Save your new file to your device."
        ],
        "faqs": [
            {"q": "Can I convert high-resolution images?", "a": "Yes, our converter handles high-resolution images and converts them flawlessly while preserving the original pixel dimensions."},
            {"q": "Do you add watermarks to converted images?", "a": "No, all our services are 100% free and we never place watermarks on your files."}
        ]
    },
    {
        "file": "split-pdf.html",
        "title": "Split PDF Pages Online",
        "meta": "Split PDF pages online for free. Extract specific pages or separate a large PDF document into multiple files instantly. 100% secure.",
        "intro": "Don't send a massive document when you only need one page. Image Runner's PDF Splitter lets you extract specific pages, or divide documents into multiple smaller files quickly and privately.",
        "steps": [
            "Select and upload the PDF file you want to split.",
            "Choose to split equally or extract specific page ranges.",
            "Click 'Split PDF' to preview your new documents.",
            "Download the extracted pages as a ZIP or individual files."
        ],
        "faqs": [
            {"q": "Is the PDF splitting processed locally?", "a": "Yes, all PDF processing is done inside your browser. No files are uploaded, making it extremely safe for legal or financial documents."},
            {"q": "Does splitting a PDF reduce its quality?", "a": "No, the extracted pages retain their exact original quality, layout, formatting, and text clarity."}
        ]
    },
    {
        "file": "rotate-pdf.html",
        "title": "Rotate PDF Pages Online",
        "meta": "Rotate PDF pages online for free. Fix upside-down scans and documents instantly. Rotate to 90, 180, or 270 degrees securely in your browser.",
        "intro": "Scanned a document upside down? Image Runner's PDF Rotator helps you permanently flip pages to the correct orientation. Perfect for fixing scanned receipts or legal forms instantly.",
        "steps": [
            "Upload the PDF you want to rotate.",
            "Click the rotation arrows to fix individual pages or the whole document.",
            "Confirm the changes.",
            "Download your permanently corrected PDF."
        ],
        "faqs": [
            {"q": "Can I rotate just one page in a PDF?", "a": "Yes, you can choose to rotate individual pages manually or apply a rotation to the entire document at once."},
            {"q": "Is it safe to use this tool for bank statements?", "a": "Absolutely. Since the rotation is done locally on your device, no data is transferred to internet servers, ensuring 100% privacy."}
        ]
    },
    {
        "file": "signature-generator.html",
        "title": "Online Signature Generator",
        "meta": "Draw or type your signature online for free. Create beautiful e-signatures downloaded as transparent PNG files. 100% private and secure.",
        "intro": "Need to sign a digital document fast? Use our free Signature Generator to draw or type a unique electronic signature. Download it instantly as a transparent PNG to use on PDFs and Word documents.",
        "steps": [
            "Choose 'Draw' or 'Type' mode.",
            "Sign your name using your mouse, trackpad, or touch screen.",
            "Adjust the thickness and color.",
            "Download the signature as a transparent background PNG file."
        ],
        "faqs": [
            {"q": "Are the signatures legally binding?", "a": "These are graphic representations of your signature. While widely accepted for informal agreements and internal documents, check local laws for strict legal bindings."},
            {"q": "Do you save a copy of my signature?", "a": "No! We respect your privacy. All strokes are generated on your local screen and nothing is ever sent or saved to a server."}
        ]
    },
    {
        "file": "upload-ready-optimizer.html",
        "title": "Image Size Optimizer",
        "meta": "Compress images to exact target sizes like 50kb or 100kb online. Perfect for strict government forms and exam portals. Free & secure.",
        "intro": "Government portals and job applications often reject files over a certain size limitation. Our Target Size Optimizer intelligently compresses your image to hit your exact requirement automatically.",
        "steps": [
            "Upload the image you need to resize.",
            "Enter your exact maximum file size (in KB).",
            "Our tool will automatically calculate the best compression.",
            "Download your compliant, optimized photo."
        ],
        "faqs": [
            {"q": "Can I compress an image to exactly 50kb?", "a": "Yes! Just set your target size and the tool will use adaptive compression to get as close to the target as possible without exceeding it."},
            {"q": "Is the process secure?", "a": "Completely secure. All processing happens in your browser natively."}
        ]
    },
    {
        "file": "photo-collage.html",
        "title": "Photo Collage Maker Online",
        "meta": "Create beautiful photo collages online for free. Combine multiple images into creative grids and layouts instantly in your browser.",
        "intro": "Tell a better story by combining multiple photos into one. Our free Photo Collage Maker offers fast, easy-to-use grid layouts for your social media posts or digital albums.",
        "steps": [
            "Select multiple photos to upload.",
            "Choose a layout template.",
            "Drag to position your photos perfectly inside the frames.",
            "Download your final collage image."
        ],
        "faqs": [
            {"q": "Is this tool free?", "a": "Yes, our grid collage maker is entirely free to use with no hidden fees."},
            {"q": "Does my collage lose quality?", "a": "We maintain the highest possible resolution when stitching your images together into the final output."}
        ]
    },
    {
        "file": "image-size-increaser.html",
        "title": "Image Upscaler & Size Increaser",
        "meta": "Increase image size safely. Enlarge your photos and dimensions online for free using precise browser-based processing.",
        "intro": "If a platform requires a minimum photo dimension and yours is too small, use our Image Size Increaser to enlarge your picture's width and height to meet those requirements instantly.",
        "steps": [
            "Upload your small image.",
            "Set your desired width and height.",
            "Preview the scaling.",
            "Download the enlarged file."
        ],
        "faqs": [
            {"q": "Will enlarging an image make it blurry?", "a": "Increasing physical pixel size can introduce some softness, but our smooth interpolation algorithms attempt to keep the image as clear as possible."},
            {"q": "Is the image data uploaded?", "a": "No, all upscaling happens on your device locally for total privacy."}
        ]
    },
    {
        "file": "social-pack.html",
        "title": "Social Media Image Cropper",
        "meta": "Instantly crop and resize photos for all social media platforms (Instagram, Twitter, Facebook). Free, fast & secure online tool.",
        "intro": "Tired of guessing the right dimensions for social media? The Social Media Pack Cropper automatically resizes and crops your uploads to the exact safe zones required by Instagram, Facebook, and Twitter.",
        "steps": [
            "Upload your photo.",
            "Select the social media platform and post type.",
            "Use the crop box to frame your image.",
            "Download the perfectly sized picture."
        ],
        "faqs": [
            {"q": "Are the dimensions accurate for 2025?", "a": "Yes, we regularly update our platform cropping presets to conform to the latest social media guidelines."},
            {"q": "Is the processing private?", "a": "100% private. Your images are cropped inside your browser, offline."}
        ]
    }
]

def inject_seo(data):
    filepath = data['file']
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return

    content = re.sub(
        r'<meta name="description" content="([^"]*)">',
        f'<meta name="description" content="{data["meta"]}">',
        content
    )

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
                    <a href="background-remover.html" class="seo-related-item">Background Remover</a>
                    <a href="webp-converter.html" class="seo-related-item">WebP Converter</a>
                </div>
            </div>
        </div>
    </section>
'''

    if 'class="seo-content"' not in content:
        content = content.replace('</main>', '</main>\\n' + seo_html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Completely updated SEO for: {filepath}")

for d in seo_content_data:
    inject_seo(d)
