"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Car, 
  Shield, 
  Clock, 
  CreditCard, 
  Users, 
  BarChart3, 
  Calendar, 
  FileText, 
  Bell, 
  Wrench,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  ChevronRight,
  Zap,
  Globe,
  Lock,
  HeartHandshake,
  Award,
  TrendingUp,
  MessageCircle,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Shield, title: 'Assurance Complète', desc: 'Tous risques inclus sans franchise cachée' },
    { icon: Clock, title: 'Disponibilité 24/7', desc: 'Réservez et récupérez à toute heure' },
    { icon: CreditCard, title: 'Paiement Flexible', desc: 'CB, espèces, virement - à vous de choisir' },
    { icon: MapPin, title: 'Livraison Gratuite', desc: 'Aéroport, hôtel, domicile - on livre partout' },
  ];

  const stats = [
    { value: '500+', label: 'Clients Satisfaits', icon: Users },
    { value: '50+', label: 'Véhicules Premium', icon: Car },
    { value: '24/7', label: 'Support Client', icon: Phone },
    { value: '4.9', label: 'Note Moyenne', icon: Star },
  ];

  const appModules = [
    { icon: Calendar, title: 'Réservations', desc: 'Planning intelligent avec détection des conflits et notifications automatiques', color: 'from-blue-500 to-cyan-500' },
    { icon: Car, title: 'Flotte', desc: 'Gestion complète du parc : photos, documents, kilométrage, historique', color: 'from-royal-500 to-royal-600' },
    { icon: Users, title: 'Clients', desc: 'Base CRM avec permis, historique, fidélisation et blacklist', color: 'from-purple-500 to-pink-500' },
    { icon: CreditCard, title: 'Paiements', desc: 'Multi-modes, paiements partiels, suivi des impayés', color: 'from-emerald-500 to-teal-500' },
    { icon: TrendingUp, title: 'Finances', desc: 'Dashboard complet : revenus, dépenses, rentabilité par véhicule', color: 'from-amber-500 to-orange-500' },
    { icon: Wrench, title: 'Maintenance', desc: 'Alertes automatiques : vidange, assurance, contrôle technique', color: 'from-red-500 to-rose-500' },
    { icon: FileText, title: 'Documents', desc: 'Génération PDF automatique : contrats, factures, états des lieux', color: 'from-indigo-500 to-violet-500' },
    { icon: Bell, title: 'Notifications', desc: 'SMS, email, WhatsApp - gardez le contact avec vos clients', color: 'from-pink-500 to-fuchsia-500' },
    { icon: Globe, title: 'Site Public', desc: 'Vitrine en ligne avec catalogue et réservation intégrée', color: 'from-teal-500 to-cyan-500' },
  ];

  const testimonials = [
    { name: 'Mohammed Alami', role: 'Directeur, AutoLux Casablanca', text: 'AutoRent a transformé notre agence. On gère 3x plus de locations avec la même équipe. L\'interface est intuitive et le support est exceptionnel.', avatar: 'MA' },
    { name: 'Sarah Benkirane', role: 'Gérante, Premium Cars Rabat', text: 'Enfin un logiciel pensé pour le Maroc ! Les contrats en arabe/français, le suivi des paiements... tout est parfait. Je recommande à 100%.', avatar: 'SB' },
    { name: 'Karim Tazi', role: 'Fondateur, FastRent Marrakech', text: 'Le ROI est incroyable. En 3 mois, on a réduit les impayés de 60% grâce aux alertes automatiques. Un investissement rentabilisé en quelques semaines.', avatar: 'KT' },
  ];

  const pricingFeatures = [
    'Véhicules illimités',
    'Clients illimités',
    'Contrats & factures PDF',
    'Tableau de bord finances',
    'Alertes maintenance',
    'Site public personnalisé',
    'Support prioritaire',
    'Mises à jour gratuites',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Développé par YK */}
      <div className="relative z-50 bg-gradient-to-r from-royal-600 via-royal-500 to-emerald-500 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 animate-pulse sm:h-4 sm:w-4" />
          <span>Développé par <strong>YK</strong> — Solution SaaS de Location de Voitures</span>
          <Sparkles className="h-3 w-3 animate-pulse sm:h-4 sm:w-4" />
        </div>
      </div>

      {/* Navigation */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-lg shadow-royal-100/50 backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-700 shadow-lg shadow-royal-500/30 sm:h-12 sm:w-12">
                <Car className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <span className={`text-xl font-extrabold sm:text-2xl ${isScrolled ? 'text-royal-900' : 'text-royal-900'}`}>Auto</span>
              <span className="text-xl font-extrabold text-royal-500 sm:text-2xl">Rent</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {['Fonctionnalités', 'Tarifs', 'Témoignages', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-royal-700 transition-all hover:bg-royal-50 hover:text-royal-900"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/public-site" className="hidden sm:block">
              <Button variant="outline" size="sm" className="border-royal-200 text-royal-700 hover:bg-royal-50">
                <Car className="mr-2 h-4 w-4" />
                Catalogue
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm" glow>
                <span className="hidden sm:inline">Espace Pro</span>
                <span className="sm:hidden">Connexion</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-royal-700 hover:bg-royal-50 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full border-t border-royal-100 bg-white p-4 shadow-xl lg:hidden">
            <nav className="flex flex-col gap-2">
              {['Fonctionnalités', 'Tarifs', 'Témoignages', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-royal-700 transition-all hover:bg-royal-50"
                >
                  {item}
                </a>
              ))}
              <Link href="/public-site" className="rounded-lg px-4 py-3 text-sm font-medium text-royal-700 hover:bg-royal-50">
                Voir le Catalogue
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-royal-50 via-white to-emerald-50">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-royal-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal-100/50 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(5,150,105,0.07)_1px,transparent_0)] bg-[length:32px_32px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-royal-200 bg-white/80 px-4 py-2 text-sm font-medium text-royal-700 shadow-sm backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                </span>
                N°1 de la gestion locative au Maroc
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-royal-950 sm:text-5xl lg:text-6xl">
                Gérez votre
                <span className="relative mx-2 inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-royal-600 to-emerald-600 bg-clip-text text-transparent">flotte</span>
                  <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8" stroke="url(#gradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488"/>
                        <stop offset="100%" stopColor="#059669"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                comme un pro
              </h1>

              <p className="mb-8 text-lg text-royal-600 sm:text-xl">
                La solution tout-en-un pour les agences de location de voitures. 
                Réservations, clients, paiements, maintenance — tout au même endroit.
              </p>

              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/public-site">
                  <Button size="lg" glow className="w-full sm:w-auto">
                    <Car className="mr-2 h-5 w-5" />
                    Voir le Catalogue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button variant="outline" size="lg" className="w-full border-royal-200 text-royal-700 hover:bg-royal-50 sm:w-auto">
                    <Play className="mr-2 h-5 w-5" />
                    Voir la Démo
                  </Button>
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-royal-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Essai gratuit 14 jours
                </div>
                <div className="flex items-center gap-2 text-sm text-royal-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Sans engagement
                </div>
                <div className="flex items-center gap-2 text-sm text-royal-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Support inclus
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Main card */}
                <div className="relative rounded-2xl border border-royal-200/50 bg-white p-6 shadow-2xl shadow-royal-200/50 sm:p-8">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-royal-900">Tableau de Bord</h3>
                      <p className="text-sm text-royal-500">Décembre 2025</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-600">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-royal-50 to-royal-100/50 p-4">
                      <p className="text-2xl font-bold text-royal-900">127,500</p>
                      <p className="text-sm text-royal-600">DH ce mois</p>
                      <p className="mt-1 text-xs text-emerald-600">+23% vs mois dernier</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4">
                      <p className="text-2xl font-bold text-emerald-700">48</p>
                      <p className="text-sm text-emerald-600">Locations actives</p>
                      <p className="mt-1 text-xs text-emerald-600">12 en cours</p>
                    </div>
                  </div>

                  {/* Mini chart */}
                  <div className="rounded-xl bg-royal-50/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-royal-700">Revenus hebdo</span>
                      <span className="text-xs text-emerald-600">+15%</span>
                    </div>
                    <div className="flex h-16 items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-royal-500 to-royal-400 transition-all hover:from-royal-600 hover:to-royal-500"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -left-4 top-1/4 hidden rounded-xl border border-royal-100 bg-white p-3 shadow-lg sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-royal-900">Paiement reçu</p>
                      <p className="text-xs text-royal-500">+2,400 DH</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 hidden rounded-xl border border-royal-100 bg-white p-3 shadow-lg sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-royal-900">Rappel vidange</p>
                      <p className="text-xs text-royal-500">Mercedes C220</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L48 45.7C96 41 192 33 288 35.3C384 38 480 50 576 54.8C672 60 768 58 864 51.5C960 45 1056 35 1152 33.5C1248 32 1344 40 1392 43.8L1440 48V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-royal-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-royal-50 to-emerald-50 transition-transform duration-300 group-hover:scale-150" />
                <div className="relative">
                  <stat.icon className="mb-3 h-6 w-6 text-royal-500" />
                  <p className="text-3xl font-bold text-royal-900 sm:text-4xl">{stat.value}</p>
                  <p className="text-sm text-royal-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-royal-200 bg-royal-50 px-4 py-2 text-sm font-medium text-royal-700">
              <Sparkles className="h-4 w-4" />
              Pourquoi nous choisir
            </div>
            <h2 className="mb-4 text-3xl font-bold text-royal-900 sm:text-4xl">
              Une expérience de location <span className="text-royal-500">exceptionnelle</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-royal-600">
              Des véhicules premium, un service irréprochable et des prix transparents.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-royal-100 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-royal-200 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-royal-500/10 to-emerald-500/10 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-600 text-white shadow-lg shadow-royal-500/30 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-royal-900">{feature.title}</h3>
                  <p className="text-royal-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section id="fonctionnalités" className="bg-gradient-to-br from-royal-950 via-royal-900 to-accent px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-royal-500/20 px-4 py-2 text-sm font-medium text-royal-300">
              <Zap className="h-4 w-4" />
              Solution Professionnelle
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Tout ce dont vous avez besoin pour <span className="bg-gradient-to-r from-royal-300 to-emerald-400 bg-clip-text text-transparent">réussir</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-royal-300">
              9 modules puissants pour gérer votre agence de A à Z.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {appModules.map((module, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-royal-500/20 bg-royal-800/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-royal-400/40 hover:bg-royal-800/50"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{module.title}</h3>
                <p className="text-sm leading-relaxed text-royal-300">{module.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/auth/login">
              <Button size="lg" glow>
                Accéder à l'Espace Pro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="témoignages" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-royal-200 bg-royal-50 px-4 py-2 text-sm font-medium text-royal-700">
              <Star className="h-4 w-4" />
              Témoignages
            </div>
            <h2 className="mb-4 text-3xl font-bold text-royal-900 sm:text-4xl">
              Ce que disent nos <span className="text-royal-500">clients</span>
            </h2>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-3xl border border-royal-100 bg-white p-8 shadow-xl sm:p-12">
              <div className="mb-8 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <blockquote className="mb-8 text-center text-xl text-royal-700 sm:text-2xl">
                "{testimonials[activeTestimonial].text}"
              </blockquote>

              <div className="flex items-center justify-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-royal-500 to-royal-600 text-lg font-bold text-white">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-royal-900">{testimonials[activeTestimonial].name}</p>
                  <p className="text-sm text-royal-600">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>

              {/* Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all ${activeTestimonial === i ? 'w-8 bg-royal-500' : 'w-2 bg-royal-200 hover:bg-royal-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="bg-gradient-to-br from-royal-50 to-emerald-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-royal-200 bg-white px-4 py-2 text-sm font-medium text-royal-700">
              <CreditCard className="h-4 w-4" />
              Tarification Simple
            </div>
            <h2 className="mb-4 text-3xl font-bold text-royal-900 sm:text-4xl">
              Un prix, <span className="text-royal-500">tout inclus</span>
            </h2>
          </div>

          <div className="mx-auto max-w-lg">
            <div className="relative overflow-hidden rounded-3xl border-2 border-royal-500 bg-white p-8 shadow-2xl shadow-royal-200/50 sm:p-10">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-royal-100 to-emerald-100" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-100 to-royal-100" />
              
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-royal-500 px-4 py-1 text-sm font-medium text-white">
                  <Sparkles className="h-4 w-4" />
                  Offre de lancement
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-royal-900 sm:text-6xl">499</span>
                    <span className="text-2xl font-bold text-royal-600">DH</span>
                    <span className="text-royal-500">/mois</span>
                  </div>
                  <p className="mt-2 text-royal-600">Facturé annuellement • Essai gratuit 14 jours</p>
                </div>

                <div className="mb-8 space-y-4">
                  {pricingFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="text-royal-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
                  <Button size="lg" glow className="w-full">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Commencer l'essai gratuit
                  </Button>
                </a>

                <p className="mt-4 text-center text-sm text-royal-500">
                  Sans engagement • Annulation à tout moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-royal-600 via-royal-500 to-emerald-500 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Prêt à transformer votre agence ?
          </h2>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            Rejoignez les centaines d'agences qui ont choisi AutoRent pour digitaliser leur activité.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/public-site">
              <Button size="lg" className="w-full bg-white text-royal-700 hover:bg-royal-50 sm:w-auto">
                <Car className="mr-2 h-5 w-5" />
                Voir le Catalogue
              </Button>
            </Link>
            <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5" />
                Nous contacter
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-royal-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="mb-6 inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-600">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white">Auto</span>
                  <span className="text-xl font-extrabold text-royal-400">Rent</span>
                </div>
              </Link>
              <p className="mb-6 text-royal-400">
                La solution SaaS N°1 pour les agences de location de voitures au Maroc.
              </p>
              <div className="flex gap-4">
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal-800 text-royal-400 transition-colors hover:bg-royal-700 hover:text-white">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="https://wa.me/212600000000" className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal-800 text-royal-400 transition-colors hover:bg-royal-700 hover:text-white">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="mb-4 font-semibold text-white">Produit</h4>
              <ul className="space-y-3 text-royal-400">
                <li><a href="#fonctionnalités" className="transition-colors hover:text-white">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="transition-colors hover:text-white">Tarifs</a></li>
                <li><Link href="/public-site" className="transition-colors hover:text-white">Catalogue</Link></li>
                <li><Link href="/auth/login" className="transition-colors hover:text-white">Connexion</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 font-semibold text-white">Contact</h4>
              <ul className="space-y-3 text-royal-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+212600000000" className="transition-colors hover:text-white">+212 6 00 00 00 00</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contact@autorent.ma" className="transition-colors hover:text-white">contact@autorent.ma</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Casablanca, Maroc</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 font-semibold text-white">Légal</h4>
              <ul className="space-y-3 text-royal-400">
                <li><a href="#" className="transition-colors hover:text-white">CGV</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-royal-800 pt-8 sm:flex-row">
            <p className="text-sm text-royal-500">© 2025 AutoRent. Tous droits réservés.</p>
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-royal-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4" />
              Développé par YK
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
