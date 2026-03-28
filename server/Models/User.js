const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    wallet: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Wallet"
    },
    goals: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Goals"
    }],
    accountCreatedOn: {
        type: Date,
        default: Date.now
    }
});


// Indexes for better query performance
userSchema.index({ email: 1 });  // Explicit index on email (already unique)

userSchema.plugin(passportLocalMongoose,
    { usernameField: 'email' });

const User = new mongoose.model("User", userSchema);

module.exports = User;