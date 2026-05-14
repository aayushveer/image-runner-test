import glob
import re

html_files = glob.glob('*.html')

# Standardized links to inject inside <nav>
standardized_nav_inner = '''
    <a href="image-compress.html" class="nav__link">Compress</a>
    <a href="image-resize.html" class="nav__link">Resize</a>
    <a href="passport-photo.html" class="nav__link">Passport</a>
    <a href="background-remover.html" class="nav__link">BG Remove</a>
    <a href="pdf-to-image.html" class="nav__link">PDF Tools</a>
'''

def fix_nav():
    count = 0
    for filepath in html_files:
        if filepath == 'index.html':
            continue  # index.html has a totally different hero-heavy nav structure
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the <nav> element in the header/topbar area
        # We look for <nav ...> ... </nav> block. We want to preserve the <nav> tag itself
        # because of class differences (e.g. class="topbar__nav" vs class="nav")
        nav_pattern = re.compile(r'(<nav[^>]*>)(.*?)(</nav>)', re.DOTALL)
        
        # Some files might have multiple <nav> tags, we usually just want to replace the first one (header)
        match = nav_pattern.search(content)
        if match:
            # Check what class the links should use
            nav_inner_current = match.group(2)
            # If the original links used "topbar__nav" or something else without a class, we adjust the replacement slightly
            # We'll extract the first <a> tag's class and apply it to our standard links
            a_class_match = re.search(r'<a[^>]*class="([^"]*)"', nav_inner_current)
            a_class = a_class_match.group(1) if a_class_match else ""
            
            customized_nav_inner = """
            <a href="image-compress.html" class="{cls}">Compress</a>
            <a href="image-resize.html" class="{cls}">Resize</a>
            <a href="passport-photo.html" class="{cls}">Passport</a>
            <a href="background-remover.html" class="{cls}">BG Remove</a>
            <a href="merge-pdf.html" class="{cls}">PDF Tools</a>
            """.format(cls=a_class)
            
            # For simplicity, just replace the first <nav> inner content
            new_content = content[:match.start(2)] + "\n" + customized_nav_inner + "\n            " + content[match.end(2):]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            count += 1
            print(f"Updated nav in {filepath}")
            
    print(f"\nDone! Updated {count} files.")

fix_nav()
