import { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { cartService } from '../services/cart';
import { FiPlus, FiMinus } from 'react-icons/fi';

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    cartService.addItem(product, selectedVariant, quantity);
    window.dispatchEvent(new Event('cart_updated'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-48 bg-gray-100 relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4 flex-grow">{product.description}</p>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Pack Size</p>
          <div className="flex gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors
                  ${selectedVariant.id === variant.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-gray-200 text-gray-600 hover:border-primary/50'}`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{selectedVariant.price}
          </span>
          <div className="flex items-center border border-gray-200 rounded-md">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Decrease quantity"
            >
              <FiMinus />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Increase quantity"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors relative overflow-hidden"
        >
          {showToast ? '✓ Added to cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
