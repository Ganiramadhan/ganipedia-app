import { useState, useEffect, type FC } from 'react';
import { Menu, X } from 'lucide-react';
import { navigationItems } from '@/data';
import { Button, LanguageSelector } from '@/components/ui';
import { useScrollspy } from '@/hooks';
import { useLanguage } from '@/contexts';
import { scrollToSection } from '@/utils';

export const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { t } = useLanguage();
  
  const sectionIds = navigationItems.map((item) => item.id);
  const activeSection = useScrollspy(sectionIds);

  const navLabels: Record<string, string> = {
    home: t('nav.home'),
    products: t('nav.products'),
    services: t('nav.services'),
    portfolio: t('nav.portfolio'),
    testimonials: t('nav.testimonials'),
    contact: t('nav.contact'),
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Calculate scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    scrollToSection(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/50'
          : 'bg-transparent'
      }`}
    >
      {/* Scroll Progress Bar - Only show when scrolled */}
      {scrollProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200/50">
          <div 
            className="h-full bg-linear-to-r from-primary-500 via-primary-600 to-primary-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 text-2xl font-bold"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
          >
            <img 
              src="/ganipedia-logo.jpg" 
              alt="Ganipedia" 
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <span
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}
            >
              Gani<span className="text-primary-500">pedia</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-primary-600 bg-primary-50'
                      : isScrolled
                      ? 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {navLabels[item.id]}
                </a>
              </li>
            ))}
          </ul>

          {/* Language Selector & CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector isScrolled={isScrolled} />
            <Button
              size="sm"
              onClick={() => handleNavClick('#contact')}
            >
              {t('nav.contactUs')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ${
            isOpen ? 'max-h-[600px] pb-4 overflow-visible' : 'max-h-0 overflow-hidden'
          }`}
        >
          <ul className="flex flex-col gap-1 bg-white rounded-2xl p-4 shadow-xl relative">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                  }`}
                >
                  {navLabels[item.id]}
                </a>
              </li>
            ))}
            <li className="mt-3 pt-3 border-t border-slate-200">
              <LanguageSelector isScrolled={true} isMobile={true} />
            </li>
            <li className="mt-2">
              <Button
                className="w-full"
                onClick={() => handleNavClick('#contact')}
              >
                {t('nav.contactUs')}
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
