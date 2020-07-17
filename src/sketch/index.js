const config = {
  cellSize: 30,
  width: 500,
  height: 500,
  frameRate: 10,
  textSize: 16,
  paused: false,
  imageLoaded: false
}
let img = null

export default function sketch ({ p5Instance, textManager }) {
  // const config.width = 500
  // const config.height = 500
  // const config.cellSize = 30
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

    p5Instance.createCanvas(config.width, config.height)
    // p5Instance.noLoop()
    setImage('./assets/images/fire.01.jpeg')
    draw()
  }

  p5Instance.mouseClicked = () => {
    draw()
  }

  const draw = () => {
    if (!config.paused) {
      if (config.imageLoaded) drawPix()
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


  const drawPix = () => {
    const newOffset = getOffset(currentOffset)
    pixelateImage({ gridSize, cellSize: config.cellSize, offset: newOffset })
    currentOffset = newOffset
  }

  // there's an issue where the right-hand strip comes and goes
  // it's an average problem. probably "correct"
  // but I don't like how it looks in a sequence
  const pixelateImage = ({ gridSize, cellSize, offset }) => {
    for (var y = 0; y <= gridSize.y; y++) {
      for (var x = 0; x <= gridSize.x; x++) {
        p5Instance.fill(getColor(x, y, offset))
        p5Instance.rect(x * cellSize, y * cellSize, cellSize, cellSize)
        const nextChar = textManager.getchar()
        p5Instance.fill('#000000') // temp color
        p5Instance.text(nextChar, (x * cellSize) + cellSize / 2, (y * cellSize) + cellSize / 2)
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
