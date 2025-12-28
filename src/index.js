class User {
  constructor(name) {
    this.name = name
    this.picnics = []
  }

  joinPicnic(picnic) {
    picnic.attendees.push(this)
    this.picnics.push(picnic)
  }

  createPicnic(name, location, date) {
    const picnic = new Picnic(name, location, date) // Create the picnic

    this.joinPicnic(picnic) // Explicitly join the picnic

    return picnic // Return the newly created picnic
  }

  bringItem(name, quantity, picnic) {
    // Find the item in the picnic's items list
    let item = picnic.items.find(item => item.name === name)

    // If it doesn't exist, create a new item and add it to the picnic
    if (!item) {
      item = new Item(name, quantity)
      picnic.items.push(item)
    }

    // Track who is bringing what
    item.whoIsBringingWhat.push({
      user: this,
      quantity: quantity,
    })
  }

  leavePicnic(picnic) {
    // Remove the user from the picnic's attendees list
    picnic.attendees = picnic.attendees.filter(attendee => attendee !== this)

    // Remove the picnic from the user's list of picnics
    this.picnics = this.picnics.filter(p => p !== picnic)

    // Remove the user's contributions from the picnic's items
    picnic.items.forEach(item => {
      item.whoIsBringingWhat = item.whoIsBringingWhat.filter(whoIsBringingWhat => whoIsBringingWhat.user !== this)
    })
  }
}

class Picnic {
  items = []
  attendees = []

  constructor(name, location, date) {
    this.name = name
    this.location = location
    this.date = date
  }
}
class Item {
  whoIsBringingWhat = []

  constructor(name, desiredQuantity = 1) {
    this.name = name
    this.desiredQuantity = desiredQuantity
  }
  get quantity() {
    return this.whoIsBringingWhat.reduce((total, item) => total + item.quantity, 0)
  }
}

const armagan = new User('Armagan')
const numan = new User('Numan')

const armagansPicnic = armagan.createPicnic("Armagan's Picnic", 'Tempelhofer Feld', '2023-05-01')
const numansPicnic = numan.createPicnic("Numan's Picnic", 'Hasenheide', '2023-05-02')

armagan.joinPicnic(numansPicnic)
numan.joinPicnic(armagansPicnic)
// Armagan brings 6 beers to Numan's Picnic
armagan.bringItem('beer', 6, numansPicnic)
numansPicnic.items[0].desiredQuantity = 12
numan.bringItem('beer', 3, numansPicnic)

// Test
console.log(numansPicnic.items[0])
console.log(
  `Numans picnic has ${numansPicnic.items[0].quantity} beers, expected to be 9: ${numansPicnic.items[0].quantity === 9}`
)

armagan.leavePicnic(numansPicnic)
console.log(numansPicnic.attendees.includes(armagan) === false) // true
console.log(numansPicnic.items[0]) // should only have Numan's contribution now
