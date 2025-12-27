// Portfolio et Watchlist - Facile à mettre à jour
// Modifie ce fichier pour ajouter/modifier des positions

export interface Position {
  name: string;
  ticker: string;
  exchange: string;
  country: string;
  flag: string;
  thesis: string;
  weight: number; // Poids relatif (le plus gros = 100)
  analysisSlug?: string; // Lien vers l'analyse si disponible
}

export interface WatchlistItem {
  name: string;
  ticker: string;
  exchange: string;
  flag: string;
  note: string;
}

export interface Update {
  date: string;
  type: 'new' | 'update' | 'sold' | 'watch';
  ticker: string;
  text: string;
}

// === PORTEFEUILLE ===
// Classé par taille de position (weight: 100 = plus grosse position)
export const portfolio: Position[] = [
  {
    name: "Harris Technology",
    ticker: "HT8",
    exchange: "ASX",
    country: "Australie",
    flag: "🇦🇺",
    thesis: "Distribution tech australienne sous-valorisée avec potentiel de redressement opérationnel.",
    weight: 100,
    // analysisSlug: "harris-technology", // À ajouter quand l'analyse sera publiée
  },
  {
    name: "Snack Empire",
    ticker: "AWH",
    exchange: "SGX",
    country: "Singapour",
    flag: "🇸🇬",
    thesis: "Franchise F&B asiatique profitable avec dividende spécial imminent et expansion régionale.",
    weight: 70,
    analysisSlug: "snack-empire",
  },
  {
    name: "Duolingo",
    ticker: "DUOL",
    exchange: "NASDAQ",
    country: "États-Unis",
    flag: "🇺🇸",
    thesis: "Leader mondial de l'apprentissage des langues avec effet réseau et monétisation en accélération.",
    weight: 50,
    analysisSlug: "duolingo",
  },
];

// === WATCHLIST ===
// Entreprises suivies mais pas encore en portefeuille
export const watchlist: WatchlistItem[] = [
  {
    name: "Dino Polska",
    ticker: "DNP",
    exchange: "WSE",
    flag: "🇵🇱",
    note: "Supermarchés de proximité en Pologne, croissance organique exceptionnelle.",
  },
  {
    name: "Sprouts Farmers Market",
    ticker: "SFM",
    exchange: "NASDAQ",
    flag: "🇺🇸",
    note: "Épiceries bio US, valorisation attractive après correction.",
  },
  {
    name: "Evolution Gaming",
    ticker: "EVO",
    exchange: "OMX",
    flag: "🇸🇪",
    note: "Leader du casino en ligne live, marges exceptionnelles.",
  },
];

// === DERNIÈRES MISES À JOUR ===
// Les plus récentes en premier
export const updates: Update[] = [
  {
    date: "Déc 2024",
    type: "new",
    ticker: "HT8",
    text: "Nouvelle position : Harris Technology",
  },
  {
    date: "Nov 2024",
    type: "update",
    ticker: "AWH",
    text: "Renforcement sur Snack Empire après résultats S1",
  },
  {
    date: "Oct 2024",
    type: "watch",
    ticker: "DNP",
    text: "Ajout de Dino Polska à la watchlist",
  },
  {
    date: "Sept 2024",
    type: "new",
    ticker: "DUOL",
    text: "Initiation de position sur Duolingo",
  },
];
