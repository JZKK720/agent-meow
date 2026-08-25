"""Resize the logo PNG to a reasonable size for the setup page."""
from PIL import Image
import os

path = "web/platform-assets/logos/agent-meow-logo.png"
img = Image.open(path)
print(f"Original: {img.size}")
img2 = img.resize((280, 280), Image.LANCZOS)
img2.save(path, format="PNG")
print(f"Resized: {img2.size}, {os.path.getsize(path)} bytes")