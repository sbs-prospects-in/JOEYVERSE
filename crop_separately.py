from PIL import Image

def aggressive_crop(path, out):
    img = Image.open(path).convert("RGBA")
    width, height = img.size
    
    min_x = width
    min_y = height
    max_x = 0
    max_y = 0
    
    # Pass 1: find bounding box of non-white pixels
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Ignore anything close to white or transparent
            # Let's be very aggressive
            if a > 100 and r < 220 and g < 220 and b < 220:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if min_x > max_x:
        print(f"File {path} is empty with this threshold")
        return
        
    print(f"Cropping {path} to bbox: {(min_x, min_y, max_x, max_y)}")
    
    cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    
    # Pass 2: Make white transparent in the cropped image
    data = cropped.getdata()
    new_data = []
    for item in data:
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    cropped.putdata(new_data)
    
    cropped.save(out, "PNG")
    print(f"Saved {out} with size {cropped.size}")

aggressive_crop(r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse (1).png", 
                r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_icon.png")
aggressive_crop(r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse.png", 
                r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_text.png")
