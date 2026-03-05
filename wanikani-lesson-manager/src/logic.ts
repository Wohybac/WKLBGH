export interface WaniKaniItem {
  id: number;
  object: 'kanji' | 'vocabulary';
  data: {
    level: number;
    characters?: string;
    slug?: string;
  };
  assignments?: {
    srs_stage: number;
  };
  review_statistics?: {
    meaning_incorrect?: number;
    reading_incorrect?: number;
  };
}

export const calculateLeechScore = (item: WaniKaniItem): number => {
  const stats = item.review_statistics;
  const ass = item.assignments;
  if (!stats || !ass || ass.srs_stage < 1) return 0;

  const total_incorrect = (stats.meaning_incorrect || 0) + (stats.reading_incorrect || 0);
  return total_incorrect / Math.pow(ass.srs_stage, 1.5);
};

export const isLeech = (item: WaniKaniItem): boolean => {
  const stats = item.review_statistics;
  const ass = item.assignments;
  if (!stats || !ass) return false;

  const total_incorrect = (stats.meaning_incorrect || 0) + (stats.reading_incorrect || 0);
  const score = calculateLeechScore(item);

  if (score > 1.0) return true;
  if (total_incorrect > 3) return true;
  if (ass.srs_stage === 9 && total_incorrect > 8) return true;

  return false;
};

export const filterItems = (
  items: WaniKaniItem[],
  focusSettings: string[],
  userLevel: number
): WaniKaniItem[] => {
  if (focusSettings.length === 0) return [];
  if (focusSettings.includes('all')) {
    return items.filter(item => item.assignments && item.assignments.srs_stage >= 1);
  }

  return items.filter((item: WaniKaniItem) => {
    const ass = item.assignments;
    if (!ass || ass.srs_stage < 1) return false;

    let keep = false;

    for (const setting of focusSettings) {
      // Level Range (e.g., "1-10")
      if (setting.includes('-')) {
        const [min, max] = setting.split('-').map(Number);
        if (item.data.level >= min && item.data.level <= max) {
          keep = true;
          break;
        }
      }

      // Recent items
      if (setting === 'recent' && item.data.level >= userLevel - 2) {
        keep = true;
        break;
      }

      // Leeches
      if (setting === 'leeches' && isLeech(item)) {
        keep = true;
        break;
      }
    }

    return keep;
  });
};
