import * as dat from 'dat.gui'
import * as config from './config'

export default class GuiControl {
  constructor () {
    const params = Object.assign({}, config)
    const gui = new dat.GUI({ name: 'OBSCURUS' })
    gui.remember(params)
    gui.add(params, 'paused').listen()
    gui.add(params, 'captureLimit').min(10).max(1000).step(1).listen()

    gui.add(params, 'p5frameRate').min(1).max(60).step(1).listen()
    gui.add(params, 'captureFrameRate').min(1).max(60).step(1).listen()

    gui.add(params, 'colorFrameRate').min(1).max(1000).step(1)
      .onChange(() => {
        params.colorFrameReset = true
        params.colorFrameMod.value = params.colorFrameRate
      })
      .listen()
    gui.add(params, 'textFrameRate').min(1).max(1000).step(1)
      .onChange(() => {
        params.textReset = true
        params.textFrameMod.value = params.textFrameRate
      })
      .listen()

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
