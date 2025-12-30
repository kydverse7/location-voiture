"use client";
/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, type VehicleInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';

export default function VehicleForm({ mode, vehicle }: { mode: 'create' | 'edit'; vehicle?: any }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [photos, setPhotos] = useState<string[]>(vehicle?.photos ?? []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [backgroundPhoto, setBackgroundPhoto] = useState<string>(vehicle?.backgroundPhoto ?? '');
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle ?? {
      marque: '',
      modele: '',
      carburant: 'essence',
      boite: 'manuelle',
      immatriculation: '',
      kilometrage: 0,
      statut: 'disponible'
    }
  });

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload échoué');
    const json = await res.json();
    return json.url as string;
  };

  const addPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    if (photos.length >= 5) {
      alert('Maximum 5 photos par véhicule');
      return;
    }
    setPhotos([...photos, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = handleSubmit(async (data) => {
    setError('');
    const payload = { ...data, photos, backgroundPhoto };
    const res = await fetch(mode === 'create' ? '/api/vehicles' : `/api/vehicles/${vehicle.id}`, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      setError('Erreur lors de la sauvegarde');
      return;
    }
    router.push('/vehicles');
    router.refresh();
  });

  const handleDelete = async () => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    setDeleting(true);
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Erreur lors de la suppression');
      setDeleting(false);
      return;
    }
    router.push('/vehicles');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Marque</label>
          <input className="input" {...register('marque')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Modèle</label>
          <input className="input" {...register('modele')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Année</label>
          <input type="number" className="input" {...register('annee', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Immatriculation</label>
          <input className="input" {...register('immatriculation')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Carburant</label>
          <select className="select" {...register('carburant')}>
            <option value="diesel">Diesel</option>
            <option value="essence">Essence</option>
            <option value="hybride">Hybride</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Boîte</label>
          <select className="select" {...register('boite')}>
            <option value="manuelle">Manuelle</option>
            <option value="automatique">Automatique</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Kilométrage</label>
          <input type="number" className="input" {...register('kilometrage', { valueAsNumber: true })} />
        </div>
        {mode === 'edit' && (
          <div>
            <label className="text-sm font-medium text-slate-700">Statut</label>
            <select className="select" {...register('statut')}>
              <option value="disponible">Disponible</option>
              <option value="loue">Loué</option>
              <option value="reserve">Réservé</option>
              <option value="maintenance">En maintenance</option>
            </select>
          </div>
        )}
      </div>

      {/* Photo de fond (site public) */}
      <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Photo background (site public)</h3>
        {backgroundPhoto && (
          <div className="relative w-full overflow-hidden rounded-lg border border-slate-200">
            <img src={backgroundPhoto} alt="Background" className="h-36 w-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="url"
            className="input flex-1"
            placeholder="URL background (https://...)"
            value={backgroundPhoto}
            onChange={(e) => setBackgroundPhoto(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="bg-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingBg(true);
              try {
                const url = await uploadFile(file);
                setBackgroundPhoto(url);
              } catch {
                setError('Upload background échoué');
              } finally {
                setUploadingBg(false);
                e.target.value = '';
              }
            }}
          />
          <label htmlFor="bg-upload" className="btn-secondary cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-md">
            {uploadingBg ? 'Upload...' : 'Uploader une image'}
          </label>
        </div>
        <p className="text-xs text-slate-500">Image utilisée comme fond/hero sur le site public.</p>
      </div>

      {/* Section Photos */}
      <div className="border-t border-slate-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Photos du véhicule (max 5)</h3>
        
        {/* Aperçu des photos existantes */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
            {photos.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erreur';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Ajouter une photo par URL */}
        {photos.length < 5 && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="url"
                className="input flex-1"
                placeholder="URL de la photo (https://...)"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
              />
              <Button type="button" onClick={addPhoto} className="shrink-0">
                Ajouter
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                id="photo-upload"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (photos.length >= 5) {
                    setError('Maximum 5 photos');
                    return;
                  }
                  setUploadingPhoto(true);
                  try {
                    const url = await uploadFile(file);
                    setPhotos((prev) => [...prev, url]);
                  } catch {
                    setError('Upload photo échoué');
                  } finally {
                    setUploadingPhoto(false);
                    e.target.value = '';
                  }
                }}
              />
              <label htmlFor="photo-upload" className="btn-secondary cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-md">
                {uploadingPhoto ? 'Upload...' : 'Uploader une photo'}
              </label>
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-1">{photos.length}/5 photos</p>
      </div>

      {/* Section Alertes Maintenance */}
      <div className="border-t border-slate-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Alertes Maintenance</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Vidange au km</label>
            <input type="number" className="input" placeholder="Ex: 150000" {...register('alerts.vidangeAtKm', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Expiration assurance</label>
            <input type="date" className="input" {...register('alerts.assuranceExpireLe')} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Expiration vignette</label>
            <input type="date" className="input" {...register('alerts.vignetteExpireLe')} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Expiration contrôle technique</label>
            <input type="date" className="input" {...register('alerts.controleTechniqueExpireLe')} />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Mettre à jour'}
        </Button>
        {mode === 'edit' && (
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        )}
      </div>
    </form>
  );
}
