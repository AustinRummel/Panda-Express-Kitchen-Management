import React, { useState, useEffect } from 'react';
import bowl from '../assets/Bowl.png';
import plate from '../assets/Plate.png';
import bigPlate from '../assets/Big_Plate.png';
import cub from '../assets/Cub.png';
import aLaCarte from '../assets/A_La_Carte.png';
import family from '../assets/Family.png';
import drink from '../assets/Drink.png'; // Add this line
import './MenuBoardPricing.css';

/**
 * MenuBoardPricing Component
 * 
 * Fetches the menu items (entrees, sides, and drinks) and displays them as cards with their respective images, 
 * descriptions, calorie counts, and prices. The items include options for bowls, plates, family meals, a la carte 
 * options, and drinks. The menu items are cycled every 3500ms, with the current item being highlighted on hover.
 * 
 * @memberof module:Frontend/Menu
 * @returns {JSX.Element} - The rendered component containing menu items with their details.
 */
const MenuBoardPricing = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoveredIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      image: bowl,
      title: 'BOWL',
      description: '1 Entree & 1 Side',
      calories: '280 - 1130 Cal Per Serving',
      price: 'Starts at* $8.30',
    },
    {
      image: plate,
      title: 'PLATE',
      description: '2 Entrees & 1 Side',
      calories: '430 - 1640 Cal Per Serving',
      price: 'Starts at* $9.80',
    },
    {
      image: bigPlate,
      title: 'BIGGER PLATE',
      description: '3 Entrees & 1 Side',
      calories: '580 - 2150 Cal Per Serving',
      price: 'Starts at* $11.30',
    },
    {
      image: cub,
      title: 'PANDA CUB',
      description: 'Jr. Entree, Jr. Side, Fruit Side, and Bottled Water/Juice',
      calories: '300 - 740 Cal Per Serving',
      price: 'Starting at* $6.60',
    },
    {
      image: family,
      title: 'FAMILY',
      description: '3 Large Entrees & 2 Large Sides',
      calories: '430 - 1640 Cal Per Serving',
      price: 'Starts at* $43.00',
    },
    {
      image: aLaCarte,
      title: 'A LA CARTE',
      description: (
        <div className="menu-card-split">
          <div className="menu-card-half">
            <strong>Entree</strong>
            <div>S: $5.20*</div>
            <div>M: $8.50*</div>
            <div>L: $11.20*</div>
          </div>          
          <div className="menu-card-half">
            <strong>Side</strong>
            <div>M: $4.40</div>
            <div>L: $5.40</div>
          </div>
        </div>
      ),
      calories: '130 - 620 Cal Per Serving',
      price: '',
    },
    {
      image: drink, // Add this block
      title: 'DRINKS',
      description: (
        <div className="menu-card-split">
          <div className="menu-card-half">
            <strong>Fountain</strong>
            <div>S: $2.10</div>
            <div>M: $2.30</div>
            <div>L: $2.50</div>
          </div>
          <div className="menu-card-half">
            <strong>Gatorade</strong>
            <div>$2.70</div>
            <div style={{ marginBottom: '15px' }}></div> {/* Add this line */}
            <strong>Water</strong>
            <div>$2.30</div>
          </div>
        </div>
      ),
      calories: '0 - 570 Cal Per Serving',
      price: '',
    },
  ];

  return (
    <div className="menu-board-pricing-container">
      <div className="menu-cards-container">
        {items.map((item, index) => (
          <div
            key={index}
            className={`menu-card ${index === hoveredIndex ? 'hovered' : ''}`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="menu-card-image"
            />
            <div className="menu-card-content">
              <h3 className="menu-card-name">{item.title}</h3>
              <p className="menu-card-description">{item.description}</p>
              <span className="menu-card-price">{item.price}</span>
              <span className="menu-card-calories">{item.calories}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBoardPricing;
