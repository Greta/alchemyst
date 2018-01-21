import React, { Component } from 'react'
import { getPotionByName, getPotionsByLevel } from '../data/potions'
const _ = require('lodash')

const buildOrder = () => {
  // Roll for rarity!
  const roll = _.random(1, 20)
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
  let addPotions = _.random(1, maxAmt)

  while (addPotions) {
    const qty = _.random(1, addPotions)
    if (request.length >= maxTypeAmt || !potionPool.length) {
      // If the maximum # of potion types has been reached, or there are no more potion types available,
      // add this quantity to a random potion type already in the order
      const i = _.random(1, request.length) - 1
      request[i].qty = request[i].qty + qty
    } else {
      // Else, add a new potion type to the order and
      // remove that type from the potion pool
      const i = _.random(1, potionPool.length) - 1,
        potion = potionPool.splice(i, 1)
      request.push({ name : potion[0].name, qty })
    }
    addPotions = addPotions - qty
  }

  // Now calculate a price
  const totalMaterials = _.reduce(request, (a, b) => {
      return a + getPotionByName(b.name).totalMats * b.qty
    }, 0),
    coefficient = 1 + ((roll - 10)/10),
    reward = Math.ceil((totalMaterials * coefficient)/5) * 5

  // Done!  Update the state
  return { request, level, reward }
}


class Orders extends Component {
  canFill = request => {
    const pots = this.props.potions
    const needsPots = _.filter(request, item => {
      if (!pots || !pots[item.name]) return true
      else return item.qty > pots[item.name]
    })
    return !needsPots.length
  }
  render() {
    const orders = _.map(this.props.orders, (order, orderIndex) => {
      const items = _.map(order.request, (item, i) => {
        return (
          <li key={'item_' + orderIndex + '_' + i}>
            <span className='qty'>{item.qty}x</span> {item.name}
          </li>
        )
      })

      let props = {
        className: 'order level_' + order.level,
        key: 'order_' + orderIndex
      }
      // Check to see if the player has the potions to fill the order
      if (this.canFill(order.request)) {
        props.className += ' canFill'
        props.onClick = () => { this.props.fillOrder(order) }
      }
      return (
        <div {...props}>
          <ul>{items}</ul>
          <div className='reward'>{order.reward}g</div>
        </div>
      )
    })
    return (
      <div id='orders'>
        <h3>Orders</h3>
        {orders}
      </div>
    )
  }
}

export default Orders
export { buildOrder }
