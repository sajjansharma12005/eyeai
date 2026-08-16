from pathlib import Path
import random

import matplotlib.pyplot as plt
from PIL import Image


# Use the SAME dataset path you used in dataset_info.py
DATASET_PATH = Path(
    r"C:\Users\Raj Kumar\Downloads\archive\Dataset - train+val+test"
)

classes = ["CNV", "DME", "DRUSEN", "NORMAL"]

# Number of images to show from each class
images_per_class = 3

fig, axes = plt.subplots(
    len(classes),
    images_per_class,
    figsize=(12, 10)
)

for row, class_name in enumerate(classes):

    class_path = DATASET_PATH / "train" / class_name

    image_files = list(class_path.glob("*"))

    selected_images = random.sample(
        image_files,
        images_per_class
    )

    for col, image_path in enumerate(selected_images):

        image = Image.open(image_path)

        axes[row, col].imshow(image, cmap="gray")
        axes[row, col].set_title(class_name)
        axes[row, col].axis("off")


plt.tight_layout()
plt.show()