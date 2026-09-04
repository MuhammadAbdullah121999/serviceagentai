'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { showcaseCategories } from '@/lib/categories';

export const ServiceCategoriesSection: React.FC = () => {
  return (
    <section id="categories" className="py-20 md:py-32 bg-neutral-50">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-4xl mb-4 text-neutral-900 font-bold">
            Service Categories
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Manage all types of service requests with AI-powered categorization.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {showcaseCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/services/${category.slug}`}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-smooth"
            >
              <Image
                src={`/images/categories/${category.slug}.webp`}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-smooth"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-semibold text-white text-sm md:text-base mb-1">
                  {category.name}
                </h3>
                <span className="flex items-center gap-1 text-xs text-white/0 group-hover:text-white/90 transition-smooth">
                  Learn more
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};