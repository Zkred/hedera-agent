import React from 'react';
import { Restaurant } from '../types/chat';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSelect }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(restaurant)}
    >
      <div className="flex">
        <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=🍽️';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{restaurant.cuisine}</p>
          
          <div className="flex items-center mb-1">
            <div className="flex items-center mr-2">
              {renderStars(restaurant.rating)}
            </div>
            <span className="text-sm text-gray-600">{restaurant.rating}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{restaurant.priceRange}</span>
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
