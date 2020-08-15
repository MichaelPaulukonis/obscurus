import { vector } from './vectorMod'

const randomHeading = () => Math.random() < 0.5 ? 1 : -1
const randomArb = (min, max) => Math.random() * (max - min) + min

const newVector = (fn = (x) => x) => ({ frameRate, min, max, direction = randomHeading(), speed }) => {
  const newFrameRate = fn(randomArb(frameRate.min, frameRate.max))
  return vector({
    value: newFrameRate,
    min,
    max,
    direction,
    speed
  })
}

const newFrameVector = newVector(Math.round)
const newModVector = newVector()

const blockModVector = newModVector({
  frameRate: { min: 0.001, max: 0.02 },
  direction: randomHeading(),
  speed: 0.0001,
  min: 0.001,
  max: 0.06
})

const inflectionVector = newFrameVector({
  frameRate: { min: 100, max: 130 },
  direction: randomHeading(),
  speed: 0.3,
  min: 80,
  max: 170
})

const colorModVector = newFrameVector({
  frameRate: { min: 21, max: 30 },
  direction: randomHeading(),
  speed: 1,
  min: 1,
  max: 30
})

const textFrameMod = newFrameVector({
  frameRate: { min: 1, max: 60 },
  min: 1,
  max: 200,
  speed: 0.2
})

const colorFrameMod = newFrameVector({
  frameRate: { min: 1, max: 30 },
  min: 1,
  max: 200,
  speed: 0.2
})

// TODO: make a common func for (re)assignment
// so we can randomly re-gen on-the-fly

// const blockFrameRate = Math.round(randomArb(1, 50))
// const blockFrameMod = vector({ value: blockFrameRate, min: 1, max: 60, direction: randomHeading(), mod: 0.3 })
const blockFrameMod = newFrameVector({
  frameRate: { min: 1, max: 50 },
  min: 1,
  max: 60,
  speed: 0.3
})

const config = {
  cellSize: 30,
  textSize: 24,
  cells: { x: 20, y: 20 },
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  p5frameRate: 60,
  captureFrameRate: 20,
  inflectionVector,
  blockModVector,
  colorModVector,
  blockFrameMod,
  textFrameMod,
  colorFrameMod,
  paused: false,
  textProvider: null,
  useColor: true,
  fillWhite: Math.random() < 0.5,
  corpus: [],
  gridOutline: false,
  dumbT: 0,
  frame: 0,
  textFrame: 0,
  previousBlockFrameCount: 0,
  previousTextFrameCount: 0,
  previousColorFrameCount: 0,
  blockFrameReset: false,
  textFrameReset: false,
  colorFrameReset: false,
  displayGui: false,
  noiseSeed: null,
  capturing: false,
  captureOverride: false,
  captureCount: 0,
  captureLimit: 100
}

export default config
