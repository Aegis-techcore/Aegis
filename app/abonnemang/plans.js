import { getMembershipPlan } from "../lib/membershipPlans.js";

export const subscriptionPlans = [
  {
    name: "Privat",
    price: getMembershipPlan("Privat").displayPrice,
    period: "/månad",
    audience:
      "För privatpersoner som vill ha hjälp med en personlig hemsida, portfolio eller mindre digital tjänst utan stora kostnader.",
    hours: "Upp till 30 minuters hjälp varje vecka",
    features: [
      "Ändring av enklare texter och bilder",
      "Uppdatering av kontaktuppgifter eller länkar",
      "Mindre justeringar på personlig hemsida eller portfolio",
      "Hjälp med enklare publicering",
      "Support via e-post"
    ],
    fit:
      "Har en mindre privat webbplats och vill kunna få enkel hjälp vid behov.",
    useCaseCount: 4
  },
  {
    name: "Start",
    price: getMembershipPlan("Start").displayPrice,
    period: "/månad",
    audience:
      "För mindre företag som vill hålla sin webbplats uppdaterad, professionell och fungerande över tid.",
    hours: "Upp till 1 timmes arbete varje vecka",
    features: [
      "Ändring av texter, bilder och innehåll",
      "Uppdatering av kontaktuppgifter, öppettider och företagsinformation",
      "Mindre designjusteringar",
      "Felsökning av mindre problem",
      "Enklare teknisk rådgivning",
      "Support via e-post"
    ],
    fit:
      "Vill ha hjälp då och då för att hålla webbplatsen aktuell och professionell.",
    useCaseCount: 6
  },
  {
    name: "Plus",
    price: getMembershipPlan("Plus").displayPrice,
    period: "/månad",
    audience:
      "För företag som vill förbättra sin webbplats löpande och utveckla nya delar utan stora engångskostnader.",
    hours: "Upp till 2 timmars arbete varje vecka",
    features: [
      "Allt som ingår i Start",
      "Skapande av nya sektioner på webbplatsen",
      "Uppdatering av menyer, knappar och layout",
      "Mindre förbättringar av design och struktur",
      "Hjälp med mobilanpassning",
      "Mindre funktioner, exempelvis formulär, knappar eller bokningslänkar",
      "Prioriterad e-postsupport"
    ],
    fit:
      "Vill kunna utveckla webbplatsen lite varje månad med tillgång till teknisk hjälp.",
    highlighted: true,
    useCaseCount: 8
  },
  {
    name: "Pro",
    price: getMembershipPlan("Pro").displayPrice,
    period: "/månad",
    audience:
      "För företag som vill ha löpande utveckling, förbättringar och teknisk support varje månad.",
    hours: "Upp till 3 timmars arbete varje vecka",
    features: [
      "Allt som ingår i Plus",
      "Löpande vidareutveckling av webbplats eller app",
      "Nya sidor och landningssidor",
      "Förbättringar av användarupplevelse och design",
      "Felsökning och buggfixar",
      "Teknisk rådgivning kring förbättringar",
      "Enklare API- och automationshjälp",
      "Support via e-post och telefon"
    ],
    fit:
      "Vill ha en flexibel utvecklingspartner tillgänglig varje månad.",
    useCaseCount: 11
  },
  {
    name: "Business",
    price: getMembershipPlan("Business").displayPrice,
    period: "/månad",
    audience:
      "För företag som vill ha en långsiktig teknikpartner för utveckling, förbättringar, support och digital tillväxt.",
    hours: "Upp till 5 timmars arbete varje vecka",
    features: [
      "Allt som ingår i Pro",
      "Kontinuerlig utveckling av webbplats, app eller digital tjänst",
      "Planering och genomförande av nya funktioner",
      "Större design- och strukturförbättringar",
      "Hjälp med kampanjsidor och nya tjänstesidor",
      "AI-, automation- och API-förbättringar vid behov",
      "Regelbundna avstämningar",
      "Prioriterad support och snabbare hantering"
    ],
    fit:
      "Vill ha en pålitlig teknikpartner som aktivt hjälper företaget att växa digitalt.",
    useCaseCount: 13
  }
];

export const subscriptionUseCases = [
  "Ändra texter och bilder",
  "Lägga till nya sidor",
  "Skapa nya sektioner",
  "Uppdatera produkter eller tjänster",
  "Lägga till kontaktformulär",
  "Förbättra design och layout",
  "Göra webbplatsen mer mobilanpassad",
  "Fixa buggar och tekniska problem",
  "Lägga till bokningslänkar eller externa tjänster",
  "Skapa kampanjsidor",
  "Göra mindre ändringar i appar",
  "Förbättra användarupplevelsen",
  "IT-support och teknisk rådgivning"
];
