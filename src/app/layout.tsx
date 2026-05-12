import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEPT-AI Font Library",
  description: "Preview all 52 Google Fonts from the AEPT-AI design library",
};

// Build the Google Fonts CSS2 URL for all 52 fonts in a single request.
// Format: family=FontName:wght@weightSpec — spaces become +
// Variable weight fonts use range syntax (e.g. 100..900), fixed use comma list.
const FONT_FAMILIES = [
  // Modern Sans
  "Inter:wght@100..900",
  "Space+Grotesk:wght@300..700",
  "DM+Sans:wght@100..900",
  "Plus+Jakarta+Sans:wght@200..800",
  "Outfit:wght@100..900",
  "Sora:wght@100..800",
  "Manrope:wght@200..800",
  "Urbanist:wght@100..900",
  "Instrument+Sans:wght@400..700",
  "Figtree:wght@300..900",
  "Albert+Sans:wght@100..900",
  "Lexend:wght@100..900",
  "Red+Hat+Display:wght@300..900",
  // Classic Sans
  "Roboto:wght@100..900",
  "Open+Sans:wght@300..800",
  "Lato:wght@100,300,400,700,900",
  "Poppins:wght@100,200,300,400,500,600,700,800,900",
  "Montserrat:wght@100..900",
  "Nunito:wght@200..1000",
  "Nunito+Sans:wght@200..1000",
  "Raleway:wght@100..900",
  "Rubik:wght@300..900",
  "Work+Sans:wght@100..900",
  "Mulish:wght@200..1000",
  "Fira+Sans:wght@100,200,300,400,500,600,700,800,900",
  "Karla:wght@200..800",
  "Cabin:wght@400..700",
  "Quicksand:wght@300..700",
  "Archivo:wght@100..900",
  "Barlow:wght@100,200,300,400,500,600,700,800,900",
  "PT+Sans:wght@400,700",
  "Ubuntu:wght@300,400,500,700",
  "Noto+Sans:wght@100..900",
  // Condensed
  "Roboto+Condensed:wght@100..900",
  "Barlow+Condensed:wght@100,200,300,400,500,600,700,800,900",
  "Oswald:wght@200..700",
  // Serif
  "Playfair+Display:wght@400..900",
  "Merriweather:wght@300,400,700,900",
  "Cormorant+Garamond:wght@300,400,500,600,700",
  "EB+Garamond:wght@400..800",
  "Libre+Baskerville:wght@400,700",
  "Lora:wght@400..700",
  "Noto+Serif:wght@100..900",
  "Source+Serif+4:wght@200..900",
  "Roboto+Slab:wght@100..900",
  // Monospace
  "JetBrains+Mono:wght@100..800",
  "IBM+Plex+Mono:wght@100,200,300,400,500,600,700",
  "Fira+Code:wght@300..700",
  "Source+Code+Pro:wght@200..900",
  "DM+Mono:wght@300,400,500",
  "Space+Mono:wght@400,700",
  "Roboto+Mono:wght@100..700",
];

const GOOGLE_FONTS_URL =
  `https://fonts.googleapis.com/css2?family=${FONT_FAMILIES.join("&family=")}&display=swap`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Single request loads all 52 fonts */}
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      </head>
      <body>{children}</body>
    </html>
  );
}
