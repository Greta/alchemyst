const _colors = ['pink', 'blue', 'green', 'purple']

// Returns the index of a given color in App state.totals
const getColorIndex = color => {
  return _colors.findIndex(c => { return color === c })
}

export { _colors, getColorIndex }
