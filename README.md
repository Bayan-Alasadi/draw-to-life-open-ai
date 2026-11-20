Draw to Life

Creative Programming – Final Project (1004)

Created by: Bayan Alasadi and Hanan Mughrabi

About the Project

Draw to Life is an interactive drawing project where users can create simple sketches and transform them into colorful digital artwork using the OpenAI API.

The user can choose colors, change the brush size, erase, undo, and save drawings. After clicking "Generate with AI", the drawing is sent to a local Node.js server, which communicates with OpenAI and returns a generated image.

The artwork can also be displayed on a separate projector screen.

Technologies Used

HTML, CSS and JavaScript

p5.js for the drawing canvas

Node.js for the local server

OpenAI API for image generation

BroadcastChannel for communication with the projector page

How to Run

Install Node.js.

Download the project files.

Create a .env file in the project folder and add your own OPENAI_API_KEY.

Open the terminal in the project folder.

Run:

node --env-file=.env server.js

Open http://127.0.0.1:5502 in the browser.

The OpenAI image generation requires a valid API key and access to the configured image model.

Security

The API key is stored in .env, which is excluded from Git tracking using .gitignore. No API key is included in the repository.

Documentation

The project was demonstrated at the Creative Programming Algorave in November 2026. Photos, a demonstration video, and further information are available on our Week 46 documentation website.
