import os
import re
import glob

# Get all HTML files
html_files = glob.glob("*.html")

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix viewport
    content = re.sub(
        r'<meta name="viewport" content="[^"]*">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        content
    )
    
    # 2. Remove obsolete meta tags
    content = re.sub(r'<meta name="keywords"[^>]*>\n?', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name="revisit-after"[^>]*>\n?', '', content, flags=re.IGNORECASE)
    
    # 3. Standardize font to Inter
    # Some files use space grotesk
    content = re.sub(
        r'(<link href="https://fonts\.googleapis\.com/css2\?family=)Space\+Grotesk([^"]*)(" rel="stylesheet">)',
        r'\1Inter:wght@400;500;600;700\3',
        content
    )
    # Also change font-family in any inline styles or classes just in case, but usually it's in CSS files.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Applied bulk fixes to", len(html_files), "files")
