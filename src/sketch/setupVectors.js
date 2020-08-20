import { vector } from './vectorMod'

const randomizeVectors = () => {
  const randomHeading = () => Math.random() < 0.5 ? 1 : -1
  const randomArb = (min, max) => Math.random() * (max - min) + min

  const newVector = (fn = (x) => x) => ({ frameRate, min, max, direction = randomHeading(), speed }) => {
    console.log('calling random)')
    const newFrameRate = fn(randomArb(frameRate.min, frameRate.max))
    return vector({
      value: newFrameRate,
      min,
      max,
      direction,
      speed
    })
  }

  const newFrameVector = newVector(Math.round)
  const newModVector = newVector()

  const getBlockModVector = () => newModVector({
    frameRate: { min: 0.001, max: 0.02 },
    direction: randomHeading(),
    speed: 0.0001,
    min: 0.001,
    max: 0.06
  })

  const getInflectionVector = () => newFrameVector({
    frameRate: { min: 100, max: 130 },
    direction: randomHeading(),
    speed: 0.3,
    min: 80,
    max: 170
  })

  const getTextFrameMod = () => newFrameVector({
    frameRate: { min: 1, max: 60 },
    min: 1,
    max: 200,
    speed: 0.2
  })

  const getColorFrameMod = () => newFrameVector({
    frameRate: { min: 1, max: 30 },
    min: 1,
    max: 200,
    speed: 0.2
  })

  const getBlockFrameMod = () => newFrameVector({
    frameRate: { min: 1, max: 50 },
    min: 1,
    max: 60,
    speed: 0.3
  })

  return {
    blockFrameMod: getBlockFrameMod(),
    blockModVector: getBlockModVector(),
    colorFrameMod: getColorFrameMod(),
    inflectionVector: getInflectionVector(),
    textFrameMod: getTextFrameMod()
  }
}

const outs = () => ({
  ...{ ...randomizeVectors() },
  randomizeVectors
})

export default outs
