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
  userLevel: number,
  leechesOnly: boolean = false
): WaniKaniItem[] => {
  if (focusSettings.length === 0) return [];
  
  let filtered = items.filter(item => item.assignments && item.assignments.srs_stage >= 1);

  if (!focusSettings.includes('all')) {
    filtered = filtered.filter((item: WaniKaniItem) => {
      for (const setting of focusSettings) {
        // Level Range (e.g., "1-10")
        if (setting.includes('-')) {
          const [min, max] = setting.split('-').map(Number);
          if (item.data.level >= min && item.data.level <= max) {
            return true;
          }
        }
        // Recent items
        if (setting === 'recent' && item.data.level >= userLevel - 2) {
          return true;
        }
      }
      return false;
    });
  }

  if (leechesOnly) {
    filtered = filtered.filter(isLeech);
  }

  return filtered;
};

export interface Option {
  id: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface Question {
  id: number;
  question_text?: string;
  sentence_with_blank?: string;
  english_translation?: string;
  tested_grammar_point?: string;
  options: Option[];
}

export interface Lesson {
  lesson_title: string;
  story_text?: string;
  story_translation?: string;
  questions: Question[];
}

export const parseGeminiResponse = (text: string): Lesson => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
  return JSON.parse(cleaned.trim());
};
