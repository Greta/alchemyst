import React, { Component } from 'react'
import { potions, getPotionById, getPotionsByLevel } from './data/potions'
const _ = require('lodash')

const grid = {
  rows: 8,
  cols: 7,
  colors: ['pink', 'blue', 'green', 'purple']
}

// Returns the index of a given color in App state.totals
const getColorIndex = color => {
  return grid.colors.findIndex(c => { return color === c })
}

const randomNumUpTo = max => {
  return Math.floor(Math.random() * max) + 1
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
      inventory: {
        potions: {},
        items: {}
      },
      orders: [],
      totals
    }
    this.updateTotals = this.updateTotals.bind(this)
  }
  updateTotals = (color, count) => {
    let totals = this.state.totals
    totals[color - 1] += count
    this.setState({ totals })
  }
  brewPotion = potion => {
    let inventory = this.state.inventory,
      totals = this.state.totals

    // Update the new totals
    _.each(potion.mats, (amt, mat) => {
      const colorIndex = getColorIndex(mat)
      totals[colorIndex] = totals[colorIndex] - amt
    })
    // Add the potion to the inventory
    if (inventory.potions[potion.name]) {
      inventory.potions[potion.name]++
    } else {
      inventory.potions[potion.name] = 1
    }
    this.setState({ inventory, totals })
  }
  previewPotion = recipe => {
    // TODO: Visualize post-brew mat values
  }
  createOrder = () => {
    // Roll for rarity!
    const roll = randomNumUpTo(20)
    let level, maxAmt, maxTypeAmt, request = []

    // Set up the basics for each level of order: rare, uncommon, and common
    if (roll === 20) {
      level = 3
      maxAmt = 1
      maxTypeAmt = 1
    } else if (roll > 15) {
      level = 2
      maxAmt = 3
      maxTypeAmt = 2
    } else {
      level = 1
      maxAmt = 5
      maxTypeAmt = 3
    }

    const potionPool = getPotionsByLevel(level)
    let fillOrder = randomNumUpTo(maxAmt)

    while (fillOrder) {
      const qty = randomNumUpTo(fillOrder)
      if (request.length === maxTypeAmt) {
        // If the maximum # of potion types has been reached, add this quantity
        // to a random potion type already in the order
        const i = randomNumUpTo(request.length) - 1
        request[i].qty = request[i].qty + qty
      } else {
        // Else, add a new potion type to the order and
        // remove that type from the potion pool
        const i = _.random(1, potionPool.length) - 1,
          potion = _.slice(potionPool, i, (i + 1))
        request.push({ id : potion[0].id, qty })
      }
      fillOrder = fillOrder - qty
    }

    // Now calculate a price
    const totalMaterials = _.reduce(request, (a, b) => {
        return a + getPotionById(b.id).totalMats * b.qty
      }, 0),
      coefficient = 1 + ((roll - 10)/10),
      reward = Math.ceil((totalMaterials * coefficient)/5) * 5

    const order = { request, level, reward }
    console.log(order)
  }
  render() {
    return (
      <div className="App">
        <div className="left">
          <Inventory {...this.state} />
        </div>
        <div className="right">
          <Recipes totals={this.state.totals} onClick={this.brewPotion} />
          <br /><button onClick={this.createOrder}>createOrder</button>
        </div>
        <Grid updateTotals={this.updateTotals} />
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
    const potions = _.map(this.props.inventory.potions, (amt, name) => {
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
    const list = _.map(potions, potion => {
      const mats = _.map(potion.mats, (amt, mat) => {
        return (
          <span className={mat} key={mat}>{amt}</span>
        )
      })

      // Check to see if you have enough materials to make the recipe
      const needsMats = _.filter(potion.mats, (amt, mat) => {
        const colorIndex = getColorIndex(mat)
        return amt > this.props.totals[colorIndex]
      })
      let props = {}
      if (!needsMats.length) {
        props.className = 'canMake'
        props.onClick = () => { this.props.onClick(potion) }
      }
      return (
        <li key={potion.id} {...props}>
          <div className="name">{potion.name}</div>
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
