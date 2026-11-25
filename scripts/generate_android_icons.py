import os
from PIL import Image, ImageDraw

def generate():
    icon_src = "public/icon-512.png"
    if not os.path.exists(icon_src):
        print(f"Error: {icon_src} not found")
        return

    base_img = Image.open(icon_src).convert("RGBA")

    # Mipmap target sizes: (density, square_size, foreground_size)
    densities = [
        ("mdpi", 48, 108),
        ("hdpi", 72, 162),
        ("xhdpi", 96, 216),
        ("xxhdpi", 144, 324),
        ("xxxhdpi", 192, 432),
    ]

    for d, sq, fg in densities:
        folder = f"android/app/src/main/res/mipmap-{d}"
        os.makedirs(folder, exist_ok=True)

        # 1. ic_launcher.webp (Square with rounded corners / standard icon)
        sq_img = base_img.resize((sq, sq), Image.Resampling.LANCZOS)
        sq_img.save(os.path.join(folder, "ic_launcher.webp"), "WEBP", quality=95)

        # 2. ic_launcher_round.webp (Circle masked icon)
        mask = Image.new("L", (sq, sq), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, sq - 1, sq - 1), fill=255)
        round_img = Image.new("RGBA", (sq, sq), (0, 0, 0, 0))
        round_img.paste(sq_img, (0, 0), mask=mask)
        round_img.save(os.path.join(folder, "ic_launcher_round.webp"), "WEBP", quality=95)

        # 3. ic_launcher_foreground.webp
        # Adaptive foreground layer: centered with standard 66% safe zone padding
        fg_canvas = Image.new("RGBA", (fg, fg), (0, 0, 0, 0))
        content_size = int(fg * 0.72)
        scaled_content = base_img.resize((content_size, content_size), Image.Resampling.LANCZOS)
        offset = (fg - content_size) // 2
        fg_canvas.paste(scaled_content, (offset, offset), mask=scaled_content)
        fg_canvas.save(os.path.join(folder, "ic_launcher_foreground.webp"), "WEBP", quality=95)

        print(f"✅ Generated mipmap-{d} icons ({sq}x{sq}, fg {fg}x{fg})")

    # Splash screens across orientations and densities
    splash_targets = [
        ("android/app/src/main/res/drawable/splash.png", 480, 320),
        ("android/app/src/main/res/drawable-land-mdpi/splash.png", 480, 320),
        ("android/app/src/main/res/drawable-land-hdpi/splash.png", 800, 480),
        ("android/app/src/main/res/drawable-land-xhdpi/splash.png", 1280, 720),
        ("android/app/src/main/res/drawable-land-xxhdpi/splash.png", 1600, 960),
        ("android/app/src/main/res/drawable-land-xxxhdpi/splash.png", 1920, 1280),
        ("android/app/src/main/res/drawable-port-mdpi/splash.png", 320, 480),
        ("android/app/src/main/res/drawable-port-hdpi/splash.png", 480, 800),
        ("android/app/src/main/res/drawable-port-xhdpi/splash.png", 720, 1280),
        ("android/app/src/main/res/drawable-port-xxhdpi/splash.png", 960, 1600),
        ("android/app/src/main/res/drawable-port-xxxhdpi/splash.png", 1280, 1920),
    ]

    bg_color = (23, 23, 29, 255) # #17171D

    for path, w, h in splash_targets:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        splash = Image.new("RGBA", (w, h), bg_color)
        logo_dim = min(int(min(w, h) * 0.38), 240)
        logo_scaled = base_img.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        pos = ((w - logo_dim) // 2, (h - logo_dim) // 2)
        splash.paste(logo_scaled, pos, mask=logo_scaled)
        splash.convert("RGB").save(path, "PNG", optimize=True)
        print(f"✅ Generated splash {path} ({w}x{h})")

if __name__ == "__main__":
    generate()
