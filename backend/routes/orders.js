/**
 * @module Backend/Orders
 * @description Routes for managing orders and payments.
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @route GET /current
 * @description Retrieves all current orders for the day along with their associated items.
 * @returns {Array<Object>} An array of orders with their respective items.
 */
router.get('/current', async (req, res) => {
    try {
        const ordersResult = await pool.query(
            "SELECT * FROM orders WHERE DATE(time_stamp AT TIME ZONE 'America/Chicago') = CURRENT_DATE AND name = 'Kiosk'"
        );

        const orders = ordersResult.rows;

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const detailsResult = await pool.query(
            "SELECT product_name, quantity, price FROM order_details WHERE order_id = $1",
                [order.order_id]
            );

            const items = detailsResult.rows.map(item => {
                const prefixMap = {
                    'M': 'Medium',
                    'N': 'Normal', 
                    'K': 'Kid',
                    'F': 'Family',
                    'L': 'Large',
                    'S': 'Small'
                };

                const parts = item.product_name.split('_');
                let prefix = parts[0];
                if (prefixMap[prefix]) {
                    parts[0] = prefixMap[prefix];
                }
                const adjustedProductName = parts.join(' ');

                return {
                    product_name: adjustedProductName,
                    quantity: item.quantity,
                    price: item.price
                };
            });

            return {
                ...order,
                items: items
            };
        }));

        res.json(ordersWithItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route POST /pay
 * @description Processes a payment for an order, including updating inventory quantities and adding order details.
 * @param {Object} req.body
 * @returns {Object} A response object
 */
router.post('/pay', async (req, res) => {
    const client = await pool.connect();
    try {
        const { items, employeeName } = req.body;
        await client.query('BEGIN');

        let order_id;
        let isUnique = false;

        while (!isUnique) {
          order_id = Math.floor(100000 + Math.random() * 900000);
          const result = await client.query('SELECT order_id FROM orders WHERE order_id = $1', [order_id]);

          if (result.rows.length === 0) {
            isUnique = true;
          }
        }

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const formattedTotal = parseFloat(total.toFixed(2));

        await client.query(
          'INSERT INTO orders (order_id, name, total, time_stamp) VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE \'America/Chicago\')',
          [order_id, employeeName, formattedTotal]
        );

        for (const item of items) {
            let price = parseFloat(item.price);
            if (isNaN(price)) {
                price = formattedTotal;
            }
            const formattedPrice = parseFloat(price.toFixed(2));
            await client.query(
                'INSERT INTO order_details (order_id, product_name, quantity, price) VALUES ($1, $2, $3, $4)',
                [order_id, item.name, item.quantity, formattedPrice]
            );

            const ingredientResults = await client.query(
                'SELECT inventory_name, inventory_quantity FROM ingredients WHERE product_name = $1',
                [item.name]
            );

            for (const ingredient of ingredientResults.rows) {
                const inventoryResult = await client.query(
                    'SELECT inventory_type, batch_quantity, quantity FROM inventory WHERE inventory_name = $1',
                    [ingredient.inventory_name]
                );

                if (inventoryResult.rows.length > 0) {
                    const { inventory_type, batch_quantity, quantity } = inventoryResult.rows[0];
                    let convertedValue = 0;

                    switch (inventory_type) {
                        case 'protein':
                        case 'sides':
                        case 'produce':
                        case 'other':
                            convertedValue = ingredient.inventory_quantity * 0.0625 * item.quantity;
                            break;
                        case 'sauces':
                            convertedValue = ingredient.inventory_quantity * 0.0078125 * item.quantity;
                            break;
                        case 'consumables':
                        case 'supplies':
                        case 'drinks':
                            convertedValue = ingredient.inventory_quantity * item.quantity;
                            break;
                        default:
                            throw new Error(`Unknown inventory type: ${inventory_type}`);
                    }

                    let newQuantity = quantity - convertedValue;

                    if (convertedValue >= batch_quantity) {
                        while (convertedValue >= batch_quantity) {
                            newQuantity -= batch_quantity;
                            convertedValue -= batch_quantity;
                        }
                    }

                    await client.query(
                        'UPDATE inventory SET quantity = $1 WHERE inventory_name = $2',
                        [newQuantity, ingredient.inventory_name]
                    );
                }
            }
        }
        const constants = ['bags', 'napkins', 'flatware', 'fortune_cookies'];
        for (const constant of constants) {
            await client.query(
                'UPDATE inventory SET quantity = quantity - 1 WHERE inventory_name = $1',
                [constant]
            );
        }
        await client.query('COMMIT');
        res.json({ message: 'Payment processed successfully', order_id });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    } finally {
      client.release();
    }
});

module.exports = router;  
