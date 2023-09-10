const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    ReleaseYear: Number,
    Director: {
        Name: String,
        Bio: String,
        Birth: Number,
        Death: Number
    },
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);// creates model + collection 'db.movies' w/in MongoDB database: myFlixDB
let User = mongoose.model('User', userSchema); //creates model + collection 'db.users' w/in MongoDB database: myFlixDB

module.exports.Movie = Movie;
module.exports.User = User;

