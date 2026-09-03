'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-responsive h-20 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-smooth"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">SP</span>
          </div>
          <span className="hidden sm:block">
            <div className="text-lg font-bold text-neutral-900">ServicePilot AI</div>
            <div className="text-xs text-neutral-600">Smart Service</div>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <a 
            href="#features" 
            className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-smooth"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-smooth"
          >
            How It Works
          </a>
          <a 
            href="#categories" 
            className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-smooth"
          >
            Services
          </a>
          <a 
            href="#cta" 
            className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-smooth"
          >
            Contact
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-smooth"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/auth/register')}
            className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth shadow-md"
          >
            Get Started
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-smooth"
        >
          {mobileMenuOpen ? (
            <X size={24} className="text-neutral-700" />
          ) : (
            <Menu size={24} className="text-neutral-700" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-neutral-200 py-6">
          <div className="container-responsive space-y-4">
            <a 
              href="#features" 
              className="block text-sm font-medium text-neutral-700 hover:text-primary-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="block text-sm font-medium text-neutral-700 hover:text-primary-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#categories" 
              className="block text-sm font-medium text-neutral-700 hover:text-primary-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>

            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <button
                onClick={() => {
                  router.push('/auth/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-smooth"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  router.push('/auth/register');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};