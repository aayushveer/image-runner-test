from pathlib import Path
import re

schema_pattern = re.compile(r"<script type=\"application/ld\+json\">.*?</script>", re.DOTALL | re.IGNORECASE)

def has_type(text, t):
    return f'\"@type\": \"{t}\"' in text

only_software = []
for path in Path(".").glob("*.html"):
    if "google" in path.name:
        continue
    text = path.read_text(encoding="utf-8")
    blocks = schema_pattern.findall(text)
    if not blocks:
        continue
    has_web = any(has_type(b, "WebApplication") for b in blocks)
    has_soft = any(has_type(b, "SoftwareApplication") for b in blocks)
    if has_soft and not has_web:
        only_software.append(path.name)

print("\n".join(sorted(only_software)))
