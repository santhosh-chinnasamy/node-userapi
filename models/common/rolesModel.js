const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const roles = new Schema({
    name: {
        type: String,
        required: true
    },
    permission: []
})