from PIL import Image

icon_path = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse (1).png"
text_path = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse.png"
out_path = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_horizontal.png"

def make_transparent(img):
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    
    # Also crop it
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

icon = Image.open(icon_path)
icon = make_transparent(icon)
print("Icon size:", icon.size)

text = Image.open(text_path)
text = make_transparent(text)
print("Text size:", text.size)

padding = 30
new_width = icon.width + padding + text.width
new_height = max(icon.height, text.height)

combined = Image.new("RGBA", (new_width, new_height), (255, 255, 255, 0))

# Paste icon
icon_y = (new_height - icon.height) // 2
combined.paste(icon, (0, icon_y), icon)

# Paste text
text_y = (new_height - text.height) // 2
combined.paste(text, (icon.width + padding, text_y), text)

combined.save(out_path, "PNG")
print(f"Saved composed image to {out_path}")
