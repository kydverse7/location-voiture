import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { connectDb } from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { 
  Car, ArrowRight, Sparkles, ArrowLeft, Fuel, Users, Settings, MapPin, 
  Filter, Star, Zap, Shield, Calendar, ChevronDown, Heart, Eye
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface VehicleItem {
  id: string;
  modele: string;
  marque?: string;
  annee?: number;
  carburant: string;
  boite: string;
  places?: number;
  prixParJour?: number;
  categorie?: string;
  photos: string[];
  statut: string;
  kilometrage?: number;
}

async function getCatalog(): Promise<VehicleItem[]> {
  await connectDb();
  const vehicles = await Vehicle.find({ statut: 'disponible' }).sort({ createdAt: -1 }).limit(50).lean<any>();
  return vehicles.map((v: any) => ({
    id: v._id.toString(),
    modele: v.modele || '',
    marque: v.marque || '',
    annee: v.annee,
    carburant: v.carburant || '',
    boite: v.boite || '',
    places: v.places || 5,
    prixParJour: v.prixParJour || 0,
    categorie: v.categorie || '',
    photos: v.photos ?? [],
    statut: v.statut ?? 'disponible',
    kilometrage: v.kilometrage || 0
  }));
}

// Catégories avec icônes et couleurs
const categories = [
  { name: 'Tous', icon: Car, color: 'royal' },
  { name: 'Économique', icon: Zap, color: 'emerald' },
  { name: 'SUV', icon: Shield, color: 'amber' },
  { name: 'Berline', icon: Star, color: 'blue' },
  { name: 'Premium', icon: Star, color: 'purple' },
];

export default async function CataloguePage() {
  const vehicles = await getCatalog();

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-950 via-royal-900 to-accent">
      {/* Top Bar */}
      <div className="relative z-50 bg-gradient-to-r from-royal-600 via-royal-500 to-emerald-500 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 animate-pulse sm:h-4 sm:w-4" />
          <span>Développé par <strong>YK</strong> — Solution SaaS Location de Voitures</span>
          <Sparkles className="h-3 w-3 animate-pulse sm:h-4 sm:w-4" />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-royal-500/20 bg-royal-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="group flex h-9 w-9 items-center justify-center rounded-xl border border-royal-500/30 text-royal-300 transition-all duration-300 hover:border-royal-400 hover:bg-royal-500/20 hover:text-white hover:shadow-lg hover:shadow-royal-500/20 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-5 sm:w-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-royal-400 to-royal-600 shadow-lg shadow-royal-500/30 transition-transform hover:scale-105 sm:h-11 sm:w-11">
                <Car className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-extrabold text-white sm:text-2xl">Auto</span>
                <span className="text-xl font-extrabold text-royal-400 sm:text-2xl">Rent</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden lg:block text-center">
            <h1 className="text-xl font-bold text-white">Notre Flotte Premium</h1>
            <p className="text-sm text-royal-300">{vehicles.length} véhicules prêts à partir</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button size="sm" variant="outline" className="group border-royal-500/50 text-royal-200 transition-all hover:border-royal-400 hover:bg-royal-500/20">
                <span className="hidden sm:inline">Espace Pro</span>
                <span className="sm:hidden">Pro</span>
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-royal-500/10 bg-gradient-to-r from-royal-900/80 via-royal-800/50 to-royal-900/80 px-4 py-8 sm:py-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-royal-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Mobile Title */}
          <div className="mb-6 text-center lg:hidden">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Notre Flotte Premium</h1>
            <p className="mt-2 text-sm text-royal-300">{vehicles.length} véhicules disponibles</p>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: `${vehicles.length}+`, label: 'Véhicules', icon: Car },
              { value: '4.9/5', label: 'Satisfaction', icon: Star },
              { value: '24/7', label: 'Support', icon: Zap },
              { value: '100%', label: 'Assurance', icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="group rounded-2xl border border-royal-500/20 bg-white/5 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:border-royal-400/40 hover:bg-white/10">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-royal-400 transition-transform group-hover:scale-110" />
                <div className="text-xl font-bold text-white sm:text-2xl">{stat.value}</div>
                <div className="text-xs text-royal-300 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        
        {/* Categories Filter */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                i === 0 
                  ? 'border-royal-400 bg-royal-500/30 text-white shadow-lg shadow-royal-500/20' 
                  : 'border-royal-500/30 bg-white/5 text-royal-300 hover:border-royal-400/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-royal-500/20 bg-gradient-to-br from-white/5 to-white/10 py-20 backdrop-blur-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-royal-500/20">
              <Car className="h-12 w-12 text-royal-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Aucun véhicule disponible</h3>
            <p className="mb-6 text-royal-300">Notre flotte sera bientôt disponible</p>
            <Link href="/">
              <Button variant="outline" className="border-royal-500/50 text-royal-200 hover:bg-royal-500/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        )}

        {/* Vehicles Grid - Cards avec image en background */}
        {vehicles.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/public-site/${vehicle.id}`}
                className="group relative h-[420px] overflow-hidden rounded-3xl border border-royal-500/20 transition-all duration-500 hover:border-royal-400/50 hover:shadow-2xl hover:shadow-royal-500/20 sm:h-[450px]"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ 
                    backgroundImage: vehicle.photos[0] 
                      ? `url(${vehicle.photos[0]})` 
                      : 'linear-gradient(135deg, #1a365d 0%, #0f172a 100%)'
                  }}
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-br from-royal-900/40 to-transparent opacity-60" />
                
                {/* Fallback Car Icon if no photo */}
                {!vehicle.photos[0] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="h-32 w-32 text-royal-700/50" />
                  </div>
                )}

                {/* Top Badges */}
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
                  {/* Category */}
                  {vehicle.categorie && (
                    <span className="rounded-full bg-royal-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm">
                      {vehicle.categorie}
                    </span>
                  )}
                  
                  {/* Favorite Button */}
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  {/* Price Tag - Floating */}
                  {(vehicle.prixParJour ?? 0) > 0 && (
                    <div className="absolute -top-6 right-5 flex items-baseline gap-1 rounded-2xl bg-gradient-to-r from-royal-500 to-emerald-500 px-4 py-2 shadow-xl">
                      <span className="text-2xl font-black text-white">{vehicle.prixParJour}</span>
                      <span className="text-sm font-medium text-white/80">DH/j</span>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  <div className="mb-4">
                    <h3 className="mb-1 text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
                      {vehicle.marque}
                    </h3>
                    <p className="text-lg font-medium text-royal-200">{vehicle.modele}</p>
                    {vehicle.annee && (
                      <p className="mt-1 text-sm text-royal-300/80">{vehicle.annee}</p>
                    )}
                  </div>

                  {/* Specs Pills */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    {vehicle.boite && (
                      <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <Settings className="h-3.5 w-3.5" />
                        {vehicle.boite === 'automatique' ? 'Auto' : 'Manuel'}
                      </span>
                    )}
                    {vehicle.carburant && (
                      <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <Fuel className="h-3.5 w-3.5" />
                        {vehicle.carburant.charAt(0).toUpperCase() + vehicle.carburant.slice(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      <Users className="h-3.5 w-3.5" />
                      {vehicle.places || 5} pl.
                    </span>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                      <span className="text-sm font-medium text-emerald-400">Disponible</span>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-full bg-white/10 py-2 pl-4 pr-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-royal-500 group-hover:pr-4 group-hover:shadow-lg">
                      <span>Réserver</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 ring-2 ring-royal-400/50 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16 sm:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-royal-500/20 bg-gradient-to-br from-royal-800/50 to-royal-900/50 p-8 text-center backdrop-blur-xl sm:p-12">
            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-royal-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
            
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-400 to-royal-600 shadow-xl shadow-royal-500/30">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                Besoin d'un véhicule spécifique ?
              </h3>
              <p className="mx-auto mb-6 max-w-lg text-royal-200">
                Notre équipe est disponible 7j/7 pour vous aider à trouver le véhicule parfait pour votre voyage.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link href="/#contact">
                  <Button size="lg" className="w-full bg-gradient-to-r from-royal-500 to-royal-600 text-white shadow-lg shadow-royal-500/30 transition-all hover:from-royal-400 hover:to-royal-500 hover:shadow-xl sm:w-auto">
                    <MapPin className="mr-2 h-5 w-5" />
                    Nous contacter
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="w-full border-royal-500/50 text-royal-200 hover:bg-royal-500/20 sm:w-auto">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-royal-500/20 bg-royal-950/90 px-4 py-10 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-400 to-royal-600">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-white">Auto</span>
                <span className="text-lg font-extrabold text-royal-400">Rent</span>
              </div>
            </div>
            
            <p className="text-center text-sm text-royal-400">
              © 2025 AutoRent. Tous droits réservés.
            </p>
            
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-royal-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
              Développé par YK
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}