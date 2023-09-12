const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //hashes users’ passed data

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

userSchema.statics.hashPassword = (password) => { //hashes submitted passwords
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) { //compares submitted hashed passwords w/ that stored in our DB.
    return bcrypt.compareSync(password, this.Password);
  };

let Movie = mongoose.model('Movie', movieSchema);// creates model + collection 'db.movies' w/in MongoDB database: myFlixDB
let User = mongoose.model('User', userSchema); //creates model + collection 'db.users' w/in MongoDB database: myFlixDB

module.exports.Movie = Movie;
module.exports.User = User;

