const _ = require('lodash')

// Base Potion Data
let _potions = [
  {
    name: 'Mana',
    mats: { blue: 10 },
    color: '#0093ff'
  },
  {
    name: 'Health',
    mats: { pink: 10 },
    color: '#ff0000'
  },
  {
    name: 'Mixture',
    mats: { blue: 5, pink: 5, purple: 5 },
    color: '#c200ff'
  },
  {
    name: 'Night Sight',
    mats: { purple: 15 },
    color: '#6815bf'
  },
  {
    name: 'Growth',
    mats: { green: 15 },
    color: '#07e22e'
  },
  {
    name: 'Tincture',
    mats: { green: 10, blue: 10 },
    color: '#67efdd'
  },
  {
    name: 'Strength',
    mats: { pink: 25, green: 25 },
    color: '#ff7901'
  },
  {
    name: 'Sleep',
    mats: { blue: 15, purple: 15, green: 15 },
    color: '#1030d6'
  },
  {
    name: 'Love',
    mats: { pink: 75, purple: 50 },
    color: '#ec0b91'
  }
]

const getTotalMats = potion => Object.values(potion.mats).reduce((a, b) => a + b)
const flasks = ['tube', 'round', 'round']

// Add totals, potion level, and name based id
// TODO: Add mats per level to base game options (it's the number 45 in code below)
_.each(_potions, potion => {
  const totalMats = getTotalMats(potion)
  potion.totalMats = totalMats
  potion.level = Math.floor(totalMats / 45) + 1
  potion.flask = flasks[potion.level - 1]
  potion.id = potion.name.replace(' ', '_').toLowerCase()
})

const getPotionByName = name => _.find(_potions, { name })
const getPotionById = id => _.find(_potions, { id })
const getPotionsByLevel = level => _.filter(_potions, potion => { return level === potion.level })

export { _potions, getPotionByName, getPotionById, getPotionsByLevel }
