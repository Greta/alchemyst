import React, { Component } from 'react';
const _ = require('lodash');

const grid = {
  rows: 8,
  cols: 7,
  colors: ['pink', 'blue', 'green', 'purple']
}

const recipes = {
  'Mana': {
    mats: { blue: 10 }
  },
  'Health': {
    mats: { pink: 10 }
  },
  'Mixture': {
    mats: { blue: 5, pink: 5, purple: 5 }
  },
  'Night Sight': {
    mats: { purple: 15 }
  },
  'Love': {
    mats: { pink: 100, purple: 50 }
  },
  'Growth': {
    mats: { green: 15 }
  },
  'Tincture': {
    mats: { green: 10, blue: 10 }
  },
  'Strength': {
    mats: { pink: 20, green: 25 }
  },
  'Sleep': {
    mats: { blue: 10, purple: 10, green: 10 }
  }
}

// Returns the index of a given color in App state.totals
const getColorIndex = color => {
  return grid.colors.findIndex(c => { return color === c })
}

class App extends Component {
  constructor() {
    super()
    // Start with nothing
    const totals = _.map(grid.colors, () => {
      return 0
    })
    this.state = {
      money: 0,
      potions: {},
      totals
    }

    this.updateTotals = this.updateTotals.bind(this)
  }
  updateTotals = (color, count) => {
    let totals = this.state.totals
    totals[color - 1] += count
    this.setState({ totals })
  }
  brewPotion = recipe => {
    let potions = this.state.potions,
      totals = this.state.totals

    // Update the new totals
    const mats = recipes[recipe].mats
    _.each(mats, (amt, mat) => {
      const colorIndex = getColorIndex(mat)
      totals[colorIndex] = totals[colorIndex] - amt
    })
    // Add the potion to the inventory
    if (potions[recipe]) {
      potions[recipe]++
    } else {
      potions[recipe] = 1
    }
    this.setState({ potions, totals })
  }
  previewPotion = recipe => {

  }
  render() {
    return (
      <div className="App">
        <Grid updateTotals={this.updateTotals} />
        <div className="right">
          <Inventory {...this.state} />
          <Recipes totals={this.state.totals} onClick={this.brewPotion} />
        </div>
      </div>
    );
  }
}

class Inventory extends Component {
  render() {
    const totals = _.map(grid.colors, (color, i) => {
      return (
        <li key={'total_' + color} className={color}>{this.props.totals[i]}</li>
      )
    })
    const potions = _.map(this.props.potions, (amt, name) => {
      return (
        <li key={name}>
          <div className="name">{name}</div>
          <div className="amt">{amt}</div>
        </li>
      )
    })
    return (
      <div id="inventory">
        <h3>Raw Materials</h3>
        <ul className="totals">{totals}</ul>
        <h3>Potions</h3>
        <ul className="potions">{potions}</ul>
      </div>
    )
  }
}

class Recipes extends Component {
  render() {
    const list = _.map(recipes, (recipe, name) => {
      const mats = _.map(recipe.mats, (amt, item) => {
        return (
          <span className={item} key={item}>{amt}</span>
        )
      })

      // Check to see if you have enough materials to make the recipe
      const needsMats = _.filter(recipe.mats, (amt, item) => {
        const colorIndex = getColorIndex(item)
        return amt > this.props.totals[colorIndex]
      })
      let props = {}
      if (!needsMats.length) {
        props.className = 'canMake'
        props.onClick = () => { this.props.onClick(name) }
      }
      return (
        <li key={name} {...props}>
          <div className="name">{name}</div>
          <div className="mats">{mats}</div>
        </li>
      )
    })
    return (
      <div id="recipes">
        <h3>Recipes</h3>
        <ul>{list}</ul>
      </div>
    )
  }
}

class Grid extends Component {
  constructor() {
    super()
    this.state = {
      matrix: this.buildGrid(),
      feedback: this.buildGrid(1)
    }

    this.fire = this.fire.bind(this)
    this.findGroup = this.findGroup.bind(this)
  }
  // Builds a random matrix based on the set grid options (size and colors)
  // Can return an empty matrix, used for tracking clicked groups
  buildGrid = (empty = 0) => {
    let matrix = []
    _.map([...Array(grid.rows).keys()], (row) => {
      matrix[row] = []
      _.map([...Array(grid.cols).keys()], (col) => {
        matrix[row][col] = empty ? 0 : this.buildSquare()
      })
    })
    return matrix
  }
  buildSquare = except => {
    let sq = Math.floor(Math.random() * grid.colors.length) + 1
    if (except && sq === except) {
      return this.buildSquare(except)
    }
    return sq
  }
  fire = sq => {
    const group = this.findGroup(sq),
      count = _.flatten(group).reduce((a, b) => a + b, 0)

    // Count group squares.  If 3 or greater, pop the group
    // and update the totals.  Otherwise, send feedback
    if (count >= 3) {
      this.pop(group)
      this.props.updateTotals(sq.color, count)
    } else {
      this.feedback(group)
    }
  }
  findGroup = props => {
    const x = props.x,
      y = props.y
    let group = this.buildGrid(1)

    group = this.checkSquare(group, x, y);
    while (this.hasUnchecked(group)) {
      group = this.checkGroup(group)
    }

    return group
  }
  checkGroup = group => {
    _.each(group, (row, y) => {
      _.each(row, (sq, x) => {
        if (sq === 2) {
          group = this.checkSquare(group, x, y)
        }
      })
    })
    return group
  }
  checkSquare = (group, x, y) => {
    // All checked squares are given the number 1 and adjacent matches
    // are given the number 2 so they can be checked later
    const matrix = this.state.matrix,
      color = matrix[y][x]
    // Check the square above
    if (y && matrix[y-1][x] === color  && !group[y-1][x]) {
      group[y-1][x] = 2
    }
    // Check the square below
    if (y < grid.rows - 1 && matrix[y+1][x] === color && !group[y+1][x]) {
      group[y+1][x] = 2
    }
    // Check the square to the left
    if (x && matrix[y][x-1] === color && !group[y][x-1]) {
      group[y][x-1] = 2
    }
    // Check the square to the right
    if (x < grid.cols - 1 && matrix[y][x+1] === color && !group[y][x+1]) {
      group[y][x+1] = 2
    }
    group[y][x] = 1
    return group
  }
  hasUnchecked = group => {
    return _.flatten(group).includes(2)
  }
  pop = group => {
    let matrix = this.state.matrix
    _.each(group, (row, y) => {
      _.each(row, (pop, x) => {
        if (pop) {
          matrix[y][x] = this.buildSquare(matrix[y][x])
        }
      })
    })
    // Set the new color matrix and clear feedback
    this.setState({ matrix, feedback: this.buildGrid(1) })
  }
  feedback = group => {
    this.setState({ feedback : group })
  }
  render() {
    const rows = _.map(this.state.matrix, (row, y) => {
      const cols = _.map(row, (color, x) => {
        let props = {y, x, color}
        return (
          <Square {...props}
            onClick={this.fire}
            key={'sq_' + y + '_' + x}
            feedback={this.state.feedback[y][x]}
          />
        )
      })
      return (
        <tr key={'row_' + y}>{cols}</tr>
      )
    })
    return (
      <table id='grid'><tbody>{rows}</tbody></table>
    )
  }
}

class Square extends Component {
  constructor(props) {
    super(props)
    this.state = {
      color: this.props.color,
      class: ''
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.color !== this.state.color) this.updateColor(nextProps.color)
    if (nextProps.feedback) this.sendFeedback()
  }
  updateColor = newColor => {
    this.setState({ color: newColor, class: 'pop' }, () => {
      setTimeout(() => {
        this.resetAnimationClass()
      }, 300)
    })
  }
  sendFeedback = () => {
    this.setState({ class: 'feedback' }, () => {
      setTimeout(() => {
        this.resetAnimationClass()
      }, 300)
    })
  }
  resetAnimationClass = () => {
    this.setState({ class: '' })
  }
  render() {
    const color = grid.colors[this.state.color - 1]
    let props = {
      onClick: () => {this.props.onClick(this.props)}
    }
    if (this.state.class) props.className = this.state.class
    return (
      <td {...props}>
        <div className={color}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </td>
    )
  }
}

export default App;
