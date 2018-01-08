import React, { Component } from 'react';
import logo from './logo.svg';
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
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">The Garden</h1>
        </header>
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
    this.resetAnimationClasses = this.resetAnimationClasses.bind(this)
  }
  // Builds a random matrix based on the set grid options (size and colors)
  // Can return an empty matrix, used for tracking clicked groups
  buildGrid = (empty = 0) => {
    let matrix = []
    _.map([...Array(grid.rows).keys()], (row) => {
      matrix[row] = []
      _.map([...Array(grid.cols).keys()], (col) => {
        matrix[row][col] = empty ? 0 : Math.floor(Math.random() * grid.colors.length) + 1
      })
    })
    return matrix
  }
  fire = props => {
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
  pop = () => {
    console.log('start popping squares')
  }
  feedback = group => {
    this.setState({ feedback : group })
  }
  resetAnimationClasses = (x, y) => {
    let feedback = this.state.feedback
    feedback[y][x] = 0
    this.setState({ feedback })
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
            resetAnimationClasses={this.resetAnimationClasses}
          />
        )
      })
      return (
        <tr key={'row_' + y}>{cols}</tr>
      )
    })
    return (
      <table id='garden'><tbody>{rows}</tbody></table>
    )
  }
}

class Square extends Component {
  componentDidUpdate() {
    // Since we're using css animations set via classes,
    // we need to remove the classes after any animation has finished
    if (this.props.feedback) {
      setTimeout(() => {
        this.props.resetAnimationClasses(this.props.x, this.props.y)
      }, 500)
    }
  }
  render() {
    const color = grid.colors[this.props.color - 1]
    let props = {
        onClick: () => {this.props.onClick(this.props)}
      }
    if (this.props.feedback) {
      props.className = 'feedback'
    }
    return (
      <td {...props}>
        <span className={color}></span>
      </td>
    )
  }
}

export default App;
