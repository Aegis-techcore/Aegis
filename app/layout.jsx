import './globals.css';
import CookieBanner from './components/CookieBanner';

export const metadata = {
  title: 'Aegis by Cedrus KB | Secure by Design',
  description: 'Aegis drivs av Cedrus kommanditbolag, ett svenskt företag inom mjukvaruutveckling, AI, IT-konsulttjänster och cybersäkerhet.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv" data-theme="aegis">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
