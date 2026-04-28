import type { FC } from 'react';
import {
  Globe,
  Palette,
  Smartphone,
  Search,
  Wrench,
  Server,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';
import { Section, SectionHeader, Card, Button } from '@/components/ui';
import { useLanguage } from '@/contexts';
import { scrollToSection } from '@/utils';

const iconMap: Record<string, FC<{ className?: string }>> = {
  Globe,
  Palette,
  Smartphone,
  Search,
  Wrench,
  Server,
};

const serviceKeys = ['webDevelopment', 'mobileApp', 'uiux', 'seo', 'maintenance', 'hosting'];
const serviceIcons = ['Globe', 'Smartphone', 'Palette', 'Search', 'Wrench', 'Server'];

export const ServicesSection: FC = () => {
  const { t, language } = useLanguage();

  const benefits = language === 'id' 
    ? [
        { icon: Zap, title: 'Cepat & Responsif', desc: 'Website dengan performa tinggi' },
        { icon: Shield, title: 'Aman & Terpercaya', desc: 'Keamanan data terjamin' },
        { icon: Clock, title: 'On-Time Delivery', desc: 'Pengerjaan tepat waktu' },
      ]
    : [
        { icon: Zap, title: 'Fast & Responsive', desc: 'High-performance websites' },
        { icon: Shield, title: 'Secure & Reliable', desc: 'Data security guaranteed' },
        { icon: Clock, title: 'On-Time Delivery', desc: 'Timely project completion' },
      ];

  return (
    <Section id="services" variant="default">
      <SectionHeader
        subtitle={t('services.subtitle')}
        title={t('services.title')}
        description={t('services.description')}
      />

      {/* Benefits Bar */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-4 p-5 bg-linear-to-r from-primary-50 to-white rounded-2xl border border-primary-100">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
              <benefit.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{benefit.title}</h4>
              <p className="text-sm text-slate-600">{benefit.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceKeys.map((key, index) => {
          const IconComponent = iconMap[serviceIcons[index]];
          const title = t(`services.items.${key}.title`);
          const description = t(`services.items.${key}.description`);
          
          return (
            <Card
              key={key}
              variant="bordered"
              hover
              className="group relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary-100 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-linear-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-primary-500 group-hover:to-primary-600 transition-all duration-300">
                  {IconComponent && (
                    <IconComponent className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {description}
                </p>
                <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all">
                  <span className="text-sm">{language === 'id' ? 'Pelajari Lebih Lanjut' : 'Learn More'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="mt-16">
        <div className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('services.customCta.title')}
            </h3>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('services.customCta.description')}
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => scrollToSection('#contact')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {t('services.customCta.button')}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
};
