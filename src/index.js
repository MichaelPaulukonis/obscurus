import P5 from 'p5'
import sketch from './sketch'
import randomPost from './sketch/tumblr-random.js'
import TextManager from './sketch/TextManager'
import corpus from './sketch/corpus.default'

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]
const textManager = new TextManager()
let newCorpus = []

const theStuff = () => {
    const builder = (p5Instance) => {
        textManager.randomPost = randomPost
        sketch({ p5Instance, textManager, corpus: newCorpus })
    }

    randomPost()
      .then((texts) => {
        newCorpus = corpus.concat(texts)
      })
      .finally((_) => {
        new P5(builder) // eslint-disable-line no-new
      })

}

theStuff()
