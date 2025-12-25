import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* Main content - ml-0 on mobile, ml-60 on lg+ */}
      <main className="relative min-h-screen overflow-hidden lg:ml-60">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-royal-50 via-white to-royal-100/50" />
        <div className="absolute inset-0 bg-dots-royal opacity-50" />
        
        {/* Decorative blobs */}
        <div className="absolute -right-40 -top-40 h-60 w-60 rounded-full bg-royal-200/30 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute -bottom-40 -left-40 h-60 w-60 rounded-full bg-royal-300/20 blur-3xl sm:h-80 sm:w-80" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
          <div className="mx-auto max-w-7xl animate-fade-in space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
