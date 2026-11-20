// Small visual changes for the AI result panel.
// The OpenAI connection stays inside ai.js and server.js.

document.addEventListener("DOMContentLoaded", () => {

  const generate =
    document.getElementById("generate-btn");

  const result =
    document.getElementById("ai-result");

  const back =
    document.getElementById("remove-ai-btn");

  const clear =
    document.getElementById("clear-btn");

  const badge =
    document.getElementById("result-badge");

  const caption =
    document.getElementById("result-caption");


  // This updates the label after the AI image is displayed.

  function updatePanel() {

    const ready =
      !result.hidden &&
      Boolean(result.getAttribute("src"));

    badge.innerHTML = ready
      ? '<span class="dot dot-blue"></span> ARTWORK READY'
      : '<span class="dot dot-purple"></span> WAITING FOR ART';

    caption.textContent = ready
      ? "Your drawing has become a new artwork!"
      : "Every masterpiece begins with a doodle.";

  }


  // This watches for changes to the AI image.
  // ai.js updates the image when generation finishes.

  const observer = new MutationObserver(updatePanel);

  observer.observe(result, {
    attributes: true,
    attributeFilter: ["hidden", "src"]
  });


  // This changes the message when AI generation starts.

  generate.addEventListener("click", () => {

    if (!generate.disabled) {
      caption.textContent = "Creating your artwork...";
    }

  }, true);


  // This updates the panel when returning to the drawing.

  back.addEventListener("click", () => {
    setTimeout(updatePanel, 0);
  });


  // This updates the panel when clearing the canvas.

  clear.addEventListener("click", () => {
    setTimeout(updatePanel, 0);
  });


  // Set the initial message.

  updatePanel();

});// This allows the user to save the AI-generated painting.
document.addEventListener("DOMContentLoaded", () => {

  const saveAIButton = document.getElementById("save-ai-btn");
  const aiImage = document.getElementById("ai-result");
  const backButton = document.getElementById("remove-ai-btn");
  const clearButton = document.getElementById("clear-btn");

  if (!saveAIButton || !aiImage) return;

  // Show the save button only when an AI image is visible.
  function updateSaveButton() {
    saveAIButton.hidden =
      aiImage.hidden || !aiImage.getAttribute("src");
  }

  // Watch for new AI-generated images.
  const observer = new MutationObserver(updateSaveButton);

  observer.observe(aiImage, {
    attributes: true,
    attributeFilter: ["src", "hidden"]
  });

  // Save the generated image as a PNG file.
  saveAIButton.addEventListener("click", () => {

    if (aiImage.hidden || !aiImage.src) return;

    const link = document.createElement("a");

    link.href = aiImage.src;
    link.download = "draw-to-life-ai-art.png";

    document.body.appendChild(link);
    link.click();
    link.remove();

  });

  // Hide the save button when returning to the sketch.
  backButton?.addEventListener("click", () => {
    setTimeout(updateSaveButton, 0);
  });

  clearButton?.addEventListener("click", () => {
    setTimeout(updateSaveButton, 0);
  });

  updateSaveButton();

});