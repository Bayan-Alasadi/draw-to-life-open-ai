// This file connects our drawing website to OpenAI.
const API_URL = "/api/generate";

// These settings prepare the drawing before sending it to OpenAI.
const AI_W = 768;
const AI_H = 512;

// This prompt tells OpenAI how we want our painting to look.
// The idea is inspired by Bob Ross paintings and the rave theme and more then 40 times of itritve work.

const PROMPT =
  "Transform the uploaded drawing into a beautiful, " +
  "vibrant psychedelic fantasy oil painting. " +
  "The painting should be inspired by traditional " +
  "wet-on-wet landscape painting techniques. " +

  "IMPORTANT: Keep the original drawing composition, " +
  "main shapes, objects and their positions recognizable. " +
  "Use the uploaded drawing as the main reference. " +
  "Do not completely replace the original idea. " +

  "Create a magical and colorful atmosphere with " +
  "forests, mountains, rivers and beautiful nature " +
  "where they fit the original drawing. " +

  "Use rich emerald green, purple, blue, magenta " +
  "and golden light. " +

  "Add dramatic lighting, mysterious shadows, " +
  "dreamy colors and artistic details. " +

  "The final image should look like a real oil painting " +
  "with thick paint textures and expressive brushstrokes. " +

  "Combine peaceful landscape painting with " +
  "colorful psychedelic rave aesthetics. " +

  "Avoid 3D renders, cartoons, anime, plastic textures, " +
  "flat colors, text, logos and watermarks.";


// This checks if OpenAI is already generating an image.
let aiBusy = false;


// These messages appear while the AI creates the painting.
const loadingMessages = [
  "🌈 Mixing colors...",
  "🖌️ Teaching AI how to paint...",
  "✨ Adding a little...",
  "🌳 Adding some greenery...",
  "💜 Sprinkling some imagination...",
  "🎨 Creating something beautiful...",
  "🌟 Almost done...",
  "🦋 Letting creativity take over...",
  "🚀 Your art is on its way!"
];


// These variables control the loading messages.
let loadingInterval = null;
let messageIndex = 0;


// This connects the buttons when the website is ready.
document.addEventListener("DOMContentLoaded", () => {

  const generateButton =
    document.getElementById("generate-btn");

  const removeButton =
    document.getElementById("remove-ai-btn");

  if (generateButton) {
    generateButton.addEventListener("click", generateAI);
  }

  if (removeButton) {
    removeButton.addEventListener("click", showSketch);
  }

});


// This hides the AI painting and shows the original drawing.
function showSketch() {

  const result = document.getElementById("ai-result");

  const removeButton =
    document.getElementById("remove-ai-btn");

  if (result) {
    result.hidden = true;
  }

  if (removeButton) {
    removeButton.hidden = true;
  }

  setStatus("You can continue drawing! 🎨");

}


// This shows messages about the AI process.
function setStatus(message, isError = false) {

  const status = document.getElementById("ai-status");

  if (!status) return;

  status.textContent = message;

  status.classList.toggle("error", isError);

}


// This starts changing the loading messages.
function startLoadingMessages() {

  stopLoadingMessages();

  messageIndex = 0;

  const message =
    document.getElementById("loading-message");

  if (!message) return;

  message.textContent = loadingMessages[messageIndex];

  loadingInterval = setInterval(() => {

    messageIndex =
      (messageIndex + 1) % loadingMessages.length;

    message.textContent =
      loadingMessages[messageIndex];

  }, 3000);

}


// This stops the loading messages.
function stopLoadingMessages() {

  if (loadingInterval !== null) {

    clearInterval(loadingInterval);

    loadingInterval = null;

  }

}


// This shows or hides the loading screen.
function setLoading(active) {

  const loading = document.getElementById("loading");

  const button = document.getElementById("generate-btn");

  if (loading) {
    loading.hidden = !active;
  }

  if (button) {

    button.disabled = active;

    button.textContent = active
      ? "✦ Creating magic..."
      : "✦ Generate with AI →";

  }

  if (active) {
    startLoadingMessages();
  } else {
    stopLoadingMessages();
  }

}


// This converts the user's drawing into an image.
// The image will be sent to OpenAI.
function imageToBase64() {

  const small = createGraphics(AI_W, AI_H);

  small.pixelDensity(1);

  small.background(255);


  // This makes the drawing fit inside the image size.
  const scale = Math.min(
    AI_W / drawing.width,
    AI_H / drawing.height
  );

  const w = drawing.width * scale;
  const h = drawing.height * scale;


  // This places the original drawing in the center.
  small.image(
    drawing,
    (AI_W - w) / 2,
    (AI_H - h) / 2,
    w,
    h
  );


  // This converts the drawing into a base64 PNG image.
  const base64 = small.canvas
    .toDataURL("image/png")
    .split(",")[1];


  // This removes the temporary canvas.
  small.remove();

  return base64;

}


// This sends the drawing to OpenAI.
// OpenAI generates a new painting based on the original sketch.
async function generateAI() {

  // This prevents two images from being generated at once.
  if (aiBusy) return;


  // This checks if the drawing canvas is ready.
  if (typeof drawing === "undefined" || !drawing) {

    setStatus("The drawing canvas is not ready.", true);

    return;

  }


  aiBusy = true;

  setLoading(true);

  setStatus("Connecting to OpenAI...");


  try {

    // This prepares the user's drawing.
    const base64 = imageToBase64();

    setStatus("Generating your painting with OpenAI...");


    // This sends the drawing and prompt to our server.
    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        image: base64,

        prompt: PROMPT

      })

    });


    // This checks if the server returned an error.
    if (!response.ok) {

      let errorMessage =
        "OpenAI could not generate the image.";

      try {

        const errorData = await response.json();

        errorMessage =
          errorData.error?.message ||
          errorData.error ||
          errorData.message ||
          errorMessage;

      } catch (error) {

        // The server did not return a JSON error.

      }

      if (typeof errorMessage !== "string") {
        errorMessage = "OpenAI request failed.";
      }

      throw new Error(
        `Server error ${response.status}: ${errorMessage}`
      );

    }


    // This receives the generated image from our server.
    const data = await response.json();


    // This checks if OpenAI returned an image.
    if (!data.images || !data.images[0]) {

      throw new Error(
        "OpenAI returned no image. Please try again."
      );

    }


    const imageData = data.images[0];


    // This prepares the image so it can appear on the website.
    const imageURL = imageData.startsWith("data:")
      ? imageData
      : "data:image/png;base64," + imageData;


    const result = document.getElementById("ai-result");

    if (!result) {

      throw new Error(
        "The AI image element was not found."
      );

    }


    // This checks if the generated image can be opened.
    await new Promise((resolve, reject) => {

      const preview = new Image();

      preview.onload = resolve;

      preview.onerror = () => reject(
        new Error("The generated image could not be opened.")
      );

      preview.src = imageURL;

    });


    // This shows the finished AI painting.
    result.src = imageURL;

    result.hidden = false;


    // This shows the button to return to the original drawing.
    const removeButton =
      document.getElementById("remove-ai-btn");

    if (removeButton) {
      removeButton.hidden = false;
    }


    setStatus("Your painting is ready! ✨");


  } catch (error) {

    // This shows an error message if something goes wrong.
    console.error("OpenAI error:", error);

    setStatus(
      error.message || "Something went wrong.",
      true
    );


  } finally {

    // This stops the loading animation.
    aiBusy = false;

    setLoading(false);

  }

}