import { describe, it, expect } from 'vitest';
import { filterItems, isLeech, parseGeminiResponse, WaniKaniItem } from '../logic';

describe('Logic Utilities', () => {
  const mockItems: WaniKaniItem[] = [
    {
      id: 1,
      object: 'kanji',
      data: { level: 5, characters: '五' },
      assignments: { srs_stage: 5 },
      review_statistics: { meaning_incorrect: 0, reading_incorrect: 0 }
    },
    {
      id: 2,
      object: 'vocabulary',
      data: { level: 15, slug: 'test' },
      assignments: { srs_stage: 3 },
      review_statistics: { meaning_incorrect: 10, reading_incorrect: 5 } // High leeches
    },
    {
      id: 3,
      object: 'kanji',
      data: { level: 1, characters: '一' },
      assignments: { srs_stage: 9 },
      review_statistics: { meaning_incorrect: 0, reading_incorrect: 0 }
    }
  ];

  describe('isLeech', () => {
    it('should identify a leech correctly', () => {
      expect(isLeech(mockItems[1])).toBe(true);
    });

    it('should not identify a clean item as a leech', () => {
      expect(isLeech(mockItems[0])).toBe(false);
    });
  });

  describe('filterItems', () => {
    it('should filter by level range', () => {
      const filtered = filterItems(mockItems, ['1-10'], 20);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(i => i.id)).toContain(1);
      expect(filtered.map(i => i.id)).toContain(3);
    });

    it('should filter by leeches', () => {
      const filtered = filterItems(mockItems, ['leeches'], 20);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    it('should filter by recent levels', () => {
      const filtered = filterItems(mockItems, ['recent'], 16); // Level 16 user, recent is 14-16
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2); // Level 15
    });

    it('should return empty array if no focus settings', () => {
      const filtered = filterItems(mockItems, [], 20);
      expect(filtered).toHaveLength(0);
    });

    it('should handle "all" setting', () => {
      const filtered = filterItems(mockItems, ['all'], 20);
      expect(filtered).toHaveLength(3);
    });
  });

  describe('parseGeminiResponse', () => {
    const validJsonString = '{"lesson_title": "Test Lesson", "questions": []}';
    
    it('should parse raw JSON correctly', () => {
      const result = parseGeminiResponse(validJsonString);
      expect(result.lesson_title).toBe('Test Lesson');
    });

    it('should strip markdown json tags and parse correctly', () => {
      const markdownWrapped = `\`\`\`json\n${validJsonString}\n\`\`\``;
      const result = parseGeminiResponse(markdownWrapped);
      expect(result.lesson_title).toBe('Test Lesson');
    });

    it('should strip plain markdown ticks and parse correctly', () => {
      const tickWrapped = `\`\`\`\n${validJsonString}\n\`\`\``;
      const result = parseGeminiResponse(tickWrapped);
      expect(result.lesson_title).toBe('Test Lesson');
    });
  });
});
