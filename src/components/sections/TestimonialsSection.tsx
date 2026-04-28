import { useState, type FC } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '@/data';
import { Section, SectionHeader } from '@/components/ui';
import { useLanguage } from '@/contexts';

export const TestimonialsSection: FC = () => {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultiple = testimonials.length > 1;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Section id="testimonials" variant="gradient">
      <SectionHeader
        subtitle={t('testimonials.subtitle')}
        title={t('testimonials.title')}
        description={t('testimonials.description')}
        light
      />

      {/* Main Testimonial */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Quote Icon */}
          <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Quote className="w-6 h-6 md:w-8 md:h-8 text-white/50" />
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'
                }`}
              >
                {index === currentIndex && (
                  <>
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        loading="lazy"
                        className="w-14 h-14 rounded-full object-cover ring-4 ring-white/20"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-primary-200">
                          {testimonial.role} {language === 'id' ? 'di' : 'at'} {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          {hasMultiple && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-white scale-110'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* All Testimonials Preview */}
      {hasMultiple && (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => setCurrentIndex(index)}
              className={`p-4 rounded-2xl text-left transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white/20 ring-2 ring-white/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{testimonial.name}</p>
                  <p className="text-xs text-primary-200">{testimonial.company}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Section>
  );
};
