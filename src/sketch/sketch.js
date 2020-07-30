
const config = {
  cellSize: 40,
  cells: { x: 15, y: 15 },
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  frameRate: 30,
  textSize: 24,
  inflectionVector: {},
  xyModVector: {},
  paused: false,
  textProvider: null,
  corpus: [],
  gridOutline: false,
  xyMod: 0.02,
  dumbT: 0,
  frame: 0,
  textFrame: 0,
  colorFrameRate: 20,
  textFrameRate: 12,
  displayGui: true,
  textReset: false
}

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

export default function sketch ({ p5Instance, textManager, corpus }) {
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

  const sliderUpdater = slider => configSetting => () => { config[configSetting] = slider.value() }

  const setupGui = () => {
    const xymodSlider = p5Instance.createSlider(0.0005, 0.06, config.xyMod, 0.0001)
    xymodSlider.position(20, 20)
    xymodSlider.input(sliderUpdater(xymodSlider)('xyMod'))

    const colorFrameSlider = p5Instance.createSlider(1, 40, config.colorFrameRate, 1)
    colorFrameSlider.position(20, 40)
    colorFrameSlider.input(sliderUpdater(colorFrameSlider)('colorFrameRate'))

    const textFrameSlider = p5Instance.createSlider(1, 40, config.textFrameRate, 1)
    textFrameSlider.position(20, 60)
    textFrameSlider.input(sliderUpdater(textFrameSlider)('textFrameRate'))

    const inflectionPointSlider = p5Instance.createSlider(1, 255, config.inflectionVector.value, 1)
    inflectionPointSlider.position(20, 80)
    inflectionPointSlider.input(() => { config.inflectionVector.value = inflectionPointSlider.value() })

    p5Instance.text('xymod', xymodSlider.x + 2 * xymodSlider.width, xymodSlider.y)

    guiControls = [xymodSlider, colorFrameSlider, textFrameSlider, inflectionPointSlider]
    controls = { xymodSlider, colorFrameSlider, textFrameSlider, inflectionPointSlider }
    showHideGui = displayControls(guiControls)
  }

  const updateGuiLabels = (controls) => {
    p5Instance.fill('#000')
    p5Instance.stroke('#fff')
    p5Instance.textAlign(p5Instance.LEFT)

    Object.keys(controls).forEach(name => {
      p5Instance.text(name, controls[name].x + controls[name].width + 10, controls[name].y)
    })
  }

  p5Instance.setup = () => {
    newText({ config, textManager })
    p5Instance.createCanvas(config.cellSize * config.cells.x, config.cellSize * config.cells.y)

    p5Instance.frameRate(config.frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    p5Instance.textFont(fonts['Interstate-Regular-Font'])

    config.xyModVector = vector({
      value: 0.02,
      direction: 1,
      speed: 0.0001,
      min: 0.001,
      max: 0.06
    })
    config.inflectionVector = vector({
      value: 128,
      direction: -1,
      speed: 0.3,
      min: 60,
      max: 190
    })

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

      case 't':
        newText({ config, textManager })
        break

      case 'g':
        config.displayGui = !config.displayGui
        showHideGui(config.displayGui)
        break

      case 'o': // for dev purposes
        config.gridOutline = !config.gridOutline
        if (config.gridOutline) {
          p5Instance.stroke('black')
        } else {
          p5Instance.noStroke()
        }
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
    config.frame += 1
    // const vec = increment()
    if (blockCells.length === 0 || config.frame % config.colorFrameRate === 0) {
      config.xyModVector.update()
      config.inflectionVector.update()
      blockCells = buildGridCells({ cells: config.cells, cellSize: config.cellSize })
    }
    if (config.textReset || textCells.length === 0 || config.frame % config.textFrameRate === 0) {
      config.textReset = false
      textCells = buildTextCells({ cells: config.cells, cellSize: config.cellSize, getchar: config.textProvider(config.textFrame) })
      config.textFrame += 1
    }
    // TODO:: revist this
    // if (config.textFrame % 10 === 0) {
    //   config.textProvider = windowFactory(config.cells)
    // }

    paintGridsNew({ textCells, blockCells })
    if (config.displayGui) updateGuiLabels(controls)
  }

  p5Instance.draw = draw

  const windowFactory = (cells) => (startIndex) => {
    const bloc = textManager.windowMaker(cells.x * cells.x)(startIndex)
    let index = -1
    return function * () {
      index = (index + 1) % bloc.length
      yield bloc[index]
      // I couldn't get statements AFTER yield to execute ?????
      /// maybe because I'm not using a 'done' thing?
    }
  }

  const buildGridCells = ({ cells, cellSize }) => {
    const bwGrid = []
    for (var y = 0; y < cells.y; y++) {
      for (var x = 0; x < cells.x; x++) {
        const triDnoise = (255 * p5Instance.noise(config.xyModVector.value * x * cells.x, config.xyModVector.value * y * cells.y, config.dumbT))
        const background = triDnoise >= config.inflectionVector.value ? 'white' : 'black'
        bwGrid.push({
          background,
          x: x * cellSize,
          y: y * cellSize,
          cellSize
        })
      }
    }
    config.dumbT = config.dumbT + config.xyModVector.value
    return bwGrid
  }

  const buildTextCells = ({ cells, cellSize, getchar }) => {
    const yMod = (p5Instance.textAscent() * 1.4) // doesn't need to be here (but values are variable with font)
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
    p5Instance.noStroke()
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)

    blockCells.forEach(cell => {
      p5Instance.fill(cell.background)
      p5Instance.rect(cell.x, cell.y, cell.cellSize, cell.cellSize)
    })
    p5Instance.fill('black')
    textCells.forEach(cell => p5Instance.text(cell.text, cell.x, cell.y))
  }
}
