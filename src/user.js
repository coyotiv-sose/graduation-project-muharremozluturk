class User {
  constructor(name, email, phone) {
    this._name = name
    this._email = email
    this._phone = phone
    this._createdAt = new Date()
  }

  // Getters
  get name() {
    return this._name
  }

  get email() {
    return this._email
  }

  get phone() {
    return this._phone
  }

  get createdAt() {
    return this._createdAt
  }

  // Setters
  set name(value) {
    this._name = value
  }

  set email(value) {
    this._email = value
  }

  set phone(value) {
    this._phone = value
  }

  // Method to get user info
  getUserInfo() {
    return {
      name: this._name,
      email: this._email,
      phone: this._phone,
      createdAt: this._createdAt,
    }
  }
}

module.exports = User
