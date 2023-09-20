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

const clearCanvas = (canvas, state) => {
  state.val = canvas.toSVG();
  canvas.getObjects().forEach((obj) => {
    if (obj !== canvas.backgroundImage) {
      canvas.remove(obj);
    }
  });
};

const restoreCanvas = (canvas, state, bgUrl) => {
  if (state.val) {
    fabric.loadSVGFromString(state.val, (objects) => {
      objects = objects.filter((o) => o["xlink:href"] !== bgUrl);
      canvas.add(...objects);
      canvas.requestRenderAll();
    });
  }
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

const groupObjects = (canvas, group, shouldGroup) => {
  if (shouldGroup) {
    const objects = canvas.getObjects();
    group.val = new fabric.Group(objects, { cornerColor: "white" });
    clearCanvas(canvas, svgState);
    canvas.add(group.val);
    canvas.requestRenderAll();
  } else {
    group.val.destroy();
    const oldGroup = group.val.getObjects();
    clearCanvas(canvas, svgState);
    canvas.add(...oldGroup);
    group.val = null;
    canvas.requestRenderAll();
  }
};

const imageAdd = (e) => {
  const file = e.target.files[0];

  reader.readAsDataURL(file);
};

const canvas = initCanvas("canvas");
const svgState = {};
let mousePressed = false;
let color = "#000000";
const group = {};
const bgUrl =
  "https://drscdn.500px.org/photo/1077610594/q%3D80_m%3D2000/v2?sig=56a7c87d7ca1de29f513a00d217c2f5ee08d6544a009f816a6b4a3ac6dc24d35";

let currentMode;

const modes = {
  pan: "pan",
  drawing: "drawing",
};
const reader = new FileReader();

setBackground(bgUrl, canvas);

setPanEvents(canvas);

setColorListener();

const inputFile = document.getElementById("imagePicker");
inputFile.addEventListener("change", imageAdd);

reader.addEventListener("load", () => {
  console.log(reader.result);
  fabric.Image.fromURL(reader.result, (img) => {
    canvas.add(img);
    canvas.requestRenderAll();
  });
});
