const express = require('express');
   morgan = require('morgan');

const app = express();

// setup logger
app.use(morgan('common'));

// shortcut to avoid multiple res.send() for all files in public folder 
app.use(express.static('public'));

let topMovies = [
    {
      title: 'Revenge',
      author: 'Yermek Shinarbayev'
    },
    {
      title: 'Three Sisters',
      author: 'Wang Bing'
    },
    {
      title: 'In the Mood for Love',
      author: 'Wong Kar Wai'
    },
    {
      title: 'The Mirror',
        author: 'Andrei Tarkovsky'
    },
    {
      title: '',
      author: ' '
    },
    {
      title: '',
      author: ' '
    },
    {
      title: '',
      author: ' '
    },
    {
      title: '',
      author: ' '
    },
    {
      title: '',
      author: ' '
    },
    {
      title: '',
      author: ' '
    },
  ];
  
  // GET requests
    app.get('/movies', (req, res) => {
    res.json(topMovies);
  });
  
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });
  
// Returns movie list array
  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });
  
// Error Handeling middleware function: set right before the app.listen()
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });