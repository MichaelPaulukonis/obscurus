// import p5Gif from 'p5.gif/dist/p5gif.min.js';
import p5Gif from 'p5.gif/dist/p5gif.js';


export default function sketch({ p5Instance, gifs }) {
  let x, y, backgroundColor;

  const width = 500;
  const height = 500;

  window.p5 = p5Instance
  var gif = new p5Gif.Gif(gifs[0].url);

  p5Instance.setup = () => {
    p5Instance.createCanvas(width, height);
    backgroundColor = p5Instance.color(p5Instance.random(255), p5Instance.random(255), p5Instance.random(255));

    x = p5Instance.random(width);
    y = height / 2;
  };

  p5Instance.draw = () => {
    p5Instance.background(backgroundColor);
    p5Instance.fill(p5Instance.color(255, 0, 0));
    p5Instance.ellipse(x, y, 100, 100);

    x = (x + 1) % width;
  };

  p5Instance.mousePressed = () => {
    backgroundColor = p5Instance.color(p5Instance.random(255), p5Instance.random(255), p5Instance.random(255));
  };
}
