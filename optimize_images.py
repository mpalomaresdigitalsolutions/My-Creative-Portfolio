import os
from PIL import Image
import pathlib

def optimize_images():
    """Optimize all PNG and JPG images in the project"""
    
    # Define source directories
    source_dirs = ['images', 'GHL images', '.']
    
    # Create optimized directory
    optimized_dir = 'optimized_images'
    if not os.path.exists(optimized_dir):
        os.makedirs(optimized_dir)
    
    optimized_count = 0
    total_saved = 0
    
    for source_dir in source_dirs:
        if not os.path.exists(source_dir):
            continue
            
        for filename in os.listdir(source_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                source_path = os.path.join(source_dir, filename)
                
                try:
                    # Open and optimize image
                    with Image.open(source_path) as img:
                        # Convert RGBA to RGB for JPEG
                        if img.mode in ('RGBA', 'LA'):
                            background = Image.new('RGB', img.size, (255, 255, 255))
                            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                            img = background
                        
                        # Calculate new size (80% quality)
                        width, height = img.size
                        
                        # Only resize if image is very large
                        if width > 1200 or height > 1200:
                            img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                        
                        # Save optimized version
                        output_path = os.path.join(optimized_dir, filename)
                        
                        if filename.lower().endswith('.png'):
                            img.save(output_path, 'PNG', optimize=True, compress_level=9)
                        else:
                            img.save(output_path, 'JPEG', quality=85, optimize=True)
                        
                        # Calculate savings
                        original_size = os.path.getsize(source_path)
                        new_size = os.path.getsize(output_path)
                        saved = original_size - new_size
                        
                        if saved > 0:
                            total_saved += saved
                            optimized_count += 1
                            print(f"Optimized {filename}: {original_size//1024}KB → {new_size//1024}KB (saved {saved//1024}KB)")
                        else:
                            # If no savings, remove the optimized file
                            os.remove(output_path)
                            
                except Exception as e:
                    print(f"Error optimizing {filename}: {e}")
    
    print(f"\nOptimization complete!")
    print(f"Optimized {optimized_count} images")
    print(f"Total space saved: {total_saved//1024}KB")

if __name__ == "__main__":
    try:
        optimize_images()
    except ImportError:
        print("PIL/Pillow not found. Installing...")
        os.system("pip install Pillow")
        from PIL import Image
        optimize_images()