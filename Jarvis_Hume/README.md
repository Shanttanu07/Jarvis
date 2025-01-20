# Real-time Face Emotion Recognition with HumeStreamClient

This Python script captures video frames from your webcam, analyzes faces, and detects emotions using the HumeStreamClient and OpenCV. The results, including the top emotion and its score, are printed in real-time.

## Prerequisites

- Python 3.x
- HumeStreamClient Library: Install the HumeStreamClient library for Python using pip.

  pip install hume-sdk

Required Python Libraries: Install the necessary Python libraries such as OpenCV, asyncio, websockets, base64, time, and pprint.<br>
  pip install opencv-python-headless<br>
  pip install websockets<br>
  
## Usage

Replace the HumeStreamClient API key in the HumeStreamClient constructor with your own API key.

Run the script:<br>
  python emotion_recognition.py

The script will capture frames from your webcam, analyze faces and emotions using HumeStreamClient, and print the top emotion along with its score.<br>
The script will run indefinitely, continuously analyzing frames from your webcam.
