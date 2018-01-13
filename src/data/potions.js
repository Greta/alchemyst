const _ = require('lodash')

// Base Potion Data
let potions = [
  {
    name: 'Mana',
    mats: { blue: 10 }
  },
  {
    name: 'Health',
    mats: { pink: 10 }
  },
  {
    name: 'Mixture',
    mats: { blue: 5, pink: 5, purple: 5 }
  },
  {
    name: 'Night Sight',
    mats: { purple: 15 }
  },
  {
    name: 'Growth',
    mats: { green: 15 }
  },
  {
    name: 'Tincture',
    mats: { green: 10, blue: 10 }
  },
  {
    name: 'Strength',
    mats: { pink: 25, green: 25 }
  },
  {
    name: 'Sleep',
    mats: { blue: 15, purple: 15, green: 15 }
  },
  {
    name: 'Love',
    mats: { pink: 75, purple: 50 }
  }
]

const getTotalMats = potion => Object.values(potion.mats).reduce((a, b) => a + b)

// Add totals, potion level, and name based id
// TODO: Add mats per level to base game options
_.each(potions, potion => {
  const totalMats = getTotalMats(potion)
  potion.totalMats = totalMats
  potion.level = Math.floor(totalMats / 45) + 1
  potion.id = potion.name.replace(' ', '_').toLowerCase()
})

const getPotionByName = name => _.find(potions, { name })
const getPotionById = id => _.find(potions, { id })
const getPotionsByLevel = level => _.filter(potions, potion => { return level === potion.level })

export { potions, getPotionByName, getPotionById, getPotionsByLevel }
