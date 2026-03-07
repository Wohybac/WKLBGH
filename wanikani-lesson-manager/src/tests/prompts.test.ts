import { describe, it, expect } from 'vitest';
import { buildGrammarLessonPrompt } from '../prompts';

describe('Prompt Builder', () => {
  const mockItems = '犬, 猫, 食べる';

  describe('buildGrammarLessonPrompt', () => {
    it('should build a standard prompt without JLPT constraints when no levels are provided', () => {
      const prompt = buildGrammarLessonPrompt(mockItems, []);
      expect(prompt).toContain(mockItems);
      expect(prompt).not.toContain('DIFFICULTY LEVEL:');
      expect(prompt).not.toContain('MUST NOT contain');
    });

    it('should include specific JLPT constraints when a subset of levels is selected (Happy Path)', () => {
      const prompt = buildGrammarLessonPrompt(mockItems, ['N5', 'N4']);
      expect(prompt).toContain('DIFFICULTY LEVEL: Only generate exercises for JLPT levels N5, N4.');
      expect(prompt).toContain('The generated lessons MUST NOT contain any exercise including N3 and N2 and N1 grammatical structures.');
    });

    it('should not include exclusion constraints if all levels are selected (Edge Case)', () => {
      const prompt = buildGrammarLessonPrompt(mockItems, ['N5', 'N4', 'N3', 'N2', 'N1']);
      expect(prompt).toContain('DIFFICULTY LEVEL: Only generate exercises for JLPT levels N5, N4, N3, N2, N1.');
      expect(prompt).not.toContain('MUST NOT contain any exercise including');
    });

    it('should format correctly even if the items list is empty (Negative Scenario)', () => {
      const prompt = buildGrammarLessonPrompt('', ['N5']);
      expect(prompt).toContain('ALLOWED ITEMS (Kanji & Vocabulary):\n\n\nOUTPUT FORMAT:');
      expect(prompt).toContain('DIFFICULTY LEVEL: Only generate exercises for JLPT levels N5.');
    });
  });
});
