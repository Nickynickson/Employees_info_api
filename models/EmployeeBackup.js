const mongoose = require('mongoose');

const employeeBackupSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true },
    birthday: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now } // To track when the backup was created
});

//EmployeeBackup model
const EmployeeBackup = mongoose.model('EmployeeBackup', employeeBackupSchema);

module.exports = EmployeeBackup;
