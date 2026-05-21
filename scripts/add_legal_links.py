from pathlib import Path

FOOTER_LINKS = """
<div class=\"footer-links\" style=\"margin-top:12px; display:flex; flex-wrap:wrap; gap:12px; justify-content:center; font-size:13px;\">
  <a href=\"about.html\" style=\"color: inherit; text-decoration: none;\">About</a>
  <a href=\"privacy.html\" style=\"color: inherit; text-decoration: none;\">Privacy</a>
  <a href=\"terms.html\" style=\"color: inherit; text-decoration: none;\">Terms</a>
  <a href=\"contact.html\" style=\"color: inherit; text-decoration: none;\">Contact</a>
  <a href=\"blog.html\" style=\"color: inherit; text-decoration: none;\">Blog</a>
</div>
""".strip("\n")

for path in Path(".").glob("*.html"):
    if "google" in path.name:
        continue

    text = path.read_text(encoding="utf-8")
    if "footer-links" in text:
        continue
    if "</footer>" not in text:
        continue

    updated = text.replace("</footer>", f"{FOOTER_LINKS}\n</footer>", 1)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"Updated footer links: {path.name}")
