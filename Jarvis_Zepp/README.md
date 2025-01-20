# Fetch API Double-Tap Example

This is an example of a mobile application with a double-tap feature for fetching data. The code demonstrates how to create two buttons with different functionality when tapped. 

## Overview

- The application uses the [hmUI](https://github.com/hmUI) library for UI components.
- It makes use of the [Vibrator](https://github.com/zos/sensor) to provide haptic feedback on button presses.

## Code Structure

The code is organized into the following main sections:

1. Importing necessary libraries and modules.
2. Initializing the `Vibrator` and setting up a logger.
3. Handling double-tap functionality for two buttons, each triggering a separate API request.
4. Defining `fetchData` and `fetchData2` functions for making API requests and updating UI elements.
5. Creating and configuring the UI components (buttons and text widgets) using `hmUI`.
6. Page initialization and setup.

## Usage

To use this code in your project:

1. Import the required libraries and modules.
2. Initialize the `Vibrator` and set up the logger as needed.
3. Copy the code to create your UI components and define the logic for button presses.
4. Customize the `fetchData` and `fetchData2` functions to suit your API endpoints and data handling.
5. Adapt the UI components' configurations (`FETCH_BUTTON`, `FETCH_BUTTON2`, `FETCH_RESULT_TEXT`, `FETCH_RESULT_TEXT2`) to your UI design.

## Getting Started

Clone the repository and integrate the code into your mobile application project.

```bash
git clone https://github.com/your-username/your-repo.git
