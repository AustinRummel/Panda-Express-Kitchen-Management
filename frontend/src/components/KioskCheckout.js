import React, { useMemo, useEffect, useState } from 'react';
import menuData from "./menuData";
import e from 'cors';
import SizeSelectionModal from "./Size";
import CustomModal from './CustomModal';

/**
 * KioskCheckout component for displaying and managing the order items in a kiosk checkout interface.
 * It allows adding/removing items, updating quantities, displaying prices, and processing payments.
 * 
 * @param {Object} props - Component properties.
 * @param {Array} props.orderItems - Array of items added to the order.
 * @param {Function} props.setOrderItems - Function to update the order items.
 * @memberof module:Frontend/Kiosk
 * @returns {JSX.Element} - The rendered checkout component.
 */
const KioskCheckout = ({ orderItems, setOrderItems, onPaymentComplete }) => {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);

  useEffect(() => {
    const fetchSidebarItems = async () => {
      await menuData.initialize(); // Ensure menuData is populated
      const items = Object.values(menuData)
        .flatMap((categoryItems) => 
          Array.isArray(categoryItems) ? categoryItems.filter((item) => item.category === 'appetizer' || item.category === 'drink') : []
        )
        .map((item) => {
          if (!item || !item.name || !item.sizes) {
            console.warn('Invalid item detected:', item);
            return null;
          }
          const isNormalSize = item.name.toLowerCase().includes('water') || item.name.toLowerCase().includes('gatorade');
          return {
            name: item.name,
            basePrice: isNormalSize ? item.sizes.normal : item.sizes.small,
            defaultDescription: [isNormalSize ? 'Normal' : 'Small'],
            category: item.category,
            image: item.image || require('../assets/menu-pics/chef_special.png'),
            sizes: item.sizes,
          };
        })
        .filter(item => item !== null);

      setSidebarItems(items);
    };

    fetchSidebarItems();
  }, []);

  // Helper function to get random sidebar items
  const getRandomSidebarItems = (orderItems, sidebarItems) => {
    const numberOfItems = 3; // Number of random items you want to select
    const filteredItems = sidebarItems.filter(item => !orderItems.some(orderItem => orderItem.name === item.name));
    
    // If we have too few items left, reset by including all items again
    const itemsToUse = filteredItems.length < numberOfItems ? sidebarItems : filteredItems;
    
    const shuffledItems = [...itemsToUse].sort(() => 0.5 - Math.random());
    return shuffledItems.slice(0, numberOfItems);
  };

  // Use useMemo after defining getRandomSidebarItems
  const randomSidebarItems = useMemo(() => getRandomSidebarItems(orderItems, sidebarItems), [orderItems, sidebarItems]);

  // Determine the current language, default to 'en' if not available
  const language = navigator.language || 'en';

  // Helper function to format price
  const formatPrice = (price) => {
    if (language.startsWith('en')) {
      return `$${price.toFixed(2)}`;
    }
    return price.toFixed(2);
  };

  // this set of statements allows for dynamic order total calculating as items are addeded and removed
  const subTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = subTotal * 0.0825;
  const total = subTotal + taxes;

  const removeItem = (id) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  // adds items to the checkout screen based on determined attributes
  const addItem = (sidebarItem) => {
    setSelectedItem(sidebarItem);
    setSelectedItemType(sidebarItem.category);
    setSizeModalOpen(true);
  };

  const handleSizeSelect = ({ size, quantity, price }) => {
    setSizeModalOpen(false);
    setSelectedSize(size);

    const newItem = {
      id: Date.now(),
      name: selectedItem.name,
      description: [size === 'normal' ? 'Normal' : size.charAt(0).toUpperCase() + size.slice(1)],
      image: selectedItem.image,
      quantity: quantity,
      price: price,
    };

    const existingItemIndex = orderItems.findIndex(
      (orderItem) =>
        orderItem.name === newItem.name &&
        JSON.stringify(orderItem.description) === JSON.stringify(newItem.description)
    );

    if (existingItemIndex !== -1) {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[existingItemIndex].quantity += newItem.quantity;
      setOrderItems(updatedOrderItems);
    } else {
      setOrderItems((prevItems) => [...prevItems, newItem]);
    }
  };

  // used to remove spaces and capitalization
  const formatItemName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  // responsible for converting items to be passed into the database
  const convertDescriptionItems = async () => {

    const convertedItems = orderItems.map(item => {
      let prefix = '';
      let formattedDescriptions = [];
      let formattedPrice = 0;
  
      // determine the prefix and price based on the item name
      if (item.name === 'Bowl' || item.name === 'Plate' || item.name === 'Bigger Plate') {

        // formats the description items for insertion into the database
        prefix = 'N_';
        formattedDescriptions = item.description.map(desc => prefix + formatItemName(desc));

        // formats pricing to split between the different elements
        if(item.name === 'Bowl' && formattedDescriptions.length === 2){
          formattedPrice = item.price / 2;
        }
        else if(item.name === 'Bowl' && formattedDescriptions.length === 3){
          formattedPrice = item.price / 3;
        }
        else if(item.name === 'Plate' && formattedDescriptions.length === 3){
          formattedPrice = item.price / 3;
        }
        else if(item.name === 'Plate' && formattedDescriptions.length === 4){
          formattedPrice = item.price / 4;
        }
        else if(item.name === 'Bigger Plate' && formattedDescriptions.length === 4){
          formattedPrice = item.price / 4;
        }
        else if(item.name === 'Bigger Plate' && formattedDescriptions.length === 5){
          formattedPrice = item.price / 5;
        }

      } 
      else if (item.name === 'Family') {
        prefix = 'L_';
        formattedDescriptions = item.description.map(desc => prefix + formatItemName(desc));

        formattedPrice = item.price / 5;
      } 
      else if (item.name === 'Panda Cub') {
        prefix = 'K_';
        formattedDescriptions = item.description.map(desc => prefix + formatItemName(desc));

        // formatting for price split up for database insertion
        if(formattedDescriptions.length === 2){
          formattedPrice = item.price / 2;
        }
        else{
          formattedPrice = item.price / 3;
        }

      } 
      else {
        // default to the first letter of the description's first item (S,M,L)
        if(item.description[0] === 'Small'){
          prefix = 'S_';
        }
        else if(item.description[0] === 'Medium'){
          prefix = 'M_';
        }
        else if(item.description[0] === 'Large'){
          prefix = 'L_';
        }
        else{
          prefix = 'N_'
        }
        formattedDescriptions = prefix + formatItemName(item.name);
        formattedPrice = item.price;
      }
  
      // create the final converted item with transformed descriptions in the name field
      return {
        name: item.name,
        description: formattedDescriptions,
        quantity: item.quantity,
        price: formattedPrice,
      };
    });
  
    return convertedItems;
  };

  const sendItemsToDatabase = async (orderItems) => {
    try {
      // first convert the items and await the result
      const convertedItems = await convertDescriptionItems(orderItems);
      
      // create separate orders for each item in the description array
      const formattedItems = [];

      const employeeName = 'Kiosk';
      
      // process each converted item
      for (let item of convertedItems) {
        

        // in the event that it is not one of these options then the formatting must look a little different
        if(item.name !== 'Bowl' && item.name !== 'Plate' && item.name !== 'Bigger Plate' && item.name !== 'Panda Cub' && item.name !== 'Family'){
          let mealType = '';

          if (item.name === 'Egg Roll' || item.name === 'Spring Roll' || item.name === 'Cream Cheese Rangoon' || item.name === 'Apple Pie Roll') {
            mealType = 'Extras';
          } 
          else if (item.name === 'Gatorade' || item.name === 'Bottled Water' || item.name === 'Fountain Drink') {
            mealType = 'Drinks';
          }
          else {
            mealType = 'A La Carte';
          }

          // Push meal type
          formattedItems.push({
            name: mealType,
            quantity: 1,
            price: 0,
          });
          
          formattedItems.push({
            name: item.description,
            quantity: item.quantity,
            price: item.price,
          });
          continue;
        }

        // Push meal type
        formattedItems.push({
          name: item.name,
          quantity: 1,
          price: 0,
        });
        for (let name of item.description) {
          
          formattedItems.push({
            name: name,
            quantity: item.quantity,
            price: item.price,
          });
        }
      }

      const paymentData = {
        items: formattedItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        employeeName,
      };
  
      // send the information to the database and wait for it to be posted
      const response = await fetch('https://pandabackend-six.vercel.app/api/orders/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to process payment');
      }
  
      const result = await response.json();
      return result;
  
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  };

  const handlePayment = () => {
    // sends items to database only when pay button is pressed
    sendItemsToDatabase();

    setOrderItems([]);
    alert('Payment Successful!');

    // After successful payment:
    onPaymentComplete();
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  return (
    <div className="flex min-h-screen">
      {/* Main content area */}
      
      <div className="flex-grow p-4">
        {/* Header */}
        <div className="grid grid-cols-4 mb-4 text-black text-3xl font-bold">
          <div className="col-span-2">Item</div>
          <div className="text-center">Qty</div>
          <div className="text-right pr-4">Total</div> {/* Adjusted padding */}
        </div>

  
        {/* Order Items */}
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div 
              key={item.id || Date.now()} 
              style={{ backgroundColor: '#c81d25' }} 
              className="p-4 rounded-lg shadow-lg"
            >
              <div className="grid grid-cols-4 items-center">
                <div className="col-span-2 flex gap-6">
                  <div className="w-40 h-28 flex items-center justify-center bg-white rounded overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="object-contain w-full h-full p-2" 
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1 text-white">{item.name}</h3>
                    {item.description.map((desc, index) => (
                      <p 
                        key={index} 
                        style={{ backgroundColor: '#c81d25', paddingLeft: '2rem', borderRadius: '0.25rem', color: 'white'}} 
                        className="text-white italic mt-1"
                      >
                        {desc}
                      </p>                  
                    ))}
                  </div>
                </div>
                <div className="text-center text-2xl text-white">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      className="text-white px-3 py-1"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className="text-white px-3 py-1"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-white">{formatPrice(item.quantity * item.price)}</span>
                  <span 
                    className="text-3xl text-white pr-4 cursor-pointer"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Footer */}
        <div className="mt-8">
          <div className="flex justify-between text-black text-2xl mb-3">
            <span>Taxes:</span>
            <span>{formatPrice(taxes)}</span>
          </div>
          <div className="flex justify-between text-black text-4xl font-bold mb-8">
            <span>TOTAL:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between w-full">
            <button 
              className="bg-gray-500 text-white px-8 py-4 rounded-lg text-2xl font-bold"
              onClick={() => setOrderItems([])} // Clear All button functionality
            >
              Clear All
            </button>
            <button 
              className="bg-green-600 text-white px-16 py-4 rounded-lg text-3xl font-bold"
              onClick={handlePayment}
            >
              Pay
            </button>
          </div>
        </div>
      </div>
  
      {/* Right sidebar with custom items */}
      <div className="w-60 p-4 pr-0">
        <div
          style={{ backgroundColor: '#c81d25' }}
          className="rounded-lg p-4 space-y-4 inline-block w-full"
        >
          {randomSidebarItems.map((sidebarItem) => (
            <button
              key={sidebarItem.name}
              onClick={() => addItem(sidebarItem)}
              className="w-full bg-white rounded-lg shadow-md p-4 relative hover:bg-gray-50 transition-colors"
            >
              <div className="absolute top-2 right-2 w-10 h-10 p-2 rounded-full bg-green-600 text-white flex items-center justify-center text-5xl font-bold">
                +
              </div>
              <div className="w-36 h-36 mx-auto bg-white rounded-lg mb-2 flex items-center justify-center">
                <img
                  src={sidebarItem.image}
                  alt={sidebarItem.name}
                  className="object-contain w-full h-full p-2"
                />
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-800 block">{sidebarItem.name}</span>
                <span className="text-gray-600">{formatPrice(sidebarItem.basePrice)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection Modal */}
      {sizeModalOpen && (
        <SizeSelectionModal
          isOpen={sizeModalOpen}
          onClose={() => {
            setSizeModalOpen(false);
            setSelectedSize(null);
          }}
          item={selectedItem}
          prices={selectedItem.sizes}
          onSelect={handleSizeSelect}
          showQuantity={
            selectedItemType === "drink" ||
            selectedItemType === "appetizer" ||
            selectedItemType === "entree" ||
            selectedItemType === "side"
          }
        />
      )}
    </div>
  );
};

export default KioskCheckout;
