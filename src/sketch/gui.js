import * as dat from 'dat.gui'

export default class GuiControl {
  constructor () {
    this.setupGui = (sketch) => { }

    const paramsInitialOld = {
      name: 'OBSCURUS',
      cellSize: 30,
      textSize: 24,
      cells: { x: 20, y: 20 },
      width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
      height: 500,
      inflectionVector: {},
      colorModVector: {},
      colorFrameMod: {},
      textFrameMod: {},
      paused: false,
      textProvider: null,
      gridOutline: false,
      colorFrameRate: 10,
      textFrameRate: 200,
      captureLimit: 100
    }

    const configOriginal = {
      cellSize: 30,
      textSize: 24,
      cells: { x: 20, y: 20 },
      width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
      height: 500,
      p5frameRate: 60,
      captureFrameRate: 10,
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
      displayGui: false,
      textReset: false,
      noiseSeed: null,
      capturing: false,
      captureOverride: false,
      captureCount: 0,
      captureLimit: 100
    }

    const params = Object.assign({}, configOriginal)
    const gui = new dat.GUI({ name: 'OBSCURUS' })
    gui.remember(params)
    gui.add(params, 'paused').listen()
    // gui.add(params, 'textsize').min(4).max(64).step(1).listen()
    // gui.add(params, 'textsizeJitRange').min(0).max(64).step(1).listen()
    // gui.add(params, 'distanceJitRange').min(0).max(64).step(1).listen()
    // gui.add(params, 'heightOffset').min(-20).max(20).step(1).listen()
    // gui.add(params, 'textMode', params.textModes).listen()
    // gui.add(params, 'rotate').listen()
    // gui.add(params, 'rotation').min(-360).max(360).step(1)
    // gui.add(params, 'autoPaintMode').listen()
    // gui.add(params, 'randomSizeMode').listen()
    this.params = params
    this.gui = gui
  }
}
