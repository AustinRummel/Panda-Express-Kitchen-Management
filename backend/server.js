const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./config/db');

// Import routes
const employeesRouter = require('./routes/employees');
const inventoryRouter = require('./routes/inventory');
const menuRouter = require('./routes/menu');
const reportsRouter = require('./routes/reports');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5001;

const corsOptions = {
    origin: [
        'http://localhost:3000', 
        'https://panda-pos-ten.vercel.app', 
        'https://panda-pos-hdav3228-cowboys-44.vercel.app'
    ],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Serve static files from the 'assets/menu-pics' directory
app.use('/assets/menu-pics', express.static(path.join(__dirname, 'assets/menu-pics')));

// Home route
app.get('/', (req, res) => {
    res.send('Hello, Backend is working!');
});

// Use routers
app.use('/api/employees', employeesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/menu', menuRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/orders', ordersRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});