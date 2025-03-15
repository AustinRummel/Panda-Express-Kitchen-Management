const apiUrl = 'https://pandabackend-six.vercel.app/api/menu/items-menu';

// Helper function to get price for a specific size of an item
const getPrice = (pricedItems, itemName, size) => {
  const pricedItem = pricedItems.find(item => item.name === `${size}_${itemName}`);
  return pricedItem ? parseFloat(pricedItem.price) : null;
};

// Helper function to get all sizes and prices for an item
const getSizes = (pricedItems, itemName) => {
  const sizes = {};
  const possibleSizes = ['S', 'M', 'L', 'N'];
  possibleSizes.forEach(size => {
    const price = getPrice(pricedItems, itemName, size);
    if (price !== null) {
      sizes[size === 'S' ? 'small' : size === 'M' ? 'medium' : size === 'L' ? 'large' : 'normal'] = price;
    }
  });
  return sizes;
};

const formatName = (name) => {
  return name.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getImage = (itemName) => {
  try {
    return require(`../assets/menu-pics/${itemName}.png`);
  } catch (error) {
    console.error(`Error loading image for ${itemName}:`, error);
    return require('../assets/menu-pics/chef_special.png');
  }
};

/**
 * Object containing menu data and methods for initializing and categorizing it.
 * @component menuData
 * @memberof module:Frontend/Menu
 */
const menuData = {
  async initialize() {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Update appetizers array
      this.appetizers = data.extras.map(item => ({
        name: item.name === 'cc_rangoon' ? 'Cream Cheese Rangoon' : formatName(item.name),
        image: getImage(item.name),
        sizes: getSizes(data.priced_items, item.name),
        calories: item.calories,
        category: 'appetizer'
      }));

      // Update entrees array
      this.entrees = data.entrees.map(item => ({
        name: formatName(item.name),
        image: getImage(item.name),
        sizes: getSizes(data.priced_items, item.name),
        calories: item.calories,
        category: 'entree'
      }));

      // Update sides array
      this.sides = data.sides.map(item => ({
        name: formatName(item.name),
        image: getImage(item.name),
        sizes: getSizes(data.priced_items, item.name),
        calories: item.calories,
        category: 'side'
      }));

      // Update drinks array
      this.drinks = data.drinks.map(item => ({
        name: formatName(item.name),
        image: getImage(item.name),
        sizes: getSizes(data.priced_items, item.name),
        calories: item.name === 'fountain_drink' ? '0 - 570' : item.calories,
        category: 'drink'
      }));
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  },
  appetizers: [],
  drinks: [],
  entrees: [],
  sides: []
};

menuData.initialize();
export default menuData;
