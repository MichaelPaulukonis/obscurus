const vectorMod = ({
  value,
  min = 2,
  max = 20,
  direction = 1,
  mod = 0.5
}) => {
  let val = value
  return () => {
    val = (val + (mod * Math.random() * direction))
    direction = (val <= min || val >= max) ? -direction : direction
    val = Math.max(Math.min(val, max), min)
    return val
  }
}

module.exports = vectorMod
