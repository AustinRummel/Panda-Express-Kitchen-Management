import React, { useState, useEffect } from 'react';

/**
 * @component Modal
 * 
 * A React functional component that renders a modal for editing, updating, or deleting an inventory item. 
 * The modal allows users to update item properties such as quantity, recommended quantity, gameday quantity, 
 * and batch quantity. It also provides functionality for deleting the item or closing the modal without saving changes.
 * 
 * @param {Object} props - The properties passed to the Modal component.
 * @param {Object} props.item - The inventory item to edit. Contains the following fields:
 *   @param {number} props.item.quantity - Current quantity of the item.
 *   @param {number} props.item.recommended_quantity - Recommended quantity of the item.
 *   @param {number} props.item.gameday_quantity - Quantity needed for gameday.
 *   @param {number} props.item.batch_quantity - Batch size for the item.
 *   @param {string} props.item.inventory_type - Type of the inventory (remains unchanged).
 * @param {Function} props.onClose - Callback function to close the modal without saving changes.
 * @param {Function} props.onUpdate - Callback function to handle the update action. Receives the updated item data as a parameter.
 * @param {Function} props.onDelete - Callback function to handle the delete action. Receives the current item as a parameter.
 * @memberof module:Frontend/Inventory
 * @returns {JSX.Element} A modal with form inputs for editing inventory item details and buttons for updating, deleting, or canceling.
 */
const Modal = ({ item, onClose, onUpdate, onDelete }) => {
  const [quantity, setQuantity] = useState(item?.quantity || 0);
  const [recommendedQuantity, setRecommendedQuantity] = useState(item?.recommended_quantity || 0);
  const [gamedayQuantity, setGamedayQuantity] = useState(item?.gameday_quantity || 0);
  const [batchQuantity, setBatchQuantity] = useState(item?.batch_quantity || 0);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setRecommendedQuantity(item.recommended_quantity);
      setGamedayQuantity(item.gameday_quantity);
      setBatchQuantity(item.batch_quantity);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      quantity,
      recommended_quantity: recommendedQuantity,
      gameday_quantity: gamedayQuantity,
      batch_quantity: batchQuantity,
      inventory_type: item.inventory_type, // Assuming this remains unchanged
    };
    onUpdate(updatedData); // Pass updated data back to Inventory component
  };

  const handleDelete = () => {
    onDelete(item);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-1/3 relative">
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-700 transition"
          title="Delete Item"
        >
          🗑️
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Inventory Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Recommended Quantity:</label>
            <input
              type="number"
              value={recommendedQuantity}
              onChange={(e) => setRecommendedQuantity(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Gameday Quantity:</label>
            <input
              type="number"
              value={gamedayQuantity}
              onChange={(e) => setGamedayQuantity(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Batch Quantity:</label>
            <input
              type="number"
              value={batchQuantity}
              onChange={(e) => setBatchQuantity(e.target.value)}
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
