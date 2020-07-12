import p5 from 'p5';
import { GiphyFetch } from '@giphy/js-fetch-api'
import sketch from './sketch';

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
        sketch({ p5Instance, gifs }) // eslint-disable-line no-new
    }

    // randomPost()
    //     .then((texts) => {
    //         this.corpus = this.corpus.concat(texts)
    //     })
    //     .catch()
    //     .finally((_) => {
    //         this.currentText = randElem(this.corpus)
    //         this.resetTextPosition()
    //         new P5(builder, 'sketch-holder') // eslint-disable-line no-new
    //     })


}

theStuff()


