import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

export default function Home() {
  const products = (storage.get('products') || []) as Product[];

  return (
    <div className="bg-secondary/20 min-h-screen pb-12">
      {/* Hero Section */}
      <div className="bg-primary/10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Fresh Urban Chakki Delivered to Your Door
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Choose your pack size and order once or set up automatic delivery.
          </p>
          <Link 
            to="/products"
            className="inline-block px-8 py-4 bg-primary text-white text-lg font-bold rounded-full shadow-md hover:bg-primary/90 transition-transform hover:scale-105"
          >
            Shop Urban Chakki
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
