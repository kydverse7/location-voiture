import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicReservePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="card space-y-2 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Réserver en ligne</h1>
        <p className="text-sm text-slate-600">
          Choisissez d’abord un véhicule dans le catalogue pour accéder au formulaire de réservation.
        </p>
        <div className="pt-2">
          <Button asChild>
            <Link href="/public-site">Voir le catalogue</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
