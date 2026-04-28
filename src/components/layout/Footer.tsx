import type { FC } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Github,
} from 'lucide-react';
import { useLanguage } from '@/contexts';
import { scrollToSection } from '@/utils';
import { PHONE_NUMBER, EMAIL, ADDRESS_LINE1, ADDRESS_LINE2 } from '@/constants';

export const Footer: FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/Ganiramadhan', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/ganiramadhan35/', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://www.instagram.com/gani.raa_/', label: 'Instagram' },
  ];

  // Get navigation items from translations
  const navItems = [
    { id: 'home', href: '#home', label: t('nav.home') },
    { id: 'products', href: '#products', label: t('nav.products') },
    { id: 'services', href: '#services', label: t('nav.services') },
    { id: 'portfolio', href: '#portfolio', label: t('nav.portfolio') },
    { id: 'testimonials', href: '#testimonials', label: t('nav.testimonials') },
    { id: 'faq', href: '#faq', label: t('nav.faq') },
    { id: 'contact', href: '#contact', label: t('nav.contact') },
  ];

  // Get products from translations
  const productKeys = ['portfolio', 'companyProfile', 'ecommerce', 'pos', 'customWebapp', 'landingPage'];
  const productItems = productKeys.map((key) => ({
    id: key,
    title: t(`products.items.${key}.title`),
  }));

  // Get services from translations
  const serviceKeys = ['webDevelopment', 'mobileApp', 'uiux', 'seo', 'maintenance', 'hosting'];
  const serviceItems = serviceKeys.slice(0, 4).map((key) => ({
    id: key,
    title: t(`services.items.${key}.title`),
  }));

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <a href="#home" className="flex items-center gap-2 text-2xl font-bold mb-6">
              <img 
                src="/ganipedia-logo.jpg" 
                alt="Ganipedia" 
                className="w-10 h-10 rounded-xl object-cover shadow-md"
              />
              <span>
                Gani<span className="text-primary-400">pedia</span>
              </span>
            </a>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }}
                    className="text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.products')}</h3>
            <ul className="space-y-3">
              {productItems.map((product) => (
                <li key={product.id}>
                  <a
                    href="#products"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('#products');
                    }}
                    className="text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {product.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">
                  {ADDRESS_LINE1}
                  <br />
                  {ADDRESS_LINE2}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400 shrink-0" />
                <a
                  href={`tel:+62${PHONE_NUMBER.substring(1)}`}
                  className="text-slate-400 hover:text-primary-400 transition-colors"
                >
                  +62 {PHONE_NUMBER.substring(1, 4)}-{PHONE_NUMBER.substring(4, 8)}-{PHONE_NUMBER.substring(8)}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400 shrink-0" />
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-slate-400 hover:text-primary-400 transition-colors"
                >
                  {EMAIL}
                </a>
              </li>
            </ul>

            {/* Services Preview */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">{t('footer.ourServices')}</h4>
              <div className="flex flex-wrap gap-2">
                {serviceItems.map((service) => (
                  <span
                    key={service.id}
                    className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400"
                  >
                    {service.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {currentYear} Ganipedia. {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-primary-400 transition-colors">
                {t('footer.privacyPolicy')}
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                {t('footer.termsOfService')}
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                {t('footer.cookiePolicy')}
              </a>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};
