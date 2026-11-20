// Connect the drawing page for the projector to have an a page for it separately.
// Find the buttons and AI elements.
document.addEventListener("DOMContentLoaded", () => {

  const button = document.getElementById("projector-btn");
  const generateButton = document.getElementById("generate-btn");
  const clearButton = document.getElementById("clear-btn");

  const result = document.getElementById("ai-result");
  const loading = document.getElementById("loading");
  const status = document.getElementById("ai-status");

  // Check if the browser supports BroadcastChannel.
  if (!("BroadcastChannel" in window)) {
    if (button) {
      button.disabled = true;
      button.title = "Projector mode is not supported.";
    }
    return;
  }

  const channel = new BroadcastChannel("draw-to-life-projector");

  // Open the projector page in a separate window.
    // I open the projector page when the button is clicked.
  // I use window.open to show projector.html.
  // I give the window a name so it can be reused.
  button.addEventListener("click", () => {

    window.open(
      "projector.html",
      "drawToLifeProjector"
    );

  });

 // Send the current state to the projector.
  // Check the current state.
  // Send the generating state.
  // Send the finished artwork.
  // Reset the projector if no image is ready.
  function sendCurrentState() {

    if (!loading.hidden) {
      channel.postMessage({ type: "generating" });
      return;
    }

    if (!result.hidden && result.src) {
      channel.postMessage({
        type: "artwork",
        image: result.src
      });
      return;
    }

    channel.postMessage({ type: "reset" });
  }

// Respond when the projector page is opened.
  // listens for messages from the projector.
  // sends the current state when the projecto
  channel.addEventListener("message", event => {

    if (event.data?.type === "request-state") {
      sendCurrentState();
    }

  });

  // shows the loading screen when Generate is clicked.
  generateButton.addEventListener("click", () => {

    if (!generateButton.disabled) {
      channel.postMessage({ type: "generating" });
    }

  }, true);

  // Show the new image when it is ready.
  const imageObserver = new MutationObserver(() => {

    if (!result.hidden && result.src) {
      channel.postMessage({
        type: "artwork",
        image: result.src
      });
    }

  });

  imageObserver.observe(result, {
    attributes: true,
    attributeFilter: ["src", "hidden"]
  });
  // Here I reset the projector when the user clicks Clear.
  clearButton.addEventListener("click", () => {
    channel.postMessage({ type: "reset" });
  });
  
  // It send a reset message if there is an error.
  const loadingObserver = new MutationObserver(() => {

    if (
      loading.hidden &&
      result.hidden &&
      status.classList.contains("error")
    ) {
      channel.postMessage({ type: "reset" });
    }

  });

  loadingObserver.observe(loading, {
    attributes: true,
    attributeFilter: ["hidden"]
  });

});