# Ganipedia - Professional Web Development Services

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A professional landing page showcasing web development services and digital solutions. Features portfolio showcase, service offerings, and complete information about Ganipedia.

## 🚀 Features

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS v4
- Smooth animations with CSS transitions
- Dark/Light mode support 
- Mobile-first responsive design

### 🌐 **Multi-Language Support**
- Indonesian & English language support
- Context-based translation system
- Language toggle with flag icons

### 💼 **Portfolio Showcase**
- Optimized image loading with lazy loading
- Interactive image gallery with lightbox
- Category-based filtering
- Multiple images per portfolio item
- Image validation on build
- Error handling for missing images
- External links to live websites
- Responsive grid layout

### 🛠️ **Digital Services**
- Portfolio Website (Rp 500,000)
- Landing Page (Rp 1,000,000) 
- Company Profile (Rp 2,500,000)
- E-Commerce (Rp 10,000,000)
- POS System (Rp 12,000,000)
- Custom Web Application (Custom Quote)

### 💬 **Customer Service Chatbot**
- Floating chat widget
- Quick replies for frequently asked questions
- Keyword-based auto-responses
- Direct WhatsApp integration

### 📊 **Statistics & Testimonials**
- Projects completed: 12+
- Satisfied clients: 10+
- Years of experience: 3+
- 24/7 customer support

### 📱 **Contact & Social Media**
- Contact form with validation
- WhatsApp integration
- Social media links (GitHub, LinkedIn, Instagram)
- Google Maps integration

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React 19** - UI Library
- 📘 **TypeScript** - Type Safety
- 🎨 **Tailwind CSS v4** - Styling Framework
- ⚡ **Vite 7.3.1** - Build Tool & Dev Server

### **Icons & Assets**
- 🎯 **Lucide React** - Icon Library
- 🖼️ **Unsplash** - High-quality Images
- 🎨 **Google Fonts** - Inter Font Family

### **Development Tools**
- 📦 **PNPM** - Package Manager
- 🔍 **ESLint** - Code Linting
- 🎯 **TypeScript** - Static Type Checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PNPM (recommended) or NPM
- Docker & Docker Compose (optional, for deployment)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/Ganiramadhan/ganipedia-v1.git
cd ganipedia-v1
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start development server**
```bash
pnpm dev
```

Server will run at `http://localhost:3300`

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server (port 3300) |
| `pnpm build` | Build for production (validates images first) |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm validate:images` | Validate all portfolio images exist |

## 🏭 Production Build

### Standard Build
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

Build output will be available in the `dist/` folder

### 🐳 Docker Deployment

**Build Docker Image:**
```bash
docker build -t ganipedia:latest .
```

**Run Container:**
```bash
docker network create ganipedia 2>/dev/null || true
docker run -d \
  --name ganipedia-app \
  --restart unless-stopped \
  --network ganipedia \
  --network-alias ganipedia-app \
  --expose 3300 \
  -e NODE_ENV=production \
  -e CLAUDE_API_KEY \
  -e CLAUDE_MODEL \
  ganipedia:latest
```

**Using Docker Compose:**
```bash
cp .env.example .env
docker-compose up -d
```

Point Nginx Proxy Manager to `http://ganipedia-app:3300` on the `ganipedia` Docker network.

**Stop Container:**
```bash
docker stop ganipedia-app
# or with docker-compose
docker-compose down
```

### 🚀 Production Deployment

**Runtime Configuration:**
- Internal Port: 3300
- Docker Network: `ganipedia`
- Network Alias: `ganipedia-app`
- No host port publishing; public access is handled by Nginx Proxy Manager
- Node server serves static assets and `/api/chat`
- Static asset caching enabled
- SPA routing support
- Security headers configured

**Environment Variables:**
```bash
NODE_ENV=production
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5
```

Use `.env.example` as the template for local development. Keep real `.env` files out of Git and inject production values through Jenkins credentials or runtime environment variables.

**Jenkins Credentials:**
- `docker-registry-host` as secret text, for example `registry.example.com` without protocol
- `docker-registry-username` as secret text
- `docker-registry-credentials` as secret text for the registry password or access token
- `ganipedia-host-ssh-server` as secret text
- `ganipedia-host-ssh-port` as secret text
- `ganipedia-host-ssh-user` as secret text
- `ganipedia-host-ssh-password` as secret text
- `ganipedia-claude-api-key` as secret text
- `ganipedia-claude-model` as secret text

## 📱 Portfolio Projects

This website showcases 8 portfolio projects:

1. **BPDA Bujapi Jabar** - Official organization company profile
2. **BPDA Admin CMS** - Content Management System
3. **BPDA HRMIS** - Human Resource Management System
4. **Batik Merawit** - Traditional batik brand company profile
5. **TechStart E-Commerce** - Technology startup e-commerce platform
6. **Warung Digital POS** - Point of Sale system for small businesses
7. **Creative Portfolio Studio** - Creative studio portfolio website
8. **EduLearn LMS** - Learning Management System

## 🌍 Customization

### **Content Management**
Edit `src/data/index.ts` to update:
- Portfolio projects
- Testimonials
- Statistics
- Navigation items

**Important**: After adding new portfolio with images, run:
```bash
pnpm validate:images
```

### **Adding Portfolio Images**
1. Place images in `public/projects/` folder
2. Update portfolio data in `src/data/index.ts`
3. Reference using path: `/projects/your-image.png`
4. Run `pnpm validate:images` to verify

See [docs/IMAGE_OPTIMIZATION.md](docs/IMAGE_OPTIMIZATION.md) for details.

### **Translations**
Edit `src/contexts/LanguageContext.tsx` to add or edit translations.

## ⚡ Performance Optimizations

- **Lazy Loading**: Images load only when visible
- **Priority Loading**: First 6 portfolio items load eagerly
- **Error Handling**: Fallback UI for broken images
- **IntersectionObserver**: Pre-loads images 100px before viewport
- **Code Splitting**: Vendor chunking for better caching
- **Compression**: Gzip enabled for all text assets
- **Caching**: 1-year cache for static assets
- **Performance Monitoring**: Core Web Vitals tracking in dev mode

## 👨‍💻 Author

**Gani Ramadhan**
- GitHub: [@Ganiramadhan](https://github.com/Ganiramadhan)
- LinkedIn: [ganiramadhan35](https://www.linkedin.com/in/ganiramadhan35/)
- Instagram: [@gani.raa_](https://www.instagram.com/gani.raa_/)

## 🆘 Support

If you have any questions or need assistance:

1. **WhatsApp**: [+62 838-7862-4702](https://wa.me/6283878624702)
2. **Email**: hello@ganipedia.com

---

⭐ **If this project helps you, don't forget to give it a star on GitHub!**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
