export const buildGrammarLessonPrompt = (learnedItemsString: string, jlptLevels: string[] = []): string => {
  let jlptConstraint = '';
  if (jlptLevels.length > 0) {
    const levelsStr = jlptLevels.join(', ');
    const unselected = ['N5', 'N4', 'N3', 'N2', 'N1'].filter(l => !jlptLevels.includes(l)).join(' and ');
    jlptConstraint = `\n5. DIFFICULTY LEVEL: Only generate exercises for JLPT levels ${levelsStr}.`;
    if (unselected.length > 0) {
       jlptConstraint += ` The generated lessons MUST NOT contain any exercise including ${unselected} grammatical structures.`;
    }
  }

  return `You are an expert Japanese language teacher creating a highly tailored grammar test for a student. 

Your task is to generate exactly 10 multiple-choice questions focusing on Japanese grammatical structures (e.g., verb conjugations, particles, conditionals, te-form, transitivity).

CRITICAL CONSTRAINTS:
1. VOCABULARY LIMITATION: You MUST construct the Japanese sentences using ONLY the Kanji and Vocabulary provided in the "ALLOWED ITEMS" list below. 
   - You may use basic standard hiragana for grammatical particles (は, が, を, に, で, etc.), copulas (だ, です), and standard conjugations.
   - DO NOT introduce any nouns, verbs, or adjectives that are not present in the ALLOWED ITEMS list.
2. GRAMMAR FOCUS: The blank space (___) in each sentence MUST represent a missing grammatical structure or particle, NOT a missing vocabulary word.
3. MULTIPLE CHOICE: Provide exactly 4 options for each sentence. Exactly ONE option must be correct.
4. EXPLANATIONS: Every single option (both correct and incorrect) MUST include a concise explanation of why it is right or wrong, referencing the grammar rule.${jlptConstraint}

ALLOWED ITEMS (Kanji & Vocabulary):
${learnedItemsString}

OUTPUT FORMAT:
You must return the response EXCLUSIVELY as a valid JSON object matching the exact structure below. Do not include any markdown formatting (like \`\`\`json), introduction, or conclusion text. Just the raw JSON object.

{
  "lesson_title": "Targeted Grammar Practice",
  "questions": [
    {
      "id": 1,
      "sentence_with_blank": "私は昨日、その本を___。",
      "english_translation": "I ___ that book yesterday.",
      "tested_grammar_point": "Past tense verb conjugation",
      "options": [
        {
          "id": "A",
          "text": "読む",
          "is_correct": false,
          "explanation": "Incorrect. This is the present/future dictionary form, but the sentence contains 'yesterday' (昨日), which requires the past tense."
        },
        {
          "id": "B",
          "text": "読んだ",
          "is_correct": true,
          "explanation": "Correct. This is the plain past tense form of the verb 読む (to read), which matches the past context."
        },
        {
          "id": "C",
          "text": "読んで",
          "is_correct": false,
          "explanation": "Incorrect. This is the te-form, which is used for linking actions or making requests, not for a completed past action at the end of a sentence."
        },
        {
          "id": "D",
          "text": "読まない",
          "is_correct": false,
          "explanation": "Incorrect. This is the negative present form ('will not read'), which does not fit the past tense context."
        }
      ]
    }
  ]
}`;
};
