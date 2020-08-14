const fs = require('fs')

const loader = dir => fs.readdirSync(dir)

module.exports = {
  images: loader('./assets/images/'),
  fonts: loader('./assets/fonts/')
}
