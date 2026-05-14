import re

content = open('index.html', encoding='utf-8').read()

# Check meta description
m = re.search(r'<meta name="description" content="([^"]+)">', content)
if m:
    print(f"Index Meta Desc Length: {len(m.group(1))} - {m.group(1)}")
else:
    print("Index Meta Desc Missing")
    
# Check canonical
c = re.search(r'<link rel="canonical" href="([^"]+)">', content)
print(f"Index Canonical: {c.group(1) if c else 'Missing'}")

# Check h1
h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
print(f"Index H1 count: {len(h1)}")
