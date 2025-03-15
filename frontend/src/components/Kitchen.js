/**
 * @module Frontend/Kitchen
 */
import React, { useState, useEffect } from 'react';
import './Kitchen.css';

/**
 * Kitchen component displays and manages the current orders in the kitchen.
 * It fetches the orders from an API, allows marking orders as completed,
 * and provides the ability to push orders back in the queue.
 *
 * @component
 * @memberof module:Frontend/Kitchen
 */
const Kitchen = () => {
    const [orders, setOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState(() => {
        const saved = localStorage.getItem("completedOrders");
        return saved ? JSON.parse(saved) : [];
    });
    const [visibleOrderIndex, setVisibleOrderIndex] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
    const [uniqueProducts, setUniqueProducts] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [hiddenProducts, setHiddenProducts] = useState(new Set());
    const [clickedOrders, setClickedOrders] = useState(new Set());

    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    };

    const handleProductButtonClick = (product) => {
        if (selectedProducts.includes(product)) {
            setSelectedProducts(selectedProducts.filter(p => p !== product));
            setHiddenProducts(new Set([...hiddenProducts].filter(p => p !== product)));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
        setIsPopupVisible(false); // Collapse the pop-up
    };

    const toggleProductVisibility = (product) => {
        if (hiddenProducts.has(product)) {
            setHiddenProducts(new Set([...hiddenProducts].filter(p => p !== product)));
            setSelectedProducts(selectedProducts.filter(p => p !== product));
        } else {
            setHiddenProducts(new Set([...hiddenProducts, product]));
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('https://pandabackend-six.vercel.app/api/orders/current');
                const data = await response.json();
                setOrders(data);

                const products = new Set();
                const excludedProducts = ["Bowl", "Plate", "Bigger Plate", "Drinks", "Extras", "A La Carte", "Family", "Panda Cub", "fountain drink", "bottled water", "gatorade"];
                data.forEach(order => {
                    order.items.forEach(item => {
                        const productName = item.product_name.replace(/^(Normal|Kid|Family|Small|Medium|Large)\s/, '');
                        if (!excludedProducts.includes(productName)) {
                            products.add(productName);
                        }
                    });
                });
                setUniqueProducts(Array.from(products));
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();

        const intervalId = setInterval(fetchOrders, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleStrikeThrough = (orderId) => {
        setCompletedOrders(prev => {
            const updated = [...prev, orderId];
            localStorage.setItem("completedOrders", JSON.stringify(updated));
            return updated;
        });
    };

    const handlePushBack = (orderId) => {
        setOrders(prevOrders => {
            const index = prevOrders.findIndex(order => order.order_id === orderId);
            if (index !== -1) {
                const updatedOrders = [...prevOrders];
                const [movedOrder] = updatedOrders.splice(index, 1);
                updatedOrders.push(movedOrder);
                return updatedOrders;
            }
            return prevOrders;
        });
    };

    const handleOrderButtonClick = (orderId) => {
        if (clickedOrders.has(orderId)) {
            handleStrikeThrough(orderId);
            setClickedOrders(new Set([...clickedOrders].filter(id => id !== orderId)));
        } else {
            setClickedOrders(new Set([...clickedOrders, orderId]));
        }
    };

    const calculateTimeSinceOrder = (timeStamp) => {
        const orderTime = new Date(timeStamp);
        const currentTime = new Date();
        const diffInSeconds = Math.floor((currentTime - orderTime) / 1000);

        const minutes = Math.floor(diffInSeconds / 60) % 60;
        const seconds = diffInSeconds % 60;

        return { minutes, seconds, formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` };
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setOrders((prevOrders) => [...prevOrders]);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const ordersLeft = orders.filter(order => !completedOrders.includes(order.order_id)).length;

    if (ordersLeft === 0) {
        return (
            <div className="no-orders">
                <div className="no-orders-text">
                    No current orders for {currentDate}.
                </div>
            </div>
        );
    }

    const visibleOrders = [];
    let count = 0;

    for (const order of orders.filter(order => !completedOrders.includes(order.order_id))) {
        if (count >= 8) break;
        if (!order.items.some(item => Array.from(hiddenProducts).some(p => item.product_name.replace(/^(Normal|Kid|Large)\s/, '').includes(p)))) {
            visibleOrders.push(order);
            count += order.items.length > 10 ? 2 : 1;
        }
    }

    if (visibleOrders.length < 8) {
        for (const order of orders.filter(order => !completedOrders.includes(order.order_id))) {
            if (visibleOrders.includes(order)) continue;
            if (count >= 8) break;
            visibleOrders.push(order);
            count += order.items.length > 10 ? 2 : 1;
        }
    }

    return (
        <div className="kitchen-container">
            <div className="orders-left">
                Orders Left: {ordersLeft}
            </div>
            <div className="product-popup-button">
                <button onClick={togglePopup}>Show Products</button>
            </div>
            {isPopupVisible && (
                <div className="product-popup">
                    <div className="popup-content">
                        <div className="popup-columns">
                            {uniqueProducts.map((product, index) => (
                                <button key={index} className="product-button" onClick={() => handleProductButtonClick(product)}>{product}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="selected-products-bar">
                {selectedProducts.map((product, index) => (
                    <button key={index} className="selected-product-button" onClick={() => toggleProductVisibility(product)}>
                        {product}
                    </button>
                ))}
            </div>
            <div className="orders-list">
                {visibleOrders.map((order) => {
                    const hasSelectedProduct = order.items.some(item => selectedProducts.some(p => item.product_name.replace(/^(Normal|Kid|Large)\s/, '').includes(p)));
                    const isHidden = order.items.some(item => Array.from(hiddenProducts).some(p => item.product_name.replace(/^(Normal|Kid|Large)\s/, '').includes(p)));
                    const isClicked = clickedOrders.has(order.order_id);
                    const { minutes, formatted } = calculateTimeSinceOrder(order.time_stamp);
                    const isFlashing = minutes >= 5;
                    return (
                        !isHidden && (
                            <div
                                key={order.order_id}
                                className={`order-card ${order.items.length > 10 ? 'wide-card' : ''} ${hasSelectedProduct ? 'highlighted' : ''}`}
                            >
                                <div className={`order-timer ${isFlashing ? 'flashing' : ''}`}>
                                    {formatted}
                                </div>
                                <div className={`order-items ${completedOrders.includes(order.order_id) ? 'completed' : ''}`}>
                                    <div className="items-list">
                                        <ul className="items-ul">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <li key={idx} className="item">
                                                        <span className={`item-name ${["Bowl", "Plate", "Bigger Plate", "Drinks", "Extras", "A La Carte", "Family", "Panda Cub"].includes(item.product_name) ? 'meal-size' : 'meal-items'}`}>
                                                            {item.product_name.replace(/^(Normal|Kid|Large)\s/, '')}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="no-items">No items listed.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <button
                                    className={`order-title complete-button ${completedOrders.includes(order.order_id) ? 'completed' : ''} ${isClicked ? 'clicked' : ''}`}
                                    onClick={() => handleOrderButtonClick(order.order_id)}
                                >
                                    {isClicked ? `*Order #${order.order_id}*` : `Order #${order.order_id}`}
                                </button>
                            </div>
                        )
                    );
                })}
            </div>
        </div>
    );
};

export default Kitchen;
