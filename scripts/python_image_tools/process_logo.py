from PIL import Image
import sys

def process_logo(input_path, output_path):
    # Open image
    img = Image.open(input_path).convert("RGBA")
    
    # Get data
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Change all white (also shades of whites)
        # to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    # Update image data
    img.putdata(new_data)
    
    # Crop to bounding box (ignoring transparency)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Successfully processed and saved to {output_path}")

if __name__ == "__main__":
    input_file = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo.jpg"
    output_file = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_processed.png"
    process_logo(input_file, output_file)
