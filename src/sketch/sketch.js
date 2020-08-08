// import CCapture from 'ccapture.js'
import { vector } from './vectorMod'

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

export default function sketch ({ p5Instance, textManager, corpus, config }) {
  config.corpus = corpus

  const fonts = {}

  p5Instance.preload = () => {
    ['GothamBold', 'Helvetica-Bold-Font', 'Interstate-Regular-Font'].forEach((font) => {
      fonts[font] = p5Instance.loadFont(`./assets/fonts/${font}.ttf`)
    })
  }

  const randomizeValues = (cfg) => {
    cfg.colorFrameRate = Math.round(p5Instance.random(1, 50))
    cfg.textFrameRate = Math.round(p5Instance.random(1, 60))

    cfg.colorFrameMod = vector({ value: cfg.colorFrameRate, min: 1, max: 60, direction: p5Instance.random([-1, 1]), mod: 0.3 })
    cfg.textFrameMod = vector({ value: cfg.textFrameRate, min: 1, max: 200, direction: p5Instance.random([-1, 1]), mod: 0.2 })
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
    if (blockCells.length === 0 || config.colorFrameReset || config.frame - config.previousColorFrameCount === config.colorFrameRate) {
      config.colorFrameReset = false
      config.previousColorFrameCount = config.frame
      config.colorFrameRate = Math.round(config.colorFrameMod.next()) // doh! we need to modify THIS, too!!!
      config.colorModVector.update()
      config.inflectionVector.update()
      blockCells = buildGridCells({ cells: config.cells, cellSize: config.cellSize })
      updated = true
    }
    if (config.textReset || textCells.length === 0 || config.frame - config.previousTextFrameCount === config.textFrameRate) {
      config.previousTextFrameCount = config.frame
      config.textFrameRate = Math.round(config.textFrameMod.next())
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
