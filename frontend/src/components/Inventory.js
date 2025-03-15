import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UsageGraph from './UsageGraph';
import SalesReport from './SalesReport';
import XReport from './XReport';
import ZReport from './ZReport';
import ExcessReport from './ExcessReport';
import RestockReport from './RestockReport';
import SellsTogether from './SellsTogether';
import ItemPopularity from './ItemPopularity';
import Modal from './Modal';
import InventoryAddModal from './InventoryAddModal';

/**
 * Inventory component that displays and manages inventory items, allows filtering, and shows various reports and trends.
 * 
 * @component
 * @memberof module:Frontend/Inventory
 */
const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filterTypes, setFilterTypes] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All');    
  const [currentTrend, setCurrentTrend] = useState(null);      
  const [error, setError] = useState(null);                     
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);  // state for edit modal
  const [selectedItem, setSelectedItem] = useState(null);       // state for the item being edited
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // state for search term
  const navigate = useNavigate();

  // allows for return to the manager selection screen
  const handleReturn = () => {
    navigate('/manager');
  };

  const handleFilterClick = (filterType) => {
    setCurrentFilter(filterType);
  };

  // handles logic for the various manager trends
  const handleTrendClick = (trend) => {
    setCurrentTrend((prevTrend) => (prevTrend === trend ? null : trend));
    
    if (trend === "Product Usage" && currentTrend !== "Product Usage") {
      setStartDate('2023-10-01');
      setEndDate('2023-11-01');
    }
  };

  const fetchFilterTypes = useCallback(async () => {
    try {
      const response = await fetch('https://pandabackend-six.vercel.app/api/inventory/types');

      if (!response.ok){
          throw new Error('Failed to fetch filter types');
      } 

      const data = await response.json();
      setFilterTypes(['All', ...data, 'Low Stock']); 

    } 
    catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch(`https://pandabackend-six.vercel.app/api/inventory/items?filter=${encodeURIComponent(currentFilter)}`);

      if (!response.ok){
          throw new Error('Failed to fetch inventory items');
      } 

      const data = await response.json();
      setInventoryItems(data);

    } 
    catch (err) {
      setError(err.message);
    }
  }, [currentFilter]);

  useEffect(() => {
    fetchFilterTypes();
  }, [fetchFilterTypes]);

  useEffect(() => {
    fetchInventory();
  }, [currentFilter, fetchInventory]);

  // handle edit functionality
  const handleUpdateItem = async (updatedData) => {
    try {
      const response = await fetch(`https://pandabackend-six.vercel.app/api/inventory/${encodeURIComponent(selectedItem.inventory_name)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update item');
      
      const updatedItem = await response.json();
      setInventoryItems((items) => 
        items.map((invItem) => (invItem.inventory_name === updatedItem.inventory_name ? updatedItem : invItem))
      );
      
      // close modal after update
      setEditModalOpen(false); 

      // clear selected item
      setSelectedItem(null); 

    } 
    catch (err) {
      setError(err.message);
    }
  };

  // handle restock functionality
  const handleRestock = async (item) => {
    try {
      const restockData = { quantity: Number(item.quantity) + Number(item.recommended_quantity) };

      const response = await fetch(`https://pandabackend-six.vercel.app/api/inventory/${encodeURIComponent(item.inventory_name)}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restockData),
      });

      if (!response.ok){
          throw new Error('Failed to restock item');
      }
      
      const updatedItem = await response.json();
      setInventoryItems((items) => 
        items.map((invItem) => (invItem.inventory_name === updatedItem.inventory_name ? updatedItem : invItem))
      );

    } 
    catch (err) {
      setError(err.message);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      const response = await fetch('https://pandabackend-six.vercel.app/api/inventory/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });      
      
      if (!response.ok) throw new Error('Failed to add item');
      
      const newItem = await response.json();
      setInventoryItems((prevItems) => [...prevItems, newItem]);
      setIsAddModalOpen(false); // Close the modal after successful addition
      fetchInventory(); // Refresh inventory after adding
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.inventory_name}?`)) return;
    try {
      const response = await fetch(`https://pandabackend-six.vercel.app/api/inventory/${encodeURIComponent(item.inventory_name)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setInventoryItems((items) => items.filter((invItem) => invItem.inventory_name !== item.inventory_name));
      setEditModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter inventory items based on search term
  const filteredItems = inventoryItems.filter(item =>
    item.inventory_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-700 to-red-500">
        <div className="text-white text-xl">Error loading inventory: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-red-700 to-red-500 p-6">
      {/* Left Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-md mr-6 p-4">
        {/* Return Button */}
        <button
          onClick={handleReturn}
          className="w-full mb-4 bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
        >
          Return to Manager Screen
        </button>

        {/* Filters Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">FILTERS</h2>
          <div className="flex flex-col gap-2">
            {filterTypes.map((filterType, index) => (
              <button
                key={index}
                className={`w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${currentFilter === filterType ? 'bg-red-100 border-red-500' : ''}`}
                onClick={() => handleFilterClick(filterType)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trends Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">TRENDS</h2>
          <div className="flex flex-col gap-2">
            {['Product Usage', 'Sales Report', 'X-Report', 'Z-Report', 
              'Excess Report', 'Restock Report', 'Sells Together', 'Item Popularity'
            ].map((trend) => (
              <button
                key={trend}
                className={`w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${currentTrend === trend ? 'bg-red-100 border-red-500' : ''}`}
                onClick={() => handleTrendClick(trend)}
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-grow p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          {currentTrend === null && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-red-500 px-6 py-2 rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
            >
              Add Item
            </button>
          )}
        </div>

        {/* Conditionally render the Search Bar */}
        {currentTrend === null && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search Inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}
      
        {/* Conditional rendering of the white box */}
        {(currentTrend === "Product Usage" || currentTrend === "Sales Report" || currentTrend === "X-Report" || currentTrend === "Z-Report" || currentTrend === "Excess Report" || currentTrend === "Restock Report" || currentTrend === "Sells Together" || currentTrend === "Item Popularity") ? (
          <div className="mt-4 mb-4 bg-white p-6 rounded-lg shadow-md">
            {(currentTrend === "Product Usage" || currentTrend === "Sales Report" || currentTrend === "X-Report" || currentTrend === "Z-Report") && (
              <button
                onClick={() => setCurrentTrend(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 mb-4"
              >
                Back to Filters
              </button>
            )}
            {currentTrend === "Product Usage" && (
              <>
                <div className="mb-6" style={{ minHeight: '400px' }}>
                  <UsageGraph 
                    inventoryType={currentFilter === 'All' ? '' : currentFilter} 
                    startDate={startDate} 
                    endDate={endDate} 
                  />
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div>
                    <label className="block mb-1">Start Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">End Date:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              </>
            )}
            {currentTrend === "Sales Report" && <SalesReport />}
            {currentTrend === "X-Report" && <XReport />}
            {currentTrend === "Z-Report" && <ZReport />}
            {currentTrend === "Excess Report" && (
              <ExcessReport
                startDate={startDate}
                endDate={endDate}
                inventoryType={currentFilter === 'All' ? '' : currentFilter}
              />
            )}
            {currentTrend === "Restock Report" && (
              <RestockReport
                inventoryItems={inventoryItems}
                onRestock={handleRestock}
              />
            )}
            {currentTrend === "Sells Together" && <SellsTogether />}
            {currentTrend === "Item Popularity" && <ItemPopularity />}
          </div>
        ) : (
          // Display inventory items grid when no white box is shown
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {filteredItems.map((item) => (
              <div key={item.inventory_id || item.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.inventory_name
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </h3>
                <div className="mt-2 text-gray-600">
                  <p>Type: {item.inventory_type}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Threshold: {item.recommended_quantity || 'N/A'}</p>
                  <p>Gameday: {item.gameday_quantity}</p>
                  <p>Batch: {item.batch_quantity}</p>
                  {item.last_updated && (
                    <p>Last Updated: {new Date(item.last_updated).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setEditModalOpen(true);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRestock(item)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          item={selectedItem}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
        />
      )}

      <InventoryAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default Inventory;
