import cashierImg from '../assets/cashier.png';
import menuImg from '../assets/menu.png';
import inventoryImg from '../assets/inventory.png';
import employeesImg from '../assets/employees.png';
import { useNavigate } from 'react-router-dom';

/**
 * The Manager component is responsible for displaying the main manager navigation screen.
 * It allows the manager to navigate between different sections such as Cashier Mode, Menu, Inventory, and Employees.
 * 
 * It also provides a logout button to end the session and redirect the user to the homepage.
 *
 * @component
 * @memberof module:Frontend/Manager
 */
const Manager = () => {

    const navigate = useNavigate();

    const handleInventory = () => {
        navigate('/inventory');
    };

    const handleMenu = () => {
        navigate('/managerMenu');
    };

    const handleEmployees = () => {
        navigate('/employees');
    };

    const handleCashierMode = () => {
        navigate('/cashier');
    };

    const handleLogout = () => {
        // perform any logout actions here
        navigate('/');
    };

    return (
        <div className="bg-gradient-to-r from-red-700 to-red-500 min-h-screen flex items-center justify-center">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Grid Layout for Main Options */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Cashier Mode */}
                    <button
                        onClick={handleCashierMode}
                        className="bg-white p-8 rounded-lg shadow-md transition-colors duration-200 flex flex-col items-center space-y-4"
                    >
                        <img
                            src={cashierImg}
                            alt="Cashier Mode"
                            className="w-32 h-32 rounded-lg object-cover"
                        />
                        <span className="text-xl font-semibold text-gray-800">Cashier Mode</span>
                    </button>

                    {/* Menu */}
                    <button
                        onClick={handleMenu}
                        className="bg-white p-8 rounded-lg shadow-md transition-colors duration-200 flex flex-col items-center space-y-4"
                    >
                        <img
                            src={menuImg}
                            alt="Menu"
                            className="w-32 h-32 rounded-lg object-cover"
                        />
                        <span className="text-xl font-semibold text-gray-800">Menu</span>
                    </button>

                    {/* Inventory */}
                    <button
                        onClick={handleInventory}
                        className="bg-white p-8 rounded-lg shadow-md transition-colors duration-200 flex flex-col items-center space-y-4"
                    >
                        <img
                            src={inventoryImg}
                            alt="Inventory"
                            className="w-32 h-32 rounded-lg object-cover"
                        />
                        <span className="text-xl font-semibold text-gray-800">Inventory</span>
                    </button>

                    {/* Employees */}
                    <button
                        onClick={handleEmployees}
                        className="bg-white p-8 rounded-lg shadow-md transition-colors duration-200 flex flex-col items-center space-y-4"
                    >
                        <img
                            src={employeesImg}
                            alt="Employees"
                            className="w-32 h-32 rounded-lg object-cover"
                        />
                        <span className="text-xl font-semibold text-gray-800">Employees</span>
                    </button>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-white p-4 rounded-lg shadow-md transition-colors duration-200 text-xl font-semibold text-gray-800"
                >
                    LOGOUT
                </button>
            </div>
        </div>
    );
};

export default Manager;
