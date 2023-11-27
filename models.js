const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // hashes users’ passed data

/**
 * Represents a movie schema.
 * @type {mongoose.Schema}
 */

let movieSchema = mongoose.Schema({
  /** The title of the movie. */
    Title: { type: String, required: true },
    /** The description of the movie. */
    Description: { type: String, required: true },
     /** The genre of the movie. */
    Genre: {
       /** The name of the genre. */
        Name: String,
          /** The description of the genre. */
        Description: String
    },
     /** The release year of the movie. */
    ReleaseYear: Number,
     /** The director of the movie. */
    Director: {
      /** The name of the director. */
        Name: String,
        /** The biography of the director. */
        Bio: String,
        /** The birth year of the director. */
        Birth: Number,
        /** The death year of the director. */
        Death: Number
    },
    /** The image URL of the movie. */
    ImagePath: String,
    /** Indicates if the movie is featured or not. */
    Featured: Boolean
});

/**
 * Represents a user schema.
 * @type {mongoose.Schema}
 */
let userSchema = mongoose.Schema({
    /** The username of the user. */
    Username: { type: String, required: true },
    /** The password of the user. */
    Password: { type: String, required: true },
    /** The email address of the user. */
    Email: { type: String, required: true },
    /** The birthday of the user. */
    Birthday: Date,
    /** The list of favourite movies of the user. */
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Logic to hashes user's password.
 * @param {string} password - Password to hash.
 * @returns {string} - Hashed password.
 */
userSchema.statics.hashPassword = (password) => { //hashes submitted passwords
    return bcrypt.hashSync(password, 10);
  };

/**
 * Logic to validate user's password.
 * @param {string} password - The password to validate.
 * @returns {boolean} - 'true' if password valid, if not 'false'.
 */
  userSchema.methods.validatePassword = function(password) { //compares submitted hashed passwords w/ that stored in our DB.
    return bcrypt.compareSync(password, this.Password);
  };

/** Represents the Movie model. */
let Movie = mongoose.model('Movie', movieSchema);// creates model + collection 'db.movies' w/in MongoDB database: myFlixDB
/** Represents the User model. */
let User = mongoose.model('User', userSchema); //creates model + collection 'db.users' w/in MongoDB database: myFlixDB

module.exports.Movie = Movie;
module.exports.User = User;

