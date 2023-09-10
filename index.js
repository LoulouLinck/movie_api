const express = require('express'),
   morgan = require('morgan'),
   bodyParser = require('body-parser'), // not needed? comes together w/ Express above v.4.16
   uuid = require('uuid');
   mongoose = require('mongoose');
   Models = require('./models.js'); //require models defined models.js file

const app = express();
const Movies = Models.Movie; //ref to model names in model.js
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true }); //connects Mongoose w/ DB to perform CRUD op. on documents from w/in our REST API

app.use(bodyParser.json()); // not needed? comes together w/ Express above v.4.16 (middleware applying bodyParser package to allow reading data from body object)


app.use(morgan('common')); // setup logger: logs requests to server
app.use(express.static('public')); // shortcut to avoid multiple res.send() for all files in public folder //or app.use('documentation', express.static('public'))?
app.use(express.json()); // import body-parser when Express above v4.16
app.use(express.urlencoded({ extended: true }));

  // GET/READ requests
  //default text response to '/'
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });  
  
// Returns JSON object: movie list array as response to '/movies'
  app.get('/movies', (req, res) => {
     Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      })   
  });

// Returns user list as response to '/users'
   app.get('/users', function (req, res) {
    Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
   });

// Returns movie data by name
app.get('/movies/:Title', (req, res) => { // why 'movies/title/:Title' also works?
  Movies.findOne({ Title: req.params.Title })
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

// Get user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        return res.status(404).send('Error: ' + req.params.Username + ' was not found');
      } else {
              res.json(user);
      }
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Returns movie by genre name
app.get('/movies/genre/:Genre', (req, res) => { // or /movies/:Genre?
	Movies.find({ 'Genre.Name': req.params.Genre })
		.then((movies) => {
			if (movies.length == 0) {
				return res.status(404).send('Error: no movies found with the ' + req.params.Genre + ' genre type.');
			} else {
				res.status(200).json(movies);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//GET data on genre by genre name
app.get('/movies/genre_description/:Genre', (req, res) => {
   Movies.findOne({ 'Genre.Name': req.params.Genre })
    .then((movie) => {
      if(!movie) {
        return res.status(404).send('Error: ' + req.params.Genre + ' was not found');
      } else {
      res.status(200).json(movie.Genre.Description);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Returns director data by name
app.get('/movies/directors/:Director', (req, res) => {
  Movies.find({ 'Director.Name': req.params.Director })
    .then((movies) => {
      if (!movies) {
        return res.status(404).send('Error: ' + req.params.Director + ' was not found.');
      } else {
      res.status(200).json(movies.Director);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// POST/CREATE requests w/ Mongoose promise function
// create new user 
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username})
     .then ((user) => {
        if (user) {
         return res.status(400).send(req.body.Username + 'already exists');
       } else {
        Users.create({
           Username: req.body.Username,
           Password: req.body.Password,
           Email: req.body.Email,
           Birthday: req.body.Birthday
          })
           .then((user) => {res.status(201).json(user);
          })
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
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $addToSet: { FavouriteMovies: req.params.MovieID },
   },
   { new: true }) // This line makes sure that the updated document is returned
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
// update user's info by username
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    },
  },
  { new: true }) //makes sure the updated docu is returned
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
	Users.findOneAndUpdate(
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
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
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
  app.listen(8080, (req, res) => console.log('Your app is listening on port 8080.'));