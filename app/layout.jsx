import './globals.css';

export const metadata = {
  title: 'FIT-TRACK | 90 KG → 80 KG Weight Loss Tracker',
  description: 'Interactive 107-day Weight Loss Website Tracker pre-populated from Excel template, ready for Vercel deployment with MongoDB Atlas & AI Empowered Analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    heading: ['Outfit', 'sans-serif'],
                    sans: ['Plus Jakarta Sans', 'sans-serif']
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
