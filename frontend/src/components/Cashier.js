/**
 * @module Frontend/Cashier
 */
import React, { useState, useEffect } from 'react';
import './Cashier.css'; // Make sure to import a CSS file for styles
import { useNavigate } from 'react-router-dom';

const getEntreeBorderClass = (pressCount) => {
    switch (pressCount) {
        case 1:
            return 'border-blue';
        case 2:
            return 'border-green-blue';
        case 3:
            return 'border-orange-green-blue';
        default:
            return 'border-gray';
    }
};

const getApplePieBorderClass = (pressCount) => {
    return getEntreeBorderClass(pressCount);
};

const getFountainDrinkBorderClass = (pressCount) => {
    return getEntreeBorderClass(pressCount);
};

const getBoolBorderClass = (pressCount) => {
    switch (pressCount) {
        case 1:
            return 'border-blue';
        default:
            return 'border-gray';
    }
};

const getSidesBorderClass = (pressCount) => {
    switch (pressCount) {
        case 1:
            return 'border-green';
        case 2:
            return 'border-orange-green';
        default:
            return 'border-gray';
    }
};

const getExtrasBorderClass = (pressCount) => {
    switch (pressCount) {
        case 1:
            return 'border-blue';
        case 2:
            return 'border-orange-blue';
        default:
            return 'border-gray';
    }
};

const getImage = (name) => {
    try {
        return require(`../assets/menu-pics/${name}.png`);
    } catch (err) {
        return require(`../assets/menu-pics/chef_special.png`);
    }
};

/**
 * A React component that manages the cashier interface for placing orders. 
 * 
 * @component
 * @memberof module:Frontend/Cashier
 * @returns {JSX.Element}
 */
const Cashier = () => {

    const useHelp = () => {
        const [helpRequested, setHelpRequested] = useState(false);
        const [helpRequestTime, setHelpRequestTime] = useState(null);
      
        useEffect(() => {
          // Function to check the help employee status
          const checkHelpStatus = async () => {
            try {
                const response = await fetch('https://pandabackend-six.vercel.app/api/employees/employee-status');
                if (!response.ok) {
                    throw new Error('Failed to fetch employee status');
                }
                const data = await response.json();
                if (data.active_status === true) {
                    setHelpRequested(true);

                    // Convert clock_in to UTC string
                    const clockInUTC = new Date(data.clock_in); // Convert to Date object
                    const clockInUTCString = clockInUTC.toLocaleString('en-US', { timeZone: 'UTC' }); // Force UTC display
                    setHelpRequestTime(clockInUTCString); // Set the time in UTC format
                } else {
                    setHelpRequested(false);
                }
            } catch (error) {
                console.error('Error fetching help status:', error);
            }
        };
      
          // Check every 5 seconds
          const intervalId = setInterval(checkHelpStatus, 5000);
      
          // Cleanup the interval when the component is unmounted
          return () => clearInterval(intervalId);
        }, []); // Empty dependency array ensures this runs only once on mount
      
        // Function to clear the help status
        const clearHelp = async () => {
          try {
            const response = await fetch('https://pandabackend-six.vercel.app/api/employees/clear-help', {
              method: 'PUT', // Use PUT for update action
            });
      
            if (!response.ok) {
              throw new Error('Failed to clear help status');
            }
      
            setHelpRequested(false); // Set helpRequested to false when the help status is cleared
          } catch (error) {
            console.error('Error clearing help status:', error);
          }
        };
      
        return { helpRequested, helpRequestTime, clearHelp };
      };

    const { helpRequested, helpRequestTime, clearHelp} = useHelp();

    const [currentOrder, setCurrentOrder] = useState([]);
    const [paymentItems, setPaymentItems] = useState([]);
    const [menuItems, setMenuItems] = useState({
        entrees: [],
        sides: [],
        extras: [],
        drinks: [],
        priced_items: []
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [pressCounts, setPressCounts] = useState({
        entrees: {},
        sides: {},
        extras: {},
        drinks: {},
        priced_items: {}
    });
    const [mealSize, setMealSize] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch('https://pandabackend-six.vercel.app/api/menu/items');
                if (!response.ok) {
                    throw new Error('Failed to fetch menu items');
                }
                const data = await response.json();
                setMenuItems(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchMenuItems();
    }, []);

    const getItemPrice = (itemName) => {
        const priced_item = menuItems.priced_items.find(item => item.name === itemName);
        return priced_item ? priced_item.price : null;
    };
    
    

    const getMaxPresses = (item, category) => {
        if (category === 'extras') {
            return item === 'apple_pie_roll' ? 3 : 2;
        }
        if (category === 'drinks') {
            return item === 'fountain_drink' ? 3 : 1;
        }
        if (category === 'sides') {
            return 2;
        }
        return 3;
    };

    const getSizeLabel = (count, item, category) => {
        if(category === 'extras') {
            if(item === 'apple_pie_roll') {
                return count === 1 ? 'S' : count === 2 ? 'M' : 'L';
            }
            return count === 1 ? 'S' : 'L';
        }
        if(category === 'drinks'){
            if(item === 'fountain_drink') {
                return count === 1 ? 'S' : count === 2 ? 'M' : 'L';
            }
            return 'N';
        }
        if(category === 'sides'){
            return count === 1 ? 'M' : 'L';
        }
        return count === 1 ? 'S' : count === 2 ? 'M' : 'L';
    };
      
    const formatItemName = (name) => {
        return name.toLowerCase().replace(/\s+/g, '_');
    };

    const formatDisplayName = (name) => {
        if (name === 'super_greens_side' || name === 'super_greens_entree') {
            name = 'super_greens';
        } else if (name === 'fountain_drink') {
            name = 'fountain';
        } else if (name === 'apple_pie_roll') {
            name = 'apple_pie';
        }
        
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleItemClick = (item, category) => {
        setPressCounts(prev => {
            const currentCount = prev[category][item] || 0;
            const maxPresses = getMaxPresses(item, category);
            const isLargeEntree = item.includes('large') && category === 'entrees';
            
            const newCount = isLargeEntree ? 3 : (currentCount === maxPresses ? 0 : currentCount + 1);
            
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    [item]: newCount
                }
            };
        });
    
        setSelectedItems(prev => {
            const existingItem = prev.find(i => i.name === item && i.category === category);
            const maxPresses = getMaxPresses(item, category);
            const isLargeEntree = item.includes('large') && category === 'entrees';
    
            if (existingItem) {
                const newCount = isLargeEntree ? 3 : (existingItem.count === maxPresses ? 0 : existingItem.count + 1);
    
                if (newCount === 0) {
                    return prev.filter(i => !(i.name === item && i.category === category));
                }
                return prev.map(i => {
                    if (i.name === item && i.category === category) {
                        return { ...i, count: newCount };
                    }
                    return i;
                });
            }
            return [...prev, { name: item, category, count: isLargeEntree ? 3 : 1 }];
        });
    };
    

    const handleAddItems = () => {
        const selectedEntrees = selectedItems.filter(item => item.category === 'entrees');
        const selectedSides = selectedItems.filter(item => item.category === 'sides');
        const selectedExtras = selectedItems.filter(item => item.category === 'extras');
        const selectedDrinks = selectedItems.filter(item => item.category === 'drinks');
    
        const entreesSelected = selectedEntrees.reduce((acc, item) => acc + item.count, 0);
        const sidesSelected = selectedSides.reduce((acc, item) => acc + item.count, 0);
        const extrasSelected = selectedExtras.length;
        const drinksSelected = selectedDrinks.length;

        let mealType = '';
        let price = 0.0;
    
        if ((extrasSelected > 0 || drinksSelected > 0) && (entreesSelected > 0 || sidesSelected > 0)) {
            alert('Invalid selection. You cannot add entrees or sides when selecting extras or drinks.');
            setSelectedItems([]);
            setPressCounts({
                entrees: {},
                sides: {},
                extras: {},
                drinks: {}
            });
            setMealSize(null);
            return;
        }
    
        if (drinksSelected > 0) {
            selectedDrinks.forEach(item => {
                const size = getSizeLabel(item.count, item.name, 'drinks');
                const formattedName = formatItemName(item.name);
                item.mealType = 'Drink';
                const itemName = `${size}_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0);
                }
            });
            const drinkItems = selectedDrinks.map(item => `${getSizeLabel(item.count, item.name, 'drinks')}_${formatItemName(item.name)}`);
            setCurrentOrder(prev => [
                ...prev,
                {
                    mealType: 'Drink',
                    price,
                    menuItems: [...drinkItems].join(', '),
                },
            ]);                
            setPaymentItems(prev => [...prev, ...drinkItems.map(item => ({ name: item, quantity: 1, price: price }))]);
        }
    
        if (extrasSelected > 0) {
            selectedExtras.forEach(item => {
                const size = getSizeLabel(item.count, item.name, 'extras');
                const formattedName = formatItemName(item.name);
                const itemName = `${size}_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0);
                }
            });
            const extraItems = selectedExtras.map(item => `${getSizeLabel(item.count, item.name, 'extras')}_${formatItemName(item.name)}`);
            setCurrentOrder(prev => [
                ...prev,
                {
                    mealType: 'Extra',
                    price,
                    menuItems: [...extraItems].join(', '),
                },
            ]);              
            setPaymentItems(prev => [...prev, ...extraItems.map(item => ({ name: item, quantity: 1, price: price }))]);
        }
    
        if ((selectedEntrees.length > 1 && selectedSides.length === 0) || (selectedSides.length > 1 && selectedEntrees.length === 0)) {
            alert('Invalid selection. You cannot add multiple A La Carte entrees or sides at the same time.');
            setSelectedItems([]);
            setPressCounts({
                entrees: {},
                sides: {},
                extras: {},
                drinks: {}
            });
            setMealSize(null);
            return;
        }

        // Determine meal type and base price
        if (entreesSelected === 1 && (sidesSelected === 1 || sidesSelected === 2)) {
            mealType = 'Bowl';
            price = 8.30;
        } else if (entreesSelected === 2 && (sidesSelected === 1 || sidesSelected === 2)) {
            mealType = 'Plate';
            price = 9.80;
        } else if (entreesSelected === 3 && (sidesSelected === 1 || sidesSelected === 2)) {
            mealType = 'Bigger Plate';
            price = 11.30;
        } else if ((entreesSelected > 0 && sidesSelected === 0) || (entreesSelected === 0 && sidesSelected > 0)) {
            mealType = 'A La Carte';
        } else if (drinksSelected === 0 && extrasSelected === 0) {
            alert('Invalid selection. Please select items that form a valid meal.');
            setSelectedItems([]);
            setPressCounts({
                entrees: {},
                sides: {},
                extras: {},
                drinks: {}
            });
            setMealSize(null);
            return;
        }

        // Handle Kid Meal
        if (mealSize === 'kid') {
            price = 6.60;
            selectedEntrees.forEach(item => {
                const formattedName = formatItemName(item.name);
                const itemName = `K_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0) * (item.count || 1);
                }
            });
            if (entreesSelected === 1 && sidesSelected === 1) {
                const entreeItems = selectedEntrees.map(item => `K_${item.name}`);
                const sideItems = selectedSides.map(item => `K_${item.name}`);
                setCurrentOrder(prev => [
                    ...prev,
                    {
                        mealType: 'Kid',
                        price,
                        menuItems: [...entreeItems, ...sideItems].join(', '),
                    },
                ]);               
                setPaymentItems(prev => [...prev, ...entreeItems.map(item => ({ name: item, quantity: 1, price: (price / 2) }))]);
                setPaymentItems(prev => [...prev, ...sideItems.map(item => ({ name: item, quantity: 1, price: (price / 2) }))]);
            } else {
                alert('Please select 1 entree and 1 side for a Kid Meal.');
                setSelectedItems([]);
                setPressCounts({
                    entrees: {},
                    sides: {},
                    extras: {},
                    drinks: {}
                });
                setMealSize(null);
                return;
            }
        }
        // Handle Family Meal
        else if (mealSize === 'family') {
            price = 43.00;
            selectedEntrees.forEach(item => {
                const formattedName = formatItemName(item.name);
                const itemName = `F_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0) * (item.count || 1);
                }
            });
            if (entreesSelected === 3 && sidesSelected === 2) {
                const entreeItems = selectedEntrees.map(item => `F_${item.name}`);
                const sideItems = selectedSides.map(item => `F_${item.name}`);
                setCurrentOrder(prev => [
                    ...prev,
                    {
                        mealType: 'Family',
                        price,
                        menuItems: [...entreeItems, ...sideItems].join(', '),
                    },
                ]);             
                setPaymentItems(prev => [...prev, ...entreeItems.map(item => ({ name: item, quantity: 1, price: ((price / 2)/3) }))]);
                setPaymentItems(prev => [...prev, ...sideItems.map(item => ({ name: item, quantity: 1, price: ((price / 2)/2) }))]);
            } else {
                alert('Please select 3 entrees and 2 sides for a Family Meal.');
                setSelectedItems([]);
                setPressCounts({
                    entrees: {},
                    sides: {},
                    extras: {},
                    drinks: {}
                });
                setMealSize(null);
                return;
            }
        }
        // Handle A La Carte
        else if (mealType === 'A La Carte') {
            selectedEntrees.forEach(item => {
                const size = getSizeLabel(item.count, item.name, 'entrees');
                const formattedName = formatItemName(item.name);
                const itemName = `${size}_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0);
                }
            });
            selectedSides.forEach(item => {
                const size = getSizeLabel(item.count, item.name, 'sides');
                const formattedName = formatItemName(item.name);
                const itemName = `${size}_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0) * (item.count || 1);
                }
            });
            const entreeItems = selectedEntrees.map(item => `${getSizeLabel(item.count, item.name, 'entrees')}_${formatItemName(item.name)}`);
            const sideItems = selectedSides.map(item => `${getSizeLabel(item.count, item.name, 'sides')}_${formatItemName(item.name)}`);
            setCurrentOrder(prev => [
                ...prev,
                {
                    mealType: 'A La Carte',
                    price,
                    menuItems: [...entreeItems, ...sideItems].join(', '),
                },
            ]);            
            setPaymentItems(prev => [...prev, ...entreeItems.map(item => ({ name: item, quantity: 1, price: price }))]);
            setPaymentItems(prev => [...prev, ...sideItems.map(item => ({ name: item, quantity: 1, price: price }))]);
        }
        // Default Meal handling
        else if(extrasSelected === 0 && drinksSelected === 0) {
            selectedEntrees.forEach(item => {
                const formattedName = formatItemName(item.name);
                const itemName = `N_${formattedName}`;
                const itemPrice = getItemPrice(itemName) || 0;
                if (itemPrice > 0) {
                    price += (Number(itemPrice) || 0) * (item.count || 1);
                }
            });
            if (sidesSelected === 2) {
                const entreeItems = selectedEntrees.map(item => `N_${item.name}`);
                const sideItems = selectedSides.map(item => `N_${item.name}`);
                setCurrentOrder(prev => [
                    ...prev,
                    {
                        mealType,
                        price,
                        menuItems: [...entreeItems, ...sideItems].join(', '),
                    },
                ]);        
                setPaymentItems(prev => [...prev, ...entreeItems.map(item => ({ name: item, quantity: 1, price: (price/(entreesSelected + 1)) }))]);
                setPaymentItems(prev => [...prev, ...sideItems.map(item => ({ name: item, quantity: 1, price: (price/(entreesSelected + 1))/2 }))]);
            } else {
                const entreeItems = selectedEntrees.map(item => `N_${item.name}`);
                const sideItems = selectedSides.map(item => `N_${item.name}`);
                setCurrentOrder(prev => [
                    ...prev,
                    {
                        mealType,
                        price,
                        menuItems: [...entreeItems, ...sideItems].join(', '),
                    },
                ]);           
                setPaymentItems(prev => [...prev, ...entreeItems.map(item => ({ name: item, quantity: 1, price: (price/(entreesSelected + 1)) }))]);
                setPaymentItems(prev => [...prev, ...sideItems.map(item => ({ name: item, quantity: 1, price: (price/(entreesSelected + 1)) }))]);
            }
        }

        setSelectedItems([]);
        setPressCounts({
            entrees: {},
            sides: {},
            extras: {},
            drinks: {}
        });
        setMealSize(null);
    };

    const handleMealSizeClick = (size) => {
        if (mealSize === size) {
          setMealSize(null);
        } else {
          setMealSize(size);
        }
      };
      

    const handleOrderClick = () => {
        setShowSummary(true);
    };

    const closeSummary = () => {
        setShowSummary(false);
    };

    const handleRemoveItem = (index) => {
        setCurrentOrder((prevOrder) => prevOrder.filter((_, i) => i !== index));
    };

    const handleReturn = () => {
        const role = localStorage.getItem('role');
        if (role === 'manager') {
            navigate('/manager')
        } else {
            navigate('/')
        }
    };

    const handlePayment = async () => {
        try {
            const employeeName = localStorage.getItem('employee');
            const paymentData = {
                items: paymentItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                employeeName,
            };
    
            const response = await fetch('https://pandabackend-six.vercel.app/api/orders/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
    
            if (!response.ok) {
                throw new Error('Failed to process payment');
            }
    
            setCurrentOrder([]);
            setPaymentItems([]);
            closeSummary();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
            setCurrentOrder([]);
            setPaymentItems([]);
        }
    };
    
    const handleIncreaseQuantity = () => {
        setCurrentOrder((prevOrder) => {
            const updatedOrder = prevOrder.map((item) => ({
                ...item,
                quantity: (item.quantity || 1) + 1,
            }));
            return updatedOrder;
        });
    
        setPaymentItems((prevPaymentItems) => {
            const updatedPaymentItems = prevPaymentItems.map((paymentItem) => ({
                ...paymentItem,
                quantity: (paymentItem.quantity || 1) + 1,
            }));
            return updatedPaymentItems;
        });
    };    
    
    const handleDecreaseQuantity = () => {
        setCurrentOrder((prevOrder) => {
            const updatedOrder = prevOrder.map((item) => ({
                ...item,
                quantity: item.quantity > 1 ? item.quantity - 1 : item.quantity,
            }));
            return updatedOrder;
        });
    
        setPaymentItems((prevPaymentItems) => {
            const updatedPaymentItems = prevPaymentItems.map((paymentItem) => ({
                ...paymentItem,
                quantity: paymentItem.quantity > 1 ? paymentItem.quantity - 1 : paymentItem.quantity,
            }));
            return updatedPaymentItems;
        });
    };
    
    

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading menu items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    const MenuSection = ({ title, items, category, isEntrees }) => {
        const gridClass = isEntrees ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-1";

        return (
            <div className="p-2 flex flex-col flex-grow h-full bg-red-500 rounded-lg">
                <div className="text-center font-bold mb-1 bg-red-600 text-white text-xl py-1 rounded-t-lg font-montserrat">
                    {title}
                </div>
                <div className={`${gridClass} flex-grow h-full overflow-y-auto`}>
                    {items.map((item) => {
                        const pressCount = pressCounts[category][item] || 0;
                        const displayName = formatDisplayName(item);
                        let borderColor = 'border-gray-400';
                        if (isEntrees) {
                            borderColor = getEntreeBorderClass(pressCount);
                        } else if (category === 'sides') {
                            borderColor = getSidesBorderClass(pressCount);
                        } else if (category === 'extras' && item !== 'apple_pie_roll') {
                            borderColor = getExtrasBorderClass(pressCount);
                        } else if (category === 'extras' && item === 'apple_pie_roll') {
                            borderColor = getApplePieBorderClass(pressCount);
                        } else if (category === 'drinks' && item === 'fountain_drink') {
                            borderColor = getFountainDrinkBorderClass(pressCount);
                        } else if (category === 'drinks' && (item === 'bottled_water' || item === 'gatorade')) {
                            borderColor = getBoolBorderClass(pressCount);
                        } else if (pressCount > 0) {
                            if (category === 'drinks' && item !== 'fountain_drink') {
                                borderColor = 'border-blue-500';
                            } else {
                                borderColor = pressCount === 1 ? 'border-blue-500' :
                                            pressCount === 2 ? 'border-green-500' :
                                            'border-orange-500';
                            }
                        }

                        return (
                            <button
                                key={item}
                                onClick={() => handleItemClick(item, category)}
                                className={`border ${borderColor} text-lg text-black bg-white rounded-lg hover:bg-gray-100 flex flex-col items-center justify-center h-full w-full p-1`}
                            >
                                <img
                                    src={getImage(item)}
                                    alt={item}
                                    className={`object-contain mb-1 ${isEntrees ? 'w-42 h-40' : 'h-12'}`}
                                    style={{ transform: 'scale(0.75)' }}
                                />
                                <span className="text-xl relative" style={{ top: '-15px'}}>{displayName}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen p-2 flex flex-col justify-between relative">
        <button
            onClick={() => handleReturn()}
            className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
            Return
        </button>

        <div className="flex flex-grow gap-2">
            <div className="w-1/5 flex flex-col gap-2 mt-12">
                <div className="p-2 flex flex-col flex-grow h-full bg-red-500 rounded-lg">
                    <div className="text-center font-bold mb-1 bg-red-600 text-white text-xl py-1 rounded-t-lg font-montserrat">
                        Sizes
                    </div>
                    <div className="flex flex-grow h-full overflow-y-auto gap-2">
                        {/* Kid button */}
                        <button
                            onClick={() => handleMealSizeClick('kid')}
                            className={`border ${mealSize === 'kid' ? getBoolBorderClass(1) : getBoolBorderClass(0)} 
                                        text-l text-black bg-white rounded-lg hover:bg-gray-100 flex-1 flex items-center justify-center`}
                        >
                            Kid
                        </button>
                        {/* Family button */}
                        <button
                            onClick={() => handleMealSizeClick('family')}
                            className={`border ${mealSize === 'family' ? getBoolBorderClass(1) : getBoolBorderClass(0)} 
                                        text-l text-black bg-white rounded-lg hover:bg-gray-100 flex-1 flex items-center justify-center`}
                        >
                            Family
                        </button>
                    </div>
                </div>
                <MenuSection title="Sides" items={menuItems.sides} category="sides" />
                <MenuSection title="Extras" items={menuItems.extras} category="extras" />
                <MenuSection title="Drinks" items={menuItems.drinks} category="drinks" />
            </div>
            <div className="w-3/5 flex-grow flex flex-col">
                <MenuSection title="Entrees" items={menuItems.entrees} category="entrees" isEntrees={true} />
            </div>
            <div className="p-2 flex flex-col gap-2 bg-red-500 rounded-lg">
                <button 
                    onClick={handleOrderClick}
                    className="bg-blue-300 hover:bg-blue-400 p-2 font-bold h-1/2 flex items-center justify-center rounded-lg"
                >
                    ORDER
                </button>
                <button 
                    onClick={handleAddItems}
                    className="bg-green-300 hover:bg-green-400 p-2 font-bold h-1/2 flex items-center justify-center rounded-lg"
                >
                    ADD
                </button>
            </div>
        </div>
        {showSummary && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 w-1/3 h-auto rounded-lg relative flex flex-col">
                    <button
                        onClick={closeSummary}
                        className="absolute top-4 right-6 text-red-500 hover:text-red-700 text-4xl"
                    >
                        &times;
                    </button>

                    <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                    {currentOrder.length > 0 ? (
                        <ul className="overflow-y-auto max-h-80 flex-grow">
                            {currentOrder.map((item, index) => (
                                <div key={index} className="order-item flex items-center justify-between mb-4">
                                    <div>
                                        <div className="meal-type text-lg font-bold text-left">
                                            {item.mealType}: ${item.price.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-400 pl-4">{item.menuItems}</div>
                                    </div>

                                    <div className="flex items-center gap-1 mr-2">
                                        <button
                                            onClick={() => handleDecreaseQuantity()}
                                            className={`px-2 py-1 rounded ${
                                                item.quantity > 1
                                                    ? "text-white bg-gray-400 hover:bg-gray-500"
                                                    : "text-gray-400 bg-gray-200 cursor-not-allowed"
                                            }`}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-bold">{item.quantity || 1}</span>
                                        <button
                                            onClick={() => handleIncreaseQuantity()}
                                            className="text-white bg-gray-400 hover:bg-gray-500 px-2 py-1 rounded"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-red-500 hover:text-red-700 text-2xl"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-lg">No items in the order.</p>
                    )}
                    <div className="relative text-xl font-bold mt-4 text-right">
                        Total: ${currentOrder.reduce((total, item) => total + item.price * (item.quantity || 1), 0).toFixed(2)}
                    </div>
                    <div className="mt-4 flex justify-end gap-4">
                        <button
                            onClick={handlePayment}
                            className="bg-blue-500 text-white p-3 rounded-lg w-32 hover:bg-blue-600"
                        >
                            Pay
                        </button>
                        <button
                            onClick={closeSummary}
                            className="bg-gray-500 text-white p-3 rounded-lg w-32 hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}


        {helpRequested && (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                backgroundColor: '#fff',
                border: '3px solid black',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
            }}>
                <button 
                    onClick={clearHelp}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '0px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '24px'
                    }}
                >
                    ×
                </button>
                <h3 style={{ marginTop: '0', marginBottom: '10px', fontWeight: 'bold'}}>Customer Needs Help!</h3>
                <p style={{ margin: '0' }}>
                    Requested at: {new Date(helpRequestTime).toLocaleTimeString()}
                </p>
            </div>
        )}
    </div>
    );
};

export default Cashier;
