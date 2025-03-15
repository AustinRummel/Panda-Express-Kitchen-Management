import React, { useEffect, useState } from "react";
import axios from "axios";
import blazingImage from "../assets/menu-pics/blazing.png";
import blazingImage2 from "../assets/menu-pics/blazing2.png";
import blazingImage3 from "../assets/menu-pics/blazing3.png";
import orangeChickenImg from "../assets/menu-pics/orange_chicken.png";
import teriyakiChicken from "../assets/menu-pics/teriyaki_chicken.png";

const API_KEY = "93ebd5f142bedb95d9b7be09a41d0897";
const API_URL = `https://api.openweathermap.org/data/2.5/weather`;
const location = "College Station"; // Fixed city

/**
 * A carousel component that displays a rotating set of images along with a weather-based recommendation.
 * 
 * @component
 * @memberof module:Frontend/Menu
 * @returns {JSX.Element} The rendered carousel component.
 * 
 * @description
 * This carousel cycles through a series of promotional images and displays a special weather-based recommendation card. 
 * The recommendation adapts dynamically based on the current weather data fetched from the OpenWeather API.
 */
const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [recommendation, setRecommendation] = useState({
    name: "",
    description: "",
    img: "",
  });

  const carouselImages = [blazingImage, blazingImage2, blazingImage3];

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(API_URL, {
          params: {
            q: location,
            appid: API_KEY,
            units: "imperial", // Use Fahrenheit
          },
        });
        setWeather(response.data);
        generateRecommendation(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchWeather();
  }, []);

  // Generate a single recommendation based on weather
  const generateRecommendation = (weatherData) => {
    const temp = weatherData?.main?.temp;

    if (temp < 75) {
      // Cooling Down (Cold Weather)
      setRecommendation({
        name: "Orange Chicken",
        description:
          "A comforting classic with crispy chicken tossed in a sweet and tangy orange sauce.",
        img: orangeChickenImg,
      });
    } else {
      // Warmer Weather (Lighter Options)
      setRecommendation({
        name: "Grilled Teriyaki Chicken",
        description:
          "Perfect for warm weather, featuring juicy grilled chicken glazed with teriyaki sauce.",
        img: teriyakiChicken, // Replace with actual Grilled Teriyaki Chicken image
      });
    }
  };

  // Include weather recommendation card as part of carousel items
  const carouselItems = [
    ...carouselImages.map((image) => ({ type: "image", content: image })),
    { type: "card", content: recommendation },
  ];

  // Update the carousel index every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carouselItems.map((item, index) =>
          item.type === "image" ? (
            <img
              key={index}
              src={item.content}
              alt={`Slide ${index + 1}`}
              className="min-w-full h-[300px] object-contain rounded-lg"
            />
          ) : (
            <div
              key={index}
              className="min-w-full h-[300px] flex items-center justify-center"
            >
              <div className="w-[400px] flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-xl font-bold mb-2 text-center">
                  <span className="text-red-600">
                    {weather ? `${Math.round(weather.main.temp)}°F in ${location}` : ""}
                  </span>
                  <br />
                  <span className="text-black">Try our {item.content.name}</span>
                </h2>
                <img
                  src={item.content.img}
                  alt={item.content.name}
                  className="w-32 h-32 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-800 text-sm text-center">
                  {item.content.description}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Carousel;
