import React, { Component } from 'react';
import logo from './logo.svg';
const _ = require('lodash');

const grid = {
  rows: 8,
  cols: 7,
  squares: ['pink', 'blue', 'green', 'purple']
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
      matrix: this.buildGrid()
    }
  }
  buildGrid = (matrix = []) => {
    if (!matrix.length) {
      _.map([...Array(grid.cols).keys()], (row) => {
        matrix[row] = []
        _.map([...Array(grid.cols).keys()], (col) => {
          matrix[row][col] = Math.floor(Math.random() * grid.squares.length) + 1
        })
      })
    }
    return matrix
  }
  pop = square => {
    console.log(square)
  }
  render() {
    const rows = _.map(this.state.matrix, (row, rowIndex) => {
      const cols = _.map(row, (sq, sqIndex) => {
        let props = { rowIndex, sqIndex, sq }
        return (
          <Square {...props} onClick={this.pop} key={'sq_' + rowIndex + '_' + sqIndex} />
        )
      })
      return (
        <tr key={'row_' + rowIndex}>{cols}</tr>
      )
    })
    return (
      <table id='garden'><tbody>{rows}</tbody></table>
    )
  }
}

class Square extends Component {
  render() {
    const color = grid.squares[this.props.sq - 1]
    return (
      <td onClick={() => {this.props.onClick(this)}}>
        <span className={color}></span>
      </td>
    )
  }
}

export default App;
