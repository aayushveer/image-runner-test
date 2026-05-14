import re
import json

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
    
if '"@type": "WebSite"' not in content:
    schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Image Runner",
        "url": "https://www.imgrunner.com/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.imgrunner.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    
    schema_script = f'\n    <script type="application/ld+json">\n    {json.dumps(schema, indent=4)}\n    </script>\n'
    content = content.replace('</head>', schema_script + '</head>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Added WebSite schema to index.html")
