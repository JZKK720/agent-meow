"""Generate all icon formats from the correct Figma assets."""
from PIL import Image
import os

Image.MAX_IMAGE_PIXELS = None

export_dir = "web/electron/icons/figma-export"
icons_dir = "web/electron/icons"

# Mapping based on user's description + pixel analysis:
# icon-50-2: center=white, cream corner → "center paw" LIGHT variant = DESKTOP icon (light)
# icon-50-3: all cream/orange → "center paw" DARK variant = DESKTOP icon (dark)
# icon-50-4: center=orange, white bg → "Orange native cat" = CHATBOT icon
# icon-50-11: center=orange, white bg → "cat with JUBAO" = LOGO icon
# icon-50-12: center=white, orange corner → "half body full color meowcat" = MASCOT

# icon-50-2: center=white, cream corner → "center paw" LIGHT variant = DESKTOP icon
# icon-50-3: all cream/orange → "center paw" DARK variant = small Electron icon
# User wants: paw DARK for small Electron window icon, paw LIGHT for desktop .ico

desktop_icon_light = os.path.join(export_dir, "icon-50-2.png")
desktop_icon_dark = os.path.join(export_dir, "icon-50-3.png")
logo_icon = os.path.join(export_dir, "icon-50-11.png")
chatbot_icon = os.path.join(export_dir, "icon-50-4.png")
mascot_icon = os.path.join(export_dir, "icon-50-12.png")

print("=== Generating icon formats ===")
print("  Desktop .ico: paw LIGHT (icon-50-2)")
print("  Electron window .png: paw DARK (icon-50-3)")

# 1. Windows ICO (multi-size) — use the DESKTOP icon (LIGHT paw variant)
print("  icon.ico (Windows app icon)...")
src = Image.open(desktop_icon_light).convert("RGBA")
src_256 = src.resize((256, 256), Image.LANCZOS)
src_128 = src.resize((128, 128), Image.LANCZOS)
src_64 = src.resize((64, 64), Image.LANCZOS)
src_48 = src.resize((48, 48), Image.LANCZOS)
src_32 = src.resize((32, 32), Image.LANCZOS)
src_16 = src.resize((16, 16), Image.LANCZOS)
src_256.save(
    os.path.join(icons_dir, "icon.ico"),
    format="ICO",
    sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)],
)
print("    icon.ico saved (6 sizes)")

# 2. icon.png (used by Electron BrowserWindow icon) — DARK paw variant
print("  icon.png (Electron window icon — paw DARK)...")
dark_src = Image.open(desktop_icon_dark).convert("RGBA")
dark_256 = dark_src.resize((256, 256), Image.LANCZOS)
dark_256.save(os.path.join(icons_dir, "icon.png"), format="PNG")
print("    icon.png saved (256x256 — paw dark)")

# 3. icon-{size}.png for all standard sizes (dark paw for window, light for desktop)
for size in [16, 32, 48, 64, 128, 256]:
    out = os.path.join(icons_dir, f"icon-{size}.png")
    dark_src.resize((size, size), Image.LANCZOS).save(out, format="PNG")
    print(f"    icon-{size}.png saved")

# 4. NSIS installer-sidebar.bmp (164x314) — use mascot (half-body meowcat)
print("  installer-sidebar.bmp (NSIS sidebar)...")
mascot = Image.open(mascot_icon).convert("RGBA")
sidebar = Image.new("RGB", (164, 314), (250, 248, 245))
# Center the mascot (1024x1024 → 100x100)
mascot_small = mascot.resize((100, 100), Image.LANCZOS)
sidebar.paste(mascot_small, (32, 40), mascot_small)
sidebar.save(os.path.join(icons_dir, "installer-sidebar.bmp"), "BMP")
print("    installer-sidebar.bmp saved (164x314)")

# 5. NSIS installer-header.bmp (150x57) — use desktop icon
print("  installer-header.bmp (NSIS header)...")
header = Image.new("RGB", (150, 57), (250, 248, 245))
icon_small = src.resize((40, 40), Image.LANCZOS)
header.paste(icon_small, (8, 8), icon_small)
header.save(os.path.join(icons_dir, "installer-header.bmp"), "BMP")
print("    installer-header.bmp saved (150x57)")

# 6. Logo for wizard header — use logo icon (cat with JUBAO)
print("  wizard-logo.png (wizard header)...")
logo = Image.open(logo_icon).convert("RGBA")
logo.resize((72, 72), Image.LANCZOS).save(os.path.join(icons_dir, "wizard-logo.png"), format="PNG")
print("    wizard-logo.png saved (72x72)")

# 7. Chatbot icon for the web app favicon
print("  favicon.png (web favicon)...")
chatbot = Image.open(chatbot_icon).convert("RGBA")
chatbot.resize((64, 64), Image.LANCZOS).save(os.path.join(icons_dir, "favicon.png"), format="PNG")
print("    favicon.png saved (64x64)")

print("\n=== All icons generated ===")
for f in sorted(os.listdir(icons_dir)):
    if f.endswith((".png", ".ico", ".bmp")) and not f.startswith("figma"):
        size = os.path.getsize(os.path.join(icons_dir, f))
        print(f"  {f} ({size} bytes)")