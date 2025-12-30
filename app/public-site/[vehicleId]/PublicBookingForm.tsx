"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PublicBookingForm({ vehicleId }: { vehicleId: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    debutAt: '',
    finAt: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    if (!formData.prenom || !formData.nom || !formData.telephone || !formData.debutAt || !formData.finAt) {
      setError('Veuillez remplir tous les champs');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      vehicle: vehicleId,
      clientInline: {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone
      },
      debutAt: new Date(formData.debutAt),
      finAt: new Date(formData.finAt),
      canal: 'public'
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Impossible de reserver');
        return;
      }
      
      setMessage('Demande de reservation envoyee ! Nous vous contacterons rapidement.');
      setFormData({ prenom: '', nom: '', telephone: '', debutAt: '', finAt: '' });
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-slate-900">Vos informations</h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Prenom *</label>
          <input type="text" name="prenom" className="input" placeholder="Votre prenom" value={formData.prenom} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Nom *</label>
          <input type="text" name="nom" className="input" placeholder="Votre nom" value={formData.nom} onChange={handleChange} required />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Telephone *</label>
          <input type="tel" name="telephone" className="input" placeholder="Ex: 0612345678" value={formData.telephone} onChange={handleChange} required />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 pt-2">Periode de location</h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Date de debut *</label>
          <input type="datetime-local" name="debutAt" className="input" value={formData.debutAt} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Date de fin *</label>
          <input type="datetime-local" name="finAt" className="input" value={formData.finAt} onChange={handleChange} required />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande de reservation'}
      </Button>
      
      <p className="text-xs text-slate-500 text-center">
        Votre demande sera traitee rapidement. Un agent vous contactera pour confirmer.
      </p>
    </form>
  );
}
