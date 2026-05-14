import glob
import re

html_files = glob.glob('*.html')
count = 0
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'property="og:site_name"' not in content:
        # insert before </head>
        content = content.replace('</head>', '    <meta property="og:site_name" content="Image Runner">\n</head>')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1

print(f"Added og:site_name to {count} files.")
