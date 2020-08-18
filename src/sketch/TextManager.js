import randomPost from './tumblr-random.js'
import defaultCorpus from './corpus.default'

export default class TextManager {
  constructor (text) {
    const defaultText = 'These are the pearls that were his eyes'
    let words = []
    let charIndex = 0
    let wordIndex = 0
    const self = this
    self.randomPost = randomPost
    self.corpus = [...defaultCorpus]
    self.redefineCorpus = () =>
      randomPost()
        .then((texts) => {
          self.corpus = [...defaultCorpus, ...texts]
        })
    self.getchar = function () {
      const c = self.w.charAt(charIndex)
      charIndex = (charIndex + 1) % self.w.length
      return c
    }
    self.getcharRandom = function () {
      return self.w.charAt(Math.floor(Math.random() * self.w.length))
    }
    self.getWord = function () {
      const word = words[wordIndex]
      wordIndex = (wordIndex + 1) % words.length
      return word
    }
    self.getText = function () {
      return self.w
    }
    self.setText = function (text) {
      self.w = text
      // words loses the split chars
      // thus, word mode (with same-color for whole word) has no spaces
      // uh..... neat, but would prefer that as an option?
      // words = self.w.replace(/\n/g, '').split(new RegExp(SPLIT_TOKENS, 'g'))
      words = self.w.replace(/\n|\s+/g, ' ').match(/\w+|\s+|[^\s\w]+/g)
      wordIndex = 0
      charIndex = 0
    }

    // since startIndex comes from the unbounded (increasing) textFrame
    // we use module to loop the index back to the beginning
    // if HOWEVER we got an actual index pegged to the length
    // except the sketch doesn't need to know the length
    // if it instead provided a DIRECTION
    // we could close over it and use and loop here
    // and never need a new index, because every iteration is going to be +1 or -1
    self.windowMaker = (width) => (startIndex) => {
      const bloc = []
      for (let i = 0; i < width; i++) {
        const index = (startIndex + i) % self.w.length
        bloc[i] = self.w[index]
      }
      return bloc.join('')
    }

    self.setText(text || defaultText)
  }
}
