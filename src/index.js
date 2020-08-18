import P5 from 'p5/lib/p5.min.js'
import sketch from './sketch'
import TextManager from './sketch/TextManager'
import GuiControl from './sketch/gui'

const textManager = new TextManager()
const gc = new GuiControl()

const seed = Math.random()
gc.params.noiseSeed = seed
console.log(`seed: ${seed}`)
gc.params.redefineCorpus = textManager.redefineCorpus

const theStuff = () => {
  const builder = (p5Instance) => {
    sketch({ p5Instance, textManager, config: gc.params, gui: gc })
  }

  const launch = () => textManager.redefineCorpus()
    .then((_) => {
      new P5(builder) // eslint-disable-line no-new
    })

  launch()
}

theStuff()
