/**
 * @module Backend/Reports
 * @description Provides routes for generating and fetching various reports.
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * Fetches the last Z-Report timestamp.
 * @route GET /last-z-report
 * @returns {Object} 200 - The last Z-Report timestamp or a default value.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/last-z-report', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT clock_out AT TIME ZONE 'UTC' as clock_out FROM Employees WHERE name = 'Z_Report'"
        );
        
        if (result.rows.length === 0) {
            return res.json({ lastZReportTime: '2024-01-01 00:00:00' });
        }

        const lastZReportTime = result.rows[0]?.clock_out
            ? result.rows[0].clock_out.toISOString().slice(0, 19).replace('T', ' ')
            : '2024-01-01 00:00:00';

        res.json({ lastZReportTime });
    } catch (error) {
        console.error('Error fetching last Z-Report time:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Generates an X-Report based on sales data after the last Z-Report.
 * @route GET /x-report
 * @returns {Array} 200 - The sales data grouped by day and hour.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/x-report', async (req, res) => {
    try {
        const zResult = await pool.query(
            "SELECT clock_out FROM Employees WHERE name = 'Z_Report'"
        );
        const lastZReportTime = zResult.rows[0]?.clock_out || '2024-01-01 00:00:00';

        const query = `
            WITH daily_sales AS (
                SELECT 
                    DATE(time_stamp) AS sale_date,
                    DATE_TRUNC('hour', time_stamp) AS hour,
                    SUM(total) AS total_sales,
                    COUNT(*) AS order_count
                FROM orders 
                WHERE time_stamp > $1
                GROUP BY DATE(time_stamp), DATE_TRUNC('hour', time_stamp)
                ORDER BY sale_date, hour
            )
            SELECT 
                TO_CHAR(sale_date, 'YYYY-MM-DD') AS date,
                TO_CHAR(hour, 'HH12:MI AM') AS time_period,
                ROUND(total_sales::NUMERIC, 2) AS total_sales,
                order_count
            FROM daily_sales;
        `;

        const result = await pool.query(query, [lastZReportTime]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error generating X-Report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Creates a new Z-Report summarizing sales data since the last Z-Report.
 * @route POST /z-report
 * @returns {Object} 200 - A summary of the Z-Report.
 * @returns {Error} 500 - Internal server error.
 */
router.post('/z-report', async (req, res) => {
    try {
        const result = await pool.query(`
            WITH daily_sales AS (
                SELECT 
                    SUM(total) AS total_sales,
                    COUNT(*) AS total_orders
                FROM orders 
                WHERE time_stamp > (
                    SELECT clock_out 
                    FROM Employees 
                    WHERE name = 'Z_Report'
                    ORDER BY clock_out DESC 
                    LIMIT 1
                )
            )
            SELECT 
                total_sales::NUMERIC(10,2) AS total_sales,
                total_orders
            FROM daily_sales;
        `);

        res.json({
            message: 'Z-Report created successfully',
            summary: result.rows[0] || { total_sales: 0, total_orders: 0 }
        });
    } catch (error) {
        console.error('Error creating Z-Report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Updates the timestamp of the last Z-Report.
 * @route POST /update-last-z-report
 * @returns {Object} 200 - Success message.
 * @returns {Error} 500 - Internal server error.
 */
router.post('/update-last-z-report', async (req, res) => {
    try {
        await pool.query(`
            UPDATE Employees 
            SET clock_out = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')
            WHERE name = 'Z_Report'
        `);
        res.status(200).json({ message: 'Last run time updated successfully' });
    } catch (error) {
        console.error('Error updating last Z-Report time:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Fetches sales data for a specific date range.
 * @route GET /sales
 * @query {string} start - Start date in ISO format.
 * @query {string} end - End date in ISO format.
 * @returns {Array} 200 - List of products and their total sales in the specified date range.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/sales', async (req, res) => {
    const { start, end } = req.query;

    const query = `
        SELECT od.product_name, SUM(od.quantity * od.price) AS total_sales
        FROM order_details od
        JOIN orders o ON od.order_id = o.order_id
        WHERE o.time_stamp BETWEEN $1 AND $2
        GROUP BY od.product_name
        ORDER BY total_sales DESC;
    `;

    try {
        const result = await pool.query(query, [start, end]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

/**
 * Fetches an excess inventory report.
 * @route GET /excess
 * @query {string} timestamp - The starting timestamp to calculate excess inventory.
 * @returns {Array} 200 - List of items with excess inventory.
 * @returns {Error} 400 - Missing query parameter.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/excess', async (req, res) => {
    const { timestamp } = req.query;

    if (!timestamp) {
        return res.status(400).send('Missing required query parameter: timestamp');
    }

    const query = `
        SELECT 
            i.inventory_name,
            i.quantity AS total_quantity,
            COALESCE(SUM(od.quantity * ing.inventory_quantity), 0) AS total_sold,
            ROUND((COALESCE(SUM(od.quantity * ing.inventory_quantity), 0) / i.quantity::numeric) * 100, 2) AS sold_percentage
        FROM inventory i
        LEFT JOIN ingredients ing ON i.inventory_name = ing.inventory_name
        LEFT JOIN order_details od ON ing.product_name = od.product_name
        LEFT JOIN orders o ON od.order_id = o.order_id
        WHERE o.time_stamp >= $1 AND o.time_stamp <= CURRENT_TIMESTAMP AT TIME ZONE \'America/Chicago\'
        GROUP BY i.inventory_name, i.quantity
        HAVING (COALESCE(SUM(od.quantity * ing.inventory_quantity), 0) / i.quantity::numeric) < 0.1
        ORDER BY sold_percentage ASC;
    `;

    try {
        const result = await pool.query(query, [timestamp]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching excess report:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

/**
 * Fetches a restock report for items below the recommended quantity.
 * @route GET /restock
 * @returns {Array} 200 - List of items that need restocking.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/restock', async (req, res) => {
    const query = `
        SELECT inventory_name, quantity, recommended_quantity
        FROM inventory
        WHERE quantity < recommended_quantity;
    `;

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching restock report:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

/**
 * Fetches a report of items that are frequently sold together.
 * @route GET /together
 * @query {string} start - Start date in ISO format.
 * @query {string} end - End date in ISO format.
 * @query {string} [order=desc] - Sorting order for the result ('asc' or 'desc').
 * @returns {Array} 200 - List of product pairs sold together and their count.
 * @returns {Error} 400 - Missing query parameters.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/together', async (req, res) => {
    const { start, end, order = 'desc' } = req.query; // Default to descending order

    if (!start || !end) {
        return res.status(400).send('Missing required query parameters: start, end');
    }

    // Sanitize and validate the order parameter
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const query = `
        SELECT 
            od1.product_name AS product_1,
            od2.product_name AS product_2,
            COUNT(*) AS sold_together_count
        FROM order_details od1
        JOIN order_details od2 ON od1.order_id = od2.order_id
        WHERE od1.product_name < od2.product_name
          AND EXISTS (
              SELECT 1
              FROM orders o
              WHERE o.order_id = od1.order_id
                AND o.time_stamp BETWEEN $1 AND $2
          )
        GROUP BY od1.product_name, od2.product_name
        ORDER BY sold_together_count ${sortOrder};
    `;

    try {
        const result = await pool.query(query, [start, end]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching what sells together report:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

/**
 * Fetches the popularity report of menu items within a specified date range.
 * @route GET /menu-items-popularity
 * @query {string} start - Start date in ISO format.
 * @query {string} end - End date in ISO format.
 * @query {number} [limit=10] - Number of top menu items to include in the report (default: 10).
 * @returns {Array} 200 - List of menu items with their total sales count, sorted by popularity.
 * @returns {Error} 400 - Missing or invalid query parameters.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/menu-items-popularity', async (req, res) => {
    const { start, end, limit = 10 } = req.query;

    if (!start || !end) {
        return res.status(400).send('Missing required query parameters: start, end');
    }

    const itemLimit = parseInt(limit, 10);
    if (isNaN(itemLimit) || itemLimit <= 0) {
        return res.status(400).send('Invalid limit parameter. Must be a positive integer.');
    }

    const query = `
        SELECT 
            od.product_name AS menu_item,
            COUNT(*) AS total_sales
        FROM order_details od
        JOIN orders o ON od.order_id = o.order_id
        WHERE o.time_stamp BETWEEN $1 AND $2
        GROUP BY od.product_name
        ORDER BY total_sales DESC
        LIMIT $3;
    `;

    try {
        const result = await pool.query(query, [start, end, itemLimit]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching menu items popularity:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

module.exports = router; 
