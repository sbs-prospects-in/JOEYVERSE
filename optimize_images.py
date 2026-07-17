from PIL import Image
import os

images = [
    r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\cartoon-cat.png",
    r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\cartoon-dog.png",
    r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\dr-anjali.png"
]

for img_path in images:
    if os.path.exists(img_path):
        try:
            img = Image.open(img_path)
            # Resize if the image is too large (e.g. width > 800)
            img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            # Save it back as optimized PNG
            img.save(img_path, optimize=True)
            print(f"Optimized: {os.path.basename(img_path)}")
        except Exception as e:
            print(f"Error optimizing {os.path.basename(img_path)}: {e}")
    else:
        print(f"File not found: {img_path}")
