import React, { useState, useEffect } from "react";
import "./MenuBoardSides.css";

const getImage = (name) => {
  try {
    return require(`../assets/menu-pics/${name}.png`);
  } catch (err) {
    return require(`../assets/menu-pics/chef_special.png`);
  }
};

/**
 * MenuBoardSides Component
 * 
 * Fetches sides and appetizers data from an API and displays them as cards. 
 * Each card includes an image, name, and calorie count. Items are highlighted 
 * in turn with a hover effect every 3500ms.
 * 
 * @memberof module:Frontend/Menu
 * @returns {JSX.Element} - The rendered component containing sides and appetizers menu sections.
 */
const MenuBoardSides = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [sides, setSides] = useState([]);
  const [appetizers, setAppetizers] = useState([]);

  useEffect(() => {
    const fetchSidesAndAppetizers = async () => {
      try {
        const response = await fetch('https://pandabackend-six.vercel.app/api/menu/items-menu');
        if (!response.ok) throw new Error('Failed to fetch sides and appetizers');
        const data = await response.json();
        setSides(data.sides);
        setAppetizers(data.extras);
      } catch (error) {
        console.error('Error fetching sides and appetizers:', error);
      }
    };

    fetchSidesAndAppetizers();

    const interval = setInterval(() => {
      setHoveredIndex((prevIndex) => (prevIndex + 1) % (sides.length + appetizers.length));
    }, 3500);

    return () => clearInterval(interval);
  }, [sides.length, appetizers.length]);

  const formatDisplayName = (name) => {
    if (name === 'super_greens_side' || name === 'super_greens_entree') {
      name = 'super_greens';
    } else if (name === 'fountain_drink') {
      name = 'fountain';
    } else if (name === 'apple_pie_roll') {
      name = 'apple_pie';
    } else if (name === 'cc_rangoon') {
      name = 'cream_cheese_rangoon';
    } else if (name === 'egg_roll') {
      name = 'chicken_egg_roll';
    } else if (name === 'spring_roll') {
      name = 'veggie_spring_roll';
    } else if (name === 'sweetfire_chicken') {
      name = 'sweetFire_chicken';
    }
    
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="sides-menu-board-container">
      {/* Sides Section */}
      <div className="sides-menu-section">
        <h2 className="sides-menu-section-title">Sides</h2>
        <div className="sides-menu-cards-container">
          {sides.map((item, index) => (
            <div
              key={index}
              className={`sides-menu-card ${index === hoveredIndex ? 'hovered' : ''}`}
            >
              <img
                src={getImage(item.name)}
                alt={item.name}
                className="sides-menu-card-image"
              />
              <div className="sides-menu-card-content">
                <h3 className="sides-menu-card-name">{formatDisplayName(item.name)}</h3>
                <span className="sides-menu-card-calories">
                  {item.calories} Calories
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appetizers Section */}
      <div className="sides-menu-section">
        <h2 className="sides-menu-section-title">Appetizers</h2>
        <div className="sides-menu-cards-container">
          {appetizers.map((item, index) => (
            <div
              key={index + sides.length}
              className={`sides-menu-card ${index + sides.length === hoveredIndex ? 'hovered' : ''}`}
            >
              <img
                src={getImage(item.name)}
                alt={item.name}
                className="sides-menu-card-image"
              />
              <div className="sides-menu-card-content">
                <h3 className="sides-menu-card-name">{formatDisplayName(item.name)}</h3>
                <span className="sides-menu-card-calories">
                  {item.calories} Calories
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuBoardSides;
