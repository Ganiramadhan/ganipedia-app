/* eslint-disable react-refresh/only-export-components -- Translations object needs to be in same file as context */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [language, setLanguage] = useState<Language>(() => {
    // Check URL path first
    const pathLang = location.pathname.split('/')[1];
    if (pathLang === 'id' || pathLang === 'en') {
      return pathLang;
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ganipedia-lang');
      if (saved === 'id' || saved === 'en') {
        return saved;
      }
    }
    
    // Default to English
    return 'en';
  });

  // Sync with URL changes
  useEffect(() => {
    const pathLang = location.pathname.split('/')[1];
    if ((pathLang === 'id' || pathLang === 'en') && pathLang !== language) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for URL sync
      setLanguage(pathLang);
      localStorage.setItem('ganipedia-lang', pathLang);
    }
  }, [location.pathname, language]);

  const handleSetLanguage = useCallback((lang: Language) => {
    // Smooth transition: update state first
    setLanguage(lang);
    localStorage.setItem('ganipedia-lang', lang);
    
    // Then navigate after a brief moment for smooth transition
    requestAnimationFrame(() => {
      navigate(`/${lang}`, { replace: true });
    });
  }, [navigate]);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'id' ? 'en' : 'id';
    handleSetLanguage(newLang);
  }, [language, handleSetLanguage]);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: unknown = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key; // Return key if translation not found
        }
      }
      
      return typeof value === 'string' ? value : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations
const translations: Record<Language, Record<string, unknown>> = {
  id: {
    nav: {
      home: 'Beranda',
      products: 'Produk',
      services: 'Layanan',
      portfolio: 'Portfolio',
      testimonials: 'Testimoni',
      faq: 'FAQ',
      contact: 'Kontak',
      contactUs: 'Hubungi Kami',
    },
    hero: {
      slides: [
        {
          subtitle: 'Solusi Website Professional',
          title: 'Transformasi Digital Bisnis Anda',
          description: 'Kami membantu bisnis Anda berkembang dengan solusi digital yang modern, cepat, dan scalable menggunakan teknologi terkini.',
          cta: 'Mulai Sekarang',
        },
        {
          subtitle: 'Tingkatkan Penjualan Online',
          title: 'E-Commerce yang Powerful',
          description: 'Platform e-commerce dengan fitur lengkap: payment gateway, inventory management, dan analitik penjualan real-time.',
          cta: 'Lihat Demo',
        },
        {
          subtitle: 'Tampilkan Profesionalitas',
          title: 'Company Profile Premium',
          description: 'Website company profile yang elegan dan responsif untuk meningkatkan kredibilitas dan kepercayaan klien Anda.',
          cta: 'Konsultasi Gratis',
        },
      ],
      viewPortfolio: 'Lihat Portfolio',
      whyChooseUs: 'Mengapa Memilih Kami?',
    },
    stats: {
      projectsCompleted: 'Project Selesai',
      happyClients: 'Klien Puas',
      yearsExperience: 'Tahun Pengalaman',
      support: 'Support',
    },
    products: {
      subtitle: 'Produk Kami',
      title: 'Solusi Digital untuk Setiap Kebutuhan',
      description: 'Kami menyediakan berbagai solusi website dan aplikasi web yang dapat disesuaikan dengan kebutuhan bisnis Anda.',
      popular: 'Paling Populer',
      consultFree: 'Konsultasi Gratis',
      items: {
        portfolio: {
          title: 'Portfolio Website',
          description: 'Website portfolio personal atau bisnis yang elegan untuk menampilkan karya dan pencapaian Anda dengan desain yang memukau.',
          price: 'Mulai Rp 500.000',
          features: [
            'Desain modern & responsive',
            'Galeri project interaktif',
            'Animasi smooth',
            'SEO optimized',
            'Contact form integration',
          ],
        },
        companyProfile: {
          title: 'Company Profile',
          description: 'Website company profile profesional yang meningkatkan kredibilitas dan kepercayaan klien terhadap bisnis Anda.',
          price: 'Mulai Rp 2.500.000',
          features: [
            'Multi-page website',
            'CMS untuk update konten',
            'Blog integration',
            'Team showcase',
            'Client testimonials',
            'Google Analytics',
          ],
        },
        ecommerce: {
          title: 'E-Commerce',
          description: 'Platform e-commerce lengkap dengan fitur pembayaran, inventory management, dan dashboard admin yang powerful.',
          price: 'Mulai Rp 10.000.000',
          features: [
            'Product management',
            'Payment gateway integration',
            'Order tracking',
            'Inventory system',
            'Customer dashboard',
            'Sales analytics',
            'Multi-vendor support',
          ],
        },
        pos: {
          title: 'Point of Sale (POS)',
          description: 'Sistem kasir modern berbasis web yang memudahkan pengelolaan transaksi, stok, dan laporan penjualan.',
          price: 'Mulai Rp 12.000.000',
          features: [
            'Real-time transaction',
            'Barcode scanner support',
            'Receipt printing',
            'Stock management',
            'Employee management',
            'Sales reporting',
            'Multi-outlet support',
          ],
        },
        customWebapp: {
          title: 'Custom Web App',
          description: 'Aplikasi web custom sesuai kebutuhan bisnis Anda dengan teknologi modern dan performa tinggi.',
          price: 'Hubungi Kami',
          features: [
            'Tailored solution',
            'API development',
            'Database design',
            'User authentication',
            'Role management',
            'Cloud deployment',
            'Maintenance support',
          ],
        },
        landingPage: {
          title: 'Landing Page',
          description: 'Landing page dengan konversi tinggi untuk campaign marketing, product launch, atau event Anda.',
          price: 'Mulai Rp 1.000.000',
          features: [
            'High conversion design',
            'A/B testing ready',
            'Fast loading',
            'Mobile optimized',
            'Analytics integration',
          ],
        },
      },
    },
    services: {
      subtitle: 'Layanan Kami',
      title: 'Layanan Profesional untuk Bisnis Anda',
      description: 'Kami menyediakan layanan lengkap mulai dari desain hingga pengembangan dan pemeliharaan website.',
      customCta: {
        title: 'Butuh Layanan Custom?',
        description: 'Kami siap membantu Anda dengan solusi yang disesuaikan dengan kebutuhan spesifik bisnis Anda.',
        button: 'Konsultasi Sekarang',
      },
      items: {
        webDevelopment: {
          title: 'Web Development',
          description: 'Pengembangan website dengan teknologi modern seperti React, Next.js, dan Node.js untuk performa optimal.',
        },
        mobileApp: {
          title: 'Mobile Responsive',
          description: 'Website yang tampil sempurna di semua perangkat, dari desktop hingga smartphone.',
        },
        uiux: {
          title: 'UI/UX Design',
          description: 'Desain antarmuka yang intuitif dan pengalaman pengguna yang memukau untuk meningkatkan engagement.',
        },
        seo: {
          title: 'SEO Optimization',
          description: 'Optimasi mesin pencari untuk meningkatkan visibilitas dan ranking website Anda di Google.',
        },
        maintenance: {
          title: 'Maintenance & Support',
          description: 'Layanan pemeliharaan dan dukungan teknis untuk memastikan website Anda selalu berjalan optimal.',
        },
        hosting: {
          title: 'Hosting & Domain',
          description: 'Layanan hosting cepat dan domain management untuk website Anda dengan uptime 99.9%.',
        },
      },
    },
    portfolio: {
      subtitle: 'Portfolio',
      title: 'Project yang Telah Kami Kerjakan',
      description: 'Berikut adalah beberapa project yang telah kami selesaikan untuk klien-klien kami.',
      all: 'Semua',
      categories: {
        companyProfile: 'Company Profile',
        ecommerce: 'E-Commerce',
        pos: 'POS',
        portfolio: 'Portfolio',
        webapp: 'Web App',
      },
    },
    testimonials: {
      subtitle: 'Testimoni',
      title: 'Apa Kata Klien Kami',
      description: 'Kepuasan klien adalah prioritas utama kami. Berikut adalah testimoni dari beberapa klien yang telah bekerja sama dengan kami.',
    },
    faq: {
      subtitle: 'FAQ',
      title: 'Pertanyaan yang Sering Diajukan',
      description: 'Temukan jawaban untuk pertanyaan-pertanyaan umum tentang layanan kami.',
      items: [
        {
          question: 'Berapa lama waktu pengerjaan website?',
          answer: 'Waktu pengerjaan bervariasi tergantung kompleksitas project. Landing page 3-5 hari kerja, Company Profile 1-2 minggu, E-commerce 3-4 minggu, dan Custom Web App 4-8 minggu.',
        },
        {
          question: 'Apakah harga sudah termasuk hosting dan domain?',
          answer: 'Harga yang tertera adalah untuk development saja. Hosting dan domain dihitung terpisah dengan opsi berlangganan tahunan. Kami juga menyediakan paket bundling yang lebih hemat.',
        },
        {
          question: 'Bagaimana proses pembayaran?',
          answer: 'Pembayaran dilakukan dalam 2 tahap: 50% di awal sebagai DP untuk memulai project, dan 50% sisanya setelah project selesai dan disetujui.',
        },
        {
          question: 'Apakah ada garansi setelah website jadi?',
          answer: 'Ya, kami memberikan garansi maintenance gratis selama 1 bulan setelah website launch. Setelah itu, tersedia paket maintenance bulanan.',
        },
        {
          question: 'Apakah bisa request revisi?',
          answer: 'Tentu! Kami memberikan 3x revisi major gratis selama proses development. Revisi minor tidak terbatas selama masih dalam scope project.',
        },
        {
          question: 'Teknologi apa yang digunakan?',
          answer: 'Kami menggunakan teknologi modern seperti React, Next.js, TypeScript, Tailwind CSS, Node.js, dan database seperti PostgreSQL atau MongoDB sesuai kebutuhan project.',
        },
      ],
    },
    contact: {
      subtitle: 'Hubungi Kami',
      title: 'Mari Diskusikan Project Anda',
      description: 'Kami siap membantu mewujudkan ide Anda menjadi produk digital yang luar biasa.',
      info: {
        title: 'Informasi Kontak',
        description: 'Hubungi kami melalui salah satu channel di bawah ini atau isi form untuk mendapatkan konsultasi gratis.',
        email: 'Email',
        phone: 'Telepon',
        address: 'Alamat',
        workHours: 'Jam Kerja',
        workHoursValue: 'Senin - Jumat, 09:00 - 18:00',
      },
      quickContact: {
        title: 'Butuh Respon Cepat?',
        description: 'Chat langsung dengan tim kami via WhatsApp untuk respon lebih cepat.',
        button: 'Chat WhatsApp',
      },
      form: {
        title: 'Kirim Pesan',
        name: 'Nama Lengkap',
        namePlaceholder: 'Masukkan nama Anda',
        email: 'Email',
        emailPlaceholder: 'email@example.com',
        phone: 'No. Telepon',
        phonePlaceholder: '+62 812-3456-7890',
        subject: 'Subjek',
        subjectPlaceholder: 'Misal: Pembuatan Website E-commerce',
        message: 'Pesan',
        messagePlaceholder: 'Ceritakan tentang project Anda...',
        submit: 'Kirim Pesan',
        responseTime: 'Kami akan merespon dalam waktu 1x24 jam kerja',
        successMessage: 'Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.',
      },
    },
    chatbot: {
      title: 'Asisten Ganipedia',
      subtitle: 'Tanya layanan, estimasi, portfolio, atau cara mulai project.',
      intro: 'Halo! Saya asisten Ganipedia. Mau diskusi website, e-commerce, company profile, POS, atau custom web app?',
      helper: 'Jawaban dibuat khusus dari informasi layanan dan portfolio Ganipedia.',
      placeholder: 'Tulis pertanyaan...',
      thinking: 'Sedang menyiapkan jawaban...',
      error: 'Maaf, chatbot belum bisa menjawab sekarang. Silakan coba lagi atau hubungi kami lewat WhatsApp.',
      open: 'Buka chat',
      close: 'Tutup chat',
      reset: 'Reset chat',
      send: 'Kirim pesan',
      shortcuts: {
        products: 'Layanan apa saja?',
        pricing: 'Berapa estimasi harga?',
        portfolio: 'Tampilkan portfolio',
        contact: 'Cara konsultasi?',
      },
    },
    footer: {
      description: 'Kami adalah tim developer profesional yang berkomitmen untuk membantu bisnis Anda berkembang melalui solusi digital yang modern dan inovatif.',
      quickLinks: 'Quick Links',
      products: 'Produk',
      contact: 'Kontak',
      ourServices: 'Layanan Kami',
      copyright: 'All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      services: 'Services',
      portfolio: 'Portfolio',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      contact: 'Contact',
      contactUs: 'Contact Us',
    },
    hero: {
      slides: [
        {
          subtitle: 'Professional Website Solutions',
          title: 'Transform Your Business Digitally',
          description: 'We help your business grow with modern, fast, and scalable digital solutions using the latest technology.',
          cta: 'Get Started',
        },
        {
          subtitle: 'Boost Your Online Sales',
          title: 'Powerful E-Commerce',
          description: 'Complete e-commerce platform with features: payment gateway, inventory management, and real-time sales analytics.',
          cta: 'View Demo',
        },
        {
          subtitle: 'Show Your Professionalism',
          title: 'Premium Company Profile',
          description: 'Elegant and responsive company profile website to increase credibility and trust from your clients.',
          cta: 'Free Consultation',
        },
      ],
      viewPortfolio: 'View Portfolio',
      whyChooseUs: 'Why Choose Us?',
    },
    stats: {
      projectsCompleted: 'Projects Completed',
      happyClients: 'Happy Clients',
      yearsExperience: 'Years Experience',
      support: 'Support',
    },
    products: {
      subtitle: 'Our Products',
      title: 'Digital Solutions for Every Need',
      description: 'We provide various website and web application solutions that can be customized to your business needs.',
      popular: 'Most Popular',
      consultFree: 'Free Consultation',
      items: {
        portfolio: {
          title: 'Portfolio Website',
          description: 'Elegant personal or business portfolio website to showcase your work and achievements with stunning design.',
          price: 'Starting from $30',
          features: [
            'Modern & responsive design',
            'Interactive project gallery',
            'Smooth animations',
            'SEO optimized',
            'Contact form integration',
          ],
        },
        companyProfile: {
          title: 'Company Profile',
          description: 'Professional company profile website that increases credibility and trust from clients towards your business.',
          price: 'Starting from $150',
          features: [
            'Multi-page website',
            'CMS for content updates',
            'Blog integration',
            'Team showcase',
            'Client testimonials',
            'Google Analytics',
          ],
        },
        ecommerce: {
          title: 'E-Commerce',
          description: 'Complete e-commerce platform with payment features, inventory management, and powerful admin dashboard.',
          price: 'Starting from $600',
          features: [
            'Product management',
            'Payment gateway integration',
            'Order tracking',
            'Inventory system',
            'Customer dashboard',
            'Sales analytics',
            'Multi-vendor support',
          ],
        },
        pos: {
          title: 'Point of Sale (POS)',
          description: 'Modern web-based cashier system that simplifies transaction management, stock, and sales reports.',
          price: 'Starting from $720',
          features: [
            'Real-time transaction',
            'Barcode scanner support',
            'Receipt printing',
            'Stock management',
            'Employee management',
            'Sales reporting',
            'Multi-outlet support',
          ],
        },
        customWebapp: {
          title: 'Custom Web App',
          description: 'Custom web application according to your business needs with modern technology and high performance.',
          price: 'Contact Us',
          features: [
            'Tailored solution',
            'API development',
            'Database design',
            'User authentication',
            'Role management',
            'Cloud deployment',
            'Maintenance support',
          ],
        },
        landingPage: {
          title: 'Landing Page',
          description: 'High-conversion landing page for marketing campaigns, product launches, or your events.',
          price: 'Starting from $60',
          features: [
            'High conversion design',
            'A/B testing ready',
            'Fast loading',
            'Mobile optimized',
            'Analytics integration',
          ],
        },
      },
    },
    services: {
      subtitle: 'Our Services',
      title: 'Professional Services for Your Business',
      description: 'We provide complete services from design to development and website maintenance.',
      customCta: {
        title: 'Need Custom Services?',
        description: 'We are ready to help you with solutions tailored to your specific business needs.',
        button: 'Consult Now',
      },
      items: {
        webDevelopment: {
          title: 'Web Development',
          description: 'Website development with modern technology like React, Next.js, and Node.js for optimal performance.',
        },
        mobileApp: {
          title: 'Mobile Responsive',
          description: 'Website that looks perfect on all devices, from desktop to smartphone.',
        },
        uiux: {
          title: 'UI/UX Design',
          description: 'Intuitive interface design and stunning user experience to increase engagement.',
        },
        seo: {
          title: 'SEO Optimization',
          description: 'Search engine optimization to increase visibility and ranking of your website on Google.',
        },
        maintenance: {
          title: 'Maintenance & Support',
          description: 'Maintenance services and technical support to ensure your website always runs optimally.',
        },
        hosting: {
          title: 'Hosting & Domain',
          description: 'Fast hosting services and domain management for your website with 99.9% uptime.',
        },
      },
    },
    portfolio: {
      subtitle: 'Portfolio',
      title: 'Projects We Have Completed',
      description: 'Here are some projects we have completed for our clients.',
      all: 'All',
      categories: {
        companyProfile: 'Company Profile',
        ecommerce: 'E-Commerce',
        pos: 'POS',
        portfolio: 'Portfolio',
        webapp: 'Web App',
      },
    },
    testimonials: {
      subtitle: 'Testimonials',
      title: 'What Our Clients Say',
      description: 'Client satisfaction is our top priority. Here are testimonials from some clients who have worked with us.',
    },
    faq: {
      subtitle: 'FAQ',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about our services.',
      items: [
        {
          question: 'How long does it take to build a website?',
          answer: 'The duration varies depending on project complexity. Landing page 3-5 business days, Company Profile 1-2 weeks, E-commerce 3-4 weeks, and Custom Web App 4-8 weeks.',
        },
        {
          question: 'Does the price include hosting and domain?',
          answer: 'The listed price is for development only. Hosting and domain are calculated separately with annual subscription options. We also provide more economical bundling packages.',
        },
        {
          question: 'What is the payment process?',
          answer: 'Payment is made in 2 stages: 50% upfront as DP to start the project, and the remaining 50% after the project is completed and approved.',
        },
        {
          question: 'Is there a warranty after the website is finished?',
          answer: 'Yes, we provide free maintenance warranty for 1 month after website launch. After that, monthly maintenance packages are available.',
        },
        {
          question: 'Can I request revisions?',
          answer: 'Of course! We provide 3 free major revisions during the development process. Minor revisions are unlimited as long as they are within the project scope.',
        },
        {
          question: 'What technology is used?',
          answer: 'We use modern technology such as React, Next.js, TypeScript, Tailwind CSS, Node.js, and databases like PostgreSQL or MongoDB according to project needs.',
        },
      ],
    },
    contact: {
      subtitle: 'Contact Us',
      title: "Let's Discuss Your Project",
      description: 'We are ready to help turn your ideas into amazing digital products.',
      info: {
        title: 'Contact Information',
        description: 'Contact us through one of the channels below or fill out the form for a free consultation.',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        workHours: 'Working Hours',
        workHoursValue: 'Monday - Friday, 09:00 - 18:00',
      },
      quickContact: {
        title: 'Need Quick Response?',
        description: 'Chat directly with our team via WhatsApp for faster response.',
        button: 'Chat WhatsApp',
      },
      form: {
        title: 'Send Message',
        name: 'Full Name',
        namePlaceholder: 'Enter your name',
        email: 'Email',
        emailPlaceholder: 'email@example.com',
        phone: 'Phone Number',
        phonePlaceholder: '+62 812-3456-7890',
        subject: 'Subject',
        subjectPlaceholder: 'e.g.: E-commerce Website Development',
        message: 'Message',
        messagePlaceholder: 'Tell us about your project...',
        submit: 'Send Message',
        responseTime: 'We will respond within 1x24 working hours',
        successMessage: 'Thank you! Your message has been sent. We will contact you soon.',
      },
    },
    chatbot: {
      title: 'Ganipedia Assistant',
      subtitle: 'Ask about services, estimates, portfolio, or how to start.',
      intro: 'Hi! I am the Ganipedia assistant. Want to discuss a website, e-commerce, company profile, POS, or custom web app?',
      helper: 'Answers are tailored from Ganipedia services and portfolio information.',
      placeholder: 'Type your question...',
      thinking: 'Preparing an answer...',
      error: 'Sorry, the chatbot cannot answer right now. Please try again or contact us via WhatsApp.',
      open: 'Open chat',
      close: 'Close chat',
      reset: 'Reset chat',
      send: 'Send message',
      shortcuts: {
        products: 'What services?',
        pricing: 'Price estimate?',
        portfolio: 'Show portfolio',
        contact: 'How to consult?',
      },
    },
    footer: {
      description: 'We are a professional developer team committed to helping your business grow through modern and innovative digital solutions.',
      quickLinks: 'Quick Links',
      products: 'Products',
      contact: 'Contact',
      ourServices: 'Our Services',
      copyright: 'All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
    },
  },
};
