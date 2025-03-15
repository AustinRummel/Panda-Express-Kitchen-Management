/**
 * @module Backend/Menu
 * @description Express router for menu-related operations.
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

/**
 * Get all menu items.
 * @route GET /
 * @returns {Object[]} 200 - Array of all menu items.
 * @returns {Error} 500 - Server error.
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Add a new menu item.
 * @route POST /
 * @param {string} req.body.product_name - Name of the product.
 * @param {number} req.body.price - Price of the product.
 * @param {string} req.body.type - Type of the product (e.g., entree, side).
 * @param {number} req.body.calories - Calories of the product.
 * @returns {Object} 200 - The newly created menu item.
 * @returns {Error} 500 - Server error.
 */
router.post('/', async (req, res) => {
    try {
        const { product_name, price, type, calories } = req.body;
        const result = await pool.query(
            'INSERT INTO menu (product_name, price, type, calories) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_name, price, type, calories]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Update a menu item.
 * @route PUT /:product_name
 * @param {string} req.params.product_name - Name of the product to update.
 * @param {number} req.body.price - New price of the product.
 * @param {number} req.body.calories - New calorie value of the product.
 * @returns {Object} 200 - The updated menu item.
 * @returns {Error} 500 - Server error.
 */
router.put('/:product_name', async (req, res) => {
    try {
        const { product_name } = req.params;
        const { price, calories } = req.body;
        const result = await pool.query(
            'UPDATE menu SET price = $1, calories = $2 WHERE product_name = $3 RETURNING *',
            [price, calories, product_name]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Delete a menu item.
 * @route DELETE /:product_name
 * @param {string} req.params.product_name - Name of the product to delete.
 * @returns {void} 204 - No content.
 * @returns {Error} 500 - Server error.
 */
router.delete('/:product_name', async (req, res) => {
    try {
        const { product_name } = req.params;
        await pool.query('DELETE FROM menu WHERE product_name = $1', [product_name]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).send('Server Error');
    }
});

/**
 * Get menu items categorized into sections.
 * @route GET /items
 * @returns {Object} 200 - Categorized menu items.
 * @returns {Error} 500 - Server error.
 */
router.get('/items', async (req, res) => {
  try {
      const result = await pool.query(`
            SELECT product_name, price, type 
            FROM menu 
            ORDER BY 
                CASE 
                    WHEN product_name LIKE '%bourbon_chicken%' THEN 1
                    WHEN product_name LIKE '%orange_chicken%' THEN 2
                    WHEN product_name LIKE '%sweetfire%' THEN 3
                    WHEN product_name LIKE '%walnut%' THEN 4
                    WHEN product_name LIKE '%kung%' THEN 5
                    WHEN product_name LIKE '%pepper_steak%' THEN 6
                    WHEN product_name LIKE '%beef%' THEN 7
                    WHEN product_name LIKE '%chow_mein%' THEN 8
                    WHEN product_name LIKE '%fried_rice%' THEN 9
                    WHEN product_name LIKE '%white_rice%' THEN 10
                    WHEN product_name LIKE '%egg%' THEN 11
                    WHEN product_name LIKE '%cc%' THEN 12
                    WHEN product_name LIKE '%spring%' THEN 13
                    WHEN product_name LIKE '%apple%' THEN 14
                    ELSE 15
                END
        `);
      const menuItems = {
        entrees: [],
        sides: [],
        extras: [],
        drinks: [],
        priced_items: [],
      };
  
      result.rows.forEach((item) => {
        const { product_name, price, type } = item;

        if (price > 0){
            menuItems.priced_items.push({ name: product_name, price });
        }
        
        if (product_name.startsWith('L_')) {
          const itemName = product_name.substring(2);
  
          if (type === "entree") {
            menuItems.entrees.push(itemName);
          } else if (type === "side") {
            menuItems.sides.push(itemName);
          } else if (type === "appetizer") {
            menuItems.extras.push(itemName);
          }
        }
        if (!product_name.startsWith('S_') && !product_name.startsWith('M_')) {
          const itemName = product_name.substring(2);
  
          if (type === "drink") {
            menuItems.drinks.push(itemName);
          }
        }
      });
      console.log(menuItems.priced_items);
      res.json(menuItems);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      res.status(500).send("Server error");
    }
});

// Collect menu items into filtered sections
router.get('/items-menu', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT product_name, price, type, calories 
            FROM menu 
            ORDER BY 
                CASE 
                    WHEN product_name LIKE '%bourbon_chicken%' THEN 1
                    WHEN product_name LIKE '%orange_chicken%' THEN 2
                    WHEN product_name LIKE '%sweetfire%' THEN 3
                    WHEN product_name LIKE '%walnut%' THEN 4
                    WHEN product_name LIKE '%kung%' THEN 5
                    WHEN product_name LIKE '%pepper_steak%' THEN 6
                    WHEN product_name LIKE '%beef%' THEN 7
                    WHEN product_name LIKE '%chow_mein%' THEN 8
                    WHEN product_name LIKE '%fried_rice%' THEN 9
                    WHEN product_name LIKE '%white_rice%' THEN 10
                    WHEN product_name LIKE '%egg%' THEN 11
                    WHEN product_name LIKE '%cc%' THEN 12
                    WHEN product_name LIKE '%spring%' THEN 13
                    WHEN product_name LIKE '%apple%' THEN 14
                    ELSE 15
                END
        `);
        const menuItems = {
          entrees: [],
          sides: [],
          extras: [],
          drinks: [],
          priced_items: [],
        };
    
        result.rows.forEach((item) => {
          const { product_name, price, type, calories } = item;
  
          if (price > 0){
              menuItems.priced_items.push({ name: product_name, price: price });
          }
          
          if (product_name.startsWith('L_')) {
            const itemName = product_name.substring(2);
    
            if (type === "entree") {
              menuItems.entrees.push({name: itemName, calories: calories});
            } else if (type === "side") {
              menuItems.sides.push({name: itemName, calories: calories});
            } else if (type === "appetizer") {
              menuItems.extras.push({name: itemName, calories: calories});
            }
          }
          if (!product_name.startsWith('S_') && !product_name.startsWith('M_')) {
            const itemName = product_name.substring(2);
    
            if (type === "drink") {
              menuItems.drinks.push({name: itemName, calories: calories});
            }
          }
        });
        console.log(menuItems.priced_items);
        res.json(menuItems);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        res.status(500).send("Server error");
      }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/menu-pics'));
  },
  filename: (req, file, cb) => {
    const itemName = req.body.itemName;
    cb(null, `${itemName}.png`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  res.status(200).send('Image uploaded successfully');
});

// Serve static files from the 'assets/menu-pics' directory
router.use('/assets/menu-pics', express.static(path.join(__dirname, '../assets/menu-pics')));

module.exports = router;
