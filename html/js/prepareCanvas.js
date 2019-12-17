export function prepareCanvas(width, height, scale, canvas) {
  canvas.getContext("2d").scale(devicePixelRatio, devicePixelRatio);
  canvas.height = (height * scale) / devicePixelRatio;
  canvas.width = (width * scale) / devicePixelRatio;
  canvas.style.height = canvas.height + "px";
  canvas.style.width = canvas.width + "px";
  canvas.height *= devicePixelRatio;
  canvas.width *= devicePixelRatio;
}
