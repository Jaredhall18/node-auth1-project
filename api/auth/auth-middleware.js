const User = require('../users/users-model')

/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
 if(req.session.user) {
    next()
 } else {
   next({status: 401, message: "You shall not pass!" })
 }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  try {
    const { username } = req.body
    const [userFromDb] = await User.findBy( {username} )
    if (userFromDb) {
      res.json({
        message: "username taken",
        status: 422
      })
    } else { 
     next()
    }
  } catch (error) {
    next({message: 'invalid credentials', status: 401})
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  try {
    const { username } = req.body
    const [userFromDb] = await User.findBy( {username} )
    if (!userFromDb) {
      return next({ message: 'invalid credentials', status: 401 })
    } else {
      return next()
    }
  } catch (error) {
    next(error)
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
try {
    const { password } = req.body
    if (!password || password.length <= 3) {
      return next({ message: "Password must be longer than 3 chars", status: 422 })
    } else {
      return next()
    }
  } catch (error) {
    next(error)
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
}