const initCanvas = (id) => {
  return new fabric.Canvas(id, {
    width: 500,
    height: 500,
    selection: false,
  });
};

const setBackground = (url, canvas) => {
  fabric.Image.fromURL(url, (img) => {
    canvas.backgroundImage = img;
    canvas.renderAll();
  });
};

const canvas = initCanvas("canvas");
let mousePressed = false;
let currentMode;
let color = "#000000";

const modes = {
  pan: "pan",
  drawing: "drawing",
};

const toggleMode = (mode) => {
  if (mode === modes.pan) {
    if (currentMode === modes.pan) {
      currentMode = "";
    } else {
      currentMode = modes.pan;
      canvas.isDrawingMode = false;
      canvas.renderAll();
    }
  } else if (mode === modes.drawing) {
    if (currentMode === modes.drawing) {
      currentMode = "";
      canvas.isDrawingMode = false;
      canvas.renderAll();
    } else {
      currentMode = modes.drawing;
      canvas.freeDrawingBrush.color = color;
      canvas.isDrawingMode = true;
      canvas.renderAll();
    }
  }
  console.log(mode);
};

const setPanEvents = (canvas) => {
  canvas.on("mouse:move", (e) => {
    if (mousePressed && currentMode === modes.pan) {
      const mouseEvent = e.e;
      const delta = new fabric.Point(
        mouseEvent.movementX,
        mouseEvent.movementY
      );
      canvas.relativePan(delta);
      canvas.setCursor("grab");
      canvas.renderAll();
    }
  });

  canvas.on("mouse:down", (event) => {
    mousePressed = true;
    if (currentMode === modes.pan) {
      canvas.setCursor("grab");
      canvas.renderAll();
    }
  });

  canvas.on("mouse:up", (event) => {
    mousePressed = false;
    canvas.setCursor("default");
    canvas.renderAll();
  });
};

const setColorListener = () => {
  const picker = document.getElementById("colorPicker");
  picker.addEventListener("change", (event) => {
    console.log(event.target.value);
    color = event.target.value;
    canvas.freeDrawingBrush.color = color;
    canvas.renderAll();
  });
};

const clearCanvas = (canvas) => {
  canvas.getObjects().forEach((obj) => {
    if (obj !== canvas.backgroundImage) {
      canvas.remove(obj);
    }
  });
};

const createRect = (canvas) => {
  const canvasCenter = canvas.getCenter();
  const rect = new fabric.Rect({
    width: 100,
    height: 200,
    fill: "cyan",
    left: canvasCenter.left,
    top: -100,
    originX: "center",
    originY: "center",
    cornerColor: "white",
  });

  canvas.add(rect);
  canvas.renderAll();
  rect.animate("top", canvasCenter.top, {
    onChange: canvas.renderAll.bind(canvas),
  });

  rect.on("selected", () => {
    rect.set("fill", "white");
    canvas.requestRenderAll();
  });

  rect.on("deselected", () => {
    rect.set("fill", "cyan");
    canvas.renderAll();
  });
};

const createCirc = (canvas) => {
  const canvasCenter = canvas.getCenter();
  const circ = new fabric.Circle({
    radius: 80,
    fill: "red",
    left: canvasCenter.left,
    top: -50,
    originX: "center",
    originY: "center",
    cornerColor: "white",
    lockScalingX: true,
    lockScalingY: false,
  });

  canvas.add(circ);
  canvas.requestRenderAll();
  circ.animate("top", canvas.height - 80, {
    onChange: canvas.renderAll.bind(canvas),
    onComplete: () => {
      circ.animate("top", canvasCenter.top, {
        onChange: canvas.renderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBounce,
        duration: 200,
      });
    },
  });
  circ.on("selected", () => {
    circ.fill = "blue";
    circ.dirty = true;
    canvas.requestRenderAll();
  });

  circ.on("deselected", () => {
    circ.fill = "red";
    circ.dirty = true;
    canvas.renderAll();
  });
};

setBackground(
  "https://drscdn.500px.org/photo/1077610594/q%3D80_m%3D2000/v2?sig=56a7c87d7ca1de29f513a00d217c2f5ee08d6544a009f816a6b4a3ac6dc24d35",
  canvas
);

setPanEvents(canvas);

setColorListener();
