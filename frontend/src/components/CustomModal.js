import React from 'react';
import './CustomModal.css';

/**
 * A reusable modal component that presents users with the option to select either an entree or a side dish 
 * for an A La Carte order.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {Function} props.onClose - Function called when the modal is closed.
 * @param {Function} props.onSelectEntree - Function called when the "Entrees" button is clicked.
 * @param {Function} props.onSelectSide - Function called when the "Sides" button is clicked.
 * @memberof module:Frontend/Kiosk
 * @returns {JSX.Element} The rendered modal component.
 */
const CustomModal = ({ onClose, onSelectEntree, onSelectSide }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">
            A La Carte Selection
          </h2>
        </div>
        <div className="modal-content">
          <p className="modal-description">
            Would you like to order an entree or a side?
          </p>
          
          <div className="button-container">
            <button 
              className="primary-button"
              onClick={onSelectEntree}
            >
              Entrees
            </button>
            
            <button 
              className="primary-button"
              onClick={onSelectSide}
            >
              Sides
            </button>
            
            <button 
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
