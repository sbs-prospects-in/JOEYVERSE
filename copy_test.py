import shutil

src1 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse (1).png"
dst1 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\test_1.png"

src2 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\Joey erse.png"
dst2 = r"C:\Users\priya\OneDrive\Desktop\anitalk\Anitalk_Website\public\images\test_2.png"

shutil.copy(src1, dst1)
shutil.copy(src2, dst2)
