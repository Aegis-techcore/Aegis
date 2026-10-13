import {
  ShieldIcon,
  CodeIcon,
  LayoutIcon,
  TableIcon,
  ServerIcon,
  CpuIcon,
  SparklesIcon,
  GamepadIcon
} from "../components/Icons";

export const services = [
  {
    id: "programming",
    title: "Programmering & Utveckling",
    icon: CodeIcon,
    items: [
      "Hjälp med objektorienterad programmering (OOP)",
      "Felsökning, debugging och prestandaanalys",
      "Optimering av långsam eller ineffektiv kod",
      "Automatisering av repetitiva arbetsuppgifter",
      "API-integrationer och mikrotjänster",
      "Robust arkitektur från idé till färdig produkt"
    ],
    scenario: {
      title: "Java-applikation som kraschar",
      problem: "Ett Java-program som kraschar varje gång användaren klickar på en specifik knapp.",
      action: "Vi läser och analyserar källkoden, identifierar minnesläckan eller pekarfelet, åtgärdar logiken och levererar stabil kod tillsammans med en tydlig förklaring."
    }
  },
  {
    id: "fullstack",
    title: "Fullstack-utveckling",
    icon: LayoutIcon,
    items: [
      "Professionella företagshemsidor och landningssidor",
      "E-handelslösningar och säkra betalningssystem",
      "Bokningssystem och interaktiva kalendrar",
      "Kundportaler och medlemssystem",
      "Adminpaneler och avancerade dashboards",
      "Mobilappar för iOS och Android"
    ],
    scenario: {
      title: "Bokningar via telefon",
      problem: "En frisörsalong hanterar alla sina bokningar manuellt via telefon, vilket tar mycket tid och gör att kvällskunder missas.",
      action: "Vi utvecklar en modern webbplats med ett integrerat kalenderbaserat bokningssystem som skickar automatiska SMS- och e-postbekräftelser."
    }
  },
  {
    id: "data",
    title: "Data & Excel",
    icon: TableIcon,
    items: [
      "Sammanställning av hundratals spridda Excel-filer",
      "Automatisk rapportgenerering i PDF och Excel",
      "Dataanalys, statistik och interaktiv visualisering",
      "Säker datamigrering och databasdesign",
      "Effektivisering och ersättning av makron med Python"
    ],
    scenario: {
      title: "500 utspridda Excel-filer",
      problem: "En ekonom lägger flera dagar varje månad på att manuellt sammanställa 500 Excel-rapporter från olika kontor.",
      action: "Vi utvecklar ett automatiserat Python-skript som läser in filerna, tvättar datan och sparar allt i en central sökbar databas."
    }
  },
  {
    id: "cybersecurity",
    title: "Cybersäkerhet",
    icon: ShieldIcon,
    items: [
      "Säkerhetsgranskningar av kod och system",
      "Skydd av känslig kunddata och GDPR-efterlevnad",
      "Säker serverkonfiguration och härdning",
      "Sårbarhetsanalys och penetrationstestning",
      "Incidenthantering och säkra autentiseringslösningar"
    ],
    scenario: {
      title: "Säkerhetstest av webbshop",
      problem: "En snabbväxande webbshop vet inte om deras kunddata eller betalningsflöden har allvarliga säkerhetsluckor.",
      action: "Vi utför penetrationstester, identifierar kritiska sårbarheter och hjälper till att åtgärda dem."
    }
  },
  {
    id: "network",
    title: "Nätverk & IT-support",
    icon: ServerIcon,
    items: [
      "Brandväggskonfiguration och intrångsskydd",
      "Säkra VPN-lösningar för distansarbete",
      "Felsökning av lokala nätverk och IP-konflikter",
      "Serverhantering för Linux och Windows",
      "Optimering av trådlösa nätverk"
    ],
    scenario: {
      title: "Instabilt distanskontor",
      problem: "Ett kontor lider av ständiga nätverksavbrott och säkerhetsrisker vid distansanslutning till servern.",
      action: "Vi konfigurerar en robust brandvägg, sätter upp säkra VPN-tunnlar och optimerar nätverket."
    }
  },
  {
    id: "embedded",
    title: "Embedded Systems & IoT",
    icon: CpuIcon,
    items: [
      "Mikrokontrollerprogrammering med ESP32, Arduino och STM32",
      "Sensorintegrationer och datainsamling i realtid",
      "Smarta och uppkopplade IoT-produkter",
      "Kommunikationsprotokoll som MQTT, BLE, I2C och Wi-Fi",
      "Hårdvarunära mjukvaruutveckling och industriell automation"
    ],
    scenario: {
      title: "Överhettade fabriksmaskiner",
      problem: "En fabrik upplever plötsliga maskinstopp för att deras äldre maskiner blir för varma utan förvarning.",
      action: "Vi installerar temperatursensorer och kopplar dem till en dashboard som visar data i realtid."
    }
  },
  {
    id: "ai",
    title: "AI & Automation",
    icon: SparklesIcon,
    items: [
      "Skräddarsydda AI-chatbots integrerade på hemsidan",
      "Intelligent dokumentanalys och textsammanfattning",
      "Automatiska arbetsflöden och skript",
      "AI-assistenter för support och intern kunskap",
      "Automatisering av e-post och kundtjänstsvar"
    ],
    scenario: {
      title: "Överbelastad kundsupport",
      problem: "Ett företag får hundratals repetitiva frågor varje dag vilket gör att handläggningstiderna blir långa.",
      action: "Vi utvecklar en AI-chatbot tränad på företagets egen dokumentation och FAQ."
    }
  },
  {
    id: "games",
    title: "Spelutveckling",
    icon: GamepadIcon,
    items: [
      "Mobilspel för iOS och Android",
      "Multiplayer-arkitektur och spelservrar",
      "Speldesign, mekanik och prototyputveckling",
      "Integration av online-funktionalitet och sparfiler",
      "Publicering på Google Play Store och App Store"
    ],
    scenario: {
      title: "Från idé till mobilspel",
      problem: "En kreatör har en spelidé men saknar teknisk kompetens för att bygga spelet.",
      action: "Vi designar spelets mekanik, programmerar funktionaliteten, bygger gränssnittet och förbereder publicering."
    }
  }
];
