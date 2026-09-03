'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-50 py-16">
      <div className="container-responsive">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold mb-2">ServicePilot AI</div>
            <p className="text-sm text-neutral-400 mb-6">
              Smart service request management for modern teams.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-smooth text-sm">
                Twitter
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-smooth text-sm">
                LinkedIn
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-smooth text-sm">
                GitHub
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-6">Product</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <a href="#features" className="hover:text-primary-500 transition-smooth">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary-500 transition-smooth">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-smooth">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 pt-8">
          <p className="text-center text-sm text-neutral-500">
            © {currentYear} ServicePilot AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};