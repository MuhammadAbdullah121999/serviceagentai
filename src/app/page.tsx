'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { VideoShowcaseSection } from '@/components/sections/VideoShowcaseSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { ServiceCategoriesSection } from '@/components/sections/ServiceCategoriesSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { CTASection } from '@/components/sections/CTASection';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <VideoShowcaseSection />
      <FeaturesSection />
      <ServiceCategoriesSection />
      <HowItWorksSection />
      <CTASection />
    </MainLayout>
  );
}