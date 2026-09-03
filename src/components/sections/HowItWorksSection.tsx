'use client';

import React from 'react';
import { Edit2, Brain, CheckCircle2, TrendingUp } from 'lucide-react';

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <Edit2 size={32} />,
    title: 'Create Request',
    description: 'Submit service requests with title, description, location, and optional photo in seconds.',
  },
  {
    number: 2,
    icon: <Brain size={32} />,
    title: 'AI Analysis',
    description: 'Our AI instantly analyzes the request and suggests category, priority, and next steps.',
  },
  {
    number: 3,
    icon: <CheckCircle2 size={32} />,
    title: 'Review & Accept',
    description: 'Review AI suggestions, accept them, or edit details. Complete control over your requests.',
  },
  {
    number: 4,
    icon: <TrendingUp size={32} />,
    title: 'Track Progress',
    description: 'Monitor all requests in your dashboard, update status, and keep your team aligned.',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-white">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-4xl mb-4 text-neutral-900 font-bold">
            How It Works
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Simple workflow designed for efficiency and team collaboration.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-8 md:gap-12 items-start">
              {/* Step Number & Icon */}
              <div className="flex-shrink-0 flex flex-col items-center">
                {/* Circle */}
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-2xl mb-4">
                  {step.number}
                </div>
                {/* Icon */}
                <div className="text-primary-600 hidden md:block">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};