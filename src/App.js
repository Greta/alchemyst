import React, { Component } from 'react'
import Menu from './components/Menu'
import Grid from './components/Grid'
import Orders, { buildOrder } from './components/Orders'
import { _colors, getColorIndex } from './data/colors'
import { _potions, getPotionByName } from './data/potions'
const _ = require('lodash')

class App extends Component {
  constructor() {
    super()
    // Start with nothing
    const totals = _.map(_colors, () => {
      return 0
    })
    const order = buildOrder()
    this.state = {
      gold: 0,
      day: 1,
      time: 0,
      timeInDay: 10,
      inventory: {
        potions: {},
        items: {}
      },
      orders: [order],
      totals
    }
    this.updateTotals = this.updateTotals.bind(this)
    this.incrementTime = this.incrementTime.bind(this)
    this.addOrder = this.addOrder.bind(this)
  }
  updateTotals = (color, count) => {
    if (color === 'golden') {
      // Update golden herb count here
    } else {
      let totals = this.state.totals
      totals[color - 1] += count
      this.setState({ totals })
    }
    // 10% chance to create an order
    if (_.random(1, 10) === 10) {
      this.addOrder()
    }
  }
  incrementTime = (amt = 1) => {
    let time = this.state.time + 1,
      day = this.state.day,
      newDay = false
    if (time > this.state.timeInDay) {
      time = 0
      day++
      newDay = true
    }
    this.setState({ time, day })
    return newDay
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
  addOrder = () => {
    const order = buildOrder()
    let orders = this.state.orders
    orders.push(order)
    this.setState({ orders })
  }
  fillOrder = order => {
    const gold = _.sum([this.state.gold, order.reward])
    let orders = this.state.orders
    _.remove(orders, order)
    let inventory = this.state.inventory
    _.each(order.request, item => {
      let potion = inventory.potions[item.name]
      potion = potion - item.qty
      if (potion < 1) {
        delete inventory.potions[item.name]
      } else {
        inventory.potions[item.name] = potion
      }
    })
    this.setState({ gold, inventory, orders })
  }
  render() {
    return (
      <div className="layout" onKeyDown={this.openMenu}>
        <Menu />
        <div className="left">
          <Recipes totals={this.state.totals} onClick={this.brewPotion} />
          <Cauldron />
        </div>
        <div className="middle">
          <Time {...this.state} />
          <Grid updateTotals={this.updateTotals} incrementTime={this.incrementTime} />
          <Inventory {...this.state} />
        </div>
        <div className="right">
          <Orders orders={this.state.orders} potions={this.state.inventory.potions} fillOrder={this.fillOrder} />
          <Orb />
        </div>
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
      const potion = getPotionByName(name),
        style = { backgroundColor: potion.color }
      return (
        <li key={name} className={'potion ' + potion.flask}>
          <span className='color' style={style}></span>
          <span className='amt'>{amt}</span>{amt}
        </li>
      )
    })
    return (
      <div id="inventory">
        <h3>Inventory</h3>
        <span className="gold">
          {this.props.gold}g
        </span>
        <ul>
          {totals}
          {potions}
        </ul>
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

      // Check to see if the player has enough materials to make the recipe
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

class Time extends Component {
  render() {
    const width = (this.props.time / this.props.timeInDay) * 100
    const pStyle = {
      width: width + '%'
    }
    return (
      <div id="time">
        Day {this.props.day}
        <div className="progress"><div style={pStyle}></div></div>
      </div>
    )
  }
}

class Cauldron extends Component {
  render() {
    return (
      <div id="cauldron">
      </div>
    )
  }
}

class Orb extends Component {
  render() {
    return (
      <div id="orb">
      </div>
    )
  }
}

export default App;
