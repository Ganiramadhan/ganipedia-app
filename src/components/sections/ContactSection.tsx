import { useState, type FC, type FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { Section, SectionHeader, Button, Input, Textarea } from '@/components/ui';
import { useLanguage } from '@/contexts';
import { PHONE_NUMBER, EMAIL, ADDRESS_LINE1, ADDRESS_LINE2 } from '@/constants';

const ADDRESS = `${ADDRESS_LINE1}, ${ADDRESS_LINE2}`;
const WHATSAPP_LINK = `https://wa.me/62${PHONE_NUMBER.substring(1)}`;

export const ContactSection: FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    alert(t('contact.form.successMessage'));
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact.info.email'),
      value: EMAIL,
      link: `mailto:${EMAIL}`,
    },
    {
      icon: Phone,
      title: t('contact.info.phone'),
      value: `+62 ${PHONE_NUMBER.substring(1, 4)}-${PHONE_NUMBER.substring(4, 8)}-${PHONE_NUMBER.substring(8)}`,
      link: `tel:+62${PHONE_NUMBER.substring(1)}`,
    },
    {
      icon: MapPin,
      title: t('contact.info.address'),
      value: ADDRESS,
      link: 'https://maps.google.com/?q=Cigadung+Raya+Timur+Bandung',
    },
    {
      icon: Clock,
      title: t('contact.info.workHours'),
      value: t('contact.info.workHoursValue'),
      link: '#',
    },
  ];

  return (
    <Section id="contact" variant="gray">
      <SectionHeader
        subtitle={t('contact.subtitle')}
        title={t('contact.title')}
        description={t('contact.description')}
      />

      <div className="grid lg:grid-cols-5 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {t('contact.info.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('contact.info.description')}
            </p>
          </div>

          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link}
                target={info.link.startsWith('http') ? '_blank' : undefined}
                rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-4 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors">
                  <info.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{info.title}</h4>
                  <p className="text-slate-600 text-sm">{info.value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Quick Contact */}
          <div className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
            <MessageCircle className="w-10 h-10 mb-4 text-primary-200" />
            <h4 className="text-lg font-semibold mb-2">{t('contact.quickContact.title')}</h4>
            <p className="text-primary-100 text-sm mb-4">
              {t('contact.quickContact.description')}
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t('contact.quickContact.button')}
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {t('contact.form.title')}
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Input
                label={t('contact.form.name')}
                placeholder={t('contact.form.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label={t('contact.form.email')}
                type="email"
                placeholder={t('contact.form.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Input
                label={t('contact.form.phone')}
                type="tel"
                placeholder={t('contact.form.phonePlaceholder')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label={t('contact.form.subject')}
                placeholder={t('contact.form.subjectPlaceholder')}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="mb-6">
              <Textarea
                label={t('contact.form.message')}
                placeholder={t('contact.form.messagePlaceholder')}
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={<Send className="w-5 h-5" />}
            >
              {t('contact.form.submit')}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
              {t('contact.form.responseTime')}
            </p>
          </form>
        </div>
      </div>
    </Section>
  );
};
