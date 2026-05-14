import glob
import re
import json

html_files = glob.glob('*.html')
count = 0

for filepath in html_files:
    if filepath == 'index.html':
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if SoftwareApplication schema already exists
    if '"@type": "SoftwareApplication"' in content:
        continue
        
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    title = title_match.group(1) if title_match else filepath.replace('.html', '').replace('-', ' ').title()
    # Strip pipe or dash from title for brevity
    clean_title = title.split('|')[0].strip()
    clean_title = clean_title.split('- Free')[0].strip()
    
    # Generate JSON-LD Schema
    schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": clean_title,
        "operatingSystem": "Any",
        "applicationCategory": "UtilitiesApplication",
        "browserRequirements": "Requires HTML5 context",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
        }
    }
    
    schema_script = f'\n    <script type="application/ld+json">\n    {json.dumps(schema, indent=4)}\n    </script>\n'
    
    # insert before </head>
    content = content.replace('</head>', schema_script + '</head>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    count += 1

print(f"Added SoftwareApplication schema to {count} missing files.")
