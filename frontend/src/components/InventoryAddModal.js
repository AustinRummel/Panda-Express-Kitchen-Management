/**
 * @module Frontend/Inventory
 */
import React, { useState } from 'react';

/**
 * A modal component for adding a new inventory item.
 * Allows the user to input the item's details, including its name, type, and quantities.
 * The form data is passed back to the parent component via the `onSubmit` callback when submitted.
 * The modal is displayed or hidden based on the `isOpen` prop.
 * 
 * @component
 *
 * @param {boolean} isOpen - Determines if the modal is open or closed.
 * @param {function} onClose - Function to be called when the modal is closed.
 * @param {function} onSubmit - Function to be called with the form data when the form is submitted.
 * @memberof module:Frontend/Inventory
 */
const InventoryAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    inventory_name: '',
    inventory_type: 'protein',
    quantity: 0,
    recommended_quantity: 0,
    gameday_quantity: 0,
    batch_quantity: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form data
    setFormData({
      inventory_name: '',
      inventory_type: 'protein',
      quantity: 0,
      recommended_quantity: 0,
      gameday_quantity: 0,
      batch_quantity: 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Add An Inventory Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Name:</label>
            <input
              type="text"
              value={formData.inventory_name}
              onChange={(e) => setFormData({ ...formData, inventory_name: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Type:</label>
            <select
              value={formData.inventory_type}
              onChange={(e) => setFormData({ ...formData, inventory_type: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            >
              <option value="protein">Protein</option>
              <option value="sides">Sides</option>
              <option value="sauces">Sauces</option>
              <option value="produce">Produce</option>
              <option value="other">Other</option>
              <option value="consumables">Consumables</option>
              <option value="supplies">Supplies</option>
              <option value="drinks">Drinks</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Quantity:</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Threshold:</label>
            <input
              type="number"
              value={formData.recommended_quantity}
              onChange={(e) => setFormData({ ...formData, recommended_quantity: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Gameday:</label>
            <input
              type="number"
              value={formData.gameday_quantity}
              onChange={(e) => setFormData({ ...formData, gameday_quantity: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Batch:</label>
            <input
              type="number"
              value={formData.batch_quantity}
              onChange={(e) => setFormData({ ...formData, batch_quantity: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryAddModal;
