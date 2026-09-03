'use client';

import React from 'react';
import { Brain, Zap, Smartphone, BarChart3, Search, Lock } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Brain size={32} />,
    title: 'AI Classification',
    description: 'Automatically categorize and prioritize service requests using intelligent analysis.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Smart Suggestions',
    description: 'Get AI-generated summaries and recommended next steps for every request.',
  },
  {
    icon: <Smartphone size={32} />,
    title: 'Multi-Platform',
    description: 'Access service requests from web dashboard or native Android app seamlessly.',
  },
  {
    icon: <BarChart3 size={32} />,
    title: 'Dashboard Overview',
    description: 'Track request counts, status breakdowns, and manage workflow in one place.',
  },
  {
    icon: <Search size={32} />,
    title: 'Smart Search',
    description: 'Quickly find requests by status, priority, or custom filters instantly.',
  },
  {
    icon: <Lock size={32} />,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with encrypted connections and reliable uptime.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-4xl mb-4 text-neutral-900 font-bold">
            Powerful Features for Your Team
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Everything you need to manage service requests efficiently with AI-powered intelligence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-50 p-8 rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-smooth group"
            >
              {/* Icon */}
              <div className="text-primary-600 mb-4 group-hover:text-primary-700 transition-smooth">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};