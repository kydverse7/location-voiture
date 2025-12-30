import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-royal-950 sm:text-4xl">Page introuvable</h1>
      <p className="mt-3 text-royal-600">La page demandée n’existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-royal-600 px-4 py-2 text-sm font-medium text-white hover:bg-royal-700"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
