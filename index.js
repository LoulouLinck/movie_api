const express = require('express'),
   morgan = require('morgan'),
   bodyParser = require('body-parser'), // not needed? comes together w/ Express above v.4.16
   uuid = require('uuid');
   mongoose = require('mongoose');
   Models = require('./models.js'); //require models defined models.js file
const { check, validationResult } = require('express-validator'); //validates username, pw: user imputs on the server side. Ensures no malicious code and imputs follow set constrains
const app = express();
const Movies = Models.Movie; //ref to model names in model.js
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true }); //connects Mongoose w/ DB to perform CRUD op. on documents from w/in our REST API

app.use(bodyParser.json()); // not needed? comes together w/ Express above v.4.16 (middleware applying bodyParser package to allow reading data from body object)


app.use(morgan('common')); // setup logger: logs requests to server
app.use(express.static('public')); // shortcut to avoid multiple res.send() for all files in public folder //or app.use('documentation', express.static('public'))?
app.use(express.json()); // import body-parser when Express above v4.16
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
// app.use(cors()); // precises app uses CORS: allows req. from all origins by default
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com']; // sets list of allowed origins

app.use(cors({ // grants access to API to specified domains
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));


let auth = require('./auth')(app); // Import our “auth.js” file into our project. Argument (app)passed to ensure Express available in “auth.js" 
const passport = require('passport'); require('./passport');


  // GET/READ requests
  //Gets default text as a response to '/'
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });  

// MOVIES ENDPOINTS
  
// Returns JSON object: movie list array as response to '/movies'
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      return res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Gets movie data by name as a response to '/movies/:Title'
app.get('/movies/:Title', passport.authenticate("jwt", { session: false }),
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

// // Returns movie by genre name as a response to '/movies/genre/:Genre'
// app.get('/movies/genre/:Genre', passport.authenticate("jwt", { session: false }),
// async (req, res) => { 
// 	await Movies.find({ 'Genre.Name': req.params.Genre })
// 		.then((movies) => {
// 			if (movies.length == 0) {
// 				return res.status(404).send('Error: no movies found with the ' + req.params.Genre + ' genre type.');
// 			} else {
// 				res.status(200).json(movies);
// 			}
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });

//Gets data on genre by genre name as a response to '/movies/genres/:genreName'
app.get('/movies/genres/:genreName',  passport.authenticate("jwt", { session: false }),
async (req, res) => {
   await Movies.findOne({ 'genre.name': req.params.genreName })
    .then((genre) => {
      if(!genre) {
        return res.status(404).send('Error: ' + req.params.genreName + ' was not found');
      } else {
      res.status(200).json(genre);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets director data by name as response to '/movies/directors/:Director'
app.get('/movies/directors/:directorName', passport.authenticate("jwt", { session: false }),
async(req, res) => {
  await Movies.findOne({ 'director.name': req.params.directorName })
    .then((director) => {
      if (!director) {
        return res.status(404).send('Error: ' + req.params.directorName + ' was not found.');
      } else {
      res.status(200).json(director);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//USERS ENDPOINTS

// // Gets user list as response to '/users' // should be delete since access to other users = security breach?
//    app.get('/users',  passport.authenticate("jwt", { session: false }),
//    async function (req, res) {
//     await Users.find()
//     .then(function (users) {
//       res.status(201).json(users);
//     })
//     .catch(function (err) {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
//    });

// // Gets user by username as response to '/users/:Username' // should be delete since = security breach?
// app.get('/users/:Username', async (req, res) => {
//   await Users.findOne({ Username: req.params.Username })
//     .then((user) => {
//       if (!user) {
//         return res.status(404).send('Error: ' + req.params.Username + ' was not found');
//       } else {
//               res.json(user);
//       }
//   })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// POST/CREATE REQUESTS w/ Mongoose promise function
// Creates new user 
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

// add favourite movie to user's list 
app.post('/users/:Username/movies/:MovieID', passport.authenticate("jwt", { session: false }),
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


// PUT/UPDATE requests
// update user's info by username if username in req.body = username in req.para (security breach)
app.put('/users/:Username',  passport.authenticate("jwt", { session: false }),
[
  // check('field in req.body to validate', 'error message if validation fails').'validation method'({});
  check("username", "username is required").isLength({ min: 5 }),
  check("username", "username contains non alphanumeric characters - not allowed!").isAlphanumeric(),
  check("password", "password is required").not().isEmpty(),
  check("email", "email is not valid").isEmail(),
],
async (req, res) => {
   //check validation object for errors
   let errors = validationResult(request);
   if (!errors.isEmpty()) {
     return response.status(422).json({ errors: errors.array() });
   }
  // Conditions
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
}
// End conditions
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
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


// DELETE
// removes movie from user's list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate("jwt", { session: false }),
async (req, res) => {
	await Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{ $pull: { FavouriteMovies: req.params.MovieID },
		},
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

// user deregistration
app.delete('/users/:Username',  passport.authenticate("jwt", { session: false }),
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
