'use client';

import React from 'react';
import { 
  Droplet, 
  Zap, 
  Wind, 
  Home, 
  Hammer, 
  Palette, 
  Layers, 
  Sprout, 
  Sparkles, 
  Wrench,
  AlertCircle,
} from 'lucide-react';

interface Category {
  icon: React.ReactNode;
  name: string;
}

const categories: Category[] = [
  { icon: <Droplet size={28} />, name: 'Plumbing' },
  { icon: <Zap size={28} />, name: 'Electrical' },
  { icon: <Wind size={28} />, name: 'HVAC' },
  { icon: <Home size={28} />, name: 'Roofing' },
  { icon: <Hammer size={28} />, name: 'Carpentry' },
  { icon: <Palette size={28} />, name: 'Painting' },
  { icon: <Layers size={28} />, name: 'Flooring' },
  { icon: <Sprout size={28} />, name: 'Landscaping' },
  { icon: <Sparkles size={28} />, name: 'Cleaning' },
  { icon: <Wrench size={28} />, name: 'General Maintenance' },
  { icon: <AlertCircle size={28} />, name: 'Other' },
];

export const ServiceCategoriesSection: React.FC = () => {
  return (
    <section id="categories" className="py-20 md:py-32 bg-neutral-50">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-4xl mb-4 text-neutral-900 font-bold">
            Service Categories
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Manage all types of service requests with AI-powered categorization.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-smooth flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Icon */}
              <div className="text-primary-600 mb-4 group-hover:text-primary-700 group-hover:scale-110 transition-smooth">
                {category.icon}
              </div>

              {/* Name */}
              <h3 className="font-semibold text-neutral-900 text-sm">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};