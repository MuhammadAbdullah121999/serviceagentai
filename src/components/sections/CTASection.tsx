'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  const router = useRouter();

  return (
    <section id="cta" className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 md:py-32">
      <div className="container-responsive text-center text-white">
        {/* Headline */}
        <h2 className="text-h2 md:text-4xl mb-6 font-bold">
          Ready to Transform Your Service Management?
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-95 leading-relaxed">
          Join service businesses using AI to streamline operations, improve efficiency, 
          and deliver exceptional results.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/auth/register')}
          className="px-10 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-neutral-50 transition-smooth shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
        >
          Start Free Trial Today
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-smooth" />
        </button>

        {/* Subtext */}
        <p className="text-sm mt-8 opacity-90">
          No credit card required • 14-day free trial • Full access to all features
        </p>
      </div>
    </section>
  );
};