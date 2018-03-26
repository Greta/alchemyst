import React, { Component } from 'react'
import { _colors } from '../data/colors'
const _ = require('lodash')

const grid = {
  rows: 8,
  cols: 7
}

class Grid extends Component {
  constructor() {
    super()
    this.state = {
      matrix: this.buildGrid(),
      feedback: this.buildGrid(1),
      specials: this.buildGrid(1),
      multiplyer: 5,
      maxMultiplyer: 10
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
    let sq = Math.floor(Math.random() * _colors.length) + 1
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

      // Multiplier truly multiplies harvest every 5 steps
      const m = Math.floor(this.state.multiplyer / 5)
      this.props.updateTotals(sq.color, (count * m))

      // If 5 or more add to multiplyer, otherwise reset it
      let multiplyer = count >= 5 ? this.state.multiplyer + 1 : 5
      multiplyer = _.min([multiplyer, this.state.maxMultiplyer])
      this.setState({ multiplyer })

      // If 10 or more create a golden flower
      if (count >= 10) {
        let specials = this.state.specials
        specials[sq.y][sq.x] = 'golden'
        this.setState({ specials })
      }

      // Increment time
      const newDay = this.props.incrementTime()
      if (newDay) {
        // At the end of the day, we harvest the golden flowers, too
        const count = _.remove(_.flatten(this.state.specials), 0).length
        this.props.updateTotals('golden', count)

        // and build a new garden
        this.setState({
          matrix: this.buildGrid(),
          specials: this.buildGrid(1)
        })
      }
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
  hasUnchecked = group => (
    _.flatten(group).includes(2)
  )
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
    const specials = this.state.specials
    const rows = _.map(this.state.matrix, (row, y) => {
      const cols = _.map(row, (color, x) => {
        let props = {y, x, color}

        // Does the square have special properties?
        if (specials[y] && specials[y][x]) {
          props.special = specials[y][x]
        }

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
      <div id='grid'>
        <table><tbody>{rows}</tbody></table>
        <div className='multiplyer'>{this.state.multiplyer % 5} - {Math.floor(this.state.multiplyer/5)}x</div>
      </div>
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
    let className = _colors[this.state.color - 1]
    let tdProps = {
      onClick: () => {this.props.onClick(this.props)}
    }
    if (this.state.class) tdProps.className = this.state.class
    if (this.props.special) className += ' ' + this.props.special
    return (
      <td {...tdProps}>
        <div className={className}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </td>
    )
  }
}

export default Grid
