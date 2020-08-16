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

    gui.add(params, 'resetVectors').name('RandomizeVecs')

    gui.add(params, 'p5frameRate').min(1).max(60).step(1).listen()
    gui.add(params, 'captureFrameRate').min(1).max(60).step(1).listen()

    gui.add(params.blockFrameMod, 'value').min(1).max(1000).step(1).name('blockFrameRate')
      .onFinishChange(() => {
        console.log('blockFrame finish')
        params.blockFrameReset = true // ugh, no - not every single time! only if it "should have" happened (shorter)
        params.blockFrameMod.max = Math.max(params.blockFrameMod.value, params.blockFrameMod.max)
      })
      .listen()
    gui.add(params.textFrameMod, 'value').min(1).max(1000).step(1).name('textFrameRate')
      .onFinishChange(() => {
        params.textFrameReset = true
        params.textFrameMod.max = Math.max(params.textFrameMod.value, params.textFrameMod.max)
      })
      .listen()
    gui.add(params.colorFrameMod, 'value').min(1).max(100).step(1).name('colorFrameRate')
      .onFinishChange(() => {
        params.colorFrameReset = true
        params.colorFrameMod.max = Math.max(params.colorFrameMod.value, params.colorFrameMod.max)
      })
      .listen()

    gui.add(params.inflectionVector, 'value').min(80).max(170).step(1).listen().name('white/black')

    this.params = params
    this.gui = gui
  }
}
