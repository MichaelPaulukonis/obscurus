import p5 from 'p5';
import { GiphyFetch } from '@giphy/js-fetch-api'
import sketch from './sketch';
import TextManager from './TextManager'

const theStuff = () => {

    const gf = new GiphyFetch(process.env.GIPHY_API_KEY)
    let gifs = []

    // fetch 10 gifs
    gf.trending({ limit: 10 })
        .then(resp => {
            console.log(resp)
            gifs = resp.data
            // var gif = new p5Gif.Gif(resp.data[0].url);
            new p5(builder);
        })

    const builder = (p5Instance) => {
        const textManager = new TextManager()
        sketch({ p5Instance, gifs, textManager }) // eslint-disable-line no-new
    }
}

theStuff()
