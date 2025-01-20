# JARVis- Aid for the Visually Impaired

Welcome to JARVis! This project aims to assist blind or visually impaired individuals in perceiving and understanding the world around them through image and text processing. This repository contains the backend code for the Vision Aid system.

## Table of Contents

- [Introduction](#introduction)
- [How It Works](#how-it-works)
- [Key Technologies](#key-technologies)
- [Libraries Used](#libraries-used)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Vision Aid Project is designed to provide real-time assistance to visually impaired individuals. It uses advanced technologies to recognize and describe scenes in front of the user, extract text from images, and answer user queries. The backend server is responsible for handling image recognition, text extraction, and natural language understanding, making it a vital part of the system.

## How It Works

1. _Image Recognition_: The system analyzes images captured by a camera to identify and describe scenes, objects, and emotions in real-time.

2. _Text Extraction_: Utilizing Amazon Textract, the system can extract text from images, making printed information accessible.

3. _Natural Language Understanding_: Users can interact with the system by asking questions or seeking information. The backend uses GooglePalm for natural language understanding to provide relevant answers.

4. _Voice Output_: The system offers voice output capabilities using gTTS (Google Text-to-Speech) to convey image descriptions and textual content to users.

5. _Real-time Communication_: The backend communicates in real-time with the frontend using WebSockets, enabling seamless user interactions.

## Key Technologies

### Zepp

- _Zepp_: We partnered with Zepp Health and integrated our frontend with ZepOS to activate our LLAVA model and for emotional analysis.

### Zilliz

- _Zilliz_: Zilliz provides a cloud-based platform for high-performance data analytics and visualization. Zilliz is utilized for real-time image analysis and similarity searches of images.

### Hume

- _Hume_: HumeStream is a part of Zilliz and provides real-time stream processing capabilities. In this project, Hume is used for real-time image analysis and emotion recognition.

### Amazon Textract

- _Amazon Textract_: Amazon Textract is a service for extracting text and data from images. It is used in the project to extract textual content from images for accessibility.

### Milvus

- _Milvus_: Milvus is an open-source vector database designed for AI and machine learning. It is used for similarity search of images in this project.

### gTTS (Google Text-to-Speech)

- _gTTS (Google Text-to-Speech)_: gTTS is a Python library and CLI tool to convert text to speech. It is used for providing voice output of image descriptions and textual content to users.

## Libraries Used

The Vision Aid Project makes use of the following libraries:

- _Flask_: A web framework for building the backend server.
- _Boto3_: The AWS SDK for Python, used for interacting with Amazon Textract.
- _Pymilvus_: A Python client for Milvus, used for similarity search of images.
- _Websockets_: A library for WebSocket communication.
- _Pillow_: A Python Imaging Library, used for image manipulation.
- _Pusher_: A library for real-time communication via the Pusher service.
- _PyTorch_: An open-source deep learning framework.
- _Transformers_: A library for Natural Language Processing tasks.
- _Langchain_: A library for text processing, splitting, and retrieval.
- _MongoDB_: A NoSQL database for storing and retrieving information.
- _NumPy_: A library for numerical operations.
- _Matplotlib_: A library for creating visualizations and plots.

## Features

- _Image Recognition_: Detects and describes scenes and emotions in real-time.
- _Text Extraction_: Extracts text from images using Amazon Textract for OCR.
- _Natural Language Understanding_: Answers user queries and provides contextual information.
- _Voice Output_: Converts text to speech for user-friendly communication.
- _Real-time Communication_: WebSocket integration for instant interaction with the frontend.
- _External Service Integration_: Connects with Zepp, Zilliz, Hume, Amazon Textract, and other services for advanced image analysis.

## Getting Started

To start using the Vision Aid Project, follow these steps:

1. Clone this repository to your local machine.

2. Install the required Python libraries using pip install -r requirements.txt.

3. Configure external services such as Zepp, Zilliz, Hume, Amazon Textract, and Milvus as needed.

4. Run the Flask application using python app.py.

## Usage

- _Image Recognition_: Capture images and send them to the server for real-time scene and emotion recognition.

- _Text Extraction_: Extract text content from images using the OCR feature.

- _Question and Interaction_: Ask questions and interact with the system to obtain answers and descriptions.

- _Real-time Communication_: Utilize WebSocket-based communication for image analysis and interaction.

## Contributing

We welcome contributions to the Vision Aid Project. If you'd like to contribute, please follow our [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
