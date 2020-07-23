const config = {
  cellSize: 30,
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  frameRate: 2,
  textSize: 16,
  inflection: 128,
  paused: false,
  textProvider: null,
  corpus: []
}

const img = null

const rgbs = {
  black: { red: 0, green: 0, blue: 0 },
  white: { red: 255, green: 255, blue: 255 }
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

  config.gridSize = {
    x: Math.floor(config.width / config.cellSize),
    y: Math.floor(config.height / config.cellSize)
  }

  const increment = xyIncrementor(xyVectors)

  p5Instance.setup = () => {
    p5Instance.frameRate(config.frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    newText({ config, textManager })
    p5Instance.createCanvas(config.width, config.height)

    draw()
  }

  p5Instance.mouseClicked = () => {
    draw()
  }

  p5Instance.keyPressed = () => {
    const keyCode = p5Instance.keyCode
    let handled = false

    if (keyCode === p5Instance.UP_ARROW || keyCode === p5Instance.DOWN_ARROW) {
      handled = true
      config.inflection += 5 * (keyCode === p5Instance.UP_ARROW ? -1 : 1)
    }

    return handled
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
    }
  }

  const newText = ({ config, textManager }) => {
    textManager.setText(p5Instance.random(config.corpus))
    config.textProvider = textGetter(config.gridSize)
  }

  const draw = () => {
    if (!config.paused) {
      coreDraw()
    }
  }

  const coreDraw = () => {
    const vec = increment()
    drawPix(config.textProvider, vec)
    if (p5Instance.frameCount % 10 === 0) {
      config.textProvider = textGetter(config.gridSize)
    }
  }

  p5Instance.draw = draw

  const drawPix = (text, vec) => {
    pixelateImage({ gridSize: config.gridSize, cellSize: config.cellSize, getchar: text, vec })
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

  const pixelateImage = ({ gridSize, cellSize, getchar, vec }) => {
    const yMod = (p5Instance.textAscent() * 1.4)

    for (var y = 0; y < gridSize.y; y++) {
      for (var x = 0; x < gridSize.x; x++) {
        const background = (255 * p5Instance.noise(vec.x * x, vec.y * y)) >= config.inflection ? 'white' : 'black'
        p5Instance.fill(background)
        p5Instance.rect(x * cellSize, y * cellSize, cellSize, cellSize)

        p5Instance.fill('black')
        const t = getchar().next().value
        const w = p5Instance.textWidth(t)
        const xMod = (cellSize - w) / 2
        p5Instance.text(getchar().next().value, (x * cellSize) + xMod, (y * cellSize) + yMod)
      }
    }
  }
}
