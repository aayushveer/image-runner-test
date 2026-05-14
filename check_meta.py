import glob
import re
for f in glob.glob('*.html'):
    if 'google' in f: continue
    content = open(f, encoding='utf-8').read()
    m = re.search(r'<meta name="description" content="([^"]+)"', content)
    if m:
        l = len(m.group(1))
        if l < 100 or l > 160:
            print(f"{f}: Warning length {l}")
    else:
        print(f"{f}: MISSING text")
