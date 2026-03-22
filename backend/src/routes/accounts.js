var express = require('express')
var router = express.Router()
var passport = require('passport')
var Client = require('../models/client')
var Expert = require('../models/expert')

function requestedRole(req) {
  var fromQuery = req.query && req.query.role
  var fromBody = req.body && req.body.role
  var r = fromQuery || fromBody
  if (r === 'client' || r === 'expert') {
    return r
  }
  return null
}

function roleOfUser(user) {
  if (!user || !user.constructor) {
    return null
  }
  if (user.constructor.modelName === 'Client') {
    return 'client'
  }
  if (user.constructor.modelName === 'Expert') {
    return 'expert'
  }
  return null
}

function toSessionUser(user) {
  if (!user) {
    return null
  }
  var o = user.toObject ? user.toObject() : {}
  delete o.hash
  delete o.salt
  o.role = roleOfUser(user)
  return o
}

router.get('/session', function (req, res) {
  var want = requestedRole(req)
  if (!req.user) {
    return res.json(null)
  }
  if (want && roleOfUser(req.user) !== want) {
    return res.status(403).json({ error: 'Session does not match requested role' })
  }
  res.send(toSessionUser(req.user))
})

router.post('/session', function (req, res, next) {
  var role = requestedRole(req)
  if (!role) {
    return res.status(400).json({
      error: 'Missing role: use query ?role=client or ?role=expert (or send role in JSON body)',
    })
  }
  var strategy = role === 'client' ? 'client-local' : 'expert-local'
  passport.authenticate(strategy, { failWithError: true }, function (err, user) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    req.logIn(user, function (loginErr) {
      if (loginErr) {
        return next(loginErr)
      }
      res.send(toSessionUser(user))
    })
  })(req, res, next)
})

router.delete('/session', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.sendStatus(200)
  })
})

module.exports = router
module.exports.requestedRole = requestedRole
module.exports.roleOfUser = roleOfUser
module.exports.toSessionUser = toSessionUser
