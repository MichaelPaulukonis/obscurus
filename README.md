# tentatively, a thing

## what it does and why it's called OBSCURUS

- the text is both obscure and obscured
- a portion of a text cycles through the screen, pieces covered or revealed

## as seen at [AvantGarde Boot Camp](https://abc.perspektive.at/obscurator-visually-difficult/)

## keys

- Arrow-up/Arrow-down - change amount of black squares
- space - pause
- n - increment all values while paused. NOTE: values incrase, but image may not change.
- i - random image of 5 pre-loaded (or drag-n-drop your own)
- s - save 200 image frames (press again while saving to cancel)
- t - switch to another of 20 pre-loaded texts
- o - grid outline on/off
- r - randomize values
- g - randomize image position
- c - load 20 new texts
- w - fill white on/off
- e - color on/off

## Roadmap

- switch between color/black and white
- extend B&W to grayscale (rolling out from the inflection point)
- Add colors? Simple web colors - blue, yellow, black, red?
  - Is this pointless, or pointful?
- ability to select from texts
  - add text(s)
- better/different movement

## fonts and design
- http://yoworks.com/telegrama/index.html
- also some shameless copying of the lovely design at [perspektive](https://abc.perspektive.at/obscurator-visually-difficult/)

### NO PLAN SURVIVES CONTACT WITH THE ENEMY

I realized I needed neither a gif, frames, nor an image for this project
[all of which remain good ideas for something else]
Just a nice source of noise for the black-n-white obscuror

## some source references

- https://developers.giphy.com/dashboard/
- https://developers.giphy.com/docs/sdk/#content-types
- https://www.npmjs.com/package/@giphy/js-fetch-api
- https://www.npmjs.com/package/@giphy/js-util
- https://www.npmjs.com/package/p5.gif
- https://www.npmjs.com/package/gif-transparency
- RITA
- my tumblr code ???
- https://stackoverflow.com/questions/48234696/how-to-put-a-gif-with-canvas
- https://creative-coding.decontextualize.com/video/

## random images from somewhere else
 - https://www.npmjs.com/package/picsum-photos
  - Since you can selet by ID and set various parameters, there could be some programmatic variety
  - AND if the randomness is seeded by the text, .... there's a relationship (oblique tho it may be)
- https://www.npmjs.com/package/random-image-js
- https://www.npmjs.com/package/random-img
- https://github.com/dherault/aquarelle

## Saving frames and animations

- you know, one could just save the array of text and images and export those for re-generation server-side
- using CCapture which slows things WAAAAAAAAY down
- https://github.com/pbeshai/p5js-ccapture
- [CREATING VIDEOS FROM PROCESSING'S P5.JS WITH CCAPTURE.JS AND FFMPEG](https://peterbeshai.com/blog/2018-10-28-p5js-ccapture/)
  - Also contains notes on building mp4s and gifs (see below)
  - The rest of their website is worth checking out
- [recording p5 with capture.js](https://medium.com/@ffmaer/record-p5-js-with-ccapture-js-8e3ac9488ac3)

### ffmpeg on Mac

Homebrew wasn't working for me (I'm on 10.12, so not the freshest).

But I was able to install a static build folloring [these instructions](https://superuser.com/a/624562/972)

```bash
ffmpeg -r 30 -f image2 -s 500x500 -i "%07d.png" -vcodec libx264 -crf 17 -pix_fmt yuv420p output.mp4

ffmpeg -r 30 -f image2 -s 500x500 -i "20200802210728-%06d.png" -vcodec libx264 -crf 17 -pix_fmt yuv420p output.mp4

```

```bash
convert -delay 3.33 -loop 0 *.png output.gif
```

#### filtering, splitting, etc

- https://ffmpeg.org/ffmpeg-filters.html#crop
- https://stackoverflow.com/a/52597266/41153

```shell
ffmpeg -i polychrometext.20201022215400.mp4 -filter_complex "[0]crop=iw:ih/3:0:0[top];[0]crop=iw:ih/3:0:oh[middle];[0]crop=iw:ih/3:0:oh*2[bottom]" -map "[top]" top.mp4 -map "[middle]" middle.mp4 -map "[bottom]" bottom.mp4
```

#### scripting

See `tools/obstool` (which uses my local assumptions, so update for your use)
