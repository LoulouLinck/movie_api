// CONFIGURATIONS

/**
 * @module express
 */
const express = require('express'),

/**
 * @module morgan
 */
morgan = require('morgan'),

/**
 * @module bodyParser
 */
bodyParser = require('body-parser'), // not needed? comes together w/ Express above v.4.16

/**
 * @module uuid
 */
uuid = require('uuid');

/**
 * @module mongoose
 */
mongoose = require('mongoose');

/**
 * Models for the application.
 * @module models
 */
Models = require('./models.js'); //require models defined models.js file

/**
 * Validation tools.
 * @module express-validator
 */
const { check, validationResult } = require('express-validator'); //validates username, pw: user imputs on the server side. Ensures no malicious code and imputs follow set constrains

/**
 * Initialize express.
 * @type {Object}
 */
const app = express();

/**
 * Movies model from the Models module.
 * @const
 */
const Movies = Models.Movie; //ref to model names in model.js

/**
 * Users model from the Models module.
 * @const
 */
const Users = Models.User;

// DATABASE CONNECTION

// mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true }); //connects Mongoose w/ DB to perform CRUD op. on documents from w/in our REST API
mongoose //connects online DB to online API on Render. Here 'connection string/connection URI' replaced by environment variable
   .connect(process.env.CONNECTION_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });

app.use(bodyParser.json()); // not needed? comes together w/ Express above v.4.16 (middleware applying bodyParser package to allow reading data from body object)

// MIDDLEWARE

app.use(morgan('common')); // setup logger: logs requests to server
app.use(express.static('public')); // shortcut to avoid multiple res.send() for all files in public folder //or app.use('documentation', express.static('public'))?
app.use(express.json()); // import body-parser when Express above v4.16
app.use(express.urlencoded({ extended: true }));


/**
 * Configuration for CORS.
 * @const
 */
const cors = require('cors');
app.use(cors()); // precises app uses CORS: allows req. from all origins by default
// let allowedOrigins = ['https://cineflixxx.netlify.app/', 'https://cineflixxx.netlify.app', 'https://cineflix-sqlk.onrender.com', 'http://localhost:10000', 'http://localhost:1234', 'http://localhost:8080']; // sets list of allowed origins

// app.use(cors({ // grants access to API to specified domains
//   origin: (origin, callback) => {
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
//       let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null, true);
//   }
// }));

/** Initialize Passport. */
let auth = require('./auth')(app); // Import our “auth.js” file into our project. Argument (app)passed to ensure Express available in “auth.js" 
const passport = require('passport'); 
require('./passport');

// ROUTES

  /** 
  * GET/READ requests
  * Gets default text as a response to '/' 
  */
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });  

/**
 * Gets all the movies
 * @name getMovies
 * @returns {Array} A list of movies.
 * @kind function
 */
app.get('/movies', 
 passport.authenticate('jwt', { session: false }),
 async (req, res) => {
   await Movies.find()
     .then((movies) => {
       return res.status(201).json(movies);
     })
     .catch((error) => {
       console.error(error);
       res.status(500).send('Error: ' + error);
     });
  }
);

/**
 * Gets movie by title.
 * @name getMovie
 * @param {string} Title - Movie title.
 * @returns {Object} The found movie.
 * @kind function
 */
app.get(
  '/movies/:Title', 
  passport.authenticate("jwt", { session: false }),
async (req, res) => { // why 'movies/title/:Title' also works?
  await Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      if (!movies) {
				return res.status(404).send('Error: ' + req.params.Title + ' was not found');
			}
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('no such movie ' + err);
    });
});

/**
 * Gets a genre
 * @name getGenre
 * @param {string} genreName genreName
 * @kind function
 */
app.get(
  '/movies/genres/:genreName',  
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log('genre: ', req.params.genreName)
     await Movies.findOne({ 'Genre.Name': req.params.genreName }) //fixed bug capitalised Genre.Name, changed findONe to find
      .then((movies) => {
        if(!movies) {
          return res.status(404).send('Error: ' + req.params.genreName + ' was not found');
        } else {
         res.status(200).json(movies.Genre);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  }
);

/**
 * Gets a director by Name
 * @name getDirector
 * @param {string} directorName directorName
 * @returns {Object} The found director.
 * @kind function
 */
app.get(
  '/movies/directors/:directorName', 
  passport.authenticate("jwt", { session: false }),
  async(req, res) => {
    await Movies.findOne({ 'Director.Name': req.params.directorName }) //fixed bug: changed 'findOne' to 'find' and director.name to Director.Name
      .then((movie) => {
        if (!movie) {
          return res
          .status(404)
          .send('Error: ' + req.params.directorName + ' was not found.');
        } else {
         res.status(200).json(movie.Director);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  }
);

// USERS ENDPOINTS

/**
 * Creates new user 
 * @name registerUser
 * @param {string} Username username
 * @param {string} Password password
 * @param {string} Email email
 * @kind function
 */
app.post('/users', 
// Validation logic for request
[ 
  // check('field in req.body to validate', 'error message if validation fails').validation method({});
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], 
async (req, res) => {
 // check the validation object for errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
   }

  let hashedPassword = Users.hashPassword(req.body.Password); // hashes password before storing it MongoDB
  await Users.findOne({ Username: req.body.Username}) // Search to see if a user with the requested username already exists
     .then ((user) => {
        if (user) { //If the user is found, send a response that it already exists
         return res.status(400).send(req.body.Username + 'already exists');
       } else { 
        Users.create({
           Username: req.body.Username,
           Password: hashedPassword, // stores hashed password
           Email: req.body.Email,
           Birthday: req.body.Birthday
          })
           .then((user) => { res.status(201).json(user) })
           .catch((error) => {
           console.error(error);
           res.status(500).send('Error: ' + error);
          });
         }
      })
  .catch ((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

/**
 * Adds favourite movie to user's list 
 * @name addFavoriteMovie
 * @param {string} Username username
 * @param {string} MovieId movieid
 * @kind function
 */
app.post(
  '/users/:Username/movies/:MovieID', 
  passport.authenticate("jwt", { session: false }),
 async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $addToSet: { FavouriteMovies: req.params.MovieID },
   },
   { new: true }) // unsures the updated document is returned
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(404).send('Error: User was not found.');
    } else {  
    res.json(updatedUser);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Updates existing user info by username if username in req.body = username in req.para (security breach)
 * @name updateUser
 * @param {string} Username username
 * @param {string} Password password
 * @param {string} Email email
 * @kind function
 */
app.put(
  '/users/:Username',  
  passport.authenticate("jwt", { session: false }),
[
  // check('field in req.body to validate', 'error message if validation fails').'validation method'({});
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed!').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email is not valid').isEmail(),
],
async (req, res) => {
   //check validation object for errors
   let errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(422).json({ errors: errors.array() });
   }
  // Conditions
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
}
// End conditions
let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    },
  },
  { new: true }) //makes sure updated docu is returned
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(404).send('Error: No such user found.');
    } else { 
    res.json(updatedUser);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// DELETE ENDPOINTS

/**
 * Removes movie from user's list
 * @name removeFavoriteMovie
 * @param {string} Username username
 * @param {string} MovieId movieid
 * @kind function
 */
app.delete(
  '/users/:Username/movies/:MovieID', 
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
	await Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{ $pull: { FavouriteMovies: req.params.MovieID },},
		{ new: true }
	)
		.then((updatedUser) => {
			if (!updatedUser) {
				return res.status(404).send('Error: User not found');
			} else {
				res.json(updatedUser);
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * User deregistration
 * @name deleteUser
 * @param {string} Username username
 * @kind function
 */
app.delete(
  '/users/:Username',
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((deletedUser) => {
      if (!deletedUser) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Error Handeling middleware function: set right before the app.listen()
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // listen for requests
  // app.listen(8080, (req, res) => console.log('Your app is listening on port 8080.')); // when locally hosted
  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
   console.log('Listening on Port ' + port);
  });
