from PIL import Image

def process_png(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Make white background transparent if needed
    datas = img.getdata()
    new_data = []
    for item in datas:
        # Check for white background
        if item[0] > 240 and item[1] > 240 and item[2] > 240 and item[3] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    
    # Crop to bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

input_1 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse (1).png"
output_1 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_final_1.png"

input_2 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse.png"
output_2 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_final_2.png"

process_png(input_1, output_1)
process_png(input_2, output_2)
