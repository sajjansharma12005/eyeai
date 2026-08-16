import torch
import torch.nn as nn
from torchvision import models


NUM_CLASSES = 5


def create_model():

    # Load pretrained ResNet18
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Freeze the pretrained layers
    for parameter in model.parameters():
        parameter.requires_grad = False

    # Replace the final classification layer
    input_features = model.fc.in_features

    model.fc = nn.Linear(
        input_features,
        NUM_CLASSES
    )

    return model


if __name__ == "__main__":

    print("=" * 60)
    print("DATASET 3 - RESNET18 MODEL TEST")
    print("=" * 60)

    # Create model
    model = create_model()

    print("\nModel created successfully ✅")

    print("\nFinal classification layer:")
    print(model.fc)

    # Create a fake batch of images
    test_images = torch.randn(
        2,
        3,
        224,
        224
    )

    # Forward pass
    output = model(test_images)

    print("\nInput shape:")
    print(test_images.shape)

    print("\nOutput shape:")
    print(output.shape)

    print("\nOutput:")
    print(output)

    print("\n" + "=" * 60)
    print("RESNET18 MODEL WORKING ✅")
    print("=" * 60)