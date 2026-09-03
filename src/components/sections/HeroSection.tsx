'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-br from-neutral-50 via-primary-50 to-primary-100 py-20 md:py-32 lg:py-40">
      <div className="container-responsive text-center">
        {/* Badge */}
        <div className="inline-block mb-6 px-4 py-2 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
          🚀 AI-Powered Service Management
        </div>

        {/* Headline */}
        <h1 className="text-h1 md:text-5xl lg:text-6xl mb-6 text-neutral-900 font-bold leading-tight">
          Smarter Service, Better Outcomes
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-neutral-700 mb-8 max-w-2xl mx-auto leading-relaxed">
          AI-powered service request management platform to create, classify, prioritize, analyze, 
          manage and track service requests effortlessly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => router.push('/auth/register')}
            className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-smooth shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-smooth" />
          </button>
          <button
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-smooth"
          >
            Learn More
          </button>
        </div>

        {/* Trust Badges */}
        <p className="text-sm text-neutral-600">
          ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
        </p>
      </div>
    </section>
  );
};