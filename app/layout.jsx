import './globals.css';
import CookieBanner from './components/CookieBanner';

export const metadata = {
  title: 'Aegis | Secure by Design',
  description: 'Vi utvecklar säkra, intelligenta och framtidssäkra tekniska lösningar inom cybersäkerhet, inbyggda system, mjukvaruutveckling och digital innovation.',
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
