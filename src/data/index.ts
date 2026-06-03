import type {
  NavItem,
  Testimonial,
  Portfolio,
  Stat,
  CarouselSlide,
} from '@/types';

// Navigation Data
export const navigationItems: NavItem[] = [
  { id: 'home', label: 'Beranda', href: '#home' },
  { id: 'products', label: 'Produk', href: '#products' },
  { id: 'services', label: 'Layanan', href: '#services' },
  { id: 'portfolio', label: 'Portfolio', href: '#portfolio' },
  { id: 'testimonials', label: 'Testimoni', href: '#testimonials' },
  { id: 'contact', label: 'Kontak', href: '#contact' },
];

// Carousel Slides Data
export const carouselSlides: CarouselSlide[] = [
  {
    id: 'slide-1',
    title: 'Transformasi Digital Bisnis Anda',
    subtitle: 'Solusi Website Professional',
    description:
      'Kami membantu bisnis Anda berkembang dengan solusi digital yang modern, cepat, dan scalable menggunakan teknologi terkini.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
    ctaText: 'Mulai Sekarang',
    ctaLink: '#contact',
  },
  {
    id: 'slide-2',
    title: 'E-Commerce yang Powerful',
    subtitle: 'Tingkatkan Penjualan Online',
    description:
      'Platform e-commerce dengan fitur lengkap: payment gateway, inventory management, dan analitik penjualan real-time.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80',
    ctaText: 'Lihat Demo',
    ctaLink: '#portfolio',
  },
  {
    id: 'slide-3',
    title: 'Company Profile Premium',
    subtitle: 'Tampilkan Profesionalitas',
    description:
      'Website company profile yang elegan dan responsif untuk meningkatkan kredibilitas dan kepercayaan klien Anda.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    ctaText: 'Konsultasi Gratis',
    ctaLink: '#contact',
  },
];

// Portfolio Data (ordered: most recent first)
export const portfolios: Portfolio[] = [
  {
    id: 'portfolio-saku-finance',
    title: 'SAKU Finance',
    category: 'Finance SaaS',
    image: '/projects/saku-landing.webp',
    images: [
      '/projects/saku-landing.webp',
      '/projects/saku-cara-kerja.webp',
      '/projects/saku-pricing.webp',
    ],
    description:
      'Platform personal finance SaaS berbasis AI untuk mencatat transaksi dengan natural language, memindai struk lewat OCR, mengelola banyak wallet, memantau budget dan goals, mengingatkan tagihan, serta menyajikan insight finansial yang actionable.',
    technologies: ['React', 'TypeScript', 'Golang', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Claude AI', 'OCR', 'Midtrans'],
    link: 'https://saku.ganipedia.com/',
  },
  {
    id: 'portfolio-mekarjaya',
    title: 'Website Profil Desa Mekarjaya',
    category: 'Government Website',
    image: '/projects/home-mekarjaya.png',
    images: [
      '/projects/home-mekarjaya.png',
      '/projects/gallery-mekarjaya.png',
      '/projects/login-page-mekarjaya.png',
      '/projects/dashboard-mekarjaya.png',
    ],
    description:
      'Website resmi Desa Mekarjaya untuk memperkuat transparansi informasi publik, menampilkan profil desa, berita dan pengumuman, galeri kegiatan, layanan masyarakat, halaman login, serta dashboard admin agar perangkat desa dapat mengelola konten secara mandiri.',
    technologies: ['Laravel', 'Blade', 'Tailwind CSS', 'MySQL'],
    link: 'http://mekarjaya.org/',
  },
  {
    id: 'portfolio-bpda-profile',
    title: 'BPDA Bujapi Jabar',
    category: 'Company Profile',
    image: '/projects/abujapi-profile.png',
    images: ['/projects/abujapi-profile.png', '/projects/abujapi-profile2.png', '/projects/abujapi-profile-3.png'],
    description: 'Website company profile resmi untuk Badan Pengelola Dana Amanah Bujapi Jawa Barat. Menampilkan informasi lengkap organisasi, visi misi, struktur kepengurusan, dan program-program unggulan dengan desain yang profesional dan informatif.',
    technologies: ['React', 'Tailwind CSS', 'Laravel', 'MySQL'],
    link: 'https://bpdabujapijabar.or.id/',
  },
  {
    id: 'portfolio-bpda-cms',
    title: 'BPDA Admin CMS',
    category: 'Web App',
    image: '/projects/abujapi-cms1.png',
    images: ['/projects/abujapi-cms1.png', '/projects/abujapi-cms2.png'],
    description: 'Content Management System untuk mengelola konten website BPDA Bujapi Jabar. Dashboard admin yang lengkap dengan fitur CRUD artikel, manajemen media, user management, dan sistem approval workflow untuk publikasi konten.',
    technologies: ['React', 'Laravel', 'MySQL', 'REST API'],
    link: 'https://admin.bpdabujapijabar.or.id/login',
  },
  {
    id: 'portfolio-bpda-hrmis',
    title: 'BPDA HRMIS',
    category: 'Web App',
    image: '/projects/abujapi-hrmis-1.png',
    images: ['/projects/abujapi-hrmis-1.png', '/projects/abujapi-hrmis-2.png', '/projects/abujapi-hrmis-3.png'],
    description: 'Human Resource Management Information System untuk pengelolaan data karyawan, absensi, payroll, dan sistem HR terintegrasi. Dilengkapi dengan fitur performance appraisal, leave management, dan reporting dashboard.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'JWT Auth'],
    link: 'https://hrmis.bpdabujapijabar.or.id/login',
  },
  {
    id: 'portfolio-batik-merawit',
    title: 'Batik Merawit',
    category: 'Company Profile',
    image: '/projects/batik-merawit-1.png',
    images: ['/projects/batik-merawit-1.png', '/projects/batik-merawit-2.png'],
    description: 'Website company profile untuk brand batik tradisional Merawit. Menampilkan katalog produk batik dengan galeri yang memukau, sejarah perusahaan, proses pembuatan batik tradisional, dan informasi kontak untuk pemesanan.',
    technologies: ['React', 'Tailwind CSS', 'Next.js'],
    link: 'https://batikmerawit.com/',
  },
];

// Testimonials Data
export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-mekarjaya',
    name: 'Pathul Mubarok, A.Md.A.B.',
    role: 'Kaur Perencanaan',
    company: 'Pemerintahan Desa Mekarjaya',
    content:
      'Recommended banget! Website yang dibuat keren, hasilnya rapi, responsif, dan sesuai kebutuhan. Timnya juga cepat tanggap dan komunikatif.',
    avatar: '/reviews/review-mekarjaya.jpeg',
    rating: 5,
  },
];

// Stats Data
export const stats: Stat[] = [
  { id: 'stat-1', value: '12+', label: 'Project Selesai', icon: 'CheckCircle' },
  { id: 'stat-2', value: '10+', label: 'Klien Puas', icon: 'Users' },
  { id: 'stat-3', value: '3+', label: 'Tahun Pengalaman', icon: 'Award' },
  { id: 'stat-4', value: '24/7', label: 'Support', icon: 'Headphones' },
];
