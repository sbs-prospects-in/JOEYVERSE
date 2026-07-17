from PIL import Image

def extract_elements(path):
    img = Image.open(path).convert("RGBA")
    width, height = img.size
    
    # We know the text is at the bottom. 
    # Let's project pixels horizontally to find empty rows.
    row_density = []
    for y in range(height):
        density = 0
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            # If not white and not transparent
            if a > 50 and (r < 240 or g < 240 or b < 240):
                density += 1
        row_density.append(density)
        
    # Find the largest gap in the bottom half of the image (between y=height//2 and height-10)
    start_y = int(height * 0.5)
    end_y = int(height * 0.98)
    
    best_gap_start = 0
    best_gap_len = 0
    current_gap_start = -1
    current_gap_len = 0
    
    for y in range(start_y, end_y):
        if row_density[y] < 5: # allow small noise
            if current_gap_start == -1:
                current_gap_start = y
            current_gap_len += 1
        else:
            if current_gap_len > best_gap_len:
                best_gap_len = current_gap_len
                best_gap_start = current_gap_start
            current_gap_start = -1
            current_gap_len = 0
            
    if current_gap_len > best_gap_len:
        best_gap_len = current_gap_len
        best_gap_start = current_gap_start
        
    print(f"Split point: {best_gap_start}, len: {best_gap_len}")
    
    split_y = best_gap_start + (best_gap_len // 2)
    
    # Extract Icon
    icon = img.crop((0, 0, width, split_y))
    # Make white transparent
    icon_data = icon.getdata()
    new_icon_data = []
    for item in icon_data:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_icon_data.append((255, 255, 255, 0))
        else:
            new_icon_data.append(item)
    icon.putdata(new_icon_data)
    
    bbox = icon.getbbox()
    if bbox:
        icon = icon.crop(bbox)
        icon.save(r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_icon_only.png")
    
    # Extract Text
    text = img.crop((0, split_y, width, height))
    text_data = text.getdata()
    new_text_data = []
    for item in text_data:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_text_data.append((255, 255, 255, 0))
        else:
            new_text_data.append(item)
    text.putdata(new_text_data)
    
    bbox = text.getbbox()
    if bbox:
        text = text.crop(bbox)
        text.save(r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_text_only.png")
    
    print("Saved logo_icon_only.png and logo_text_only.png")

extract_elements(r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse (1).png")
