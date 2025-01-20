# OCR Using Azure Cognitive Services Computer Vision

This Python script demonstrates how to perform Optical Character Recognition (OCR) on an image or video stream using Azure Cognitive Services Computer Vision.

## Prerequisites

- Python 3.x
- Azure Cognitive Services Subscription: You need a subscription key and endpoint to use Azure Computer Vision. You can obtain one from the Azure portal.
- Azure Cognitive Services SDK: Install the Azure Cognitive Services SDK for Python using pip.

bash
pip install azure-cognitiveservices-vision-computervision
---Required Python Libraries: Install the necessary Python libraries such as OpenCV, Pillow (PIL), and pymongo.<br>
  pip install opencv-python-headless<br>
  pip install pillow<br>
  pip install pymongo<br>

# Usage
1 Replace the sub_key and endpoint variables with your Azure Cognitive Services subscription key and endpoint.<br>
  sub_key = "YOUR_SUBSCRIPTION_KEY"<br>
  endpoint = "YOUR_ENDPOINT"<br>


2 Ensure your camera is accessible by OpenCV. Modify the camera configuration as needed:<br>
  cap = cv2.VideoCapture(0)

# Run the script:
  python ocr_azure.py

The script will capture frames from the camera, save them as image files, and perform OCR on each image using Azure Cognitive Services Computer Vision. The recognized text is saved to a file named file_input.txt.
The recognized text will be printed to the console, and you can also access it in the file_input.txt file.

# Contributing
Feel free to contribute to this project by opening issues or creating pull requests on the GitHub repository.
