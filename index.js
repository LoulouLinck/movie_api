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



app.use(morgan('common')); // setup logger: logs requests to server
app.use(express.static('public')); // shortcut to avoid multiple res.send() for all files in public folder //or app.use('documentation', express.static('public'))?
app.use(express.json()); // import body-parser when Express above v4.16
app.use(express.urlencoded({ extended: true }));

  // GET/READ requests
  //default text
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });  
  
// Returns movie list array
  app.get('/movies', (req, res) => {
    res.status(200).json(topMovies);
  });

// Returns movie data by name
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = topMovies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }
})

// Returns movie by genre name
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = topMovies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }
})

// Returns director by name
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find( movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director')
  }
})

// POST/CREATE requests
// create new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names')
  }
})

// add favorite movie to user's list 
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has now been added to user ${id}'s array`); 
  } else {
    res.status(400).send('no such user')
  }

})

// PUT/UPDATE requests
// update username
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user); 
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE
// removes movie from user's list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle );
    res.status(200).send(`${movieTitle} has now been removed from user ${id}'s array`); 
  } else {
    res.status(400).send('no such user')
  }

})


// user deregistration
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id );
    res.status(200).send(`user ${id} has now been deleted`); 
  } else {
    res.status(400).send('no such user')
  }
})

  
// Error Handeling middleware function: set right before the app.listen()
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // listen for requests
  app.listen(8080, () => console.log('Your app is listening on port 8080.'));