from PIL import Image

def analyze_image(path):
    try:
        img = Image.open(path)
        print(f"File: {path}")
        print(f"Size: {img.size}")
        print(f"Format: {img.format}")
    except Exception as e:
        print(f"Error reading {path}: {e}")

input_1 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse (1).png"
input_2 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse.png"

analyze_image(input_1)
analyze_image(input_2)
