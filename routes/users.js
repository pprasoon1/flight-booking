const  mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb+srv://prasu202324:prasu2024@cluster0.npmy0bw.mongodb.net");

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    profileImage: String,
    contact: Number,
    boards: {
        type: Array,
        default: []
    }
});

userSchema.plugin(plm, {usernameField: 'username'});
module.exports = mongoose.model("User", userSchema);
