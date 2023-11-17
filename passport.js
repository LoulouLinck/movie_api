const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');
//{ model } = require("mongoose"); why commented out?

/**
 * The User model from the models module.
 * @type {Object}
 */
let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/** 
 * Logic for 1st loggin authentification
 * uses a username and password
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    /**
   * @param {string} username - Username provided by user
   * @param {string} password - Password provided by user
   * @param {function} callback - Callback executed when authentication over
   */
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username })
      .then((user) => {
        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        if (!user.validatePassword(password)) { // Hashes password before comparing it to that in MongoDB
          console.log('incorrect password');
          return callback(null, false, { message: 'Incorrect password.' });
        }
        console.log('finished');
        return callback(null, user);
      })
      .catch((error) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
      });
    }
  )
);

/**
 * 1st login generates JWT token for future auth:
 * JWT logic to handle JWT-based authentication.
 * Protects routes requiring valid JWT token.
 */
passport.use(
    new JWTStrategy(
        {
          jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
           secretOrKey: 'your_jwt_secret'
        },
         /**
         * @param {Object} jwtPayload - The decoded JWT payload.
         * @param {function} callback - A callback to be executed once the JWT is verified.
         */ 
        async (jwtPayload, callback) => {
          return await Users.findById(jwtPayload._id)
            .then((user) => {
                return callback(null, user);
            })
            .catch((error) => {
                return callback(error)
    });
}
)
);
