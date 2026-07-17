from PIL import Image

def find_split_and_compose(path, out_path):
    img = Image.open(path).convert("RGBA")
    width, height = img.size
    
    # Find the empty rows
    empty_rows = []
    for y in range(height):
        is_empty = True
        for x in range(width):
            pixel = img.getpixel((x, y))
            if pixel[3] > 10: # not fully transparent
                is_empty = False
                break
        if is_empty:
            empty_rows.append(y)
            
    # Find the largest contiguous block of empty rows in the bottom half
    max_gap_start = 0
    max_gap_len = 0
    
    current_start = -1
    current_len = 0
    
    for y in range(height):
        if y in empty_rows:
            if current_start == -1:
                current_start = y
            current_len += 1
        else:
            if current_len > max_gap_len and current_start > height * 0.5: # lower half
                max_gap_len = current_len
                max_gap_start = current_start
            current_start = -1
            current_len = 0
            
    print(f"Split point found at y={max_gap_start} with gap length {max_gap_len}")
    
    if max_gap_len == 0:
        print("Could not find a clear horizontal gap to split.")
        return
        
    split_y = max_gap_start + (max_gap_len // 2)
    
    icon = img.crop((0, 0, width, max_gap_start))
    text = img.crop((0, max_gap_start + max_gap_len, width, height))
    
    # Crop horizontal whitespace for both
    icon = icon.crop(icon.getbbox())
    text = text.crop(text.getbbox())
    
    # Create new combined image side-by-side
    padding = 40
    new_width = icon.width + padding + text.width
    new_height = max(icon.height, text.height)
    
    combined = Image.new("RGBA", (new_width, new_height), (255, 255, 255, 0))
    
    # Paste icon (centered vertically)
    icon_y = (new_height - icon.height) // 2
    combined.paste(icon, (0, icon_y), icon)
    
    # Paste text (centered vertically)
    text_y = (new_height - text.height) // 2
    combined.paste(text, (icon.width + padding, text_y), text)
    
    combined.save(out_path, "PNG")
    print(f"Saved composed image to {out_path}")

find_split_and_compose(r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_final_1.png", r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_horizontal.png")
