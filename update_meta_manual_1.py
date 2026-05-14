import re

# High-quality, hand-crafted meta descriptions (all under 160 characters)
meta_updates = {
    'image-compress.html': 'Compress images online for free. Reduce JPG, PNG & WebP file size by up to 90% without losing quality. 100% private, browser-based compression.',
    'image-resize.html': 'Resize images online instantly. Scale photos by pixels or percentage for social media, document uploads, and web design. Fast, free & secure.',
    'merge-pdf.html': 'Merge PDF files online for free. Combine multiple PDFs into a single document fast & securely. No signup required. 100% private browser processing.',
    'compress-pdf.html': 'Compress PDF files online for free. Reduce PDF size for easy email sharing without losing text or image quality. Secure, fast, and private.',
    'image-to-pdf.html': 'Convert JPG, PNG & WebP images to PDF online. Merge multiple photos into one PDF document instantly. 100% free, private, and securely processed.'
}

for filepath, new_desc in meta_updates.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace existing meta description
        new_content = re.sub(
            r'<meta name="description" content="[^"]*">',
            f'<meta name="description" content="{new_desc}">',
            content
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} - Length: {len(new_desc)}")
    except Exception as e:
        print(f"Error with {filepath}: {e}")
