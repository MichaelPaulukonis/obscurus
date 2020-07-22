// import { NoEmitOnErrorsPlugin } from "webpack"

const config = {
  cellSize: 30,
  width: 500,
  height: 500,
  frameRate: 2,
  textSize: 16,
  paused: false,
  imageLoaded: false,
  textProvider: null,
  corpus: []
}

let img = null

const rgbs = {
  black: { red: 0, green: 0, blue: 0 },
  white: { red: 255, green: 255, blue: 255 }
}

const noise = {
  red: 10000,
  blue: 20000,
  green: 30000
}

const noiseIncrementer = (i) => (n) => () => {
  n = { red: n.red + i.red, blue: n.blue + i.blue, green: n.green + i.green }
  return n
}

const startInc = {
  red: 0.1,
  blue: 0.1,
  green: 0.1
}

const xyVectors = {
  x: 0,
  xVec: 0.1,
  y: 0,
  yVec: 0.1
}

const xyIncrementor = (i) => () => {
  i.x += i.xVec
  i.y += i.yVec
  return { x: i.x, y: i.y }
}

export default function sketch ({ p5Instance, textManager, corpus }) {
  config.corpus = corpus

  const gridSize = {
    x: Math.floor(config.width / config.cellSize),
    y: Math.floor(config.height / config.cellSize)
  }

  const initialOffset = () => ({
    x: Math.floor(p5Instance.random(img.width - gridSize.x)),
    y: Math.floor(p5Instance.random(img.height - gridSize.y))
  })

  let currentOffset = {}
  let vectorX = { direction: 1, speed: 2 }
  let vectorY = { direction: 1, speed: 1 }

  let incrementNoise = noiseIncrementer(startInc)(noise)
  let increment = xyIncrementor(xyVectors)

  p5Instance.setup = () => {
    p5Instance.frameRate(config.frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    textManager.setText(p5Instance.random(corpus))
    config.textProvider = textGetter(gridSize)
    p5Instance.createCanvas(config.width, config.height)
    // setImage('./assets/images/fire.01.jpeg')
    setImage('./assets/images/stock.stripes.jpeg')

    draw()
  }

  p5Instance.mouseClicked = () => {
    draw()
  }

  p5Instance.keyTyped = () => {
    const key = p5Instance.key

    switch (key) {
      case ' ':
        config.paused = !config.paused
        break;

      case 'n':
        coreDraw()
        break
    }
  }

  const draw = () => {
    if (!config.paused && config.imageLoaded) {
      coreDraw()
    }
  }

  const coreDraw = () => {
    const vec = increment()
    drawPix(config.textProvider, vec)
    if (p5Instance.frameCount % 10 === 0) {
      config.textProvider = textGetter(gridSize)
    }
  }

  p5Instance.draw = draw

  const imageReady = () => {
    img.loadPixels()
    currentOffset = initialOffset()
    config.imageLoaded = true
  }

  const setImage = (filename) => {
    config.imageLoaded = false
    img = p5Instance.loadImage(filename, imageReady)
  }

  // TODO:: encapsulate the vectors
  const getOffset = (previousOffset) => {
    let nextOffset = { x: previousOffset.x + vectorX.direction * vectorX.speed, y: previousOffset.y + vectorY.direction * vectorY.speed }
    vectorX.direction = (nextOffset.x >= img.width - gridSize.x || nextOffset.x <= 0) ? -vectorX.direction : vectorX.direction
    vectorY.direction = (nextOffset.y >= img.height - gridSize.y || nextOffset.y <= 0) ? -vectorY.direction : vectorY.direction

    return nextOffset
  }

  const drawPix = (text, vec) => {
    const newOffset = getOffset(currentOffset)
    pixelateImage({ gridSize, cellSize: config.cellSize, offset: newOffset, getchar: text, vec })
    currentOffset = newOffset
  }

  const textGetter = (gridSize) => {
    const bloc = new Array(gridSize.x * gridSize.y).fill('').map(textManager.getchar)
    let index = -1
    return function* () {
      index = (index + 1) % bloc.length
      yield bloc[index]
      // I couldn't get statements AFTER yield to execute ?????
      /// maybe because I'm not using a 'done' thing?
    }
  }

  const pixelateImage = ({ gridSize, cellSize, offset, getchar, vec }) => {
    for (var y = 0; y < gridSize.y; y++) {
      for (var x = 0; x < gridSize.x; x++) {
        // const n = incrementNoise()
        // const cellColor = {
        //   red: p5Instance.noise(n.red) * 255,
        //   blue: p5Instance.noise(n.blue) * 255,
        //   green: p5Instance.noise(n.green) * 255
        // }
        // const stark = worb(cellColor)
        // p5Instance.fill(p5Instance.color(stark.red, stark.blue, stark.green))

        const background = (255 * p5Instance.noise(vec.x * x, vec.y * y)) >= 128  ? 'white' : 'black'
        p5Instance.fill(background)

        p5Instance.rect(x * cellSize, y * cellSize, cellSize, cellSize)
        p5Instance.fill('black')
        p5Instance.text(getchar().next().value, (x * cellSize) + cellSize / 2, (y * cellSize) + cellSize / 2)
      }
    }
  }

  // based on https://gomakethings.com/dynamically-changing-the-text-color-based-on-background-color-contrast-with-vanilla-js/
  const getYIQ = ({ red, green, blue }) => {
    var yiq = ((red * 299) + (green * 587) + (blue * 114)) / 1000;
    return yiq
  }

  const yiqBool = yiq => yiq >= 128

  const worb = (rgb) => yiqBool(getYIQ(rgb)) ? rgbs.white : rgbs.black

  const invertColor = ({ red, green, blue }) => {
    return { red: 255 - red, green: 255 - green, blue: 255 - blue }
  }



  // average code based on http://stackoverflow.com/a/12408627/41153
  // this is likely to fail if xLoc,yLoc is with pixSize of width,height
  // but works for what I'm currently doing....
  const getImageRGB = (xLoc, yLoc, offset) => {
    // if (yLoc < 0) { yLoc = 0 }
    // if (xLoc < 0) { xLoc = 0 }
    // let r = 0, b = 0, g = 0;
    // const pixelCount = cellSize * cellSize

    // // could be faster if we grab this all first and calculate?
    // const allPixels = img.drawingContext.getImageData(xLoc, yLoc, cellSize, cellSize).data
    // for (let i = 0; i < allPixels.length; i += 4) {
    //   r += allPixels[i]
    //   g += allPixels[i + 1]
    //   b += allPixels[i + 2]
    //   // skip alpha
    // }

    // const averageColor = color(r / pixelCount, g / pixelCount, b / pixelCount);
    // return averageColor;

    var pix = img.drawingContext.getImageData(xLoc + offset.x, yLoc + offset.y, 1, 1).data
    return { red: pix[0], green: pix[1], blue: pix[2] }
  }
}
