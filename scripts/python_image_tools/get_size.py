from PIL import Image

path = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\logo_final_1.png"
img = Image.open(path)
print(f"Size: {img.size}")
