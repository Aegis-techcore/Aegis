// Stable service IDs and labels used by the contact form and its API.
export const SERVICE_LABELS = {
  programming: 'Programmering & Utveckling',
  fullstack: 'Fullstack-utveckling',
  data: 'Data & Excel-automation',
  cybersecurity: 'Cybersäkerhet',
  network: 'Nätverk & Brandvägg',
  embedded: 'Embedded Systems / IoT',
  ai: 'AI-chatbot / Automation',
  maintenance: 'Webbunderhåll & IT-support',
  games: 'Spelutveckling'
};

export const serviceOptions = Object.entries(SERVICE_LABELS).map(([value, label]) => ({
  value,
  label
}));
