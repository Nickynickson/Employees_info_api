const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birthday: { type: Date }
});

module.exports = mongoose.model('Employee', EmployeeSchema, 'employees');
