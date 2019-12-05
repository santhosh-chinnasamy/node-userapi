const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: [true,"email required"],
        unique: true,
        dropDups:true,
        trim: true
    },
    password: {
        type: String,
        required: [true,"Password Required"]
    },
    role: {
        type: String,
        default: "basic",
        enum: ['basic', 'manager', 'admin']
    },
    permission:{
        type:Array,
        default:[]
    },
    accessToken: {
        type: String
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;