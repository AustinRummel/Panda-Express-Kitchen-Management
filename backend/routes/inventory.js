/**
 * @module Backend/Inventory
 * @description API routes for managing inventory operations.
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * Add a new inventory item.
 * @route POST /api/inventory
 * @param {Object} req.body - The inventory item details.
 * @param {string} req.body.inventory_name - Name of the inventory item.
 * @param {string} req.body.inventory_type - Type/category of the inventory item.
 * @param {number} req.body.quantity - Current quantity of the inventory item.
 * @param {number} req.body.recommended_quantity - Recommended stock quantity.
 * @param {number} req.body.gameday_quantity - Quantity needed for game day.
 * @param {number} req.body.batch_quantity - Quantity per batch.
 * @returns {Object} 201 - The newly created inventory item.
 */
router.post('/', async (req, res) => {
    try {
        const { inventory_name, inventory_type, quantity, recommended_quantity, gameday_quantity, batch_quantity } = req.body;
        const result = await pool.query(
            'INSERT INTO inventory (inventory_name, inventory_type, quantity, recommended_quantity, gameday_quantity, batch_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [inventory_name, inventory_type, quantity, recommended_quantity, gameday_quantity, batch_quantity]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Delete an inventory item by name.
 * @route DELETE /api/inventory/:inventory_name
 * @param {string} req.params.inventory_name - The name of the inventory item to delete.
 * @returns {204} 204 - No content.
 */
router.delete('/:inventory_name', async (req, res) => {
    try {
        const { inventory_name } = req.params;
        await pool.query('DELETE FROM inventory WHERE inventory_name = $1', [inventory_name]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Get distinct inventory types.
 * @route GET /api/inventory/types
 * @returns {string[]} 200 - List of distinct inventory types.
 */
router.get('/types', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT inventory_type FROM inventory');
        res.json(result.rows.map(row => row.inventory_type));
    } catch (error) {
        console.error('Error fetching inventory types:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Get inventory items based on a filter.
 * @route GET /api/inventory/items
 * @param {string} [req.query.filter] - Filter criteria (e.g., "Low Stock", "Type").
 * @returns {Object[]} 200 - List of inventory items matching the filter.
 */
router.get('/items', async (req, res) => {
    try {
        const filter = req.query.filter; 
        let query = 'SELECT * FROM inventory';
        const params = [];

        if (filter && filter !== 'All') {
            if (filter === 'Low Stock') {
                query += ' WHERE quantity <= recommended_quantity';
            } else {
                query += ' WHERE inventory_type = $1';
                params.push(filter);
            }
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Calculate product usage for a specific inventory type and date range.
 * @route GET /api/inventory/usage
 * @param {string} req.query.type - The inventory type to calculate usage for.
 * @param {string} req.query.start - The start date (ISO format).
 * @param {string} req.query.end - The end date (ISO format).
 * @returns {Object[]} 200 - List of inventory usage data.
 */
router.get('/usage', async (req, res) => {
    const { type, start, end } = req.query;

    if (!type || !start || !end) {
        return res.status(400).send('Missing required query parameters: type, start, end');
    }

    const query = `
      SELECT i.inventory_name, SUM(od.quantity * ing.inventory_quantity) AS total_used 
      FROM order_details od 
      JOIN orders o ON od.order_id = o.order_id 
      JOIN ingredients ing ON od.product_name = ing.product_name 
      JOIN inventory i ON ing.inventory_name = i.inventory_name 
      WHERE i.inventory_type = $1 
        AND o.time_stamp BETWEEN $2 AND $3 
      GROUP BY i.inventory_name 
      ORDER BY total_used DESC;
    `;

    try {
        const result = await pool.query(query, [type, start, end]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching usage data:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Get an inventory item by name.
 * @route GET /api/inventory/:inventory_name
 * @param {string} req.params.inventory_name - The name of the inventory item.
 * @returns {Object} 200 - The inventory item details.
 */
router.get('/:inventory_name', async (req, res) => {
    try {
        const { inventory_name } = req.params;
        const result = await pool.query(
            'SELECT * FROM inventory WHERE inventory_name = $1',
            [inventory_name]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Inventory item not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Update an inventory item.
 * @route PUT /api/inventory/:name
 * @param {string} req.params.name - The name of the inventory item to update.
 * @param {Object} req.body - The updated inventory details.
 * @param {number} req.body.quantity - Updated quantity.
 * @param {number} req.body.recommended_quantity - Updated recommended quantity.
 * @param {number} req.body.gameday_quantity - Updated game day quantity.
 * @param {number} req.body.batch_quantity - Updated batch quantity.
 * @returns {Object} 200 - The updated inventory item.
 */
router.put('/:name', async (req, res) => {
    const { name } = req.params;
    const { quantity, recommended_quantity, gameday_quantity, batch_quantity, inventory_type } = req.body;

    try {
        const result = await pool.query(
            'UPDATE inventory SET quantity = $1, recommended_quantity = $2, gameday_quantity = $3, batch_quantity = $4 WHERE inventory_name = $5 RETURNING *', 
            [quantity, recommended_quantity, gameday_quantity, batch_quantity, name]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

/**
 * Restock an inventory item.
 * @route POST /api/inventory/:inventory_name/restock
 * @param {string} req.params.inventory_name - The name of the inventory item.
 * @param {number} req.body.quantity - The new stock quantity.
 * @returns {Object} 200 - The updated inventory item.
 */
router.post('/:inventory_name/restock', async (req, res) => {
    try {
        const { inventory_name } = req.params;
        const { quantity } = req.body;
        
        const result = await pool.query(
            `UPDATE inventory 
             SET quantity = $1
             WHERE inventory_name = $2
             RETURNING *`,
            [quantity, inventory_name]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 
