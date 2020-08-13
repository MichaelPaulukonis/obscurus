import { vector } from './vectorMod'

const randomHeading = () => Math.random() < 0.5 ? 1 : -1
const randomArb = (min, max) => Math.random() * (max - min) + min

let defaults = {
  direction: randomHeading(), // Math.random() p5Instance.random([1, -1]),
  speed: 0.0001, // so.... would be nice to have THIS change, too
  min: 0.001, // smooth curve (close up)
  max: 0.06 // jagged blocks (zoomed out)
}
defaults.value = randomArb(defaults.min, defaults.max / 3)
const colorModVector = vector(defaults)

defaults = {
  direction: randomHeading(), // Math.random() p5Instance.random([1, -1]),
  speed: 0.3,
  min: 80, // more white
  max: 170 // more black
}
defaults.value = Math.round(randomArb(defaults.min + 20, defaults.max - 40))
const inflectionVector = vector(defaults)

const colorFrameRate = Math.round(randomArb(1, 50))
const textFrameRate = Math.round(randomArb(1, 60))

// doh! the min/max are not matched in the sliders!
const colorFrameMod = vector({ value: colorFrameRate, min: 1, max: 60, direction: randomHeading(), mod: 0.3 })
const textFrameMod = vector({ value: textFrameRate, min: 1, max: 200, direction: randomHeading(), mod: 0.2 })

const config = {
  cellSize: 30,
  textSize: 24,
  cells: { x: 20, y: 20 },
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  p5frameRate: 60,
  captureFrameRate: 20,
  inflectionVector,
  colorModVector,
  colorFrameMod,
  textFrameMod,
  paused: false,
  textProvider: null,
  useColor: true,
  corpus: [],
  gridOutline: false,
  dumbT: 0,
  frame: 0,
  textFrame: 0,
  colorFrameRate,
  textFrameRate,
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

export default config
