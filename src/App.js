import React, { Component } from 'react';
const _ = require('lodash');

const grid = {
  rows: 8,
  cols: 7,
  colors: ['pink', 'blue', 'green', 'purple']
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Grid />
      </div>
    );
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
  fire = props => {
    // If currently animating, fizzle out
    if (props.feedback || props.group) return

    const group = this.findGroup(props),
      count = _.flatten(group).reduce((a, b) => a + b, 0)

    // Count group squares.  If 3 or greater, pop the group
    // Otherwise, send feedback
    if (count >= 3) {
      this.pop(group)
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
    this.setState({ matrix })
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
