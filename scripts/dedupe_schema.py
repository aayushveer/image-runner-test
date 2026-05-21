import re
from pathlib import Path

schema_pattern = re.compile(r"<script type=\"application/ld\+json\">.*?</script>", re.DOTALL | re.IGNORECASE)

for path in Path(".").glob("*.html"):
    if "google" in path.name:
        continue

    text = path.read_text(encoding="utf-8")
    blocks = schema_pattern.findall(text)
    if not blocks:
        continue

    tool_blocks = [b for b in blocks if '"@type": "SoftwareApplication"' in b or '"@type": "WebApplication"' in b]
    if len(tool_blocks) <= 1:
        continue

    updated = text
    removed = False

    for block in tool_blocks:
        if '"@graph"' in block:
            continue
        if '"browserRequirements": "Requires HTML5 context"' not in block:
            continue
        if '"priceCurrency": "INR"' not in block:
            continue
        updated = updated.replace(block, "", 1)
        removed = True
        break

    if removed and updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"Removed duplicate schema block: {path.name}")
