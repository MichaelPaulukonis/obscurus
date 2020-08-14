import * as dat from 'dat.gui'
import config from './config'

export default class GuiControl {
  constructor () {
    const params = Object.assign({}, config)
    const gui = new dat.GUI({ name: 'OBSCURUS' })
    gui.remember(params)
    gui.add(params, 'paused').listen()
    gui.add(params, 'useColor').name('color')
    gui.add(params, 'fillWhite').name('Fill white').listen()
    gui.add(params, 'captureLimit').min(10).max(1000).step(1).listen()

    gui.add(params, 'p5frameRate').min(1).max(60).step(1).listen()
    gui.add(params, 'captureFrameRate').min(1).max(60).step(1).listen()

    gui.add(params, 'blockFrameRate').min(1).max(1000).step(1)
      .onFinishChange(() => {
        params.blockFrameReset = true // ugh, no - not every single time!
        params.blockFrameMod.value = params.blockFrameRate
        params.blockFrameMod.max = Math.max(params.blockFrameRate, params.blockFrameMod.max)
      })
      .listen()
    gui.add(params, 'textFrameRate').min(1).max(1000).step(1)
      .onFinishChange(() => {
        params.textFrameReset = true
        params.textFrameMod.value = params.textFrameRate
        params.textFrameMod.max = Math.max(params.textFrameRate, params.textFrameMod.max)
      })
      .listen()
    gui.add(params, 'colorFrameRate').min(1).max(100).step(1)
      .onFinishChange(() => {
        params.colorFrameReset = true
        params.colorFrameMod.value = params.colorFrameRate
        params.colorFrameMod.max = Math.max(params.colorFrameRate, params.colorFrameMod.max)
      })
      .listen()

    gui.add(params.inflectionVector, 'value').min(80).max(170).step(1).listen().name('white/black')

    this.params = params
    this.gui = gui
  }
}
