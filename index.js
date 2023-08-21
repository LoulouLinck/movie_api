const express = require('express');
const app = express();

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
  
//   app.get('/documentation', (req, res) => {                  
//     res.sendFile('public/documentation.html', { root: __dirname });
//   });
  

  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });