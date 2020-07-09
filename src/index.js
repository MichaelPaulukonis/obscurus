import p5 from 'p5';
import { GiphyFetch } from '@giphy/js-fetch-api'
import sketch from './sketch';

const theStuff = () => {

    const gf = new GiphyFetch(process.env.GIPHY_API_KEY)

    // fetch 10 gifs
     gf.trending({ limit: 10 })
        .then(gifs => {
            console.log(gifs)
            new p5(sketch);
        })
}

theStuff()


