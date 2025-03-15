// MenuBoardEntrees.js
import React, { useState, useEffect } from "react";
import "./MenuBoardEntrees.css";
import Carousel from "./Carousel";

const getImage = (name) => {
  try {
    return require(`../assets/menu-pics/${name}.png`);
  } catch (err) {
    return require(`../assets/menu-pics/chef_special.png`);
  }
};

/**
 * MenuBoardEntrees Component
 * 
 * Fetches a list of entree items from the backend API and displays them as cards with images, names, and calorie counts.
 * Each card displays an image of the entree, formatted name, and calorie count.
 * The component also automatically cycles through the entrees on hover every 3500ms.
 * 
 * @memberof module:Frontend/Menu
 * @returns {JSX.Element} - The rendered component containing the carousel and entree cards.
 */
const MenuBoardEntrees = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [entrees, setEntrees] = useState([]);

  useEffect(() => {
    const fetchEntrees = async () => {
      try {
        const response = await fetch('https://pandabackend-six.vercel.app/api/menu/items-menu');
        if (!response.ok) throw new Error('Failed to fetch entrees');
        const data = await response.json();
        setEntrees(data.entrees);
      } catch (error) {
        console.error('Error fetching entrees:', error);
      }
    };

    fetchEntrees();

    const interval = setInterval(() => {
      setHoveredIndex((prevIndex) => (prevIndex + 1) % entrees.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [entrees.length]);

  const formatDisplayName = (name) => {
    if (name === 'super_greens_side' || name === 'super_greens_entree') {
      name = 'super_greens';
    } else if (name === 'fountain_drink') {
      name = 'fountain';
    } else if (name === 'apple_pie_roll') {
      name = 'apple_pie';
    } else if (name === 'sweetfire_chicken') {
      name = 'sweetFire_chicken';
    }
    
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="entrees-menu-board-container">
      {/* Carousel */}
      <Carousel />

      {/* Entrees Cards */}
      <div className="entrees-menu-cards-container mt-4">
        {entrees.map((item, index) => (
          <div
            key={index}
            className={`entrees-menu-card ${index === hoveredIndex ? "hovered" : ""}`}
          >
            <img
              src={getImage(item.name)}
              alt={item.name}
              className="entrees-menu-card-image"
            />
            <div className="entrees-menu-card-content">
              <h3 className="entrees-menu-card-name">{formatDisplayName(item.name)}</h3>
              <span className="entrees-menu-card-calories">
                {item.calories} Calories
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBoardEntrees;
