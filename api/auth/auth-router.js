const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../users/users-model')
// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

router.post('/register', async (req, res, next) => {
  try {
    // 1- pull u and p from req.body
    const { username, password } = req.body
    // 2- create a hash off of the password
    const newUser = {
    username,
    password: bcrypt.hashSync(password, 8),
    }
    // 3- we will store u and hash to the db
    const created = await User.add(newUser)
    res.status(200).json({
    user_id: created.user_id, username: created.username
 })
  } catch (err) {
    next(err)
  }
})
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

  router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body
      const [userFromDb] = await User.findBy( {username} )
      if (!userFromDb) {
        return next({ message: 'invalid credentials', status: 401 })
      }
      const verifies = bcrypt.compareSync(password, userFromDb.password)
      if(!verifies) {
        return next({ message: 'invalid credentials', status: 401 })
      }
      req.session.user = userFromDb
      res.json({
        message: ` Welcome ${username}!`
      })
    } catch (err) {
        next(err)
    }
  })

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get('/logout', async (req, res, next) => {
  try {
    if(req.session.user) {
      req.session.destroy((err) => {
        if (err) {
          res.json('an error occurred.')
        } else {
          res.json('logged out')
        }
      })
    } else {
      res.json({
        message: 'no session'
      })
    }
  } catch (error) {
    next(error)
  }
})

 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router