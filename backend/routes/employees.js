/**
 * @module Backend/Employees
 * @description A module that provides routes for managing
 * employee data in the database.
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * Get all employees
 * 
 * @route GET /api/employees
 * @description Get all employees
 * @returns {Object[]} An array of employee objects, each containing the employee's id, name, role, clock-in, clock-out, and active status.
 * @throws {500} Server error
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT employee_id, name, role, clock_in, clock_out, active_status FROM Employees');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

/**
 * Update an employee's active status and clock-in time.
 * 
 * @route PUT /api/employees/update-help-employee
 * @description Updates an employee's active status to true and sets clock-in to the current UTC time.
 * @returns {Object} 200 - A success message if the employee was updated.
 * @throws {404} Employee not found.
 * @throws {500} Server error.
 */
router.put('/update-help-employee', async (req, res) => {
    try {

        // SQL query to update the employee's active status and clock_in to current time in UTC
        const result = await pool.query(
            `
            UPDATE Employees 
            SET active_status = $1, 
                clock_in = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago') AT TIME ZONE 'UTC'
            WHERE employee_id = $2
            `,
            [true, 5]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Employee not found' });
        } else {
            res.json({ message: 'Employee updated successfully' });
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Get the status of an employee.
 * 
 * @route GET /api/employees/employee-status
 * @description Retrieve the clock-in time (in UTC) and active status of a specific employee.
 * @returns {Object} 200 - The active_status and clock_in in ISO format.
 * @throws {404} Employee not found.
 * @throws {500} Server error.
 */
router.get('/employee-status', async (req, res) => {
    try {
      // Query to get clock_in and active_status for employee
      const { rows } = await pool.query(
        "SELECT clock_in AT TIME ZONE 'UTC' as clock_in, active_status FROM Employees WHERE employee_id = $1",
        [5]  // Replace 5 with the actual employee_id if necessary
      );
  
      // Check if the employee was found
      if (rows.length === 0) {
        console.log('Employee not found');
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      // Extract clock_in and active_status from the result
      const clockIn = rows[0].clock_in;
      const activeStatus = rows[0].active_status;
  
      // Check if clock_in is valid
      if (!clockIn) {
        console.log('Invalid clock_in value');
        return res.status(500).json({ error: 'Invalid clock_in value' });
      }
  
      // Return active_status and clock_in in ISO format
      return res.json({
        active_status: activeStatus,
        clock_in: clockIn.toISOString()  // Ensure clock_in is returned in ISO format
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
    
  
/**
 * Clear an employee's help status.
 * 
 * @route PUT /api/employees/clear-help
 * @description Deactivates an employee by setting their active_status to false.
 * @returns {Object} 200 - A success message if the employee was deactivated.
 * @throws {404} Employee not found.
 * @throws {500} Server error.
 */
router.put('/clear-help', async (req, res) => {
    try {

        // SQL query to set the active_status to false
        const result = await pool.query(
            `
            UPDATE Employees 
            SET active_status = $1 
            WHERE employee_id = $2
            `,
            [false, 5]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Employee not found' });
        } else {
            res.json({ message: 'Employee deactivated successfully' });
        }
    } catch (error) {
        console.error('Error deactivating employee:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * @route GET /api/employees/get-employee/:id
 * @description Get an employee by their employee_id (PIN)
 * @param {string} id - The employee's ID (PIN)
 * @returns {Object} An employee object containing the name and role of the employee.
 * @throws {404} Employee not found if no employee with the provided ID exists
 * @throws {500} Server error
 */
router.get('/get-employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching employee with ID: ${id}`);
        const result = await pool.query(
            'SELECT name, role, active_status FROM Employees WHERE employee_id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            console.log(`Employee with ID: ${id} not found`);
            res.status(404).json({ error: 'Employee not found' });
        } else {
            console.log(`Employee found: ${JSON.stringify(result.rows[0])}`);
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

/**
 * @route POST /api/employees
 * @description Add a new employee
 * @body {Object} employee - The employee's details to be added
 * @bodyParam {string} name - The name of the employee
 * @bodyParam {string} role - The role of the employee
 * @bodyParam {boolean} active_status - The active status of the employee
 * @returns {Object} The created employee object with employee_id, name, role, and active_status.
 * @throws {500} Server error
 */
router.post('/', async (req, res) => {
    try {
        const { name, role, active_status } = req.body;
        const result = await pool.query(
            'INSERT INTO Employees (name, role, active_status) VALUES ($1, $2, $3) RETURNING *',
            [name, role, active_status]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

/**
 * @route PUT /api/employees/:id
 * @description Update an existing employee's details
 * @param {string} id - The employee's ID (PIN)
 * @body {Object} employee - The employee's updated details
 * @bodyParam {string} name - The updated name of the employee
 * @bodyParam {string} role - The updated role of the employee
 * @bodyParam {boolean} active_status - The updated active status of the employee
 * @returns {Object} The updated employee object with employee_id, name, role, and active_status.
 * @throws {500} Server error
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, active_status } = req.body;
        const result = await pool.query(
            'UPDATE Employees SET name = $1, role = $2, active_status = $3 WHERE employee_id = $4 RETURNING *',
            [name, role, active_status, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

/**
 * @route PUT /api/employees/:id/terminate
 * @description Terminate an employee by setting their active status to NULL
 * @param {string} id - The employee's ID (PIN)
 * @returns {Object} The updated employee object with the active status set to NULL.
 * @throws {500} Server error
 */
router.put('/:id/terminate', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE Employees SET active_status = NULL WHERE employee_id = $1 RETURNING *',
            [id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
