import re

with open(r"C:\Users\vedab\.gemini\antigravity\brain\1819a50d-605f-4313-8712-0ba573a613ba\.system_generated\steps\1132\content.md", "r", encoding="utf-8") as f:
    content = f.read()

# Find font-family declarations
fonts = re.findall(r"font-family:[^;\"']+", content, re.IGNORECASE)
print("Fonts found:")
for font in set(fonts):
    print(font.strip())

# Find font links (like google fonts or static fonts)
links = re.findall(r"<link[^>]+font[^>]+>", content, re.IGNORECASE)
print("\nFont links found:")
for link in set(links):
    print(link.strip())
