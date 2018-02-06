import React, { Component } from 'react'

class Menu extends Component {
  saveGame = () => {
    console.log('saving the game...')
  }
  loadGame = () => {
    console.log('loading game...')
  }
  render() {
    if (this.props.panel !== 'closed') {
      return (
        <div id='menu'>
          <div>
            <h2>Menu</h2>
            <ul>
              <li><button onClick={this.saveGame}>Save</button></li>
              <li><button onClick={this.loadGame}>Load</button></li>
            </ul>
          </div>
        </div>
      )
    }
    return null
  }
}

export default Menu
