const config = {
  cellSize: 30,
  width: 500,
  height: 500,
  frameRate: 10,
  textSize: 16,
  paused: false,
  imageLoaded: false,
  textProvider: null,
  corpus: []
}
let img = null

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

  p5Instance.setup = () => {
    p5Instance.frameRate(config.frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    textManager.setText(p5Instance.random(corpus))
    config.textProvider = textGetter(gridSize)
    p5Instance.createCanvas(config.width, config.height)
    setImage('./assets/images/fire.01.jpeg')
    draw()
  }

  p5Instance.mouseClicked = () => {
    draw()
  }

  p5Instance.keyTyped = () => {
    const key = p5Instance.key

    if (key === ' ') {
      config.paused = !config.paused
    }
  }

  const draw = () => {
    if (!config.paused) {
      if (config.imageLoaded) drawPix(config.textProvider)
      if (p5Instance.frameCount % 10 === 0) {
        config.textProvider = textGetter(gridSize)
      }
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

  const drawPix = (text) => {
    const newOffset = getOffset(currentOffset)
    pixelateImage({ gridSize, cellSize: config.cellSize, offset: newOffset, getchar: text })
    currentOffset = newOffset
  }

  const textGetter = (gridSize) => {
    const bloc = new Array(gridSize.x * gridSize.y).fill('').map(textManager.getchar)
    let index = -1
    return function * () {
      index = (index + 1) % bloc.length
      yield bloc[index]
      // I couldn't get statements AFTER yield to execute ?????
      /// maybe because I'm not using a 'done' thing?
    }
  }

  const pixelateImage = ({ gridSize, cellSize, offset, getchar }) => {
    for (var y = 0; y < gridSize.y; y++) {
      for (var x = 0; x < gridSize.x; x++) {
        p5Instance.fill(getColor(x, y, offset))
        p5Instance.rect(x * cellSize, y * cellSize, cellSize, cellSize)
        p5Instance.fill('#000000') // temp color
        p5Instance.text(getchar().next().value, (x * cellSize) + cellSize / 2, (y * cellSize) + cellSize / 2)
      }
    }
  }

  // average code based on http://stackoverflow.com/a/12408627/41153
  // this is likely to fail if xLoc,yLoc is with pixSize of width,height
  // but works for what I'm currently doing....
  const getColor = (xLoc, yLoc, offset) => {
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
    return p5Instance.color(pix[0], pix[1], pix[2])
  }
}
