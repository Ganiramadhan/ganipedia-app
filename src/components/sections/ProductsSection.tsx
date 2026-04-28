import type { FC } from 'react';
import {
  Briefcase,
  Building2,
  ShoppingCart,
  Monitor,
  Code2,
  Rocket,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Section, SectionHeader, Button } from '@/components/ui';
import { useLanguage } from '@/contexts';
import { scrollToSection } from '@/utils';

const iconMap: Record<string, FC<{ className?: string }>> = {
  Briefcase,
  Building2,
  ShoppingCart,
  Monitor,
  Code2,
  Rocket,
};

const productKeys = ['portfolio', 'companyProfile', 'ecommerce', 'pos', 'customWebapp', 'landingPage'];
const productIcons = ['Briefcase', 'Building2', 'ShoppingCart', 'Monitor', 'Code2', 'Rocket'];
const popularIndex = 1; // Company Profile is popular

export const ProductsSection: FC = () => {
  const { t, language } = useLanguage();

  return (
    <Section id="products" variant="gray">
      <SectionHeader
        subtitle={t('products.subtitle')}
        title={t('products.title')}
        description={t('products.description')}
      />

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {productKeys.map((key, index) => {
          const IconComponent = iconMap[productIcons[index]];
          const isPopular = index === popularIndex;
          
          const title = t(`products.items.${key}.title`);
          const description = t(`products.items.${key}.description`);
          const price = t(`products.items.${key}.price`);
          
          const featuresKey = `products.items.${key}.features`;
          const features = [0, 1, 2, 3, 4, 5, 6, 7].map(i => 
            t(`${featuresKey}.${i}`)
          ).filter(f => !f.includes('products.items')); 
          
          return (
            <div
              key={key}
              className={`relative bg-white rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1 ${
                isPopular 
                  ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/20 scale-[1.02] lg:scale-105' 
                  : 'shadow-md hover:shadow-xl border border-slate-100'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    {t('products.popular')}
                  </div>
                </div>
              )}

              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isPopular 
                    ? 'bg-linear-to-br from-primary-500 to-primary-600' 
                    : 'bg-linear-to-br from-slate-100 to-slate-50'
                }`}>
                  {IconComponent && (
                    <IconComponent className={`w-7 h-7 ${isPopular ? 'text-white' : 'text-primary-600'}`} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className={`text-3xl font-bold ${isPopular ? 'text-primary-600' : 'text-slate-900'}`}>
                  {price}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {language === 'id' ? 'Harga dapat disesuaikan' : 'Price can be adjusted'}
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-2">
                {description}
              </p>

              {/* Divider */}
              <div className="border-t border-slate-100 my-6"></div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isPopular ? 'bg-primary-100' : 'bg-green-100'
                    }`}>
                      <Check className={`w-3 h-3 ${isPopular ? 'text-primary-600' : 'text-green-600'}`} />
                    </div>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
                {features.length > 5 && (
                  <li className="text-sm text-primary-600 font-medium pl-8">
                    +{features.length - 5} {language === 'id' ? 'fitur lainnya' : 'more features'}
                  </li>
                )}
              </ul>

              {/* CTA Button */}
              <Button
                variant={isPopular ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => scrollToSection('#contact')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('products.consultFree')}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <p className="text-slate-600 mb-4">
          {language === 'id' 
            ? 'Butuh solusi yang lebih spesifik?' 
            : 'Need a more specific solution?'}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => scrollToSection('#contact')}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {language === 'id' ? 'Konsultasi Gratis Sekarang' : 'Get Free Consultation Now'}
        </Button>
      </div>
    </Section>
  );
};