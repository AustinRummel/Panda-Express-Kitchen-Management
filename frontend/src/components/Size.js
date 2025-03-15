import React, { useState, useEffect } from 'react';
import menuData from './menuData';
import './Size.css';

/**
 * @component SizeSelectionModal
 * 
 * A React functional component for selecting the size and quantity of a menu item in a modal popup.
 * It provides size options based on the available `prices` and allows the user to adjust the quantity 
 * if the `showQuantity` flag is enabled. It is displayed conditionally based on the `isOpen` prop.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.isOpen - Determines if the modal should be displayed.
 * @param {function} props.onClose - Function to be called when the modal is closed.
 * @param {function} props.onSelect - Callback function triggered when a size is selected. 
 *                                      It passes an object with the selected `size`, `quantity`, and `price`.
 * @param {Object} props.item - An object representing the menu item being customized.
 * @param {string} props.item.name - The name of the menu item.
 * @param {string} props.item.image - The image URL of the menu item.
 * @param {Object} [props.prices={}] - An object containing price details for available sizes 
 *                                      (e.g., `{ small: 5.99, medium: 7.99, large: 9.99 }`).
 * @param {boolean} [props.showQuantity=false] - If true, displays quantity controls in the modal.
 * 
 * @memberof module:Frontend/Kiosk
 * @returns {JSX.Element|null} A modal for size selection or null if `isOpen` is false.
 */
const SizeSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  item, 
  prices = {},
  showQuantity = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Initialize selected size based on available sizes
      const availableSizes = Object.keys(prices);
      if (availableSizes.length === 1 && availableSizes[0] === 'normal') {
        handleSizeSelect('normal');
      } else {
        setSelectedSize('');
      }
    }
  }, [isOpen, prices]);

  if (!isOpen) return null;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    onSelect({
      size: size,
      quantity: quantity,
      price: prices[size]
    });
  };

  const renderSizeOptions = () => {
    const availableSizes = Object.keys(prices);

    if (availableSizes.length === 1 && availableSizes[0] === 'normal') {
      return (
        <button 
          className="size-button add-item-button"
          onClick={() => handleSizeSelect('normal')}
        >
         Normal
        </button>
      );
    }

    return (
      <div className="size-options">
        {availableSizes.includes('small') && (
          <button 
            className={`size-button ${selectedSize === 'small' ? 'selected' : ''}`}
            onClick={() => handleSizeSelect('small')}
          >
            <span>Small</span>
            <span className="price">+${prices.small.toFixed(2)}</span>
          </button>
        )}
        
        {availableSizes.includes('medium') && (
          <button 
            className={`size-button ${selectedSize === 'medium' ? 'selected' : ''}`}
            onClick={() => handleSizeSelect('medium')}
          >
            <span>Medium</span>
            <span className="price">+${prices.medium.toFixed(2)}</span>
          </button>
        )}
        
        {availableSizes.includes('large') && (
          <button 
            className={`size-button ${selectedSize === 'large' ? 'selected' : ''}`}
            onClick={() => handleSizeSelect('large')}
          >
            <span>Large</span>
            <span className="price">+${prices.large.toFixed(2)}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="size-modal">
        <button onClick={onClose} className="close-button">
          ×
        </button>

        <div className="item-info">
          <img 
            src={item.image} 
            alt={item.name} 
            className="item-image enlarged-modal-image"
            style={{ width: '200px', height: '200px', objectFit: 'contain', margin: '0 auto' }}
          />
          <h3>{item.name}</h3>
        </div>

        {showQuantity && (
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="quantity-button"
            >
              -
            </button>
            <span className="quantity">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="quantity-button"
            >
              +
            </button>
          </div>
        )}

        {renderSizeOptions()}
      </div>
    </div>
  );
};

export default SizeSelectionModal;
