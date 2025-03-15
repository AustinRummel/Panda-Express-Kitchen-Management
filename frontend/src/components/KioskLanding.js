/* global google */

import React, { useState, useEffect, useRef } from "react";
import "./KioskLanding.css";
import Checkout from "./KioskCheckout";
import bowl from "../assets/Bowl.png";
import plate from "../assets/Plate.png";
import bigPlate from "../assets/Big_Plate.png";
import cub from "../assets/Cub.png";
import aLaCarte from "../assets/A_La_Carte.png";
import family from "../assets/Family.png";
import SizeSelectionModal from "./Size";
import menuData from "./menuData";
import Cookies from "js-cookie";
import WeatherWidget from "./WeatherWidget";
import CustomModal from './CustomModal';
import "./CustomModal.css";

import { FaSearchPlus, FaSearchMinus } from "react-icons/fa";

// Flag to prevent multiple script loads
let googleTranslateScriptLoaded = false;

/**
 * Main landing page component for the kiosk system.
 * @memberof module:Frontend/Kiosk
 */
function KioskLanding() {
  const [activeSection, setActiveSection] = useState("meals");
  const [orderItems, setOrderItems] = useState([]);
  const translateRef = useRef(null);
  
  // Accessibility State
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  
  // Zoom State
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  
  useEffect(() => {
    // Remove any existing Google Translate elements
    const existingElements = document.querySelectorAll('.google-translate-element');
    existingElements.forEach(el => el.innerHTML = '');

    // Check if the script is already loaded globally
    if (!googleTranslateScriptLoaded && (!window.google || !window.google.translate)) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.id = "google-translate-script";
      
      // Add error handling
      script.onerror = () => {
        console.error('Failed to load Google Translate script');
      };

      document.body.appendChild(script);
      googleTranslateScriptLoaded = true;
    }

    // Initialize Google Translate
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate && translateRef.current) {
          new google.translate.TranslateElement(
            {
              pageLanguage: "en",
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              includedLanguages: "es,zh,zh-CN,tl,vi,ar,fr,ko,ru,de,ht,hi,pt,it,pl,yi,ja,fa,bn,th,ur,el,pa,hy,sr,he",
              autoDisplay: false,
            },
            translateRef.current
          );
        }
      };
    }

    // Cleanup function
    return () => {
      if (translateRef.current) {
        translateRef.current.innerHTML = '';
      }
      // Optionally, remove the script only if no other components need it
      // const scriptElement = document.getElementById("google-translate-script");
      // if (scriptElement) {
      //   scriptElement.remove();
      //   googleTranslateScriptLoaded = false;
      // }
      // delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    // Apply the language from the cookie on mount
    const storedLanguage = Cookies.get("language");
    if (storedLanguage && storedLanguage !== "en") {
      setTimeout(() => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = storedLanguage;
          select.dispatchEvent(new Event("change"));
        }
      }, 1000); // Timeout to ensure the Google Translate widget is initialized
    }
  }, []);

  return (
    <div className={`kiosk-container ${isZoomEnabled ? "zoomed" : ""}`}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        orderItems={orderItems}
        isAccessibilityEnabled={isAccessibilityEnabled}
        setIsAccessibilityEnabled={setIsAccessibilityEnabled}
        isZoomEnabled={isZoomEnabled}
        setIsZoomEnabled={setIsZoomEnabled}
        translateRef={translateRef}
      />
      <Content
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
        isAccessibilityEnabled={isAccessibilityEnabled}
      />
    </div>
  );
}

/**
 * Sidebar component that displays navigation links and order item counter.
 *
 * @param {Object} props - The component props.
 * @param {string} props.activeSection - The current active section.
 * @param {Function} props.setActiveSection - The function to set the active section.
 * @param {Array} props.orderItems - The list of items in the current order.
 * 
 * @memberof module:Frontend/Kiosk
 */
function Sidebar({ activeSection, setActiveSection, orderItems, isAccessibilityEnabled, setIsAccessibilityEnabled, isZoomEnabled, setIsZoomEnabled, translateRef }) {
  // Calculate the total count of items in the order
  const itemCount = orderItems.reduce((total, item) => total + item.quantity, 0);

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 300); // Remove animation after 300ms
      return () => clearTimeout(timeout); // Clean up timeout
    }
  }, [itemCount]);

  // New State for Managing Tap Timing
  const tapTimeout = useRef(null);

  // Function to handle taps with accessibility
  const handleTap = (action) => {
    if (isAccessibilityEnabled) {
      if (tapTimeout.current) {
        // Double tap detected
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
        action('double');
      } else {
        // Single tap detected, set a timeout to wait for potential double tap
        tapTimeout.current = setTimeout(() => {
          tapTimeout.current = null;
          action('single');
        }, 300); // 300ms timeout for double tap
      }
    } else {
      // If accessibility is not enabled, proceed with normal click
      action('single');
    }
  };

  const handleSectionClick = (section) => {
    handleTap((tapType) => {
      if (isAccessibilityEnabled) {
        if (tapType === 'single') {
          const utterance = new SpeechSynthesisUtterance(`You selected ${section}. Single tap to hear details, double tap to select.`);
          speechSynthesis.speak(utterance);
        } else if (tapType === 'double') {
          setActiveSection(section);
        }
      } else {
        setActiveSection(section);
      }
    });
  };

  // Move handlers into Sidebar component
  const handleAccessibilityToggle = () => {
    setIsAccessibilityEnabled(!isAccessibilityEnabled);
    const utterance = new SpeechSynthesisUtterance(
      !isAccessibilityEnabled 
        ? `Voiceover is now enabled. Single tap to hear details, double tap to select.`
        : `Voiceover is now disabled.`
    );
    speechSynthesis.speak(utterance);
  };

  const handleZoomToggle = () => {
    setIsZoomEnabled(!isZoomEnabled);
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-list">
          {/* Menu Items */}
          <li>
            <button
              className={`sidebar-item ${activeSection === "meals" ? "active" : ""}`}
              onClick={() => handleSectionClick("meals")}
              translate="yes"
            >
              <span>Meals</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeSection === "entrees" ? "active" : ""}`}
              onClick={() => handleSectionClick("entrees")}
              translate="yes"
            >
              <span>Entrees</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeSection === "sides" ? "active" : ""}`}
              onClick={() => handleSectionClick("sides")}
              translate="yes"
            >
              <span>Sides</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeSection === "appetizers" ? "active" : ""}`}
              onClick={() => handleSectionClick("appetizers")}
              translate="yes"
            >
              <span>Appetizers</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeSection === "drinks" ? "active" : ""}`}
              onClick={() => handleSectionClick("drinks")}
              translate="yes"
            >
              <span>Drinks</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeSection === "checkout" ? "active" : ""}`}
              onClick={() => handleSectionClick("checkout")}
              translate="yes"
            >
              <span>Checkout</span>
              {itemCount > 0 && (
                <div className={`counter-badge ${animate ? "enlarge" : ""}`}>
                  {itemCount}
                </div>
              )}
            </button>
          </li>

          {/* Controls Section */}
          <li className="accessibility-zoom-toggle-container">
            <div className="accessibility-toggle-container">
              <button
                className={`switch ${isAccessibilityEnabled ? 'active' : ''}`}
                onClick={handleAccessibilityToggle}
                aria-label="Toggle Voiceover Feature"
                aria-pressed={isAccessibilityEnabled}
              >
                <div className="switch-thumb">🗣️</div>
              </button>
            </div>
            <div className="zoom-toggle-container">
              <button 
                onClick={handleZoomToggle} 
                aria-label="Toggle Text Enlargement" 
                className="zoom-button"
              >
                {isZoomEnabled ? <FaSearchMinus /> : <FaSearchPlus />}
              </button>
            </div>
            <div
              ref={translateRef}
              id="google_translate_element"
              className="google-translate-element"
            ></div>
          </li>

          {/* Weather Widget */}
          <li className="weather-widget-container" translate="yes">
            <WeatherWidget />
          </li>
        </ul>
      </nav>
    </aside>
  );
}

/**
 * Content component that displays the dynamic content of each section
 *
 * @param {Object} props - The component props.
 * @param {string} props.activeSection - The current active section.
 * @param {Function} props.setActiveSection - The function to set the active section.
 * @param {Array} props.orderItems - The list of items in the current order.
 * @param {Function} props.setOrderItems - The function to update the order items.
 * @param {Object} props.translateRef - Reference to the Google Translate widget.
 * 
 * @memberof module:Frontend/Kiosk
 */
function Content({ activeSection, setActiveSection, orderItems, setOrderItems, translateRef, isAccessibilityEnabled }) {
  const [selectedMealOption, setSelectedMealOption] = useState(null);
  const [selectedEntree, setSelectedEntree] = useState(null);
  const [selectedSides, setSelectedSides] = useState([]);
  const [selectedPlateEntrees, setSelectedPlateEntrees] = useState([]);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [showALaCarteModal, setShowALaCarteModal] = useState(false);

  const [showHelpPopup, setShowHelpPopup] = useState(false);

  // New State for Managing Tap Timing
  const tapTimeout = useRef(null);

  // Accessibility Tap Handler
  const handleTap = (action) => {
    if (isAccessibilityEnabled) {
      if (tapTimeout.current) {
        // Double tap detected
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
        action('double');
      } else {
        // Single tap detected, set a timeout to wait for potential double tap
        tapTimeout.current = setTimeout(() => {
          tapTimeout.current = null;
          action('single');
        }, 300); // 300ms timeout for double tap
      }
    } else {
      // If accessibility is not enabled, proceed with normal click
      action('single');
    }
  };

  // Responsible for handling the different meal options
  // array of items to be displayed on the 'Meals' tab (information pulled from the menu boards)
  const items = [
    {
      name: "Bowl",
      image: bowl,
      title: 'BOWL',
      description: '1 Entree & 1 Side',
      calories: '280 - 1130 Cal Per Serving',
      price: "$8.30+"
    },
    {
      name: "Plate",
      image: plate,
      title: 'PLATE',
      description: '2 Entrees & 1 Side', 
      calories: '430 - 1640 Cal Per Serving',
      price: "$9.80+"
    },
    {
      name: "Bigger Plate",
      image: bigPlate,
      title: 'BIGGER PLATE',
      description: '3 Entrees & 1 Side',
      calories: '580 - 2150 Cal Per Serving',
      price: "$11.30+"
    },
    {
      name: "Cub",
      image: cub,
      title: 'PANDA CUB',
      description: 'Jr. Entree, Jr. Side, Fruit Side, and Bottled Water/Juice',
      calories: '300 - 740 Cal Per Serving',
      price: "$6.80+"
    },
    {
      name: "Family",
      image: family,
      title: 'FAMILY',
      description: '3 Large Entrees & 2 Large Sides',
      calories: '430 - 1640 Cal Per Serving',
      price: "$43.00+"
    },
    {
      name: "A La Carte",
      image: aLaCarte,
      title: "A LA CARTE",
      description: (
        <div className="menu-card-split">
          <div className="menu-card-half">
            <strong>Entree</strong>
          </div>
          <div className="menu-card-half">
            <strong>Side</strong>
          </div>
        </div>
      ),
      calories: '130 - 620 Cal Per Serving',
      price: "$4.40+"
    },
  ];

  const resetStates = () => {
    setSelectedMealOption(null);
    setSelectedEntree(null);
    setSelectedSides([]);
    setSelectedPlateEntrees([]);
    setSizeModalOpen(false);
    setSelectedItem(null);
    setSelectedSize(null);
    setSelectedItemType(null);
    setShowALaCarteModal(false);
  };

  // set of arrays to store the current items
  const entrees = menuData.entrees;
  const sides = menuData.sides;
  const appetizers = menuData.appetizers;
  const drinks = menuData.drinks;


  const addItemToOrder = (item) => {
    // check if the item already exists in orderItems
    const existingItemIndex = orderItems.findIndex(
      (orderItem) =>
        orderItem.name === item.name && 
        JSON.stringify(orderItem.description) === JSON.stringify(item.description)
    );
  
    if (existingItemIndex !== -1) {
      // if the item exists, update its quantity
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedOrderItems);
    } 
    else {
      // otherwise, add it
      setOrderItems((prevItems) => [
        ...prevItems,
        {
          ...item,
          id: Date.now(),
        },
      ]);
    }
  
    // reset the states after adding the item
    resetStates();
  };

  // responsible for handling the different meal options
  const handleMealOptionClick = (option) => {
    handleTap((tapType) => {
      if (isAccessibilityEnabled) {
        if (tapType === 'single') {
          // Voice over for meal selection
          const utterance = new SpeechSynthesisUtterance(`${option}: ${getMealDescription(option)}`);
          speechSynthesis.speak(utterance);
        } else if (tapType === 'double') {
          // Execute original logic on double tap
          if (option === 'A LA CARTE') {
            setShowALaCarteModal(true);
            setSelectedMealOption(option);
            
            // Add speech synthesis for accessibility
            const aLaCarteUtterance = new SpeechSynthesisUtterance(
              "A La Carte Selection. Would you like to order an entree or a side? Entrees, Sides, Cancel."
            );
            speechSynthesis.speak(aLaCarteUtterance);
          } else {
            setSelectedMealOption(selectedMealOption === option ? null : option);
            handleMealClick(option);
          }
        }
      } else {
        // Original behavior when accessibility is disabled
        if (option === 'A LA CARTE') {
          setShowALaCarteModal(true);
          setSelectedMealOption(option);
        } else {
          setSelectedMealOption(selectedMealOption === option ? null : option);
          handleMealClick(option);
        }
      }
    });
  };

  const handleALaCarteSelection = (selection) => {
    setShowALaCarteModal(false);
    setActiveSection(selection);
  };

  // Dynamic styling for `next-button-container`
  const nextButtonContainerStyle = {
    boxShadow: showALaCarteModal ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : 'none',
  };

  // sorts through the entree options and applies formatting accordingly
  const handleEntreeClick = (entree) => {
    handleTap((tapType) => {
      if (isAccessibilityEnabled) {
        if (tapType === 'single') {
          // Voice over for entree selection
          const utterance = new SpeechSynthesisUtterance(
            `${entree.name}. ${entree.calories} calories.`
          );
          speechSynthesis.speak(utterance);
        } else if (tapType === 'double') {
          // Original selection logic
          if (selectedMealOption === "A LA CARTE") {
            setSelectedItem(entree);
            setSelectedItemType("entree");
            setSizeModalOpen(true);
          } 
          else if (selectedMealOption === 'BOWL') {
            setSelectedEntree(entree.name);
          }
          else if (selectedMealOption === 'PLATE') {
            if (selectedPlateEntrees.length < 2) {
              setSelectedPlateEntrees(prevSelected => [...prevSelected, entree.name]);
            } 
            else {
              const newSelected = [...selectedPlateEntrees];
              newSelected.shift();
              setSelectedPlateEntrees([...newSelected, entree.name]);
            }
          } 
          else if (selectedMealOption === 'BIGGER PLATE' || selectedMealOption === 'FAMILY') {
            if (selectedPlateEntrees.length < 3) {
              setSelectedPlateEntrees(prevSelected => [...prevSelected, entree.name]);
            } 
            else {
              const newSelected = [...selectedPlateEntrees];
              newSelected.shift();
              setSelectedPlateEntrees([...newSelected, entree.name]);
            }
          }
          else {
            setSelectedEntree(entree.name);
          }
        }
      } else {
        // Original behavior when accessibility is disabled
        if (selectedMealOption === "A LA CARTE") {
          setSelectedItem(entree);
          setSelectedItemType("entree");
          setSizeModalOpen(true);
        } 
        else if (selectedMealOption === 'BOWL') {
          setSelectedEntree(entree.name);
        }
        else if (selectedMealOption === 'PLATE') {
          if (selectedPlateEntrees.length < 2) {
            setSelectedPlateEntrees(prevSelected => [...prevSelected, entree.name]);
          } 
          else {
            const newSelected = [...selectedPlateEntrees];
            newSelected.shift();
            setSelectedPlateEntrees([...newSelected, entree.name]);
          }
        } 
        else if (selectedMealOption === 'BIGGER PLATE' || selectedMealOption === 'FAMILY') {
          if (selectedPlateEntrees.length < 3) {
            setSelectedPlateEntrees(prevSelected => [...prevSelected, entree.name]);
          } 
          else {
            const newSelected = [...selectedPlateEntrees];
            newSelected.shift();
            setSelectedPlateEntrees([...newSelected, entree.name]);
          }
        }
        else {
          setSelectedEntree(entree.name);
        }
      }
    });
  };

  // responsible for managing the selected side options
  const handleSideClick = (side) => {
    handleTap((tapType) => {
      if (isAccessibilityEnabled) {
        if (tapType === 'single') {
          const utterance = new SpeechSynthesisUtterance(
            `${side.name}. ${side.calories} calories.`
          );
          speechSynthesis.speak(utterance);
        } else if (tapType === 'double') {
          // Original selection logic
          if (selectedMealOption === "A LA CARTE") {
            setSelectedItem(side);
            setSelectedItemType("side");
            setSizeModalOpen(true);
          } 
          else if (selectedMealOption === 'FAMILY') {
            if (selectedSides.includes(side.name)) {
              const index = selectedSides.indexOf(side.name);
              const newSelectedSides = [...selectedSides];
              newSelectedSides.splice(index, 1);
              setSelectedSides(newSelectedSides);
            } 
            else if (selectedSides.length < 2) {
              setSelectedSides([...selectedSides, side.name]);
            } 
            else {
              const newSelected = [...selectedSides];
              newSelected.shift();
              setSelectedSides([...newSelected, side.name]);
            }
          }
          else {
            if (selectedSides.length === 0) {
              setSelectedSides([side.name]);
            } 
            else if (selectedSides.length === 1) {
              if (selectedSides[0] === side.name) {
                return;
              }
              setSelectedSides(prevSelected => [...prevSelected, side.name]);
            } 
            else if (selectedSides.length === 2) {
              if (selectedSides.includes(side.name)) {
                setSelectedSides([side.name]);
              } 
              else {
                const newSelected = [...selectedSides];
                newSelected.shift();
                setSelectedSides([...newSelected, side.name]);
              }
            }
          }
        }
      } else {
        if (selectedMealOption === "A LA CARTE") {
          setSelectedItem(side);
          setSelectedItemType("side");
          setSizeModalOpen(true);
        } 
        else if (selectedMealOption === 'FAMILY') {
          // allow selection of up to 2 sides
          if (selectedSides.includes(side.name)) {
            const index = selectedSides.indexOf(side.name);
            const newSelectedSides = [...selectedSides];
            newSelectedSides.splice(index, 1);
            setSelectedSides(newSelectedSides);
          } 
          else if (selectedSides.length < 2) {
            setSelectedSides([...selectedSides, side.name]);
          } 
          else {
            // if already 2 sides are selected, replace the first one
            const newSelected = [...selectedSides];
            newSelected.shift();
            setSelectedSides([...newSelected, side.name]);
          }
        }
        else {
          if (selectedSides.length === 0) {
            // if no sides selected, add this as the first one
            setSelectedSides([side.name]);
          } 
          else if (selectedSides.length === 1) {
            if (selectedSides[0] === side.name) {
              // do nothing if clicking the single selected side
              return;
            }
            // if one side is selected, add this as the second one
            setSelectedSides(prevSelected => [...prevSelected, side.name]);
          } 
          else if (selectedSides.length === 2) {
            if (selectedSides.includes(side.name)) {
              // if clicking one of the 1/2 sides, make it full and remove the other
              setSelectedSides([side.name]);
            } 
            else {
              // if clicking a new side, remove the first one and add the new one
              const newSelected = [...selectedSides];
              newSelected.shift();
              setSelectedSides([...newSelected, side.name]);
            }
          }
        }
      }
    });
  };


 // update the selection count functions
 const getEntreeSelectionCount = (entreeName) => {
  if (selectedMealOption === 'BOWL' || selectedMealOption === 'PANDA CUB') {
    return selectedEntree === entreeName ? 1 : 0;
  }
  return selectedPlateEntrees.filter(name => name === entreeName).length;
};

const getSideSelectionCount = (sideName) => {
  
  if (selectedMealOption === 'FAMILY') {
    if (!selectedSides.includes(sideName)) {
      return 0; // no selection
    }
    else if (selectedSides.length === 1) {
      return "2"; // single selection shows as "1"
    } 
    else if (selectedSides.length === 2) {
      return "1";
    }
  }
  else {
    if (!selectedSides.includes(sideName)) {
      return 0; // no selection
    }
    if (selectedSides.length === 1) {
      return "1"; // single selection shows as "1"
    } 
    else {
      return "1/2"; // multiple selections show as "1/2"
    }
  }
};

  const handleAppetizerClick = (appetizer) => {
    handleTap((tapType) => {
      if (isAccessibilityEnabled) {
        if (tapType === 'single') {
          const utterance = new SpeechSynthesisUtterance(
            `${appetizer.name}. ${appetizer.calories} calories.`
          );
          speechSynthesis.speak(utterance);
        } else if (tapType === 'double') {
          setSelectedItem(appetizer);
          setSelectedItemType("appetizer");
          setSizeModalOpen(true);
        }
      } else {
        // Original non-accessibility behavior
        setSelectedItem(appetizer);
        setSelectedItemType("appetizer");
        setSizeModalOpen(true);
      }
    });
  };

  const handleDrinkClick = (drink) => {
    handleTap((tapType) => {
      if (isAccessibilityEnabled) {
        if (tapType === 'single') {
          const utterance = new SpeechSynthesisUtterance(
            `${drink.name}. ${drink.calories} calories.`
          );
          speechSynthesis.speak(utterance);
        } else if (tapType === 'double') {
          setSelectedItem(drink);
          setSelectedItemType("drink");
          setSizeModalOpen(true);
        }
      } else {
        // Original non-accessibility behavior
        setSelectedItem(drink);
        setSelectedItemType("drink");
        setSizeModalOpen(true);
      }
    });
  };

  const goToMeals = () => {
    setActiveSection("meals");
  };

  const goToEntrees = () => {
    setActiveSection("entrees");
  };

  // Inside Content component

// Add this helper function for voice over descriptions
const getMealDescription = (mealType) => {
  switch (mealType) {
    case 'BOWL':
      return '1 Entree and 1 Side for $8.30';
    case 'PLATE':
      return '2 Entrees and 1 Side for $9.80';
    case 'BIGGER PLATE':
      return '3 Entrees and 1 Side for $11.30';
    case 'PANDA CUB':
      return 'Junior Entree, Junior Side, Fruit Side, and Bottled Water or Juice for $6.80';
    case 'FAMILY':
      return '3 Large Entrees and 2 Large Sides for $43.00';
    case 'A LA CARTE':
      return 'Individual items starting at $4.40';
    default:
      return '';
  }
};


// Keep the original handleMealClick function unchanged
const handleMealClick = (mealType) => {
  goToEntrees();

  if (mealType === 'BOWL' && selectedEntree && selectedSides.length !== 0) {
    // existing bowl logic
    let finalPrice = 8.30;
    if(selectedEntree === 'Honey Walnut Shrimp' || selectedEntree === 'Black Pepper Steak'){
      finalPrice += 1.5;
    }

    addItemToOrder({
      name: "Bowl",
      description: [...selectedSides, selectedEntree],
      image: require("../assets/checkout-pics/bowl.png"),
      quantity: 1,
      price: finalPrice
    });
    goToMeals();
  } 
    
    else if (mealType === 'PLATE' && selectedPlateEntrees.length !== 0 && selectedSides.length !== 0) {

      // calculate additional cost for special entrees
      const specialEntreeCount = selectedPlateEntrees.reduce((count, entree) => {
        if (entree === 'Black Pepper Steak' || entree === 'Honey Walnut Shrimp') {
          return count + 1.5;
        }
        return count;
      }, 0);
    
      // calculate final price
      const basePrice = 9.80;
      const finalPrice = basePrice + specialEntreeCount;
    

      addItemToOrder({
        name: "Plate",
        description: [...selectedSides, ...selectedPlateEntrees],
        image: require("../assets/checkout-pics/plate.png"),
        quantity: 1,
        price: finalPrice
      });
      goToMeals();
    }
    else if (mealType === 'BIGGER PLATE' && selectedPlateEntrees.length !== 0 && selectedSides.length !== 0) {

      // calculate additional cost for special entrees
      const specialEntreeCount = selectedPlateEntrees.reduce((count, entree) => {
        if (entree === 'Black Pepper Steak' || entree === 'Honey Walnut Shrimp') {
          return count + 1.5;
        }
        return count;
      }, 0);
    
      // calculate final price
      const basePrice = 11.30;
      const finalPrice = basePrice + specialEntreeCount;

      addItemToOrder({
        name: "Bigger Plate",
        description: [...selectedSides, ...selectedPlateEntrees],
        image: require("../assets/checkout-pics/big_plate.png"),
        quantity: 1,
        price: finalPrice
      });
      goToMeals();
    }
    else if (mealType === 'FAMILY' && selectedPlateEntrees.length !== 0 && selectedSides.length !== 0) {
      
      // calculate additional cost for special entrees
      const specialEntreeCount = selectedPlateEntrees.reduce((count, entree) => {
        if (entree === 'Black Pepper Steak' || entree === 'Honey Walnut Shrimp') {
          return count + 4.50;
        }
        return count;
      }, 0);
    
      // calculate final price
      const basePrice = 43.00;
      const finalPrice = basePrice + specialEntreeCount;

      addItemToOrder({
        name: "Family",
        description: [...selectedSides, ...selectedPlateEntrees],
        image: require("../assets/checkout-pics/family_meal.png"),
        quantity: 1,
        price: finalPrice
      });
      goToMeals();
    }
    else if (mealType === 'PANDA CUB' && selectedEntree && selectedSides.length !== 0) {

      let finalPrice = 6.80;
      if(selectedEntree === 'Honey Walnut Shrimp' || selectedEntree === 'Black Pepper Steak'){
        finalPrice += 1;
      }

      addItemToOrder({
        name: "Panda Cub",
        description: [...selectedSides, selectedEntree],
        image: require("../assets/checkout-pics/cub_meal.png"),
        quantity: 1,
        price: finalPrice
      });
      goToMeals();
    }
  };

  const handleNext = () => {
    if (activeSection === "meals" && selectedMealOption) {
      setActiveSection("entrees");
    } 
    else if (activeSection === "entrees") {
      if ((selectedMealOption === 'BOWL' || selectedMealOption === 'PANDA CUB') && selectedEntree) {
        setActiveSection("sides");
      } 
      else if ((selectedMealOption === 'PLATE' && selectedPlateEntrees.length === 2) ||
                 ((selectedMealOption === 'BIGGER PLATE' || selectedMealOption === 'FAMILY') && 
                   selectedPlateEntrees.length === 3)) {
        setActiveSection("sides");
      }
    } 
    else if (activeSection === "sides" && selectedSides.length > 0) {
      // add item to order based on meal type
      if (selectedMealOption === 'BOWL') {

        // in the event that we have shrimp or this steak the price should be adjusted
        let finalPrice = 8.30;
        if(selectedEntree === 'Honey Walnut Shrimp' || selectedEntree === 'Black Pepper Steak'){
          finalPrice += 1.5;
        }

        addItemToOrder({
          name: "Bowl",
          description: [...selectedSides, selectedEntree],
          image: require("../assets/checkout-pics/bowl.png"),
          quantity: 1,
          price: finalPrice
        });
      } 
      else if (selectedMealOption === 'PLATE') {

        // calculate additional cost for special entrees
        const specialEntreeCount = selectedPlateEntrees.reduce((count, entree) => {
          if (entree === 'Black Pepper Steak' || entree === 'Honey Walnut Shrimp') {
            return count + 1.5;
          }
          return count;
        }, 0);
      
        // calculate final price
        const basePrice = 9.80;
        const finalPrice = basePrice + specialEntreeCount;

        addItemToOrder({
          name: "Plate",
          description: [...selectedSides, ...selectedPlateEntrees],
          image: require("../assets/checkout-pics/plate.png"),
          quantity: 1,
          price: finalPrice
      });
   }
      else if (selectedMealOption === 'BIGGER PLATE') {

        // calculate additional cost for special entrees
        const specialEntreeCount = selectedPlateEntrees.reduce((count, entree) => {
          if (entree === 'Black Pepper Steak' || entree === 'Honey Walnut Shrimp') {
            return count + 1.5;
          }
          return count;
        }, 0);
      
        // calculate final price
        const basePrice = 11.30;
        const finalPrice = basePrice + specialEntreeCount;

        addItemToOrder({
          name: "Bigger Plate",
          description: [...selectedSides, ...selectedPlateEntrees],
          image: require("../assets/checkout-pics/big_plate.png"),
          quantity: 1,
          price: finalPrice
        });
      } 
      else if (selectedMealOption === 'FAMILY') {

        // calculate additional cost for special entrees
        const specialEntreeCount = selectedPlateEntrees.reduce((count, entree) => {
          if (entree === 'Black Pepper Steak' || entree === 'Honey Walnut Shrimp') {
            return count + 4.50;
          }
          return count;
        }, 0);
      
        // calculate final price
        const basePrice = 43.00;
        const finalPrice = basePrice + specialEntreeCount;

        addItemToOrder({
          name: "Family",
          description: [...selectedSides, ...selectedPlateEntrees],
          image: require("../assets/checkout-pics/family_meal.png"),
          quantity: 1,
          price: finalPrice
        });

      } 
      else if (selectedMealOption === 'PANDA CUB') {

        // calculate additional cost for premium options
        let finalPrice = 6.80;
        if(selectedEntree === 'Honey Walnut Shrimp' || selectedEntree === 'Black Pepper Steak'){
          finalPrice += 1;
        }

        addItemToOrder({
          name: "Panda Cub",
          description: [...selectedSides, selectedEntree],
          image: require("../assets/checkout-pics/cub_meal.png"),
          quantity: 1,
          price: finalPrice
        });
      }

    // Redirect to Meals instead of Checkout
      goToMeals();
    } else if (activeSection === "appetizers") {
      setActiveSection("drinks");
    } else if (activeSection === "drinks") {
      setActiveSection("checkout"); 
    }
  };

  const isNextEnabled = () => {
    if (activeSection === "meals") {
      return selectedMealOption !== null;
    } 
    else if (activeSection === "entrees") {
      if (selectedMealOption === 'BOWL' || selectedMealOption === 'PANDA CUB') {
        return selectedEntree !== null;
      } 
      else if (selectedMealOption === 'PLATE') {
        return selectedPlateEntrees.length === 2;
      } 
      else if (selectedMealOption === 'BIGGER PLATE' || selectedMealOption === 'FAMILY') {
        return selectedPlateEntrees.length === 3;
      }
    } 
    else if (activeSection === "sides") {
      return selectedSides.length > 0;
    } 
    else if (activeSection === "appetizers" || activeSection === "drinks") {
      return true;
    }
    return false;
  };

  // update menu card styles for drinks section
  const getDrinkCardClass = (drink) => {
    const isSelected = selectedItem?.name === drink.name && selectedSize;
    return `menu-card ${isSelected ? "selected" : ""}`;
  };

  const numberToWords = (num) => {
    const ones = [
      "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    ];
    const teens = [
      "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
      "seventeen", "eighteen", "nineteen",
    ];
    const tens = [
      "", "ten", "twenty", "thirty", "forty", "fifty",
      "sixty", "seventy", "eighty", "ninety",
    ];
  
    // Function to convert numbers from 1 to 99
    const convertToWords = (n) => {
      if (n < 10) return ones[n];
      if (n >= 11 && n <= 19) return teens[n - 11];
      if (n < 100) {
        let tensPlace = Math.floor(n / 10);
        let onesPlace = n % 10;
        return onesPlace === 0 ? tens[tensPlace] : tens[tensPlace] + " " + ones[onesPlace];
      }
      return '';
    };
  
    let dollars = Math.floor(num);
    let cents = Math.round((num - dollars) * 100);
  
    const dollarText = dollars > 0 ? convertToWords(dollars) + " dollar" + (dollars > 1 ? "s" : "") : "";
    const centText = cents > 0 ? convertToWords(cents) + " cent" + (cents > 1 ? "s" : "") : "";
  
    if (dollars > 0 && cents > 0) {
      return `${dollarText} and ${centText}`;
    } else if (dollars > 0) {
      return dollarText;
    } else if (cents > 0) {
      return centText;
    } else {
      return "zero dollars";
    }
  };

  
  const speakOrder = () => {
    const subTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxes = subTotal * 0.0825;
    const total = subTotal + taxes;
  
    // Generate speech text from orderItems
    const orderText = orderItems
      .map((item) => {
        if(item.name === 'Bowl' || item.name === 'Plate' || item.name === 'Bigger Plate' || item.name === 'Panda Cub' || item.name === 'Family'){
          const descriptionText = item.description ? item.description.join(", ") : "";
          return `${item.quantity} ${item.name} with ${descriptionText}`;
        }
        return `${item.quantity} ${item.description} ${item.name}`;
        
      })
      .join(". ");
  
      const totalText = `The total is ${numberToWords(total)}.`;
  
    // Create a SpeechSynthesisUtterance object
    const utterance = new SpeechSynthesisUtterance(`${orderText}. ${totalText}`);
    speechSynthesis.speak(utterance);
  };


  const notifyEmployee = async () => {
    setShowHelpPopup(true);
    try {
      // Call the API to update the "Help" employee status
      const response = await fetch('https://pandabackend-six.vercel.app/api/employees/update-help-employee', {
        method: 'PUT',
      });
  
      if (!response.ok) {
        throw new Error('Failed to update employee status');
      }
  
      const data = await response.json();
      console.log(data.message); // Logging the success message
    } catch (err) {
      console.error(err.message);
    }
  };
  
  

  return (
    <main className="content">
        {showALaCarteModal && (
        <CustomModal 
          onClose={() => setShowALaCarteModal(false)}
          onSelectEntree={() => handleALaCarteSelection("entrees")}
          onSelectSide={() => handleALaCarteSelection("sides")}
        />
      )}

       {/* Help Popup */}
       {showHelpPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "30px",
            border: '3px solid black',
            fontSize: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setShowHelpPopup(false)}
            style={{
              position: "absolute",
              top: "0px",
              right: "10px",
              background: "none",
              color: "red",
              border: "none",
              fontSize: "30px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <h3 style={{ margin: 0, textAlign: "center" }}>Help is on the way...</h3>
        </div>
      )}


      <div className="next-button-container" style={nextButtonContainerStyle}>
        <h1 className="section-title">
          {activeSection === "meals" && <span>PICK A MEAL</span>}
          {activeSection === "entrees" && (
            <span>
              PICK AN ENTREE -
              <span style={{ fontWeight: "normal" }}>
                {selectedMealOption === 'BOWL' || selectedMealOption === 'PANDA CUB' || selectedMealOption === 'A LA CARTE' ? " (Choose 1)" : selectedMealOption === 'BIGGER PLATE' || selectedMealOption === 'FAMILY' ? " (Choose 3)" : " (Choose 2)"}
              </span>
            </span>
          )}
          {activeSection === "appetizers" && <span>PICK AN APPETIZER</span>}
          {activeSection === "drinks" && <span>PICK A DRINK</span>}
          {activeSection === "sides" && (
            <span>
              PICK A SIDE -
              <span style={{ fontWeight: "normal" }}>
                {selectedMealOption === 'A LA CARTE' ? " (Choose 1)" : selectedMealOption === 'FAMILY' ? " (Choose 2)" : " (Choose up to 2)"}
              </span>
            </span>
          )}
          {activeSection === "checkout" && <span>CHECKOUT</span>}
        </h1>


        {/* Only show the Next button on specific tabs */}
        {activeSection !== "appetizers" && 
          activeSection !== "drinks" && 
          activeSection !== "meals" && 
          activeSection !== "checkout" && (
            <button
              className="next-button"
              onClick={handleNext}
              disabled={!isNextEnabled()}
            >
              {activeSection === "sides" ? <span>ADD TO CART</span> : <span>NEXT</span>}
            </button>
          )}

          {activeSection === "checkout" && (
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={speakOrder}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-2xl font-bold"
              >
                Read Order
              </button>
            </div>
          )}

          {activeSection === "checkout" && (
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={notifyEmployee}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-2xl font-bold"
              >
                Call For Help
              </button>
            </div>
          )}

          
      </div>


      {activeSection === "meals" && (
        <section className="content-section">
          <div className="menu-cards-container">
            {items.map((item) => (
              <div
                key={item.title}
                className={`menu-card ${
                  selectedMealOption === item.title ? "selected" : ""
                }`}
                onClick={() => handleMealOptionClick(item.title)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="menu-card-image"
                />
                <div className="menu-card-content">
                  <h2 className="menu-card-name"><span>{item.title}</span></h2>
                  <p className="menu-card-description"><span>{item.description}</span></p>
                  <span className="menu-card-price"><span>{item.price}</span></span>
                  <span className="menu-card-calories"><span>{item.calories}</span></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
       {activeSection === "entrees" && (
        <section className="content-section">

          {/* Entrees Cards */}
          <div className="menu-cards-container">
            {entrees.map((entree) => {
              const selectionCount = getEntreeSelectionCount(entree.name);
              return (
                <div
                  key={entree.name}
                  className={`menu-card ${selectionCount > 0 ? "selected" : ""}`}
                  onClick={() => handleEntreeClick(entree)}
                >
                  {selectionCount > 0 && (
                    <div className="selection-count">{selectionCount}</div>
                  )}
                  <img
                    src={entree.image}
                    alt={entree.name}
                    className="menu-card-image"
                  />
                  <div className="menu-card-content">
                    <h2 className="menu-card-name">{entree.name}</h2>
                    <span className="menu-card-calories">
                      {entree.calories} Calories
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

       {activeSection === "sides" && (
        <section className="content-section">
         <div className="menu-cards-container">
      {sides.map((side) => {
        const selectionCount = getSideSelectionCount(side.name);
        return (
          <div
            key={side.name}
            className={`menu-card ${selectionCount !== 0 ? 'selected' : ''}`}
            onClick={() => handleSideClick(side)}
          >
            {selectionCount !== 0 && (
              <div className="selection-count">{selectionCount}</div>
            )}
            <img
              src={side.image}
              alt={side.name}
              className="menu-card-image"
            />
            <div className="menu-card-content">
              <h2 className="menu-card-name">{side.name}</h2>
              <span className="menu-card-calories">{side.calories} Calories</span>
            </div>
          </div>
        );
      })}
          </div>
        </section>
      )}
      {activeSection === "appetizers" && (
        <section className="content-section">
          <div className="menu-cards-container">
            {appetizers.map((appetizer) => (
              <div
                key={appetizer.name}
                className={`menu-card ${
                  selectedItem?.name === appetizer.name && selectedSize
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleAppetizerClick(appetizer)}
              >
                <img
                  src={appetizer.image}
                  alt={appetizer.name}
                  className="menu-card-image"
                  style={{
                    objectFit: "contain",
                    height: "250px",
                    margin: "0 auto",
                  }}
                />
                <div className="menu-card-content">
                  <h2 className="menu-card-name">{appetizer.name}</h2>
                  <span className="menu-card-calories">
                    {appetizer.calories} Calories
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {activeSection === "drinks" && (
        <section className="content-section">
          <div className="menu-cards-container">
            {drinks.map((drink) => (
              <div
                key={drink.name}
                className={getDrinkCardClass(drink)}
                onClick={() => handleDrinkClick(drink)}
              >
                <img
                  src={drink.image}
                  alt={drink.name}
                  className="menu-card-image"
                  style={{
                    objectFit: "contain",
                    height: "250px",
                    width: "100%",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
                <div className="menu-card-content">
                  <h2 className="menu-card-name">{drink.name}</h2>
                  <span className="menu-card-calories">
                    {drink.calories} Calories
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {activeSection === "checkout" && (
        <section className="content-section-checkout">
          <div className="checkout-content">
            <Checkout 
              orderItems={orderItems} 
              setOrderItems={setOrderItems} 
              onPaymentComplete={() => {
                goToMeals();
              }} 
            />
          </div>
        </section>
      )}

      {sizeModalOpen && (
        <SizeSelectionModal
          isOpen={sizeModalOpen}
          onClose={() => {
            setSizeModalOpen(false);
            setSelectedSize(null);
          }}
          item={selectedItem}
          prices={selectedItem.sizes}
          onSelect={({ size, quantity, price }) => {
            setSelectedSize(size);

            let finalPrice = price;
            if (selectedItemType === 'entree') {
              finalPrice = selectedItem.sizes[size.toLowerCase()];
            } else if (selectedItemType === 'side') {
              finalPrice = selectedItem.sizes[size.toLowerCase()];
            }

            addItemToOrder({
              name: selectedItem.name,
              description: [size === 'normal' ? 'Normal' : size.charAt(0).toUpperCase() + size.slice(1)],
              image: selectedItem.image,
              quantity: quantity,
              price: finalPrice,
            });
            goToMeals();
          }}
          showQuantity={
            selectedItemType === "drink" ||
            selectedItemType === "appetizer" ||
            selectedItemType === "entree" ||
            selectedItemType === "side"
          }
        />
      )}
    </main>
  );
}
export default KioskLanding; 
