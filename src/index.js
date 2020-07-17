import P5 from 'p5'
import { GiphyFetch } from '@giphy/js-fetch-api'
import sketch from './sketch'
import TextManager from './TextManager'

const theStuff = () => {
  const gf = new GiphyFetch(process.env.GIPHY_API_KEY)

  gf.trending({ limit: 10 })
    .then(_ => {
      new P5(builder) // eslint-disable-line no-new
    })

  const builder = (p5Instance) => {
    const textManager = new TextManager()
    sketch({ p5Instance, textManager })
  }
}

theStuff()
