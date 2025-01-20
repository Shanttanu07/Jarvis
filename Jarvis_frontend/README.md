# Jarvis_frontend# Flask Video Processing and Text-to-Speech Web Application

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Routes](#routes)
- [Customization](#customization)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Author](#author)

## Introduction

This is a Flask-based web application that captures video from your computer's camera and provides real-time video streaming. It also includes functionality for speech-to-text and text-to-speech conversion. The application uses various libraries and services, such as OpenCV, gTTS, and Replicate for AI text generation.

## Features

- Real-time video streaming from your camera.
- Text-to-speech conversion.
- Speech-to-text processing.
- AI text generation using Replicate.

## Prerequisites

Before running the application, make sure you have the following installed:

- Python (3.x recommended)
- Required Python libraries (Flask, OpenCV, gTTS, Replicate). You can install them using `pip`.

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
#Install the required Python libraries:<br>
  pip install -r requirements.txt

#Set up the Replicate API token:
Edit the script and assign your token to the REPLICATE_API_TOKEN variable:<br>
REPLICATE_API_TOKEN = "your-api-token"

Create a directory to store captured frames:<br>
  mkdir saved_frames

# Usage
Run the Flask application:<br>
  python your_app.py

Open a web browser and navigate to http://localhost:5000/ to access the application.
Explore the various features and functionalities provided by the web application.

# Routes

/: Home page.
/main: Main page.
/api/stt (POST): Process speech-to-text for a given message.
/video_feed: Video streaming route.
/text_to_speech (POST): Convert text to speech and return an audio file.
/audio/<filename>: Serve audio files.
/receive_frame (POST): Process video frames and perform text generation.


# Customization

You can customize the application further by editing the HTML templates and adding additional functionality as needed.

# Frontend
The frontend of this project is built using the following technologies:

Next.js: Next.js is a React framework that provides server-side rendering, routing, and other useful features.

Tailwind CSS: Tailwind CSS is a utility-first CSS framework that helps you quickly build responsive and highly customizable user interfaces.

Daisy: Daisy is a library for [insert what Daisy does here].


# Dependencies
hmUI<br>
Vibrator<br>

# License
This code is released under the MIT License. See LICENSE for more details.


