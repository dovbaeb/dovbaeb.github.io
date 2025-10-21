const { isPanning } = require("./mindmap");

window.addEventListener("pointerup", (e) => {
  if (!isPanning) return;
  isPanning = false;
  try {
    stage.releasePointerCapture(e.pointerId);
  } catch (_) {}
});
