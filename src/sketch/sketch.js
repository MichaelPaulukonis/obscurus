
const config = {
  cellSize: 30,
  textSize: 24,
  cells: { x: 20, y: 20 },
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  p5frameRate: 60,
  inflectionVector: {},
  colorModVector: {},
  paused: false,
  textProvider: null,
  corpus: [],
  gridOutline: false,
  dumbT: 0,
  frame: 0,
  textFrame: 0,
  colorFrameRate: 10,
  textFrameRate: 200,
  displayGui: false,
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
    const colorFrameSlider = p5Instance.createSlider(1, 1000, config.colorFrameRate, 1)
    colorFrameSlider.position(20, 40)
    colorFrameSlider.input(sliderUpdater(colorFrameSlider)('colorFrameRate'))

    const textFrameSlider = p5Instance.createSlider(1, 1000, config.textFrameRate, 1)
    textFrameSlider.position(20, 60)
    textFrameSlider.input(sliderUpdater(textFrameSlider)('textFrameRate'))

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
    cfg.textFrameRate = Math.round(p5Instance.random(10, 200))
    cfg.colorFrameRate = Math.round(p5Instance.random(10, 50))
  }

  p5Instance.setup = () => {
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
    config.frame += 1
    if (blockCells.length === 0 || config.frame % config.colorFrameRate === 0) {
      config.colorModVector.update()
      config.inflectionVector.update()
      blockCells = buildGridCells({ cells: config.cells, cellSize: config.cellSize })
    }
    if (config.textReset || textCells.length === 0 || config.frame % config.textFrameRate === 0) {
      config.textReset = false
      textCells = buildTextCells({ cells: config.cells, cellSize: config.cellSize, getchar: config.textProvider(config.textFrame) })
      config.textFrame += 1
    }

    const textCheck = p5Instance.random()
    if (textCheck < 0.0001) {
      newText({ config, textManager })
    } else if (textCheck < 0.001) {
      config.textProvider = windowFactory(config.cells)
    }

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
        // console.log(`${t}: ${w} - ${cellSize} ${xMod}`)
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
