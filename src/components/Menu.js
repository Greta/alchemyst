import React, { Component } from 'react'

class Menu extends Component {
  constructor() {
    super()
    this.state = {
      panel: 'closed'
    }
  }
  toggleMenu = () => {
    const panel = this.state.panel === 'closed' ? 'open' : 'closed'
    this.setState({ panel })
  }
  escKey = e => {
    if (e.keyCode === 27) {
      this.toggleMenu()
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.escKey, true)
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.escKey, true)
  }
  saveGame = () => {
    console.log('saving the game...')
  }
  loadGame = () => {
    console.log('loading game...')
  }
  render() {
    if (this.state.panel !== 'closed') {
      return (
        <div id='menu'>
          <div className='panel'>
            <h2>Menu</h2>
            <ul>
              <li><button onClick={this.saveGame}>Save</button></li>
              <li><button onClick={this.loadGame}>Load</button></li>
            </ul>
          </div>
          <div className='overlay' onClick={this.toggleMenu}></div>
        </div>
      )
    }
    return null
  }
}

export default Menu
