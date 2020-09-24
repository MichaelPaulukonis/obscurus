// import P5 from 'p5/lib/p5.min.js'
// import Q5 from 'q5xjs/q5.js'
import sketch from './sketch'
import TextManager from './sketch/TextManager'
import GuiControl from './sketch/gui'
import seedrandom from 'seedrandom'

console.log(`Version: ${VERSION}`)

const parseParams = () => {
  const params = (new URL(document.location)).searchParams
  const seedString = params.get('seed') // is the string "Jonathan Smith".
  const seed = parseFloat(seedString) || null
  return {
    seed
  }
}

const seeder = () => parseInt([...Array(10)].map(_ => (~~(Math.random() * 36)).toString(10)).join(''), 10)
const queryParams = parseParams()

const seed = queryParams.seed ? queryParams.seed : seeder()
seedrandom(seed, { global: true })
console.log(`seed: ${seed} => ${Math.random()}`)

const textManager = new TextManager()
const gc = new GuiControl()
gc.params.noiseSeed = seed
gc.params.redefineCorpus = textManager.redefineCorpus

const theStuff = () => {
  const builder = (p5Instance) => {
    sketch({ p5Instance, textManager, config: gc.params, gui: gc })
  }

  const launch = () => textManager.redefineCorpus()
    .finally((_) => {
      // new P5(builder) // eslint-disable-line no-new
      builder(new Q5())
    })

  launch()
}

theStuff()
