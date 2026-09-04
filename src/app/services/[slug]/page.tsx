import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { categories, getCategory } from '@/lib/categories';

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category || !category.showcase) notFound();

  const gallery = Array.from(
    { length: category.galleryCount },
    (_, i) => `/images/gallery/${category.slug}-${i + 1}.webp`
  );

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative h-[380px] md:h-[460px]">
        <Image
          src={`/images/categories/${category.slug}.webp`}
          alt={category.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/60 to-neutral-900/30" />

        <div className="absolute inset-0 flex items-end pb-12">
          <div className="container-responsive">
            <Link
              href="/#categories"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-smooth"
            >
              <ArrowLeft size={16} />
              All categories
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {category.name}
            </h1>
            <p className="text-lg text-white/90">{category.tagline}</p>
          </div>
        </div>
      </section>

      {/* Description + issues */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-responsive grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Managing {category.name.toLowerCase()} requests
            </h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              {category.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">
              Common requests
            </h3>
            <ul className="space-y-3">
              {category.commonIssues.map((issue) => (
                <li key={issue} className="flex items-start gap-3 text-neutral-600">
                  <Check size={18} className="text-primary-600 mt-0.5 shrink-0" />
                  <span className="text-sm">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Video */}
      {category.hasVideo && (
        <section className="pb-16 md:pb-24 bg-white">
          <div className="container-responsive">
            <div className="rounded-lg overflow-hidden shadow-lg aspect-video">
              <video
                className="w-full h-full object-cover"
                poster={`/images/videos/${category.slug}-poster.webp`}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={`/images/videos/${category.slug}.mp4`} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-16 md:py-24 bg-neutral-50">
          <div className="container-responsive">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">
              {category.name} in the field
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((src) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm"
                >
                  <Image
                    src={src}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-smooth"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-responsive text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start tracking {category.name.toLowerCase()} requests
          </h2>
          <p className="text-lg opacity-95 mb-8 max-w-xl mx-auto">
            Create an account and log your first request in under a minute.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-neutral-50 transition-smooth shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}