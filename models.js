const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // hashes users’ passed data

/**
 * @fileOverview Defines Movie and User Mongoose schemas and models.
 * @module models
 * @type {mongoose.Schema}
 */

/**
 * Schema for the Movie.
 * @typedef {Object} MovieSchema
 * @property {string} Title - Movie's title.
 * @property {string} Description - Movie's description: plot & style.
 * @property {Object} Genre - Movie's genre.
 * @property {string} Genre.Name - Genre's name.
 * @property {string} Genre.Description - Genre's definition.
 * @property {number} ReleaseYear - Movie's release year.
 * @property {Object} Director - Movie's director.
 * @property {string} Director.Name - Director's name.
 * @property {string} Director.Bio - Short biography of movie's director.
 * @property {number} Birth - Director's birth year.
 * @property {number} Death - Director's death year.
 * @property {string} ImagePath - A link to movie's poster.
 * @property {boolean} Featured - Tells if the movie is featured.
 */

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

/**
 * User Schema.
 * @typedef {Object} UserSchema
 * @property {string} Username - User's unique username.
 * @property {string} Password - User's hashed password.
 * @property {string} Email - User's email address.
 * @property {Date} Birthday - User's date of birth.
 * @property {mongoose.Schema.Types.ObjectId[]} FavoriteMovies - Favourite movies' list.
 */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Logic to hashes user's password.
 * @function
 * @param {string} password - Password to hash.
 * @returns {string} - Hashed password.
 */
userSchema.statics.hashPassword = (password) => { //hashes submitted passwords
    return bcrypt.hashSync(password, 10);
  };

/**
 * Logic to validate user's password.
 * @function
 * @param {string} password - The password to validate.
 * @returns {boolean} - 'true' if password valid, if not 'false'.
 */
  userSchema.methods.validatePassword = function(password) { //compares submitted hashed passwords w/ that stored in our DB.
    return bcrypt.compareSync(password, this.Password);
  };

/**
 * Mongoose model for the Movie schema.
 * @type {mongoose.Model}
 */

let Movie = mongoose.model('Movie', movieSchema);// creates model + collection 'db.movies' w/in MongoDB database: myFlixDB
/**
 * Mongoose model for the User schema.
 * @type {mongoose.Model}
 */
let User = mongoose.model('User', userSchema); //creates model + collection 'db.users' w/in MongoDB database: myFlixDB

module.exports.Movie = Movie;
module.exports.User = User;

