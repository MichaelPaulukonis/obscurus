const fs = require('fs')

const loader = (dir = './assets/fonts/') => {
  var files = fs.readdirSync(dir)
  console.log(JSON.stringify(files))
  return files
}

module.exports = loader
