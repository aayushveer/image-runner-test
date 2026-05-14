import glob
import re

for f in glob.glob('*.html'):
    if 'google' in f: continue
    content = open(f, encoding='utf-8').read()
    c = re.search(r'<link rel="canonical" href="([^"]+)">', content)
    if c:
        expected = f"https://www.imgrunner.com/{f}" if f != 'index.html' else "https://www.imgrunner.com/"
        if c.group(1) != expected:
            print(f"Canonical mismatch in {f}: Expected {expected} got {c.group(1)}")
    else:
        print(f"Missing canonical in {f}")
        
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    if len(h1s) != 1:
        print(f"H1 tag issue in {f}: Found {len(h1s)} tags.")
