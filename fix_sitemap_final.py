import glob

html_files = glob.glob('*.html')
urls = []
urls.append(f"""  <url>
    <loc>https://www.imgrunner.com/</loc>
    <lastmod>2026-05-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>""")

for f in sorted(html_files):
    if 'google' in f or f == 'index.html': continue
    urls.append(f"""  <url>
    <loc>https://www.imgrunner.com/{f}</loc>
    <lastmod>2026-05-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)
print("Sitemap fixed and rebuilt successfully!")
