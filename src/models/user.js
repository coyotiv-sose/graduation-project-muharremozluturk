class User {
  constructor(name, email, phone) {
    this.name = name
    this.email = email
    this.phone = phone
    this.createdAt = new Date()
  }

  // Method to get user info
  getUserInfo() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      createdAt: this.createdAt,
    }
  }
}

module.exports = User
