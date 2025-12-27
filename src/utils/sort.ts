/**
 * Parse une date au format français "DD mois YYYY" en objet Date
 * Ex: "21 mai 2022" -> Date(2022, 4, 21)
 */
export function parseFrenchDate(dateStr: string): Date {
  const months: Record<string, number> = {
    janvier: 0, février: 1, mars: 2, avril: 3,
    mai: 4, juin: 5, juillet: 6, août: 7,
    septembre: 8, octobre: 9, novembre: 10, décembre: 11
  };

  const parts = dateStr.toLowerCase().split(' ');
  const day = parseInt(parts[0], 10);
  const month = months[parts[1]];
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

/**
 * Trie les analyses par date de publication (les plus récentes en premier)
 */
export function sortAnalysesByDate(analyses: any[]): any[] {
  return [...analyses].sort((a, b) => {
    const dateA = parseFrenchDate(a.data.publishDate);
    const dateB = parseFrenchDate(b.data.publishDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Trie les histoires par date de publication (les plus récentes en premier)
 */
export function sortHistoiresByDate(histoires: any[]): any[] {
  return [...histoires].sort((a, b) => {
    const dateA = parseFrenchDate(a.data.publishDate);
    const dateB = parseFrenchDate(b.data.publishDate);
    return dateB.getTime() - dateA.getTime();
  });
}
