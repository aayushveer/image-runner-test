import re
from datetime import datetime

filepath = 'sitemap.xml'
today = datetime.now().strftime('%Y-%m-%d')
try:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace <loc>URL</loc> with <loc>URL</loc>\n<lastmod>TODAY</lastmod>
    # if it doesn't already have lastmod
    
    def replacer(match):
        url = match.group(1)
        # return the loc tag, with the lastmod tag right after it
        return f'{url}\\n    <lastmod>{today}</lastmod>'

    # Simple regex to find <loc> blocks that don't have <lastmod> closely following them.
    # A cleaner way is just resetting all blocks:
    content = re.sub(r'(<loc>[^<]+</loc>)(?!\\s*<lastmod>)', replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Sitemap up to date with lastmod!")
except Exception as e:
    print("Error:", e)
