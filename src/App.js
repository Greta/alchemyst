import React, { Component } from 'react'
import Grid from './components/Grid'
import { _colors, getColorIndex } from './data/colors'
import { _potions, getPotionById, getPotionsByLevel } from './data/potions'
const _ = require('lodash')

const randomNumUpTo = max => {
  return Math.floor(Math.random() * max) + 1
}

class App extends Component {
  constructor() {
    super()
    // Start with nothing
    const totals = _.map(_colors, () => {
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
    const totals = _.map(_colors, (color, i) => {
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
    const list = _.map(_potions, potion => {
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

export default App;
