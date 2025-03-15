/**
 * @module Frontend/Manager
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component responsible for building the form for adding or editing menu items.
 * Allows input for name, type, prices, and calories for a menu item.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {Object} [props.item] - The item to edit, if any.
 * @param {Function} props.onSubmit - Function to call when the form is submitted.
 * @param {Function} props.onCancel - Function to call when the form is canceled.
 * 
 * @memberof module:Frontend/Manager
 */
const MenuItemForm = ({ item, onSubmit, onCancel }) => {
  const sizes = ['S', 'M', 'L', 'K', 'N', 'F'];
  const [formData, setFormData] = useState({
    name: item?.name || '',
    type: item?.type || 'entree',
    prices: item?.prices || sizes.reduce((acc, size) => ({ ...acc, [size]: '0.00' }), {}),
    calories: item?.calories || '0'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!item && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="entree">Entree</option>
              <option value="side">Side</option>
              <option value="drink">Drink</option>
              <option value="appetizer">Appetizer</option>
            </select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Prices</label>
        {sizes.map((size) => (
          <div key={size} className="flex items-center space-x-2">
            <label className="w-20 text-sm text-gray-600">Size {size}:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.prices[size]}
              onChange={(e) => setFormData({
                ...formData,
                prices: { ...formData.prices, [size]: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Calories</label>
        <input
          type="number"
          value={formData.calories}
          onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          {item ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const getImage = (name) => {
  try {
    return require(`../assets/menu-pics/${name}.png`);
  } catch (err) {
    return require(`../assets/menu-pics/chef_special.png`);
  }
};

const ManagerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filters = ['All Items', 'Entrees', 'Sides', 'Drinks', 'Appetizers'];

  const sizeLabels = {
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    K: 'Kids',
    N: 'Normal',
    F: 'Family',
  };

  const handleReturn = () => {
    navigate('/manager');
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const toTitleCase = (str) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch('https://pandabackend-six.vercel.app/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      
      // group items by base name
      const groupedItems = data.reduce((acc, item) => {

        // remove size prefix (N_, S_, ...)
        const baseName = item.product_name.substring(2); 
        
        if (!acc[baseName]) acc[baseName] = { items: [] };
        acc[baseName].items.push(item);
        return acc;
      }, {});

      const processedItems = Object.entries(groupedItems).map(([baseName, group]) => ({
        name: toTitleCase(baseName),
        type: group.items[0].type,
        calories: group.items[0].calories,
        prices: group.items.reduce((acc, item) => ({
          ...acc,
          [item.product_name[0]]: item.price
        }), {})
      }));

      if (currentFilter && currentFilter !== 'All Items') {
        const filterType = currentFilter.slice(0, -1).toLowerCase();
        setMenuItems(processedItems.filter(item => item.type === filterType));
      } 
      else {
        setMenuItems(processedItems);
      }
    } 
    catch (err) {
      setError(err.message);
    }
  }, [currentFilter]);

  const handleAddItem = async (formData) => {
    try {
        const items = Object.entries(formData.prices).map(([size, price]) => ({
            product_name: `${size}_${formData.name.toLowerCase().replace(/\s+/g, '_')}`,
            price: parseFloat(price) || 0,
            type: formData.type,
            calories: parseInt(formData.calories, 10)
        }));

        for (const item of items) {
            const response = await fetch('https://pandabackend-six.vercel.app/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                throw new Error(`Failed to add item ${item.product_name}`);
            }
        }

        setIsAddModalOpen(false);
        showSuccess('Menu item added successfully!');
        fetchMenuItems();
    } catch (err) {
        setError(err.message);
        console.error('Error adding item:', err);
    }
  };

  const handleEditItem = async (formData) => {
    try {
      const items = Object.entries(formData.prices).map(([size, price]) => {
        const item = {
          product_name: `${size}_${formData.name.toLowerCase().replace(/\s+/g, '_')}`,
          price: parseFloat(price),
          type: formData.type,
          calories: parseInt(formData.calories, 10)
        };
        return item;
      });

      for (const item of items) {
        await fetch(`https://pandabackend-six.vercel.app/api/menu/${item.product_name}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }

      setEditingItem(null);
      showSuccess('Menu item updated successfully!');
      fetchMenuItems();
    } 
    catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const sizes = ['S', 'M', 'L', 'K', 'N', 'F'];
      const baseName = item.name.toLowerCase().replace(/\s+/g, '_');
      for (const size of sizes) {
        const productName = `${size}_${baseName}`;
        const response = await fetch(`https://pandabackend-six.vercel.app/api/menu/${productName}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete ${productName}`);
        }
      }

      showSuccess('Menu item deleted successfully!');
      fetchMenuItems();
    } 
    catch (err) {
      setError(err.message);
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchMenuItems();
  }, [currentFilter, fetchMenuItems]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-700 to-red-500">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-red-700 to-red-500 p-6">
      {/* Left Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-md mr-6 p-4">
        <button
          onClick={handleReturn}
          className="w-full mb-4 bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
        >
          Return to Manager Screen
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">FILTERS</h2>
          <div className="flex flex-col gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
                  currentFilter === filter ? 'bg-red-100 border-red-500' : ''
                }`}
                onClick={() => setCurrentFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Menu Items</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-red-500 px-6 py-2 rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
          >
            Add Item
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search Menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <div key={item.name} className="bg-white rounded-lg shadow-md p-6">

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {item.name.replace(/_/g, ' ')}
                  </h3>
                </div>
              </div>

              <div className="flex justify-between items-center space-x-4">
                <div className="space-y-1">
                  {Object.entries(item.prices).map(([size, price]) => (
                    <p key={size} className="text-gray-600">
                      {sizeLabels[size] || `Size ${size}`}: ${price ? Number(price).toFixed(2) : '0.00'}
                    </p>
                  ))}
                  <p className="text-gray-600">
                    Calories: {item.calories}
                  </p>
                </div>
                <img
                  src={getImage(item.name.toLowerCase().replace(/\s+/g, '_'))}
                  alt={item.name}
                  className="w-40 h-40 object-contain rounded-md"
                />
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => setEditingItem(item)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="bg-white text-red-500 px-4 py-2 rounded-lg border border-red-500 transition-colors duration-200 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Menu Item"
      >
        <MenuItemForm
          onSubmit={handleAddItem}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Menu Item"
      >
        {editingItem && (
          <MenuItemForm
            item={editingItem}
            onSubmit={handleEditItem}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManagerMenu;
