"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Fuel, Settings2, Eye, X, ChevronLeft, ChevronRight, ImageOff, Car } from 'lucide-react';

type CatalogItem = {
  id: string;
  modele: string;
  carburant: string;
  boite: string;
  immatriculation: string;
  photos: string[];
  statut: string;
};

const statutLabels: Record<string, string> = {
  disponible: 'Disponible',
  loue: 'Loué',
  reserve: 'Réservé',
  maintenance: 'Indisponible'
};

const statutVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'royal'> = {
  disponible: 'success',
  loue: 'danger',
  reserve: 'warning',
  maintenance: 'neutral'
};

export default function CatalogGallery({ catalog }: { catalog: CatalogItem[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<CatalogItem | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const openGallery = (vehicle: CatalogItem) => {
    if (vehicle.photos.length === 0) return;
    setSelectedVehicle(vehicle);
    setCurrentPhotoIndex(0);
  };

  const closeGallery = () => {
    setSelectedVehicle(null);
  };

  const nextPhoto = () => {
    if (!selectedVehicle) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % selectedVehicle.photos.length);
  };

  const prevPhoto = () => {
    if (!selectedVehicle) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + selectedVehicle.photos.length) % selectedVehicle.photos.length);
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card variant="outline" className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-royal-100">
                  <Car className="h-8 w-8 text-royal-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-royal-900">Aucun véhicule</h3>
                  <p className="text-royal-600">Le catalogue est vide pour le moment.</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          catalog.map((c) => (
            <div
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-royal-200/50 bg-white shadow-lg shadow-royal-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-royal-200/50"
            >
              {/* Image */}
              <div
                className={`relative h-48 bg-gradient-to-br from-royal-100 to-royal-50 ${c.photos.length > 0 ? 'cursor-pointer' : ''}`}
                onClick={() => openGallery(c)}
              >
                {c.photos.length > 0 ? (
                  <>
                    <img
                      src={c.photos[0]}
                      alt={c.modele}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Photo+indisponible';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {c.photos.length > 1 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-royal-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <Eye className="h-3.5 w-3.5" />
                        {c.photos.length} photos
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-royal-700 shadow-lg backdrop-blur-sm">
                        <Eye className="h-4 w-4" />
                        Voir la galerie
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-royal-300 gap-2">
                    <ImageOff className="w-10 h-10" />
                    <span className="text-sm">Pas de photo</span>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={statutVariant[c.statut] ?? 'neutral'} size="sm">
                    {statutLabels[c.statut] ?? c.statut}
                  </Badge>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="mb-3 text-lg font-bold text-royal-900">{c.modele}</h3>
                
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-royal-100 px-2.5 py-1 text-xs font-medium text-royal-700">
                    <Fuel className="h-3.5 w-3.5" />
                    {c.carburant}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-royal-100 px-2.5 py-1 text-xs font-medium text-royal-700">
                    <Settings2 className="h-3.5 w-3.5" />
                    {c.boite}
                  </span>
                </div>
                
                <p className="mb-4 text-sm text-royal-500">{c.immatriculation}</p>
                
                {c.statut === 'disponible' ? (
                  <Button asChild className="w-full">
                    <Link href={`/public-site/${c.id}`}>Voir et réserver</Link>
                  </Button>
                ) : (
                  <Button disabled variant="secondary" className="w-full opacity-60">
                    {c.statut === 'loue' ? 'Actuellement loué' : 'Non disponible'}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/90 p-4 backdrop-blur-sm"
          onClick={closeGallery}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl border border-royal-500/20 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-royal-100 bg-gradient-to-r from-royal-50 to-white p-4">
              <h3 className="text-lg font-bold text-royal-900">{selectedVehicle.modele}</h3>
              <button
                onClick={closeGallery}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-100 text-royal-600 transition-colors hover:bg-royal-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image */}
            <div className="relative aspect-video bg-gradient-to-br from-royal-900 to-royal-950 flex items-center justify-center">
              <img
                src={selectedVehicle.photos[currentPhotoIndex]}
                alt={`${selectedVehicle.modele} - Photo ${currentPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Photo+indisponible';
                }}
              />

              {selectedVehicle.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-royal-700 shadow-lg transition-all hover:bg-white hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-royal-700 shadow-lg transition-all hover:bg-white hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-royal-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                {currentPhotoIndex + 1} / {selectedVehicle.photos.length}
              </div>
            </div>

            {/* Thumbnails */}
            {selectedVehicle.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto bg-royal-50 p-4">
                {selectedVehicle.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`shrink-0 h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentPhotoIndex 
                        ? 'border-royal-500 ring-2 ring-royal-500/30 scale-105' 
                        : 'border-transparent hover:border-royal-300'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=?';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
