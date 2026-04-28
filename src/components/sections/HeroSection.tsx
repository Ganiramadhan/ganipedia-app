import type { FC } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { carouselSlides, stats } from '@/data';
import { Button } from '@/components/ui';
import { useCarousel } from '@/hooks';
import { useLanguage } from '@/contexts';
import { scrollToSection } from '@/utils';
import {
  CheckCircle,
  Users,
  Award,
  Headphones,
} from 'lucide-react';

const iconMap: Record<string, FC<{ className?: string }>> = {
  CheckCircle,
  Users,
  Award,
  Headphones,
};

export const HeroSection: FC = () => {
  const { t } = useLanguage();
  const { currentSlide, nextSlide, prevSlide, goToSlide } = useCarousel({
    totalSlides: carouselSlides.length,
    autoPlayInterval: 6000,
  });

  const translatedSlides = [0, 1, 2].map(i => ({
    subtitle: t(`hero.slides.${i}.subtitle`),
    title: t(`hero.slides.${i}.title`),
    description: t(`hero.slides.${i}.description`),
    cta: t(`hero.slides.${i}.cta`),
  }));

  const statsLabels: Record<string, string> = {
    'stat-1': t('stats.projectsCompleted'),
    'stat-2': t('stats.happyClients'),
    'stat-3': t('stats.yearsExperience'),
    'stat-4': t('stats.support'),
  };

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={translatedSlides[index]?.title || slide.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'low'}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="min-h-screen flex items-center pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-12">
            {/* Text Content */}
            <div className="text-white">
              {carouselSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-700 ${
                    index === currentSlide
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 absolute'
                  }`}
                >
                  {index === currentSlide && (
                    <>
                      <span className="inline-block px-4 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-300 text-sm font-medium mb-6 animate-fade-in-up">
                        {translatedSlides[index]?.subtitle || slide.subtitle}
                      </span>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up animation-delay-100">
                        {translatedSlides[index]?.title || slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed animate-fade-in-up animation-delay-200">
                        {translatedSlides[index]?.description || slide.description}
                      </p>
                      <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
                        <Button
                          size="lg"
                          onClick={() => scrollToSection(slide.ctaLink)}
                          rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                          {translatedSlides[index]?.cta || slide.ctaText}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-white/30 text-white hover:bg-white/10"
                          onClick={() => scrollToSection('#portfolio')}
                        >
                          {t('hero.viewPortfolio')}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Carousel Controls */}
              <div className="flex items-center gap-4 mt-12">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-8 bg-primary-500'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h3 className="text-white text-xl font-semibold mb-6">
                  {t('hero.whyChooseUs')}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat) => {
                    const IconComponent = iconMap[stat.icon];
                    return (
                      <div
                        key={stat.id}
                        className="bg-white/5 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors"
                      >
                        {IconComponent && (
                          <IconComponent className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                        )}
                        <div className="text-3xl font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-slate-300">{statsLabels[stat.id]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};
