import React, { useState, useEffect, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  Send, 
  ChevronDown, 
  Check, 
  X, 
  Menu, 
  MapPin, 
  Paintbrush, 
  Hammer, 
  Layers, 
  Bath, 
  ChefHat, 
  Droplet, 
  Zap, 
  Wand2, 
  Grid as GridIcon, 
  HardHat, 
  Maximize, 
  Brush,
  ArrowRight,
  Info,
  Award,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { 
  CONTACTS, 
  PRICING_CARDS, 
  SERVICES, 
  ADVANTAGES, 
  STAGES, 
  PORTFOLIO_ITEMS, 
  PORTFOLIO_PLACEHOLDER,
  TESTIMONIALS, 
  FAQ_ITEMS 
} from "@/constants/data";

// Graceful fallback: if a local portfolio image is missing, show the placeholder.
// Used on every portfolio <img> via onError.
const handleImgError = (e) => {
  if (e.target.src.indexOf(PORTFOLIO_PLACEHOLDER) === -1) {
    e.target.src = PORTFOLIO_PLACEHOLDER;
  }
};

// Brand logo mark — three stylized skyscrapers with illuminated amber windows
const FormatLogoMark = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ФОРМАТ">
    {/* Left building */}
    <rect x="2" y="20" width="11" height="20" fill="currentColor" />
    <rect x="4.5" y="23" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="8.3" y="23" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="4.5" y="27.5" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="8.3" y="27.5" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="4.5" y="32" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="8.3" y="32" width="2.2" height="2.2" fill="#F59E0B" />
    {/* Center tallest building */}
    <rect x="14" y="6" width="13" height="34" fill="currentColor" />
    <rect x="17" y="10" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="21.4" y="10" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="17" y="15" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="21.4" y="15" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="17" y="20" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="21.4" y="20" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="17" y="25" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="21.4" y="25" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="17" y="30" width="2.6" height="2.6" fill="#F59E0B" />
    <rect x="21.4" y="30" width="2.6" height="2.6" fill="#F59E0B" />
    {/* Right building */}
    <rect x="28" y="15" width="11" height="25" fill="currentColor" />
    <rect x="30.5" y="19" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="34.3" y="19" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="30.5" y="23.5" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="34.3" y="23.5" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="30.5" y="28" width="2.2" height="2.2" fill="#F59E0B" />
    <rect x="34.3" y="28" width="2.2" height="2.2" fill="#F59E0B" />
    {/* Ground base */}
    <rect x="0" y="41" width="44" height="2.5" fill="#F59E0B" />
  </svg>
);

// Helper to render lucide icons dynamically
const renderServiceIcon = (iconName, props = {}) => {
  const iconMap = {
    Paintbrush, Hammer, Layers, Bath, ChefHat, Droplet, 
    Zap, Wand2, Grid: GridIcon, HardHat, Maximize, Brush
  };
  const IconComponent = iconMap[iconName] || Hammer;
  return <IconComponent {...props} />;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://capella-builds.preview.emergentagent.com";
const API = `${BACKEND_URL}/api`;

export default function App() {
  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Lead Form states
  const [formData, setFormData] = useState({ name: "", phone: "", comment: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Portfolio states
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [portfolioFilter, setPortfolioFilter] = useState("Все");
  const [photoIndex, setPhotoIndex] = useState(0);

  // Reset carousel to first image whenever a project opens
  useEffect(() => {
    setPhotoIndex(0);
  }, [selectedPhoto]);

  // Carousel navigation helpers
  const nextPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto) return;
    setPhotoIndex((prev) => (prev + 1) % selectedPhoto.images.length);
  };
  const prevPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto) return;
    setPhotoIndex((prev) => (prev - 1 + selectedPhoto.images.length) % selectedPhoto.images.length);
  };

  // Touch swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) nextPhoto();
      else prevPhoto();
    }
  };

  // Keyboard navigation for the gallery
  useEffect(() => {
    if (!selectedPhoto) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") nextPhoto();
      else if (e.key === "ArrowLeft") prevPhoto();
      else if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedPhoto]);

  // Calculator states
  const [calcRoomType, setCalcRoomType] = useState("apartment"); // studio, apartment, house, commercial
  const [calcArea, setCalcArea] = useState(50);
  const [calcRepairType, setCalcRepairType] = useState("overhaul"); // cosmetic, overhaul, designer
  const [calcAddons, setCalcAddons] = useState([]); // plumbing, electrical, demolition, tile, laminate, painting
  const [calcPrice, setCalcPrice] = useState(0);

  // FAQ accordion open states
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Monitor scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Recalculate calculator price dynamically
  useEffect(() => {
    // Pricing configurations
    const basePrices = {
      cosmetic: 3000,
      overhaul: 8000,
      designer: 15000
    };
    const roomMultipliers = {
      studio: 0.9,
      apartment: 1.0,
      house: 1.2,
      commercial: 1.15
    };
    const addonPrices = {
      plumbing: 25000,
      electrical: 30000,
      demolition: 15000,
      tile: 35000,
      laminate: 20000,
      painting: 18000
    };

    const repairBase = basePrices[calcRepairType] || 8000;
    const roomMultiplier = roomMultipliers[calcRoomType] || 1.0;
    const addonsTotal = calcAddons.reduce((sum, addon) => sum + (addonPrices[addon] || 0), 0);

    const calculated = Math.round(calcArea * repairBase * roomMultiplier + addonsTotal);
    setCalcPrice(calculated);
  }, [calcRoomType, calcArea, calcRepairType, calcAddons]);

  // Handle calculator addon toggle
  const toggleAddon = (addonId) => {
    setCalcAddons((prev) => 
      prev.includes(addonId) ? prev.filter((a) => a !== addonId) : [...prev, addonId]
    );
  };

  // Scroll helpers
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  // Pre-fill form from calculator state
  const handleCalcCTA = () => {
    const roomTypeNames = {
      studio: "Студия",
      apartment: "Квартира",
      house: "Загородный дом",
      commercial: "Коммерческое помещение"
    };
    const repairTypeNames = {
      cosmetic: "Косметический",
      overhaul: "Капитальный",
      designer: "Дизайнерский"
    };
    
    const commentText = `Заявка из калькулятора. Тип помещения: ${roomTypeNames[calcRoomType]}, Площадь: ${calcArea} кв.м., Ремонт: ${repairTypeNames[calcRepairType]}. Предварительная стоимость: ${calcPrice.toLocaleString()} руб.`;
    setFormData((prev) => ({
      ...prev,
      comment: commentText
    }));
    scrollToSection("contact-form-section");
  };

  // Prefill form for SVO discount CTA
  const handleSvoCTA = () => {
    setFormData((prev) => ({
      ...prev,
      comment: "Хочу воспользоваться скидкой для молодых семей."
    }));
    scrollToSection("contact-form-section");
  };

  // Prefill form for "visit our active site" CTA
  const handleVisitCTA = () => {
    setFormData((prev) => ({
      ...prev,
      comment: "Хочу приехать на действующий объект и посмотреть, как вы работаете."
    }));
    scrollToSection("contact-form-section");
  };

  // Submit form handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setFormError("Пожалуйста, заполните обязательные поля (Имя и Телефон)");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    // Prepare payload matching LeadCreate schema in server.py
    const payload = {
      name: formData.name,
      phone: formData.phone,
      comment: formData.comment || null,
      calculator: {
        room_type: calcRoomType,
        area: parseFloat(calcArea),
        repair_type: calcRepairType,
        addons: calcAddons,
        estimated_price: parseFloat(calcPrice)
      }
    };

    try {
      const response = await axios.post(`${API}/leads`, payload);
      if (response.status === 200 || response.status === 201) {
        setFormSubmitted(true);
        setFormData({ name: "", phone: "", comment: "" });
      } else {
        throw new Error("Неверный ответ от сервера");
      }
    } catch (err) {
      console.error("Ошибка при отправке заявки:", err);
      setFormError("Не удалось отправить заявку. Попробуйте еще раз или свяжитесь с нами напрямую по телефону.");
    } finally {
      setFormLoading(false);
    }
  };

  // Filtering portfolio
  const filteredPortfolio = portfolioFilter === "Все" 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(item => item.tags.some(tag => tag === portfolioFilter));

  const allFilterTags = ["Все", "Капитальный", "Дизайнерский", "Косметический", "Санузел"];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-amber-500 selection:text-black luxury-grid">
      
      {/* 1. Header (Sticky - Light Glassmorphism) */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white border-b border-zinc-200 py-4 shadow-md" : "bg-white py-6 border-b border-zinc-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & City */}
          <div className="flex items-center gap-6">
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-3 group"
              data-testid="header-logo-link"
            >
              {/* Skyscraper brand mark */}
              <FormatLogoMark className="w-12 h-12 sm:w-14 sm:h-14 text-zinc-900 group-hover:text-amber-600 transition-colors" />
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl sm:text-3xl tracking-wider leading-none text-zinc-900 group-hover:text-amber-500 transition-colors">
                  ФОРМАТ
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Строительная компания
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 lg:pl-8 xl:pl-12 text-[13px] uppercase tracking-wide font-bold text-zinc-600">
            <button onClick={() => scrollToSection("about-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-about">Преимущества</button>
            <button onClick={() => scrollToSection("pricing-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-pricing">Цены</button>
            <button onClick={() => scrollToSection("services-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-services">Услуги</button>
            <button onClick={() => scrollToSection("portfolio-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-portfolio">Портфолио</button>
            <button onClick={() => scrollToSection("founder-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-founder">Руководитель</button>
            <button onClick={() => scrollToSection("calculator-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-calculator">Калькулятор</button>
            <button onClick={() => scrollToSection("faq-section")} className="hover:text-amber-500 transition-colors" data-testid="nav-link-faq">FAQ</button>
          </nav>

          {/* Contacts & CTA */}
          <div className="hidden sm:flex items-center gap-6 lg:pl-8 xl:pl-12">
            <div className="flex flex-col items-end">
              <a 
                href={CONTACTS.phoneRaw} 
                className="font-heading font-bold text-base text-zinc-900 hover:text-amber-500 transition-colors flex items-center gap-1.5"
                data-testid="header-phone-link"
              >
                <Phone className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                <span className="whitespace-nowrap">{CONTACTS.phone}</span>
              </a>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Иркутск • Без выходных</span>
            </div>

            <button 
              onClick={() => scrollToSection("contact-form-section")}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs tracking-widest px-5 py-3 transition-all duration-300 border-none font-heading"
              data-testid="header-cta-button"
            >
              Заказать замер
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="header-mobile-menu-toggle"
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[73px] left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-zinc-200 z-45 py-8 px-6 lg:hidden shadow-lg"
          >
            <div className="flex flex-col gap-6 text-center text-base uppercase tracking-widest font-bold text-zinc-800">
              <button onClick={() => scrollToSection("about-section")} className="hover:text-amber-500 py-2">Преимущества</button>
              <button onClick={() => scrollToSection("pricing-section")} className="hover:text-amber-500 py-2">Цены</button>
              <button onClick={() => scrollToSection("services-section")} className="hover:text-amber-500 py-2">Услуги</button>
              <button onClick={() => scrollToSection("portfolio-section")} className="hover:text-amber-500 py-2">Портфолио</button>
              <button onClick={() => scrollToSection("founder-section")} className="hover:text-amber-500 py-2">Руководитель</button>
              <button onClick={() => scrollToSection("calculator-section")} className="hover:text-amber-500 py-2">Калькулятор</button>
              <button onClick={() => scrollToSection("faq-section")} className="hover:text-amber-500 py-2">FAQ</button>
              
              <div className="h-px bg-zinc-200 my-4"></div>
              
              <a 
                href={CONTACTS.phoneRaw} 
                className="font-heading font-bold text-lg text-zinc-900 hover:text-amber-500 transition-colors flex items-center justify-center gap-2"
                data-testid="mobile-menu-phone-link"
              >
                <Phone className="w-5 h-5 text-amber-500" />
                <span>{CONTACTS.phone}</span>
              </a>

              <button 
                onClick={() => scrollToSection("contact-form-section")}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-sm tracking-widest py-4 mt-2"
                data-testid="mobile-menu-cta-button"
              >
                Бесплатный замер
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 2. Hero Section — Split: white text left, diagonal yellow divider, empty interior right */}
      <section className="relative min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden">

        {/* LEFT — Text on white background */}
        <div className="relative z-20 bg-white flex items-center pt-28 pb-16 lg:pt-24 lg:pb-24 px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-16">
          <div className="w-full max-w-xl space-y-8 text-left">

            <div className="inline-flex items-center gap-2 text-amber-600 font-heading text-xs font-bold tracking-[0.25em] uppercase border border-amber-500/30 bg-amber-500/5 px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Премиальный ремонт квартир в Иркутске</span>
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-none text-zinc-900 uppercase">
              Ремонт квартир <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-amber-600 to-amber-500">
                под ключ
              </span> <br />
              в Иркутске
            </h1>

            <p className="font-body text-base sm:text-lg text-zinc-600 leading-relaxed">
              Создаем эксклюзивные, комфортные и функциональные интерьеры любой сложности. Работаем строго по официальному договору, с фиксированной сметой и железным соблюдением сроков.
            </p>

            {/* Bullet points */}
            <div className="grid sm:grid-cols-3 gap-4 py-2 border-y border-zinc-200">
              {["Бесплатный замер", "Бесплатная консультация", "Смета в день обращения"].map((b) => (
                <div key={b} className="flex items-center gap-2.5 text-sm text-zinc-800">
                  <div className="w-5 h-5 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">✓</div>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 pt-4">
              <button 
                onClick={() => scrollToSection("contact-form-section")}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-sm sm:text-xs tracking-wider px-8 py-5 sm:py-4.5 transition-all duration-300 font-heading text-center"
                data-testid="hero-consult-button"
              >
                Получить консультацию
              </button>
              <button 
                onClick={() => scrollToSection("calculator-section")}
                className="w-full sm:w-auto bg-transparent border border-zinc-300 hover:border-amber-500 hover:text-amber-600 text-zinc-900 font-bold uppercase text-sm sm:text-xs tracking-wider px-8 py-5 sm:py-4.5 transition-all duration-300 font-heading text-center"
                data-testid="hero-calc-button"
              >
                Рассчитать стоимость
              </button>
            </div>

            {/* Contacts & Social links row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-5 sm:gap-4 sm:gap-x-8 text-base tracking-wider pt-4 text-zinc-500 font-semibold">
              <a href={CONTACTS.phoneRaw} className="hover:text-amber-600 flex items-center gap-3" data-testid="hero-phone-link">
                <Phone className="w-6 h-6 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Звонок: {CONTACTS.phone}</span>
              </a>
              <a href={CONTACTS.telegram} target="_blank" rel="noreferrer" className="hover:text-amber-600 flex items-center gap-3" data-testid="hero-telegram-link">
                <Send className="w-6 h-6 text-sky-500 shrink-0" />
                <span>Telegram</span>
              </a>
              <a href={CONTACTS.max} target="_blank" rel="noreferrer" className="hover:text-amber-600 flex items-center gap-3" data-testid="hero-max-link">
                <span className="w-7 h-7 overflow-hidden inline-flex shrink-0">
                  <img src="/max_logo.png" alt="MAX" className="w-full h-full object-cover scale-[1.18]" />
                </span>
                <span>MAX</span>
              </a>
            </div>

          </div>
        </div>

        {/* RIGHT — Framed Scandinavian interior above center, discount plaque below */}
        <div className="relative flex flex-col items-center justify-center bg-white px-6 sm:px-10 lg:px-14 py-16 lg:py-24">

          {/* Transition line — vertical & narrow on desktop, horizontal on mobile */}
          <div className="hidden lg:block absolute top-0 left-0 h-full w-1.5 bg-amber-500 -translate-x-1/2 z-30 shadow-xl"></div>
          <div className="lg:hidden absolute top-0 left-0 w-full h-1.5 bg-amber-500 z-30 shadow-md"></div>

          <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center lg:-translate-x-10 lg:translate-y-10">

            {/* Framed photo — nudged above center, yellow frame */}
            <div className="relative w-full lg:-mt-6 bg-amber-500 p-3 lg:p-4 shadow-2xl">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" 
                  alt="Ремонт квартиры в скандинавском стиле от ФОРМАТ" 
                  className="w-full h-[300px] sm:h-[380px] lg:h-[450px] object-cover"
                  loading="eager"
                />
                {/* White filter — only over the photo */}
                <div className="absolute inset-0 bg-white/25 pointer-events-none"></div>
              </div>
            </div>

            {/* Discount plaque — below the photo, bordeaux text, yellow brush, tilted */}
            <button
              onClick={handleSvoCTA}
              className="relative -mt-6 rotate-[5deg] z-30 w-[250px] sm:w-[290px] lg:w-[350px] flex items-center justify-center transition-transform duration-300 hover:scale-105 focus:outline-none"
              data-testid="hero-svo-badge"
            >
              <svg viewBox="0 0 300 260" className="absolute inset-0 w-full h-full drop-shadow-2xl" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <filter id="brushRough" x="-12%" y="-15%" width="124%" height="130%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015 0.03" numOctaves="3" seed="7" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                <g filter="url(#brushRough)">
                  <rect x="6" y="18" width="288" height="224" rx="8" fill="#F59E0B" />
                  <rect x="18" y="10" width="264" height="26" rx="13" fill="#F59E0B" />
                  <rect x="18" y="226" width="270" height="26" rx="13" fill="#F59E0B" />
                </g>
              </svg>
              <div className="relative z-10 text-center px-2 py-8">
                <span className="block font-poster font-bold text-[#8C1230] uppercase leading-none text-4xl sm:text-5xl tracking-tight">
                  Скидки
                </span>
                <span className="block font-poster font-semibold text-[#8C1230] uppercase leading-tight text-lg sm:text-xl mt-2 tracking-wide">
                  молодым семьям
                </span>
              </div>
            </button>

            {/* Small trust stats to fill the space */}
            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-8">
              <div className="text-center">
                <span className="block font-heading font-black text-2xl sm:text-3xl text-amber-500 leading-none">7+</span>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">лет опыта</span>
              </div>
              <div className="w-px h-10 bg-zinc-200"></div>
              <div className="text-center">
                <span className="block font-heading font-black text-2xl sm:text-3xl text-amber-500 leading-none">250+</span>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">объектов сдано</span>
              </div>
              <div className="w-px h-10 bg-zinc-200"></div>
              <div className="text-center">
                <span className="block font-heading font-black text-2xl sm:text-3xl text-amber-500 leading-none">2 года</span>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">гарантия</span>
              </div>
            </div>

          </div>
        </div>

      </section>





      {/* 3. Advantages Section (Light Gray Background) */}
      <section id="about-section" className="py-24 sm:py-32 border-t border-zinc-100 relative bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Почему выбирают нас</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
              Стандарты безупречной работы
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4"></div>
            <p className="text-zinc-600 text-sm sm:text-base font-medium">
              Мы разработали прозрачную и ориентированную на заказчика систему ремонта, которая полностью исключает стресс, затягивание сроков и скрытые расходы.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ADVANTAGES.map((adv, index) => {
              // Custom icons for advantages based on index
              const icons = [ClipboardCheck, ShieldCheck, Clock, Award, CheckCircle2, Info, Droplet, Layers, HardHat, Sparkles];
              const IconComp = icons[index % icons.length] || ClipboardCheck;

              return (
                <div 
                  key={index} 
                  className="bg-white border border-zinc-200/80 shadow-sm p-8 relative group hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1"
                  data-testid={`advantage-card-${index}`}
                >
                  <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-zinc-900 mb-3 uppercase tracking-tight">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed font-body">
                    {adv.desc}
                  </p>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 4. Pricing (Стоимость) */}
      <section id="pricing-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Стоимость услуг</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
              Прозрачные тарифы на ремонт
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4"></div>
            <p className="text-zinc-600 text-sm sm:text-base font-medium">
              Выберите подходящий формат ремонта. Окончательная стоимость формируется индивидуально на основе точных замеров и фиксируется в смете.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {PRICING_CARDS.map((card) => (
              <div 
                key={card.id}
                className={`flex flex-col justify-between p-8 border ${
                  card.accent 
                    ? "bg-white border-2 border-amber-500 shadow-xl relative" 
                    : "bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-300"
                }`}
                data-testid={`pricing-card-${card.id}`}
              >
                {card.accent && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-black text-[9px] uppercase tracking-widest font-black py-1 px-3">
                    Популярно
                  </div>
                )}

                <div>
                  <h3 className="font-heading font-black text-xl text-zinc-900 uppercase tracking-wider mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-6 min-h-[32px]">{card.description}</p>
                  
                  <div className="border-y border-zinc-200 py-6 mb-8 text-left">
                    <span className="text-zinc-500 text-xs block uppercase tracking-widest mb-1">Базовая стоимость</span>
                    <span className="text-3xl sm:text-4xl font-heading font-black text-amber-500">
                      {card.price}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8 text-left text-sm text-zinc-700 font-body">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    setCalcRepairType(card.id);
                    scrollToSection("calculator-section");
                  }}
                  className={`w-full py-4 uppercase text-xs tracking-wider font-extrabold transition-all duration-300 ${
                    card.accent 
                      ? "bg-amber-500 hover:bg-amber-600 text-black" 
                      : "bg-transparent border border-zinc-300 text-zinc-800 hover:border-amber-500 hover:text-amber-600"
                  }`}
                  data-testid={`pricing-calc-button-${card.id}`}
                >
                  Рассчитать точную стоимость
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 5. Services Section */}
      <section id="services-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Что мы умеем</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
              Полный спектр отделочных услуг
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4"></div>
            <p className="text-zinc-600 text-sm sm:text-base font-medium">
              Мы выполняем абсолютно все виды ремонтных, инженерных и отделочных работ без привлечения сторонних субподрядчиков.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div 
                key={service.id} 
                className="bg-white border border-zinc-200/80 p-6 flex items-start gap-5 hover:border-amber-500/20 hover:bg-zinc-50 transition-all duration-300 group shadow-sm"
                data-testid={`service-item-${service.id}`}
              >
                <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 shrink-0">
                  {renderServiceIcon(service.icon, { className: "w-5 h-5" })}
                </div>
                <div className="text-left space-y-2">
                  <h3 className="font-heading font-bold text-base text-zinc-900 uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-body">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 6. Portfolio (Галерея с увеличением) */}
      <section id="portfolio-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left space-y-4 max-w-xl">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Наши работы</span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
                Выполненные объекты
              </h2>
              <div className="w-16 h-1 bg-amber-500 mt-4"></div>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest font-bold">
              {allFilterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setPortfolioFilter(tag)}
                  className={`px-4 py-2 border transition-all duration-300 ${
                    portfolioFilter === tag 
                      ? "bg-amber-500 text-black border-amber-500" 
                      : "bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                  }`}
                  data-testid={`portfolio-filter-${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Bento Grid for images */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolio.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="bg-zinc-50 border border-zinc-200 overflow-hidden group cursor-pointer relative"
                data-testid={`portfolio-card-${index}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-200 relative">
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    loading="lazy"
                    onError={handleImgError}
                  />
                  {/* Photo count badge */}
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1 tracking-wider">
                    <GridIcon className="w-3 h-3" />
                    <span>{item.images.length} фото</span>
                  </div>
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-xs font-heading tracking-widest uppercase bg-amber-500 text-black font-extrabold px-4 py-2">
                      Смотреть галерею
                    </span>
                  </div>
                </div>
                
                <div className="p-6 text-left space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] uppercase tracking-wider text-amber-600 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-heading font-bold text-base text-zinc-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Portfolio Photo Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-zinc-200 max-w-4xl w-full text-left relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 bg-white/90 p-2.5 text-zinc-500 hover:text-black border border-zinc-200 hover:bg-white transition-colors z-10 shadow-md"
                onClick={() => setSelectedPhoto(null)}
                data-testid="portfolio-modal-close-button"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-12">
                <div 
                  className="md:col-span-8 bg-zinc-950 flex flex-col items-center justify-center relative select-none"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  data-testid="portfolio-modal-carousel"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={photoIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      src={selectedPhoto.images[photoIndex]} 
                      alt={`${selectedPhoto.title} — фото ${photoIndex + 1}`} 
                      className="max-h-[70vh] w-full object-contain"
                      data-testid="portfolio-modal-image"
                      onError={handleImgError}
                    />
                  </AnimatePresence>

                  {selectedPhoto.images.length > 1 && (
                    <>
                      {/* Prev button */}
                      <button
                        onClick={prevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-amber-500 text-black p-3 shadow-lg transition-colors z-10"
                        data-testid="portfolio-modal-prev"
                        aria-label="Предыдущее фото"
                      >
                        <ChevronDown className="w-5 h-5 rotate-90" />
                      </button>
                      {/* Next button */}
                      <button
                        onClick={nextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-amber-500 text-black p-3 shadow-lg transition-colors z-10"
                        data-testid="portfolio-modal-next"
                        aria-label="Следующее фото"
                      >
                        <ChevronDown className="w-5 h-5 -rotate-90" />
                      </button>
                      {/* Counter */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-bold px-3 py-1.5 tracking-wider z-10" data-testid="portfolio-modal-counter">
                        {photoIndex + 1} / {selectedPhoto.images.length}
                      </div>
                    </>
                  )}
                </div>
                <div className="md:col-span-4 p-8 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-wider text-amber-600 border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 font-extrabold">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-heading font-black text-xl text-zinc-900 uppercase leading-tight">
                      {selectedPhoto.title}
                    </h3>
                    <p className="text-sm text-zinc-600 font-body">
                      Объект выполнен под ключ в соответствии с высокими стандартами качества строительной группы ФОРМАТ. Выполнена полная проверка качества материалов.
                    </p>
                    <p className="text-xs text-zinc-400 font-bold">
                      Локация: {selectedPhoto.desc}
                    </p>

                    {/* Thumbnail strip */}
                    {selectedPhoto.images.length > 1 && (
                      <div className="flex gap-2 pt-1">
                        {selectedPhoto.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                            className={`w-14 h-14 overflow-hidden border-2 transition-all ${
                              i === photoIndex ? "border-amber-500" : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                            data-testid={`portfolio-modal-thumb-${i}`}
                          >
                            <img src={img} alt={`Миниатюра ${i + 1}`} className="w-full h-full object-cover" onError={handleImgError} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        comment: `Интересует проект: ${selectedPhoto.title}`
                      }));
                      setSelectedPhoto(null);
                      scrollToSection("contact-form-section");
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs tracking-wider py-4 font-heading"
                    data-testid="portfolio-modal-cta-button"
                  >
                    Хочу такой же ремонт
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 7. Working Stages (Этапы работы) */}
      <section className="py-24 sm:py-32 border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Как мы работаем</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
              6 простых шагов к вашему идеальному жилью
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 relative">
            {STAGES.map((stage, i) => (
              <div 
                key={i} 
                className="text-left space-y-4 border-l border-zinc-200 pl-6 relative"
                data-testid={`stage-card-${i}`}
              >
                <span className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-amber-500/20 absolute -top-4 right-0 pointer-events-none select-none">
                  {stage.step}
                </span>
                <span className="text-amber-600 font-heading font-extrabold text-xs uppercase tracking-wider block">
                  Шаг {stage.step}
                </span>
                <h3 className="font-heading font-bold text-lg text-zinc-900 uppercase tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-sm text-zinc-600 font-body leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 8. Interactive Calculator */}
      <section id="calculator-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Calculator Control Panel (Left Side) */}
            <div className="lg:col-span-7 bg-zinc-50 border border-zinc-200 p-8 sm:p-10 space-y-8 text-left">
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-600 block">Калькулятор ремонта</span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none">
                  Расчет стоимости онлайн
                </h2>
                <div className="w-12 h-1 bg-amber-500 mt-2"></div>
              </div>

              {/* Room type selection */}
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-extrabold">1. Тип помещения</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "studio", name: "Студия" },
                    { id: "apartment", name: "Квартира" },
                    { id: "house", name: "Дом" },
                    { id: "commercial", name: "Офис/Комм." }
                  ].map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setCalcRoomType(room.id)}
                      className={`py-3 uppercase text-[10px] tracking-widest font-black transition-all duration-300 border ${
                        calcRoomType === room.id 
                          ? "bg-amber-500 text-black border-amber-500" 
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                      }`}
                      data-testid={`calc-room-type-${room.id}`}
                    >
                      {room.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Slider / Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 font-extrabold">2. Площадь помещения</label>
                  <div className="flex items-center bg-white border border-zinc-200 px-3 py-1">
                    <input 
                      type="number" 
                      min="10" 
                      max="300"
                      value={calcArea}
                      onChange={(e) => setCalcArea(Math.max(10, Math.min(300, parseInt(e.target.value) || 0)))}
                      className="bg-transparent text-zinc-900 font-heading font-bold text-sm w-12 text-right focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      data-testid="calc-area-input"
                    />
                    <span className="text-xs text-zinc-400 ml-1 font-bold">м²</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 font-bold">10 м²</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="200" 
                    value={calcArea}
                    onChange={(e) => setCalcArea(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-200 accent-amber-500 cursor-pointer"
                    data-testid="calc-area-slider"
                  />
                  <span className="text-xs text-zinc-400 font-bold">200 м²</span>
                </div>
              </div>

              {/* Repair Type selection */}
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-extrabold">3. Вид ремонта</label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { id: "cosmetic", name: "Косметический", price: "3 000 ₽/м²" },
                    { id: "overhaul", name: "Капитальный", price: "8 000 ₽/м²" },
                    { id: "designer", name: "Дизайнерский", price: "15 000 ₽/м²" }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCalcRepairType(type.id)}
                      className={`p-4 flex flex-col justify-center items-center text-center transition-all duration-300 border ${
                        calcRepairType === type.id 
                          ? "bg-amber-500 text-black border-amber-500" 
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                      }`}
                      data-testid={`calc-repair-type-${type.id}`}
                    >
                      <span className="uppercase text-[10px] tracking-wider font-black block mb-1">
                        {type.name}
                      </span>
                      <span className={`text-[9px] font-semibold ${calcRepairType === type.id ? "text-black/70" : "text-zinc-500"}`}>
                        {type.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional works checkboxes */}
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-extrabold">4. Дополнительные работы</label>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { id: "plumbing", name: "Замена сантехники" },
                    { id: "electrical", name: "Новая электрика" },
                    { id: "demolition", name: "Демонтажные работы" },
                    { id: "tile", name: "Укладка керамогранита" },
                    { id: "laminate", name: "Настил ламината" },
                    { id: "painting", name: "Безвоздушная покраска" }
                  ].map((addon) => (
                    <div 
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-300 bg-white ${
                        calcAddons.includes(addon.id) 
                          ? "border-amber-500/50 bg-amber-500/5" 
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                      data-testid={`calc-addon-wrapper-${addon.id}`}
                    >
                      <div 
                        className={`w-4.5 h-4.5 flex items-center justify-center border ${
                          calcAddons.includes(addon.id) ? "border-amber-500 bg-amber-500 text-black" : "border-zinc-300"
                        }`}
                        data-testid={`calc-addon-${addon.id}`}
                      >
                        {calcAddons.includes(addon.id) && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-zinc-700 font-body select-none font-medium">{addon.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Price Output panel (Right Side, high-contrast dark card for premium pop!) */}
            <div className="lg:col-span-5 bg-zinc-900 border border-amber-500/30 p-8 sm:p-10 space-y-8 text-left relative text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

              <div className="space-y-1">
                <span className="text-zinc-400 text-[10px] uppercase tracking-widest block font-bold">Ориентировочная сметная стоимость</span>
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-4xl sm:text-5xl font-heading font-black text-amber-500 tracking-tight"
                    data-testid="calc-total-price"
                  >
                    {calcPrice.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-amber-500">₽</span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block pt-2 border-t border-zinc-800">
                  *Включает базовые черновые материалы
                </span>
              </div>

              <div className="space-y-4 text-xs text-zinc-400 font-body">
                <div className="flex justify-between pb-2.5 border-b border-zinc-800">
                  <span>Выбранная площадь:</span>
                  <span className="text-white font-bold">{calcArea} м²</span>
                </div>
                <div className="flex justify-between pb-2.5 border-b border-zinc-800">
                  <span>Тип помещения:</span>
                  <span className="text-white font-bold">
                    {calcRoomType === "studio" && "Студия"}
                    {calcRoomType === "apartment" && "Квартира"}
                    {calcRoomType === "house" && "Загородный дом"}
                    {calcRoomType === "commercial" && "Коммерческое"}
                  </span>
                </div>
                <div className="flex justify-between pb-2.5 border-b border-zinc-800">
                  <span>Выбранный класс отделки:</span>
                  <span className="text-white font-bold">
                    {calcRepairType === "cosmetic" && "Косметический"}
                    {calcRepairType === "overhaul" && "Капитальный"}
                    {calcRepairType === "designer" && "Дизайнерский"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Дополнительные опции:</span>
                  <span className="text-white font-bold">{calcAddons.length} шт.</span>
                </div>
              </div>

              <div className="h-px bg-zinc-800"></div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-400 font-body leading-relaxed">
                  Получите точный расчет с детализацией по каждому этапу работ. Наш инженер бесплатно приедет к вам для проведения профессионального лазерного замера.
                </p>
                
                <button
                  onClick={handleCalcCTA}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-widest py-4 transition-all duration-300 font-heading"
                  data-testid="calc-submit-cta"
                >
                  Оставить заявку на бесплатный замер
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8.5 Founder / Leader Section */}
      <section id="founder-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-amber-500 p-3 sm:p-4 shadow-2xl max-w-md mx-auto lg:mx-0">
                <img
                  src="https://customer-assets.emergentagent.com/job_capella-builds/artifacts/brh3ne7f_GLA_5279%20%281%29%20%283%29%20%281%29.jpg"
                  alt="Дмитрий Дианов — руководитель компании ФОРМАТ"
                  className="w-full h-[420px] sm:h-[520px] object-cover object-top"
                  loading="lazy"
                  data-testid="founder-photo"
                />
                <div className="absolute -bottom-5 -right-2 sm:right-4 bg-zinc-900 text-white px-5 py-3 shadow-xl">
                  <span className="block font-heading font-black text-sm uppercase tracking-wider">Дмитрий Дианов</span>
                  <span className="block text-[10px] uppercase tracking-widest text-amber-500 font-bold mt-0.5">Руководитель · Прораб</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="lg:col-span-7 text-left space-y-6">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Руководитель компании</span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-zinc-900 leading-none">
                Дмитрий Дианов
              </h2>
              <div className="w-16 h-1 bg-amber-500"></div>

              <div className="space-y-5 text-sm sm:text-base text-zinc-600 font-body leading-relaxed max-w-2xl">
                <p>
                  Руководитель компании и опытный прораб, известный в Иркутске благодаря успешной реализации проектов различной сложности.
                </p>
                <p>
                  С самого детства Дмитрий был связан со строительством и ремонтом, поэтому отлично понимает все этапы работы — от подготовки объекта до финальной сдачи заказчику. Многолетний практический опыт позволяет находить эффективные решения даже в нестандартных ситуациях и контролировать качество на каждом этапе ремонта.
                </p>
                <p>
                  Главный принцип работы Дмитрия — <span className="text-zinc-900 font-semibold">честность, ответственность и внимание к деталям</span>. Каждый объект выполняется так, словно ремонт делается для собственной семьи.
                </p>
                <p>
                  Под его руководством команда стремится не просто выполнить ремонт, а создать комфортное, надежное и современное пространство, в котором приятно жить долгие годы.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={CONTACTS.phoneRaw}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs tracking-wider px-7 py-4 transition-all duration-300 font-heading inline-flex items-center gap-2"
                  data-testid="founder-call-button"
                >
                  <Phone className="w-4 h-4" />
                  Связаться с руководителем
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8.6 Visit Active Objects Section */}
      <section id="visit-section" className="relative py-24 sm:py-32 overflow-hidden bg-zinc-900">
        {/* Background image + overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?crop=entropy&cs=srgb&fm=jpg&w=1920&q=80"
            alt="Действующий объект компании ФОРМАТ в работе"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-zinc-950/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left space-y-6">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-500 block">Открытость и доверие</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-none">
              Приезжайте на наши<br /> текущие объекты
            </h2>
            <div className="w-16 h-1 bg-amber-500"></div>
            <p className="text-sm sm:text-base text-zinc-300 font-body leading-relaxed">
              Нам нечего скрывать. Вы можете лично приехать на текущий объект в Иркутске и своими глазами увидеть, как работает наша команда: качество черновых работ, порядок на площадке, аккуратность мастеров и используемые материалы.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 py-4">
              {[
                { t: "Реальные объекты", d: "Покажем ремонт на разных стадиях" },
                { t: "Живое общение", d: "Ответим на все вопросы на месте" },
                { t: "Без обязательств", d: "Просмотр ни к чему вас не обязывает" }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-amber-500 pl-4 text-left" data-testid={`visit-benefit-${i}`}>
                  <h3 className="font-heading font-bold text-sm text-white uppercase tracking-tight mb-1">{item.t}</h3>
                  <p className="text-xs text-zinc-400 font-body leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleVisitCTA}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-sm tracking-wider px-10 py-6 transition-all duration-300 font-heading text-center inline-flex items-center justify-center gap-2.5"
                data-testid="visit-cta-button"
              >
                <MapPin className="w-5 h-5" />
                Записаться на просмотр объекта
              </button>
              <a
                href={CONTACTS.phoneRaw}
                className="w-full sm:w-auto bg-transparent border border-zinc-600 hover:border-amber-500 text-white hover:text-amber-500 font-bold uppercase text-sm tracking-wider px-10 py-6 transition-all duration-300 font-heading text-center inline-flex items-center justify-center gap-2.5"
                data-testid="visit-call-button"
              >
                <Phone className="w-5 h-5" />
                Позвонить
              </a>
            </div>
          </div>
        </div>
      </section>






      {/* 9. Reviews (Отзывы) */}
      <section className="py-24 sm:py-32 border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Отзывы клиентов</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
              Что говорят о нас наши заказчики
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-zinc-200/80 shadow-sm p-8 relative flex flex-col justify-between"
                data-testid={`testimonial-card-${idx}`}
              >
                {/* Large Quote mark behind */}
                <span className="text-[120px] font-black text-zinc-100 absolute -top-8 -left-2 pointer-events-none select-none">
                  “
                </span>

                <div className="space-y-6 relative z-10 text-left">
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <span key={i} className="text-amber-500 text-lg">★</span>
                    ))}
                  </div>
                  
                  <p className="text-zinc-600 font-body text-sm leading-relaxed italic font-medium">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-6 mt-8 flex justify-between items-center relative z-10 text-left">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-zinc-900 uppercase tracking-tight">{t.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 font-bold">{t.project}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">{t.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 10. FAQ Section (Accordion) */}
      <section id="faq-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Часто задаваемые вопросы</span>
            <h2 className="font-heading font-black text-3xl uppercase tracking-tight text-zinc-900 leading-none">
              Популярные вопросы и ответы
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4"></div>
          </div>

          <div className="space-y-4 text-left">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="border-b border-zinc-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                    data-testid={`faq-accordion-trigger-${idx}`}
                  >
                    <span className="font-heading font-bold text-base text-zinc-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 group-hover:text-amber-500 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 text-amber-500" : ""
                    }`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p 
                          className="pb-6 text-sm text-zinc-600 leading-relaxed font-body"
                          data-testid={`faq-accordion-content-${idx}`}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 11. Lead Order Form ("Получите бесплатный замер") */}
      <section id="contact-form-section" className="py-24 sm:py-32 border-t border-zinc-200 bg-zinc-50 relative">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/34573691/pexels-photo-34573691.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
            alt="Чертеж" 
            className="w-full h-full object-cover filter brightness-[0.98] opacity-[0.03]"
          />
        </div>

        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6">
          
          <div className="bg-white border border-zinc-200 shadow-lg p-8 sm:p-12 space-y-8 text-left">
            
            <div className="text-center space-y-3">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 block">Свяжитесь с нами</span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none">
                Получите бесплатный замер
              </h2>
              <div className="w-12 h-1 bg-amber-500 mx-auto mt-2"></div>
              <p className="text-xs text-zinc-500 font-body leading-relaxed max-w-sm mx-auto font-medium">
                Оставьте ваши контакты. Наш специалист свяжется с вами для согласования удобного времени замера.
              </p>
            </div>

            {formSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-500/10 border border-amber-500/30 p-8 text-center space-y-4"
                data-testid="lead-form-success-message"
              >
                <div className="w-16 h-16 bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-600 rounded-full mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="font-heading font-bold text-lg text-zinc-900 uppercase tracking-tight">
                  Спасибо!
                </h3>
                <p className="text-sm text-zinc-700 font-body font-medium">
                  Мы свяжемся с вами в ближайшее время.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs text-amber-600 underline font-extrabold tracking-wider hover:text-amber-500 transition-colors uppercase pt-2"
                >
                  Отправить еще одну заявку
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-500 font-bold" data-testid="lead-form-error">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block">Ваше имя *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например, Александр"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 transition-all font-body font-medium"
                    data-testid="lead-form-name-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block">Ваш телефон *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (999) 000-00-00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 transition-all font-body font-medium"
                    data-testid="lead-form-phone-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block">Комментарий к заявке</label>
                  <textarea
                    rows="3"
                    placeholder="Укажите ЖК, площадь или тип требуемых работ..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 transition-all font-body font-medium resize-none"
                    data-testid="lead-form-comment-input"
                  />
                </div>

                <div className="text-[11px] text-zinc-500 leading-relaxed font-body">
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <a href="/privacy" className="underline text-zinc-400 hover:text-amber-500">Политикой конфиденциальности</a>{" "}
                  и даете согласие на обработку персональных данных.
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-100 disabled:text-zinc-400 text-black font-black uppercase text-xs tracking-widest py-4 transition-all duration-300 font-heading"
                  data-testid="lead-form-submit-button"
                >
                  {formLoading ? "Отправка..." : "Заказать бесплатный замер"}
                </button>

              </form>
            )}

          </div>

        </div>
      </section>


      {/* 12. Footer (Ancoring Luxury Dark Footer) */}
      <footer className="bg-[#0A0A0A] border-t border-zinc-800 py-16 text-zinc-400 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            
            {/* Logo column */}
            <div className="md:col-span-4 space-y-4 text-left">
              <a 
                href="/"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="flex items-center gap-3"
              >
                <FormatLogoMark className="w-12 h-12 text-white" />
                <span className="font-heading font-black text-2xl tracking-wider text-white">
                  ФОРМАТ
                </span>
              </a>
              <p className="text-xs text-zinc-500 font-body leading-relaxed max-w-sm">
                Строительная компания полного цикла в Иркутске. Качественный ремонт квартир, коттеджей и коммерческой недвижимости под ключ с гарантией 2 года по договору.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4 text-left space-y-4">
              <h4 className="text-white font-heading font-bold text-xs uppercase tracking-widest">Разделы сайта</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-body">
                <button onClick={() => scrollToSection("about-section")} className="hover:text-amber-500 text-left py-1">Преимущества</button>
                <button onClick={() => scrollToSection("pricing-section")} className="hover:text-amber-500 text-left py-1">Тарифы</button>
                <button onClick={() => scrollToSection("services-section")} className="hover:text-amber-500 text-left py-1">Услуги</button>
                <button onClick={() => scrollToSection("portfolio-section")} className="hover:text-amber-500 text-left py-1">Портфолио</button>
                <button onClick={() => scrollToSection("calculator-section")} className="hover:text-amber-500 text-left py-1">Калькулятор</button>
                <button onClick={() => scrollToSection("faq-section")} className="hover:text-amber-500 text-left py-1">FAQ</button>
              </div>
            </div>

            {/* Contacts & Socials */}
            <div className="md:col-span-4 text-left space-y-4">
              <h4 className="text-white font-heading font-bold text-xs uppercase tracking-widest">Контакты в Иркутске</h4>
              <div className="space-y-3 text-xs font-body">
                <a 
                  href={CONTACTS.phoneRaw} 
                  className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors font-semibold"
                  data-testid="footer-phone-link"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{CONTACTS.phone}</span>
                </a>
                
                <div className="flex gap-4 pt-1">
                  <a 
                    href={CONTACTS.telegram} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 text-sky-400 hover:text-white transition-colors"
                    data-testid="footer-telegram-link"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                  
                  <a 
                    href={CONTACTS.max} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 text-amber-500 hover:text-white transition-colors"
                    data-testid="footer-max-link"
                  >
                    <span className="w-4 h-4 overflow-hidden inline-flex shrink-0">
                      <img src="/max_logo.png" alt="MAX" className="w-full h-full object-cover scale-[1.18]" />
                    </span>
                    <span>MAX</span>
                  </a>
                </div>

                <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 uppercase tracking-widest font-semibold">
                  Адрес офиса: г. Иркутск
                </div>
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-800 my-8"></div>

          {/* Copyrights and Terms */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 gap-4 font-body">
            <div>
              &copy; {new_year()} СК ФОРМАТ. Все права защищены. Ремонт квартир под ключ в Иркутске.
            </div>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:underline hover:text-zinc-300 font-semibold">Политикой конфиденциальности</a>
              <a href="/consent" className="hover:underline hover:text-zinc-300 font-semibold">Согласие на обработку персональных данных</a>
            </div>
          </div>

        </div>
      </footer>


      {/* 13. Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3 pointer-events-none">
        
        {/* Floating Call Button */}
        <a 
          href={CONTACTS.phoneRaw}
          className="w-12 h-12 bg-amber-500 hover:bg-amber-600 text-black shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 pointer-events-auto"
          title="Позвонить руководителю"
          data-testid="floating-call-btn"
        >
          <Phone className="w-5 h-5 animate-bounce" />
        </a>

        {/* Floating Telegram Button */}
        <a 
          href={CONTACTS.telegram}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 bg-[#229ED9] hover:bg-[#1f8ec4] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 pointer-events-auto"
          title="Связаться в Telegram"
          data-testid="floating-telegram-btn"
        >
          <Send className="w-5 h-5" />
        </a>

        {/* Floating MAX Button */}
        <a 
          href={CONTACTS.max}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 pointer-events-auto"
          title="Наш профиль на MAX"
          data-testid="floating-max-btn"
        >
          <img src="/max_logo.png" alt="MAX" className="w-full h-full object-cover scale-[1.18]" />
        </a>

      </div>

    </div>
  );
}

// Simple helper to render current year dynamically
function new_year() {
  return new Date().getFullYear();
}
