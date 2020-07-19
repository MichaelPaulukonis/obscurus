import P5 from 'p5'
import sketch from './sketch'
import TextManager from './TextManager'
import corpus from './sketch/corpus.default'

const theStuff = () => {
    Promise.resolve().then(_ => new P5(builder))

    const builder = (p5Instance) => {
        const textManager = new TextManager()
        sketch({ p5Instance, textManager, corpus })
    }
}

theStuff()
