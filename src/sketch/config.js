import out from './setupVectors'

const config = () => {
  const {
    blockFrameMod,
    blockModVector,
    colorFrameMod,
    inflectionVector,
    textFrameMod,
    randomizeVectors
  } = out()

  return {
    cellSize: 30,
    textSize: 24,
    cells: { x: 20, y: 20 },
    width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
    height: 500,
    p5frameRate: 60,
    captureFrameRate: 20,
    inflectionVector,
    blockModVector,
    blockFrameMod,
    colorFrameMod,
    textFrameMod,
    resetVectors: function () {
      const newVecs = randomizeVectors()
      this.blockFrameMod.set(newVecs.blockFrameMod)
      this.blockModVector.set(newVecs.blockModVector)
      this.colorFrameMod.set(newVecs.colorFrameMod)
      this.inflectionVector.set(newVecs.inflectionVector)
      // TODO: need to set the new data that also happens in the "onFinishChange" funcs. doh!
    },
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
    canvasReset: false,
    displayGui: false,
    noiseSeed: null,
    capturing: false,
    captureOverride: false,
    captureCount: 0,
    captureLimit: 200,
    redefineCorpus: () => { }
  }
}

export default config
