import re
import json

filepath = 'background-remover.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS reference if not there
if 'seo-content.css' not in content:
    content = content.replace('</head>', '    <link rel="stylesheet" href="css/seo-content.css">\n</head>')

# 2. Prepare FAQ Page Schema
faq_schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Is this AI background remover tool really free?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Image Runner's AI background remover is 100% free with no daily limits, subscriptions, or watermarks."
            }
        },
        {
            "@type": "Question",
            "name": "Are my photos uploaded to a server?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all processing happens securely right inside your browser window using advanced WebAssembly AI. Your images are never uploaded or stored on our servers, ensuring total privacy."
            }
        },
        {
            "@type": "Question",
            "name": "What image formats are supported?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload JPG, PNG, WEBP, and HEIC images. The tool will output a high-quality PNG with a transparent background."
            }
        },
        {
            "@type": "Question",
            "name": "How accurate is the AI background removal?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our AI model is highly trained to handle complex edges like hair, fur, and intricate objects with professional-grade accuracy."
            }
        }
    ]
}
schema_script = f'\n    <script type="application/ld+json">\n    {json.dumps(faq_schema, indent=4)}\n    </script>\n'
if '"@type": "FAQPage"' not in content:
    content = content.replace('</head>', schema_script + '</head>')


# 3. HTML Content Block
seo_html = '''
    <!-- SEO Content Section -->
    <section class="seo-content">
        <div class="seo-container">
            
            <article class="seo-article">
                <h2 class="seo-heading">100% Free AI Background Remover</h2>
                <p class="seo-text">
                    Remove backgrounds from your images instantly with Image Runner's <strong>AI Background Remover</strong>. 
                    Whether you are preparing product photos for e-commerce, creating social media graphics, or editing portraits, 
                    our advanced AI model detects the main subject and cuts out the background with pixel-perfect accuracy.
                </p>
                <p class="seo-text">
                    Unlike other web tools, our application runs locally in your browser. This means <strong>zero server uploads</strong>, 
                    guaranteed privacy, and incredibly fast processing speeds. It is completely free, with no watermarks and no sign-up required.
                </p>
            </article>

            <article class="seo-article">
                <h2 class="seo-subheading">How to Remove Image Backgrounds Online</h2>
                <ol class="seo-list">
                    <li><strong>Upload your image:</strong> Select or drag-and-drop your JPG, PNG, or WebP file into the tool.</li>
                    <li><strong>Wait for AI processing:</strong> Our browser-based AI automatically detects the main subject (person, product, animal) and separates it from the background.</li>
                    <li><strong>Preview and Compare:</strong> Use the interactive slider to compare the original image with the transparent background.</li>
                    <li><strong>Download:</strong> Click Download to save your image instantly as a high-quality transparent PNG.</li>
                </ol>
            </article>

            <article class="seo-article">
                <h2 class="seo-subheading">Frequently Asked Questions</h2>
                
                <details class="seo-faq">
                    <summary>Is this AI background remover tool really free?</summary>
                    <div class="seo-faq-content">
                        Yes, Image Runner's AI background remover is 100% free with no daily limits, subscriptions, or watermarks.
                    </div>
                </details>
                
                <details class="seo-faq">
                    <summary>Are my photos uploaded to a server?</summary>
                    <div class="seo-faq-content">
                        No, all processing happens securely right inside your browser window using advanced WebAssembly AI. Your images are never uploaded or stored on our servers, ensuring total privacy.
                    </div>
                </details>

                <details class="seo-faq">
                    <summary>What image formats are supported?</summary>
                    <div class="seo-faq-content">
                        You can upload JPG, PNG, WEBP, and HEIC images. The tool will output a high-quality PNG with a transparent background.
                    </div>
                </details>

                <details class="seo-faq">
                    <summary>How accurate is the AI background removal?</summary>
                    <div class="seo-faq-content">
                        Our AI model is highly trained to handle complex edges like hair, fur, and intricate objects with professional-grade accuracy.
                    </div>
                </details>
            </article>
            
            <div class="seo-related">
                <h3 class="seo-subheading">Explore More Free Tools</h3>
                <div class="seo-related-grid">
                    <a href="image-compress.html" class="seo-related-item">Compress Image</a>
                    <a href="image-resize.html" class="seo-related-item">Resize Image</a>
                    <a href="passport-photo.html" class="seo-related-item">Passport Photo Maker</a>
                    <a href="image-to-pdf.html" class="seo-related-item">Image to PDF</a>
                    <a href="webp-converter.html" class="seo-related-item">WebP Converter</a>
                </div>
            </div>

        </div>
    </section>
'''

if 'class="seo-content"' not in content:
    # Insert right after </main>
    content = content.replace('</main>', '</main>\n' + seo_html)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("SEO content, FAQ schema, and standard CSS injected into background-remover.html")
