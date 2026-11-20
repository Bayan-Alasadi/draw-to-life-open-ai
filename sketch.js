// These variables control the drawing and selected tool
// Here I keep the brush settings.
// These arrays help the user undo and redo drawing steps.
let drawing;
let brushColor = "#328dca";
let brushSize = 6;
let currentTool = "brush";

// These variables remember drawing steps
let undoStack = [];
let redoStack = [];

// Here I keep track of the pointer position.
let activePointerId = null;
let previousPoint = null;

// Drawing colors
// These are the colors the user can choose from.
const COLORS = [
  "#36875b", // Green
  "#328dca", // Blue
  "#f4c542", // Yellow
  "#e74c3c", // Red
  "#9576b5", // Purple
  "#f48ab5", // Pink
  "#95613c", // Brown
  "#222222", // Black
  "#f58b45", // Orange
  "#ffffff"  // White
];

// ==========================================
// SETUP
// ==========================================

// Here I create the canvas for drawing.
// I use a separate layer to keep the drawing.
// These settings make the brush strokes smoother.
// Here I connect the mouse, pen and touch events.
// Finally, I set up the drawing tools.

function setup() {

  const canvas = createCanvas(900, 585);

  canvas.parent("canvas-host");

  pixelDensity(1);

  drawing = createGraphics(width, height);

  drawing.pixelDensity(1);
  drawing.background(255);

  drawing.strokeCap(ROUND);
  drawing.strokeJoin(ROUND);

  // Mouse, pen and touch support
  canvas.elt.style.touchAction = "none";

  canvas.elt.addEventListener(
    "pointerdown",
    startPointer
  );

  canvas.elt.addEventListener(
    "pointermove",
    movePointer
  );

  canvas.elt.addEventListener(
    "pointerup",
    endPointer
  );

  canvas.elt.addEventListener(
    "pointercancel",
    endPointer
  );

  canvas.elt.addEventListener(
    "lostpointercapture",
    endPointer
  );

  setupTools();
}

// ==========================================
// DRAW
// ==========================================
// I keep the canvas white and show the drawing layer.
function draw() {

  background(255);

  image(drawing, 0, 0);

}

// ==========================================
// POINTER POSITION
// ==========================================
// I convert the pointer position to canvas coordinates.
function getPoint(event) {

  const rect = document
    .querySelector("#canvas-host canvas")
    .getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) * width / rect.width,
    y: (event.clientY - rect.top) * height / rect.height
  };

}
// This checks if the user is inside the canvas.

function isInside(point) {

  return (
    point.x >= 0 &&
    point.x <= width &&
    point.y >= 0 &&
    point.y <= height
  );

}

// ==========================================
// START DRAWING
// ==========================================
// I save the drawing before starting a new brush stroke.

function startPointer(event) {

  if (activePointerId !== null) return;

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  const point = getPoint(event);

  if (!isInside(point)) return;

  event.preventDefault();

  activePointerId = event.pointerId;
  previousPoint = point;

  event.currentTarget.setPointerCapture(
    event.pointerId
  );

  saveUndo();

  paintLine(
    point.x,
    point.y,
    point.x,
    point.y
  );

}

// ==========================================
// DRAW WHILE MOVING
// ==========================================

function movePointer(event) {

  if (
    event.pointerId !== activePointerId ||
    !previousPoint
  ) {
    return;
  }
// I connect the previous point to the new position.

  event.preventDefault();

  const point = getPoint(event);

  const x = constrain(point.x, 0, width);
  const y = constrain(point.y, 0, height);

  paintLine(
    previousPoint.x,
    previousPoint.y,
    x,
    y
  );

  previousPoint = { x, y };

}

// ==========================================
// STOP DRAWING
// ==========================================

// I reset the pointer when the user stops drawing.

function endPointer(event) {

  if (event.pointerId !== activePointerId) {
    return;
  }

  activePointerId = null;
  previousPoint = null;

}

// ==========================================
// BRUSH AND ERASER
// ==========================================

// Here I draw with the brush or eraser.
// I use the selected brush size.
// If the eraser is selected, I draw in white.
// A click makes a dot, and dragging makes a line.
function paintLine(x1, y1, x2, y2) {

  drawing.strokeCap(ROUND);
  drawing.strokeJoin(ROUND);

  // Use the current brush size
  drawing.strokeWeight(brushSize);

  if (currentTool === "eraser") {

    drawing.stroke(255);
    drawing.fill(255);

  } else {

    drawing.stroke(brushColor);
    drawing.fill(brushColor);

  }

  if (x1 === x2 && y1 === y2) {

    drawing.noStroke();

    drawing.circle(
      x1,
      y1,
      brushSize
    );

  } else {

    drawing.line(
      x1,
      y1,
      x2,
      y2
    );

  }

}

// ==========================================
// UNDO AND REDO
// ==========================================

// I save a copy of the drawing so the user can undo.
// I limit the history to 20 steps and clear redo after a new action.
function saveUndo() {

  undoStack.push(drawing.get());

  if (undoStack.length > 20) {
    undoStack.shift();
  }

  redoStack = [];

}
// Here I restore a saved version of the drawing.
function restoreSnapshot(snapshot) {

  drawing.clear();

  drawing.image(
    snapshot,
    0,
    0,
    width,
    height
  );

}
// I save the current drawing for redo, then go back one step.
function undo() {

  if (!undoStack.length) return;

  redoStack.push(drawing.get());

  restoreSnapshot(undoStack.pop());

}
// I save the current drawing for undo, then redo the last step.

function redo() {

  if (!redoStack.length) return;

  undoStack.push(drawing.get());

  restoreSnapshot(redoStack.pop());

}

// ==========================================
// SELECT DRAWING TOOL
// ==========================================
// Select the drawing tool.
// Update brush size and slider progress.
// Create the color palette.
// Select a brush color.
// Connect the drawing controls.
function selectTool(tool) {

  currentTool = tool;

  document.getElementById("brush-btn")
    .classList.toggle(
      "active",
      tool === "brush"
    );

  document.getElementById("eraser-btn")
    .classList.toggle(
      "active",
      tool === "eraser"
    );

}

// ==========================================
// BRUSH SIZE CONTROL
// ==========================================
// Update brush size and slider progress.

function updateBrushSize() {

  const slider = document.getElementById("brush-size");

  if (!slider) return;

  // Change the real brush thickness
  brushSize = Number(slider.value);

  // Update the displayed number
  const sizeValue = document.getElementById(
    "brush-size-value"
  );

  if (sizeValue) {
    sizeValue.textContent = brushSize;
  }

  const min = Number(slider.min);
  const max = Number(slider.max);

  // Calculate the blue progress
  const progress = max > min
    ? ((brushSize - min) / (max - min)) * 100
    : 0;

  // Update the blue line while dragging
  slider.style.setProperty(
    "--brush-progress",
    progress + "%"
  );

}

// ==========================================
// SETUP DRAWING TOOLS
// ==========================================
// Create the color palette.
// Select a brush color.
// Connect the drawing controls.
function setupTools() {

  const container = document.getElementById("colors");

  // Create color buttons
  COLORS.forEach(color => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "color-swatch";

    button.style.backgroundColor = color;

    button.setAttribute(
      "aria-label",
      `Choose color ${color}`
    );

    if (color === brushColor) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {

      brushColor = color;

      selectTool("brush");

      document.querySelectorAll(".color-swatch")
        .forEach(b => {
          b.classList.remove("selected");
        });

      button.classList.add("selected");

    });

    container.appendChild(button);

  });

  // Brush button
  document.getElementById("brush-btn")
    .addEventListener("click", () => {
      selectTool("brush");
    });

  // Eraser button
  document.getElementById("eraser-btn")
    .addEventListener("click", () => {
      selectTool("eraser");
    });

  // Undo button
  document.getElementById("undo-btn")
    .addEventListener("click", undo);

  // Redo button
  document.getElementById("redo-btn")
    .addEventListener("click", redo);

  // ========================================
  // INTERACTIVE BRUSH SLIDER
  // ========================================

  const brushSlider = document.getElementById(
    "brush-size"
  );

  // Update continuously while dragging
  brushSlider.addEventListener(
    "input",
    updateBrushSize
  );

  // Set the correct value when the page opens
  updateBrushSize();

  // ========================================
  // CLEAR CANVAS
  // ========================================
// Here I clear the drawing when the user clicks the button.
// I save the drawing first so the user can undo.

  document.getElementById("clear-btn")
    .addEventListener("click", () => {

      saveUndo();

      drawing.background(255);

      showSketchIfAvailable();

    });

  // ========================================
  // SAVE SKETCH
  // ========================================
// Here I save the sketch as a PNG image.

  document.getElementById("save-btn")
    .addEventListener("click", () => {

      saveCanvas(
        drawing.canvas,
        "my-sketch",
        "png"
      );

    });

}

// ==========================================
// RETURN TO ORIGINAL DRAWING
// ==========================================
// I show the sketch again if the function is available.

function showSketchIfAvailable() {

  if (typeof showSketch === "function") {
    showSketch();
  }

}