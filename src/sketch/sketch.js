const config = {
  cellSize: 40,
  cells: { x: 15, y: 15 },
  width: 500, // rather these were a functions of the cellsize, so everything fits smoothly
  height: 500,
  frameRate: 2,
  textSize: 24,
  inflection: 128,
  paused: false,
  textProvider: null,
  corpus: []
}

const xyVectors = {
  x: 0,
  xVec: 0.01,
  y: 0,
  yVec: 0.01
}

const xyIncrementor = (i) => () => {
  i.x += i.xVec
  i.y += i.yVec
  return { x: i.x, y: i.y }
}

export default function sketch ({ p5Instance, textManager, corpus }) {
  config.corpus = corpus

  const increment = xyIncrementor(xyVectors)
  const fonts = {}

  p5Instance.preload = () => {
    ['GothamBold', 'Helvetica-Bold-Font', 'Interstate-Regular-Font'].forEach((font) => {
      fonts[font] = p5Instance.loadFont(`./assets/fonts/${font}.ttf`)
    })
  }

  p5Instance.setup = () => {
    console.log('starting!')
    newText({ config, textManager })
    p5Instance.createCanvas(config.cellSize * config.cells.x, config.cellSize * config.cells.y)
    p5Instance.frameRate(config.frameRate)
    p5Instance.noStroke()
    p5Instance.textSize(config.textSize)
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    p5Instance.textFont(fonts['Interstate-Regular-Font'])

    draw()
  }

  p5Instance.mouseClicked = () => {
    draw()
  }

  p5Instance.keyPressed = () => {
    const keyCode = p5Instance.keyCode
    if (keyCode === p5Instance.UP_ARROW || keyCode === p5Instance.DOWN_ARROW) {
      config.inflection += 5 * (keyCode === p5Instance.UP_ARROW ? -1 : 1)
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
    }
  }

  const newText = ({ config, textManager }) => {
    textManager.setText(p5Instance.random(config.corpus))
    config.textProvider = textGetter(config.cells)
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
      config.textProvider = textGetter(config.cells)
    }
  }

  p5Instance.draw = draw

  const drawPix = (text, vec) => {
    pixelateImage({ cells: config.cells, cellSize: config.cellSize, getchar: text, vec })
  }

  const textGetter = (cells) => {
    const bloc = new Array(cells.x * cells.y).fill('').map(textManager.getchar)
    let index = -1
    return function * () {
      index = (index + 1) % bloc.length
      yield bloc[index]
      // I couldn't get statements AFTER yield to execute ?????
      /// maybe because I'm not using a 'done' thing?
    }
  }

  const pixelateImage = ({ cells, cellSize, getchar, vec }) => {
    const yMod = (p5Instance.textAscent() * 1.4)

    for (var y = 0; y < cells.y; y++) {
      for (var x = 0; x < cells.x; x++) {
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
