// import p5Gif from 'p5.gif/dist/p5gif.min.js';
import p5Gif from 'p5.gif/dist/p5gif.js';

let config = {
  paused: false,
  delay: 100,
  initialSize: 5,
  stepSize: 5,
  maxSteps: 20,
  step: function () { logger('step'); singlestep = true; },
  type: 2,
  dMin: 5,
  dMax: 20
};
let m = 0;

export default function sketch ({ p5Instance, gifs, textManager }) {

  const width = 500;
  const height = 500;

  p5Instance.setup = () => {
    p5Instance.frameRate(0.5)
    p5Instance.noStroke();
    // p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER)
    p5Instance.textSize(16)
    p5Instance.createCanvas(width, height);
    p5Instance.noLoop()
    draw()
  };

  p5Instance.mouseClicked = () => {
    draw()
  }

  const draw = () => {
    // if (!config.paused && (p5Instance.millis() - m > config.delay)) {
      drawPix();
    //   m = p5Instance.millis();
    // }
  };

  const setPixSize = (direction, pixSize, stepSize) => {
    pixSize = (pixSize + (direction * stepSize));
    if (pixSize < stepSize) pixSize = stepSize;
    return pixSize;
  }

  // loop purely for manual monitoring
  // for export [for, say, a gif], do it faster
  const drawPix = () => {
    const pixSize = 30;
    pixelateImageUpperLeft(pixSize);
    // TODO: and draw a letter in it
  }

  // there's an issue where the right-hand strip comes and goes
  // it's an average problem. probably "correct"
  // but I don't like how it looks in a sequence
  const pixelateImageUpperLeft = (pxSize) => {
    p5Instance.textAlign(p5Instance.CENTER, p5Instance.CENTER) 

    for (var y = 0; y < height; y += pxSize) {
      for (var x = 0; x < width; x += pxSize) {
        p5Instance.fill(getColor(x, y, pxSize));
        p5Instance.rect(x, y, pxSize, pxSize);
        p5Instance.fill(getColor(x, y, pxSize));
        const nextChar = textManager.getchar()
        p5Instance.text(nextChar, x + pxSize / 2, y + pxSize / 2)
      }
    }
  }

  // average code based on http://stackoverflow.com/a/12408627/41153
  // this is likely to fail if xLoc,yLoc is with pixSize of width,height
  // but works for what I'm currently doing....
  const getColor = (xLoc, yLoc, cellSize) => {
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

    // temp random
    return p5Instance.color(p5Instance.random(255), p5Instance.random(255), p5Instance.random(255));
  }


}
