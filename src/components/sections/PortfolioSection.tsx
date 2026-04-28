import { useState, useEffect, useMemo, useCallback, useRef, type FC } from 'react';
import { ExternalLink, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { portfolios } from '@/data';
import { Section, SectionHeader, Badge } from '@/components/ui';
import { useLanguage } from '@/contexts';
import { normalizeImagePath, toWebpPath } from '@/utils';

interface LightboxState {
  isOpen: boolean;
  currentImage: string;
  currentTitle: string;
  portfolioIndex: number;
  imageIndex: number;
}

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  priority?: boolean;
}

// Optimized image component with IntersectionObserver and error handling
const ImageLoader: FC<ImageLoaderProps> = ({ src, alt, className = '', onLoad, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Normalize image path for production
  const imageSrc = normalizeImagePath(src);
  const webpSrcRaw = toWebpPath(src);
  const webpSrc = webpSrcRaw ? normalizeImagePath(webpSrcRaw) : null;

  return (
    <div className="relative w-full h-full bg-slate-100">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
      )}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image not found</p>
          </div>
        </div>
      ) : (
        <picture>
          {webpSrc && isInView && <source srcSet={webpSrc} type="image/webp" />}
          <img
            ref={imgRef}
            src={isInView ? imageSrc : undefined}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            width={1280}
            height={720}
            className={`${className} transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}
    </div>
  );
};

export const PortfolioSection: FC = () => {
  const { t, language } = useLanguage();
  const allLabel = t('portfolio.all');
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const categories = useMemo(() => [allLabel, ...new Set(portfolios.map((p) => p.category))], [allLabel]);
  const [activeCategory, setActiveCategory] = useState(allLabel);
  
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentImage: '',
    currentTitle: '',
    portfolioIndex: 0,
    imageIndex: 0,
  });

  const filteredPortfolios = useMemo(
    () => activeCategory === allLabel
      ? portfolios
      : portfolios.filter((p) => p.category === activeCategory),
    [activeCategory, allLabel]
  );

  // Initialize active image index for each portfolio (using useMemo to avoid effect)
  const initialActiveImageIndex = useMemo(() => {
    const initialIndex: Record<string, number> = {};
    portfolios.forEach(p => {
      initialIndex[p.id] = 0;
    });
    return initialIndex;
  }, []);

  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>(initialActiveImageIndex);

  const openLightbox = useCallback((portfolioIndex: number, imageIndex: number) => {
    const portfolio = filteredPortfolios[portfolioIndex];
    const images = portfolio.images && portfolio.images.length > 0 ? portfolio.images : [portfolio.image];
    setLightbox({
      isOpen: true,
      currentImage: images[imageIndex],
      currentTitle: portfolio.title,
      portfolioIndex,
      imageIndex,
    });
    document.body.style.overflow = 'hidden';
  }, [filteredPortfolios]);

  const closeLightbox = useCallback(() => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
    document.body.style.overflow = 'auto';
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    const portfolio = filteredPortfolios[lightbox.portfolioIndex];
    const images = portfolio.images && portfolio.images.length > 0 ? portfolio.images : [portfolio.image];
    let newImageIndex: number;
    
    if (direction === 'next') {
      newImageIndex = (lightbox.imageIndex + 1) % images.length;
    } else {
      newImageIndex = (lightbox.imageIndex - 1 + images.length) % images.length;
    }
    
    setLightbox(prev => ({
      ...prev,
      currentImage: images[newImageIndex],
      imageIndex: newImageIndex,
    }));
  }, [filteredPortfolios, lightbox.portfolioIndex, lightbox.imageIndex]);

  const handleThumbnailClick = useCallback((portfolioId: string, index: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [portfolioId]: index,
    }));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, closeLightbox, navigateLightbox]);

  return (
    <Section id="portfolio" variant="gray" ref={sectionRef}>
      <SectionHeader
        subtitle={t('portfolio.subtitle')}
        title={t('portfolio.title')}
        description={t('portfolio.description')}
      />

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
              activeCategory === category
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 border border-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPortfolios.map((portfolio, portfolioIndex) => {
          const images = portfolio.images && portfolio.images.length > 0 ? portfolio.images : [portfolio.image];
          const currentImageIndex = activeImageIndex[portfolio.id] || 0;
          const isPriority = portfolioIndex < 6; // First 6 images are priority for above-the-fold content
          
          return (
            <div
              key={portfolio.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-slate-100 hover:border-primary-200"
            >
              {/* Image Container */}
              <div className="relative bg-slate-50 p-3 pb-2">
                {/* Main Image with border */}
                <div 
                  className="relative aspect-video overflow-hidden cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm"
                  onClick={() => openLightbox(portfolioIndex, currentImageIndex)}
                >
                  <ImageLoader
                    src={images[currentImageIndex]}
                    alt={portfolio.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={isPriority}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-lg">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="primary">{portfolio.category}</Badge>
                  </div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                          handleThumbnailClick(portfolio.id, newIndex);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newIndex = (currentImageIndex + 1) % images.length;
                          handleThumbnailClick(portfolio.id, newIndex);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3 px-2">
                    {images.map((img, imgIndex) => (
                      <button
                        aria-label='border'
                        key={imgIndex}
                        onClick={() => handleThumbnailClick(portfolio.id, imgIndex)}
                        className={`relative shrink-0 w-14 h-9 rounded-md overflow-hidden transition-all duration-200 border-2 ${
                          currentImageIndex === imgIndex 
                            ? 'border-primary-500 shadow-md scale-105' 
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <ImageLoader
                          src={img}
                          alt={`${portfolio.title} - ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 flex-1">
                    {portfolio.title}
                  </h3>
                  {portfolio.link && portfolio.link !== '#' && (
                    <a
                      href={portfolio.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-9 h-9 bg-primary-50 hover:bg-primary-600 hover:text-white rounded-lg flex items-center justify-center text-primary-600 transition-all shadow-sm hover:shadow"
                      aria-label="Visit site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 min-h-10">
                  {portfolio.description}
                </p>
                
                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {portfolio.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-medium rounded border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                  {portfolio.technologies.length > 3 && (
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded border border-primary-200">
                      +{portfolio.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All CTA */}
      <div className="mt-12 text-center">
        <p className="text-slate-600">
          {language === 'id' 
            ? 'Ingin melihat lebih banyak project?' 
            : 'Want to see more projects?'}
          {' '}
          <a 
            href="#contact" 
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-primary-600 font-semibold hover:underline"
          >
            {language === 'id' ? 'Hubungi Kami' : 'Contact Us'}
          </a>
        </p>
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {(() => {
            const portfolio = filteredPortfolios[lightbox.portfolioIndex];
            const images = portfolio?.images && portfolio.images.length > 0 ? portfolio.images : [portfolio?.image];
            return images.length > 1 ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                  className="absolute left-4 md:left-8 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                  className="absolute right-4 md:right-8 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            ) : null;
          })()}

          {/* Image Container */}
          <div 
            className="max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white/5 rounded-2xl p-2 overflow-hidden">
              <ImageLoader
                src={lightbox.currentImage}
                alt={lightbox.currentTitle}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                priority={true}
              />
            </div>
            <div className="text-center mt-6">
              <h3 className="text-2xl font-bold text-white">{lightbox.currentTitle}</h3>
              {(() => {
                const portfolio = filteredPortfolios[lightbox.portfolioIndex];
                const images = portfolio?.images && portfolio.images.length > 0 ? portfolio.images : [portfolio?.image];
                return images.length > 1 ? (
                  <p className="text-white/60 text-sm mt-2">
                    {lightbox.imageIndex + 1} / {images.length}
                  </p>
                ) : null;
              })()}
            </div>
            
            {/* Thumbnail Navigation in Lightbox */}
            {(() => {
              const portfolio = filteredPortfolios[lightbox.portfolioIndex];
              const images = portfolio?.images && portfolio.images.length > 0 ? portfolio.images : [portfolio?.image];
              return images.length > 1 ? (
                <div className="flex justify-center gap-2 mt-6 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      aria-label={`View image ${idx + 1}`}
                      key={idx}
                      onClick={() => setLightbox(prev => ({ ...prev, currentImage: img, imageIndex: idx }))}
                      className={`shrink-0 w-20 h-12 rounded-lg overflow-hidden transition-all border-2 ${
                        lightbox.imageIndex === idx 
                          ? 'border-primary-500 scale-105' 
                          : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <ImageLoader src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </Section>
  );
};
