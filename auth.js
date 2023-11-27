const jwtSecret = 'your_jwt_secret'; // Must be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Our local passport file

/**
 * Generates JWT token for user authentication.
 * @param {Object} user - User object whose token is being generated.
 * @returns {string} - Generated JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username we’re encoding in the JWT
    expiresIn: '7d', // Specifies: token expires in 7 days
    algorithm: 'HS256' // Algorithm used to “sign” or encode the values of the JWT
  });
}

/**
 * Sets up user login route.
 * @param {Object} router - Express router object.
 */
module.exports = (router) => {
  /**
   * POST login route.
   */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
