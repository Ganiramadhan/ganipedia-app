import { useState, type FC } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Search } from 'lucide-react';
import { Section, SectionHeader, Button } from '@/components/ui';
import { useLanguage } from '@/contexts';
import { scrollToSection } from '@/utils';

export const FAQSection: FC = () => {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Get FAQ items by accessing each index individually
  const faqItems = [0, 1, 2, 3, 4, 5].map(i => ({
    question: t(`faq.items.${i}.question`),
    answer: t(`faq.items.${i}.answer`),
  })).filter(item => !item.question.includes('faq.items')); // Filter out missing translations

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery 
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq" variant="default">
      <SectionHeader
        subtitle={t('faq.subtitle')}
        title={t('faq.title')}
        description={t('faq.description')}
      />

      <div className="max-w-4xl mx-auto">
        {/* Search Box */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari pertanyaan...' : 'Search questions...'}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* FAQ Cards */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === index 
                  ? 'border-primary-200 shadow-lg shadow-primary-500/10' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 flex items-start gap-4 text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  openIndex === index 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold transition-colors ${
                      openIndex === index ? 'text-primary-600' : 'text-slate-900'
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-primary-600 text-white rotate-180'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                } overflow-hidden`}
              >
                <div className="px-6 pb-6 pl-20">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {language === 'id' ? 'Tidak ada hasil' : 'No results found'}
            </h3>
            <p className="text-slate-500">
              {language === 'id' 
                ? 'Coba kata kunci lain atau hubungi kami langsung' 
                : 'Try different keywords or contact us directly'}
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-linear-to-br from-primary-50 to-primary-100 rounded-3xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {language === 'id' ? 'Masih Punya Pertanyaan?' : 'Still Have Questions?'}
          </h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            {language === 'id' 
              ? 'Tim kami siap membantu menjawab semua pertanyaan Anda. Jangan ragu untuk menghubungi kami kapan saja.'
              : 'Our team is ready to help answer all your questions. Feel free to contact us anytime.'}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => scrollToSection('#contact')}
          >
            {language === 'id' ? 'Hubungi Kami' : 'Contact Us'}
          </Button>
        </div>
      </div>
    </Section>
  );
};
