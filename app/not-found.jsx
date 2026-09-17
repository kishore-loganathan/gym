import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="glass-panel p-8 text-center max-w-md w-full border-cyan-500/30">
        <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-2">404</h2>
        <h3 className="text-base font-bold text-white mb-2">Page Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">
          The requested route could not be found.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
