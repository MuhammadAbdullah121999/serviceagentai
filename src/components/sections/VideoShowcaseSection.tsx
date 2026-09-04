'use client';

import React from 'react';

export const VideoShowcaseSection: React.FC = () => {
  return (
    <section className="relative bg-neutral-900">
      <div className="relative h-[420px] md:h-[520px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/videos/landing-technician-poster.webp"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/images/videos/landing-technician.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/95 via-neutral-900/70 to-neutral-900/30" />

        <div className="relative h-full flex items-center">
          <div className="container-responsive">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 text-xs font-semibold rounded-full mb-5">
                BUILT FOR THE FIELD
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                From the job site to your dashboard
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Your team logs a request on their phone the moment they spot the
                problem. It lands in the dashboard classified, prioritised, and
                ready to assign — no paperwork, no phone tag.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};