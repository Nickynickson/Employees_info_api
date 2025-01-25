const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');

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
        try {
            const savedEmployee = await employee.save();
            res.status(201).json(savedEmployee);
        } catch (err) {
            res.status(400).json({ message: err.message });
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

        try {
            const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
            res.json(updatedEmployee);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

// DELETE an employee
router.delete('/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
