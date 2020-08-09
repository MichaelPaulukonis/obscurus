module.exports = {
  cellSize: 30,
  textSize: 24,
  cells: { x: 20, y: 20 },
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  p5frameRate: 60,
  captureFrameRate: 20,
  inflectionVector: {},
  colorModVector: {},
  colorFrameMod: {},
  textFrameMod: {},
  paused: false,
  textProvider: null,
  corpus: [],
  gridOutline: false,
  dumbT: 0,
  frame: 0,
  textFrame: 0,
  colorFrameRate: 10,
  textFrameRate: 200,
  previousTextFrameCount: 0,
  previousColorFrameCount: 0,
  colorFrameReset: false,
  textFrameReset: false,
  displayGui: false,
  textReset: false,
  noiseSeed: null,
  capturing: false,
  captureOverride: false,
  captureCount: 0,
  captureLimit: 100
}