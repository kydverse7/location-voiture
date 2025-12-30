"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { cloudinaryBestQuality } from '@/lib/cloudinary';

export default function VehicleGallery({ photos, modele }: { photos: string[]; modele: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (photos.length === 0) return null;

  return (
    <>
      {/* Grille de photos */}
      <div className="card overflow-hidden">
        {photos.length === 1 ? (
          <img
            src={cloudinaryBestQuality(photos[0])}
            alt={modele}
            className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openModal(0)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Photo+indisponible';
            }}
          />
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {/* Image principale */}
            <div className="col-span-3 row-span-2">
              <img
                src={cloudinaryBestQuality(photos[0])}
                alt={`${modele} - Photo 1`}
                className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openModal(0)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Photo+indisponible';
                }}
              />
            </div>
            {/* Thumbnails */}
            {photos.slice(1, 5).map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={cloudinaryBestQuality(photo)}
                  alt={`${modele} - Photo ${index + 2}`}
                  className="w-full h-[7.75rem] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openModal(index + 1)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=?';
                  }}
                />
                {/* Indicateur "+X photos" sur la dernière thumb si plus de 5 photos */}
                {index === 3 && photos.length > 5 && (
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                    onClick={() => openModal(4)}
                  >
                    <span className="text-white font-semibold">+{photos.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeModal}
        >
          <div
            className="relative w-full h-full max-w-none flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <span className="font-medium">{modele}</span>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-2 relative overflow-auto">
              <img
                src={cloudinaryBestQuality(photos[currentIndex])}
                alt={`${modele} - Photo ${currentIndex + 1}`}
                className="max-w-none max-h-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Photo+indisponible';
                }}
              />

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails en bas */}
            <div className="flex gap-2 p-4 justify-center overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    index === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={cloudinaryBestQuality(photo)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=?';
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Compteur */}
            <div className="text-center pb-4 text-white text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
