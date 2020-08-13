import config from "./config"

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

const randomImgOffset = (img) => ({
  x: Math.floor(Math.random() * img.width - config.cellSize),
  y: Math.floor(Math.random() * img.height - config.cellSize)
})

let currentOffset = {}
const vectorX = { direction: 1, speed: 2 }
const vectorY = { direction: 1, speed: 1 }

export default function sketch ({ p5Instance, textManager, corpus, config }) {
  p5Instance.disableFriendlyErrors = true
  config.corpus = corpus

  let img = null
  const fonts = {}
  let canvas = null

  p5Instance.preload = () => {
    ['Interstate-Regular-Font'].forEach((font) => {
      fonts[font] = p5Instance.loadFont(`./assets/fonts/${font}.ttf`)
    })
  }

  p5Instance.setup = () => {
    if (config.noiseSeed) {
      p5Instance.noiseSeed(config.noiseSeed)
    }
    newText({ config, textManager })
    canvas = p5Instance.createCanvas(config.cellSize * config.cells.x, config.cellSize * config.cells.y)
    canvas.drop(gotFile)

    p5Instance.frameRate(config.p5frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    p5Instance.textFont(fonts['Interstate-Regular-Font'])

    setImage('./assets/images/fire.01.jpeg')

    draw()
  }

  const imageReady = () => {
    img.loadPixels()
    currentOffset = randomImgOffset(img)
    config.colorFrameReset = true
    config.imageLoaded = true
  }

  const setImage = (filename) => {
    config.imageLoaded = false
    img = p5Instance.loadImage(filename, imageReady)
  }

  const gotFile = (file) => {
    if (file && file.type === 'image') {
      config.imageLoaded = false
      img = p5Instance.loadImage(file.data, imageReady)
    } else {
      console.log('Not an image file!')
    }
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
    config.textFrameReset = true
  }

  const draw = () => {
    if (!config.paused && config.imageLoaded) {
      coreDraw()
    }
  }
  let blockCells = []
  let textCells = []
  let colorCells = []

  const coreDraw = () => {
    let updated = false
    config.frame += 1
    if (blockCells.length === 0 || config.blockFrameReset || config.frame - config.previousBlockFrameCount === config.blockFrameRate) {
      config.previousBlockFrameCount = config.frame
      config.blockFrameReset = false
      config.blockFrameRate = Math.round(config.blockFrameMod.next().value)
      config.blockModVector.next()
      config.inflectionVector.next()
      blockCells = buildGridCells({ cells: config.cells, cellSize: config.cellSize })
      updated = true
    }
    if (config.textFrameReset || textCells.length === 0 || config.frame - config.previousTextFrameCount === config.textFrameRate) {
      config.previousTextFrameCount = config.frame
      config.textFrameReset = false
      config.textFrameRate = Math.round(config.textFrameMod.next().value)
      textCells = buildTextCells({ cells: config.cells, cellSize: config.cellSize, getchar: config.textProvider(config.textFrame) })
      config.textFrame += 1
      updated = true
    }

    if (config.colorFrameReset || colorCells.length === 0 || config.frame - config.previouscolorFrameCount === config.colorFrameRate) {
      config.previouscolorFrameCount = config.frame
      config.colorFrameReset = false
      config.colorFrameRate = Math.round(config.colorFrameMod.next().value)
      const newOffset = getOffset(currentOffset)
      colorCells = buildRgbGridCells({ cells: config.cells, cellSize: config.cellSize, offset: newOffset })
      currentOffset = newOffset
      updated = true
    }

    const textCheck = Math.random()
    if (textCheck < 0.0001) {
      newText({ config, textManager })
    } else if (textCheck < 0.001) {
      config.textProvider = windowFactory(config.cells)
    }

    paintGrids({ textCells, blockCells, colorCells })
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
    const direction = Math.random() < 0.01 ? -1 : 1
    let index = direction === 1 ? -1 : bloc.length
    return function* () {
      index = direction === 1
        ? (index + direction) % bloc.length
        : index ? index + direction : bloc.length - 1
      yield bloc[index]
      // I couldn't get statements AFTER yield to execute ?????
      /// maybe because I'm not using a 'done' thing?
    }
  }

  // TODO:: encapsulate the vectors
  const getOffset = (previousOffset) => {
    let nextOffset = { x: previousOffset.x + vectorX.direction * vectorX.speed, y: previousOffset.y + vectorY.direction * vectorY.speed }
    vectorX.direction = (nextOffset.x >= img.width - config.cellSize || nextOffset.x <= 0) ? -vectorX.direction : vectorX.direction
    vectorY.direction = (nextOffset.y >= img.height - config.cellSize || nextOffset.y <= 0) ? -vectorY.direction : vectorY.direction

    return nextOffset
  }

  const buildRgbGridCells = ({ cells, cellSize, offset }) => {
    const grid = []
    for (var y = 0; y < cells.y; y++) {
      for (var x = 0; x < cells.x; x++) {
        const background = getColor(x, y, offset)
        grid.push({
          background,
          x: x * cellSize,
          y: y * cellSize,
          cellSize
        })
      }
    }
    config.dumbT = config.dumbT + config.blockModVector.value
    return grid
  }

  const buildGridCells = ({ cells, cellSize }) => {
    const bwGrid = []
    for (var y = 0; y < cells.y; y++) {
      for (var x = 0; x < cells.x; x++) {
        const triDnoise = (255 * p5Instance.noise(config.blockModVector.value * x * cells.x, config.blockModVector.value * y * cells.y, config.dumbT))
        const background = triDnoise >= config.inflectionVector.value ? 'white' : 'black'
        bwGrid.push({
          background,
          x: x * cellSize,
          y: y * cellSize,
          cellSize
        })
      }
    }
    config.dumbT = config.dumbT + config.blockModVector.value
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

  const paintGrids = ({ textCells, blockCells, colorCells }) => {
    p5Instance.textAlign(p5Instance.LEFT, p5Instance.CENTER)

    if (config.gridOutline) {
      p5Instance.stroke('black')
    } else {
      p5Instance.noStroke()
    }

    //
    // for (let i = 0; i < blockCells.length; i++) {
    //   const cell = blockCells[i]
    //   // const color = config.useColor && cell.background === 'white' ?  colorCells[i].background : cell.background
    //   const color = cell.background
    //   p5Instance.fill(color)
    //   p5Instance.rect(cell.x, cell.y, cell.cellSize, cell.cellSize)
    // }

    let i = 0
    blockCells.forEach(cell => {
      const bkgColor = config.useColor && cell.background === 'white' ? colorCells[i].background : cell.background
      p5Instance.fill(bkgColor)
      p5Instance.rect(cell.x, cell.y, cell.cellSize, cell.cellSize)
      i++
    })

    p5Instance.fill('black')
    p5Instance.noStroke()

    textCells.forEach(cell => p5Instance.text(cell.text, cell.x, cell.y))
  }

  // average code based on http://stackoverflow.com/a/12408627/41153
  // this is likely to fail if xLoc,yLoc is with pixSize of width,height
  // but works for what I'm currently doing....
  const getColor = (xLoc, yLoc, offset) => {
    var pix = img.drawingContext.getImageData(xLoc + offset.x, yLoc + offset.y, 1, 1).data
    return p5Instance.color(pix[0], pix[1], pix[2])
  }

}
