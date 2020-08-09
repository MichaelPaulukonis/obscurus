import * as dat from 'dat.gui'
import * as config from './config'

// if the function is called repeatedly, wait until threshold passes until we execute the function
const debounce = function (func, threshold, callImmediately) {
  let timeout

  return function () {
    const obj = this
    const args = arguments
    function delayed () {
      timeout = null
      if (!callImmediately) func.apply(obj, args)
    }

    const callNow = callImmediately || !timeout

    clearTimeout(timeout)
    timeout = setTimeout(delayed, threshold)

    if (callNow) {
      func.apply(obj, args)
    }
  }
}
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
      .onChange(debounce(() => {
        params.colorFrameReset = true // ugh, no - not every single time!
        params.colorFrameMod.value = params.colorFrameRate
        params.colorFrameMod.max = Math.max(params.colorFrameRate, params.colorFrameMod.max)
      }, 200))
      .listen()
    gui.add(params, 'textFrameRate').min(1).max(1000).step(1)
      .onChange(debounce(() => {
        params.textReset = true
        params.textFrameMod.value = params.textFrameRate
        params.textFrameMod.max = Math.max(params.textFrameRate, params.textFrameMod.max)
      }, 200))
      .listen()

    this.params = params
    this.gui = gui
  }
}
