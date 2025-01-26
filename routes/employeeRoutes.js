const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const EmployeeBackup = require('../models/EmployeeBackup');
const mongoose = require('mongoose');

const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new employee with validation
router.post(
    '/',
    [
        body('firstName').isString().notEmpty().withMessage('First name is required'),
        body('lastName').isString().notEmpty().withMessage('Last name is required'),
        body('department').isString().notEmpty().withMessage('Department is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('birthday').optional().isDate().withMessage('Birthday must be a valid date')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const employee = new Employee(req.body);
        const session = await mongoose.startSession(); // Start a session

        try {
            session.startTransaction();

            // Save the new employee
            const savedEmployee = await employee.save({ session });

            // Back up the new employee
            const backupEntry = new EmployeeBackup(savedEmployee.toObject());
            await backupEntry.save({ session });

            await session.commitTransaction();
            res.status(201).json(savedEmployee);
        } catch (err) {
            console.error(err);
            await session.abortTransaction();
            res.status(400).json({ message: err.message });
        } finally {
            session.endSession(); // Ensure the session is ended
        }
    }
);

// PUT (update) an employee with validation
router.put(
    '/:id',
    [
        body('firstName').optional().isString().notEmpty().withMessage('First name must be a non-empty string'),
        body('lastName').optional().isString().notEmpty().withMessage('Last name must be a non-empty string'),
        body('department').optional().isString().notEmpty().withMessage('Department must be a non-empty string'),
        body('email').optional().isEmail().withMessage('Valid email is required'),
        body('birthday').optional().isDate().withMessage('Birthday must be a valid date')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const session = await mongoose.startSession(); // Start a session

        try {
            session.startTransaction();

            // Update the employee
            const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, session });
            if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });

            // Back up the updated employee
            const backupEntry = new EmployeeBackup(updatedEmployee.toObject());
            await backupEntry.save({ session });

            await session.commitTransaction();
            res.json(updatedEmployee);
        } catch (err) {
            console.error(err);
            await session.abortTransaction();
            res.status(400).json({ message: err.message });
        } finally {
            session.endSession(); // Ensure the session is ended
        }
    }
);

// DELETE an employee
router.delete('/:id', async (req, res) => {
    const session = await mongoose.startSession(); // Start a session

    try {
        session.startTransaction();

        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id, { session });
        if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });

        // Back up the deleted employee
        const backupEntry = new EmployeeBackup(deletedEmployee.toObject());
        await backupEntry.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        console.error(err);
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession(); // Ensure the session is ended
    }
});

module.exports = router;
