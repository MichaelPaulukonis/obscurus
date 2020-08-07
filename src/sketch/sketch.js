// import CCapture from 'ccapture.js'
import vectorMod from './vectorMod'

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

const datestring = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const secs = String(d.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hour}${min}${secs}`
}

const filenamer = prefix => {
  let frame = 0
  return () => {
    const name = `${prefix}-${String(frame).padStart(6, '0')}`
    frame += 1
    return name
  }
}

let namer = null

const vector = ({ value, direction, speed, min, max }) => {
  const self = { value, direction, speed, min, max }
  self.update = () => {
    let newValue = self.value + (self.speed * self.direction)
    if (newValue >= self.max || newValue <= self.min) {
      self.direction = -self.direction
      newValue = Math.max(Math.min(newValue, self.max), self.min)
    }
    self.value = newValue
  }
  return self
}

export default function sketch ({ p5Instance, textManager, corpus, config }) {
  config.corpus = corpus

  const fonts = {}

  p5Instance.preload = () => {
    ['GothamBold', 'Helvetica-Bold-Font', 'Interstate-Regular-Font'].forEach((font) => {
      fonts[font] = p5Instance.loadFont(`./assets/fonts/${font}.ttf`)
    })
  }

  let guiControls = []
  let controls = {}

  const displayControls = (controls) => (show) => {
    // this.elt.style.display = 'block';
    const func = show ? 'show' : 'hide'
    controls.forEach(c => c[func]())
  }
  let showHideGui

  const configUpdater = slider => configSetting => () => { config[configSetting] = slider.value() }
  const sliderUpdater = slider => configSetting => () => { slider.value(config[configSetting]) }

  const setupGui = () => {
    const colorFrameSlider = p5Instance.createSlider(1, 1000, config.colorFrameRate, 1)
    colorFrameSlider.position(20, 40)
    colorFrameSlider.input(configUpdater(colorFrameSlider)('colorFrameRate'))

    const textFrameSlider = p5Instance.createSlider(1, 1000, config.textFrameRate, 1)
    textFrameSlider.position(20, 60)
    textFrameSlider.input(configUpdater(textFrameSlider)('textFrameRate'))

    guiControls = [colorFrameSlider, textFrameSlider]
    controls = { colorFrameSlider, textFrameSlider }
    showHideGui = displayControls(guiControls)
    showHideGui(config.displayGui)
  }

  const updateGuiLabels = (controls) => {
    p5Instance.fill('#000')
    p5Instance.stroke('#fff')
    p5Instance.textAlign(p5Instance.LEFT)

    Object.keys(controls).forEach(name => {
      p5Instance.text(name, controls[name].x + controls[name].width + 10, controls[name].y)
    })
  }

  const randomizeValues = (cfg) => {
    cfg.colorFrameRate = Math.round(p5Instance.random(1, 50))
    cfg.textFrameRate = Math.round(p5Instance.random(1, 60))

    cfg.colorFrameMod = vectorMod({ value: cfg.colorFrameRate, min: 1, max: 60, direction: p5Instance.random([-1, 1]), mod: 0.3 })
    cfg.textFrameMod = vectorMod({ value: cfg.textFrameRate, min: 1, max: 200, direction: p5Instance.random([-1, 1]), mod: 0.2 })
  }

  p5Instance.setup = () => {
    if (config.noiseSeed) {
      p5Instance.noiseSeed(config.noiseSeed)
    }
    newText({ config, textManager })
    p5Instance.createCanvas(config.cellSize * config.cells.x, config.cellSize * config.cells.y)

    p5Instance.frameRate(config.p5frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    p5Instance.textFont(fonts['Interstate-Regular-Font'])

    randomizeValues(config)

    let defaults = {
      direction: p5Instance.random([1, -1]),
      speed: 0.0001, // so.... would be nice to have THIS change, too
      min: 0.001, // smooth curve (close up)
      max: 0.06 // jagged blocks (zoomed out)
    }
    defaults.value = p5Instance.random(defaults.min, defaults.max / 3)
    console.log(`colorMod: ${defaults.value}`)

    config.colorModVector = vector(defaults)

    defaults = {
      direction: p5Instance.random([1, -1]),
      speed: 0.3,
      min: 80, // more white
      max: 170 // more black
    }
    defaults.value = Math.round(p5Instance.random(defaults.min + 20, defaults.max - 40))
    console.log(`inflection: ${defaults.value}`)
    config.inflectionVector = vector(defaults)

    setupGui()

    draw()
  }

  p5Instance.mouseClicked = () => {
    draw()
  }

  p5Instance.keyPressed = () => {
    const keyCode = p5Instance.keyCode
    if (keyCode === p5Instance.UP_ARROW || keyCode === p5Instance.DOWN_ARROW) {
      // TODO: need a function to set bounds
      config.inflectionVector.value += 5 * (keyCode === p5Instance.UP_ARROW ? -1 : 1)
    }
  }

  p5Instance.keyTyped = () => {
    const key = p5Instance.key

    switch (key) {
      case ' ':
        config.paused = !config.paused
        break

      case 'n':
        if (config.paused) {
          coreDraw()
        }
        break

      case 's':
        if (config.capturing) {
          config.captureOverride = false
          p5Instance.frameRate(config.p5frameRate)
        } else {
          namer = filenamer(datestring())
          config.captureCount = 0
          config.captureOverride = true
          p5Instance.frameRate(config.captureFrameRate)
        }
        config.capturing = !config.capturing
        break

      case 't':
        newText({ config, textManager })
        break

      case 'g':
        config.displayGui = !config.displayGui
        showHideGui(config.displayGui)
        break

      case 'o': // for dev purposes
        config.gridOutline = !config.gridOutline
    }
  }

  const newText = ({ config, textManager }) => {
    textManager.setText(p5Instance.random(config.corpus))
    config.textProvider = windowFactory(config.cells)
    config.textReset = true
  }

  const draw = () => {
    if (!config.paused) {
      coreDraw()
    }
  }
  let blockCells = []
  let textCells = []

  const coreDraw = () => {
    let updated = false
    config.frame += 1
    if (blockCells.length === 0 || config.frame - config.previousColorFrameCount === config.colorFrameRate) {
      config.previousColorFrameCount = config.frame
      // console.log(`color frame: ${config.frame} rate: ${config.colorFrameRate}`)
      config.colorFrameRate = Math.round(config.colorFrameMod())
      config.colorModVector.update()
      config.inflectionVector.update()
      blockCells = buildGridCells({ cells: config.cells, cellSize: config.cellSize })
      updated = true
    }
    if (config.textReset || textCells.length === 0 || config.frame - config.previousTextFrameCount === config.textFrameRate) {
      config.previousTextFrameCount = config.frame
      // console.log(`text frame: ${config.frame} rate: ${config.textFrameRate}`)
      config.textFrameRate = Math.round(config.textFrameMod())
      config.textReset = false
      textCells = buildTextCells({ cells: config.cells, cellSize: config.cellSize, getchar: config.textProvider(config.textFrame) })
      config.textFrame += 1
      updated = true
    }

    const textCheck = p5Instance.random()
    if (textCheck < 0.0001) {
      newText({ config, textManager })
    } else if (textCheck < 0.001) {
      config.textProvider = windowFactory(config.cells)
    }

    paintGridsNew({ textCells, blockCells })
    if (config.capturing && (updated || config.captureOverride)) {
      config.captureOverride = false
      console.log('capturing frame')
      p5Instance.saveCanvas(namer(), 'png')
      config.captureCount += 1
      if (config.captureCount > config.captureLimit) {
        config.capturing = false
        p5Instance.frameRate(config.p5frameRate)
      }
    }
    if (config.displayGui) updateGuiLabels(controls)
  }

  p5Instance.draw = draw

  const windowFactory = (cells) => (startIndex) => {
    const bloc = textManager.windowMaker(cells.x * cells.x)(startIndex)
    const direction = p5Instance.random() < 0.01 ? -1 : 1
    let index = direction === 1 ? -1 : bloc.length
    return function * () {
      index = direction === 1
        ? (index + direction) % bloc.length
        : index ? index + direction : bloc.length - 1
      yield bloc[index]
      // I couldn't get statements AFTER yield to execute ?????
      /// maybe because I'm not using a 'done' thing?
    }
  }

  const buildGridCells = ({ cells, cellSize }) => {
    const bwGrid = []
    for (var y = 0; y < cells.y; y++) {
      for (var x = 0; x < cells.x; x++) {
        const triDnoise = (255 * p5Instance.noise(config.colorModVector.value * x * cells.x, config.colorModVector.value * y * cells.y, config.dumbT))
        const background = triDnoise >= config.inflectionVector.value ? 'white' : 'black'
        bwGrid.push({
          background,
          x: x * cellSize,
          y: y * cellSize,
          cellSize
        })
      }
    }
    config.dumbT = config.dumbT + config.colorModVector.value
    return bwGrid
  }

  const buildTextCells = ({ cells, cellSize, getchar }) => {
    // const yMod = (p5Instance.textAscent() * 1.4) // doesn't need to be here (but values are variable with font)
    const yMod = (p5Instance.textAscent() * 0.7) // doesn't need to be here (but values are variable with font)

    const textGrid = []
    for (var y = 0; y < cells.y; y++) {
      for (var x = 0; x < cells.x; x++) {
        const t = getchar().next().value
        const w = p5Instance.textWidth(t)
        const xMod = (cellSize - w) / 2
        textGrid.push({
          text: t,
          x: (x * cellSize) + xMod,
          y: (y * cellSize) + yMod
        })
      }
    }
    return textGrid
  }

  const paintGridsNew = ({ textCells, blockCells }) => {
    p5Instance.textAlign(p5Instance.LEFT, p5Instance.CENTER)

    if (config.gridOutline) {
      p5Instance.stroke('black')
    } else {
      p5Instance.noStroke()
    }

    blockCells.forEach(cell => {
      p5Instance.fill(cell.background)
      p5Instance.rect(cell.x, cell.y, cell.cellSize, cell.cellSize)
    })
    p5Instance.fill('black')
    p5Instance.noStroke()

    textCells.forEach(cell => p5Instance.text(cell.text, cell.x, cell.y))
  }
}
