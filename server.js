// This server connects Draw to Life to OpenAI.
// Set up the Node.js server.
// Import the required modules.
// Define the server port.
// Define the supported file types.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// Here I define the port for my website.
const PORT = 5502;

const fileTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

// This sends the drawing to OpenAI.
// Here I receive the drawing from the website.
// I check that my OpenAI API key exists.
// I read the image data from the request.
// I stop if the image data is too large.
// I convert the JSON text into an object.
// I check that the image data has the right format.
// I convert the Base64 image into a buffer.
async function generateImage(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing.");
  }

  let body = "";

  for await (const chunk of req) {
    body += chunk;

    if (body.length > 12_000_000) {
      res.writeHead(413);
      res.end("Image is too large.");
      return;
    }
  }

  const data = JSON.parse(body);

  if (
    typeof data.image !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(data.image)
  ) {
    res.writeHead(400);
    res.end("Invalid image.");
    return;
  }

  const imageBuffer = Buffer.from(data.image, "base64");

  // I use FormData to prepare the OpenAI request.
// I add the model name and the drawing as a PNG file.
// I include the prompt and image settings.
  const form = new FormData();

  form.append("model", "gpt-image-2.5-flare");

  form.append(
    "image",
    new Blob([imageBuffer], { type: "image/png" }),
    "drawing.png"
  );

  form.append("prompt", data.prompt);

  form.append("quality", "medium");
  form.append("size", "1536x1024");

  // This sends the request to OpenAI.
  // I send a POST request to the OpenAI image editing API.
// I use the API key from my server environment
// to authorize the request.
  const response = await fetch(
    "https://api.openai.com/v1/images/edits",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    }
  );
// Here I read the response from OpenAI.
// I check if the request was successful.
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "OpenAI generation failed."
    );
  }

  // I get the generated image from the response.
// I show an error if no image was returned.
// I send the finished image back to the website.
  const generatedImage = result.data?.[0]?.b64_json;

  if (!generatedImage) {
    throw new Error("OpenAI returned no image.");
  }

  res.writeHead(200, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    images: [generatedImage]
  }));
}

// This starts the website server.
// Here I create the website server.
// I check if the user wants to generate an AI image.
// I call the function that sends the drawing to OpenAI.
// I catch errors if something goes wrong.
// I send an error message back to the browser.
// Here I start the server on port 5502.
http.createServer(async (req, res) => {
  try {

    // Handle OpenAI image generation.
    if (req.url === "/api/generate" && req.method === "POST") {
      await generateImage(req, res);
      return;
    }

    // Show the website files.
    // Here I find the file requested by the browser.
// I use index.html as the homepage.
// I create the full path to the file.
// I check that the file is safe to access.
// I read the file from my project folder.
// I send the file back to the browser.
    const urlPath = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname
    );

    const fileName =
      urlPath === "/" ? "/index.html" : urlPath;

    const root = path.resolve(__dirname);
    const filePath = path.resolve(root, "." + fileName);

    // Protect private files.
    if (
      (filePath !== root &&
       !filePath.startsWith(root + path.sep)) ||
      path.basename(filePath).startsWith(".") ||
      !Object.hasOwn(fileTypes, path.extname(filePath)) ||
      path.basename(filePath) === "server.js"
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const content = await fs.promises.readFile(filePath);

    res.writeHead(200, {
      "Content-Type":
        fileTypes[path.extname(filePath)]
    });

    res.end(content);

  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: error.message
      }));
    }
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(
    `Draw to Life OpenAI: http://127.0.0.1:${PORT}`
  );
});