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
3. MULTIPLE CHOICE: Provide exactly 4 options for each sentence. Exactly ONE option must be correct. Ensure there is absolutely no ambiguity. The three incorrect options MUST be definitively wrong in the given context. Do not use options that could be considered correct under different interpretations.
4. EXPLANATIONS: Every single option (both correct and incorrect) MUST include a concise explanation IN ENGLISH of why it is right or wrong, referencing the grammar rule.${jlptConstraint}

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

export const buildShortStoryPrompt = (learnedItemsString: string, jlptLevels: string[] = []): string => {
  let grammarAllowance = 'basic standard hiragana for grammatical particles (は, が, を, に, で, etc.), copulas (だ, です), and standard conjugations';
  let grammarRestriction = '';

  if (jlptLevels.length > 0) {
    const allLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];
    const highestSelectedLevel = allLevels.find(level => jlptLevels.includes(level)) || 'N5';
    const forbiddenLevels = allLevels.slice(0, allLevels.indexOf(highestSelectedLevel));
    
    grammarAllowance = `grammatical structures, particles, and conjugations up to and including the ${highestSelectedLevel} level (i.e., ${allLevels.slice(allLevels.indexOf(highestSelectedLevel)).join(', ')})`;
    
    if (forbiddenLevels.length > 0) {
       grammarRestriction = `\n   - CRITICAL: You MUST NOT use any grammatical structures from higher levels: ${forbiddenLevels.join(', ')}.`;
    }
  }

  return `You are an expert Japanese language teacher creating a reading comprehension exercise for a student.

Your task is to write a cohesive, engaging short story in Japanese (up to 15 sentences long) and generate exactly 5 multiple-choice reading comprehension questions based on the story.

CRITICAL CONSTRAINTS:
1. VOCABULARY & GRAMMAR LIMITATION: You MUST construct the Japanese story and the questions using ONLY the Kanji and Vocabulary provided in the "ALLOWED ITEMS" list below. 
   - For grammar, you may use ${grammarAllowance}.
   - DO NOT introduce any nouns, verbs, or adjectives that are not present in the ALLOWED ITEMS list.${grammarRestriction}
2. NARRATIVE FLOW & NATURAL LANGUAGE: The story must be a cohesive piece of text with a clear beginning, middle, and end. It should be engaging and make logical sense as a complete narrative. DO NOT just string together vaguely connected random sentences. Avoid nonsensical sentences just to fit the vocabulary.
3. MULTIPLE CHOICE: Provide exactly 4 options for each question (A, B, C, D). Exactly ONE option must be correct. Ensure there is absolutely no ambiguity. The three incorrect options MUST be definitively wrong based on the story. Do not use options that could be considered correct under different interpretations.
4. EXPLANATIONS: Every single option (both correct and incorrect) MUST include a concise explanation IN ENGLISH of why it is right or wrong based on the events in the story.
5. ENGLISH TRANSLATION: Provide a full English translation of the story.

ALLOWED ITEMS (Kanji & Vocabulary):
${learnedItemsString}

OUTPUT FORMAT:
You must return the response EXCLUSIVELY as a valid JSON object matching the exact structure below. Do not include any markdown formatting (like \`\`\`json), introduction, or conclusion text. Just the raw JSON object.

{
  "lesson_title": "Reading Comprehension: [Insert Story Title]",
  "story_text": "[Insert the full Japanese story here]",
  "story_translation": "[Insert the full English translation of the story here]",
  "questions": [
    {
      "id": 1,
      "question_text": "[Insert the Japanese question here]",
      "english_translation": "[Insert the English translation of the question here]",
      "options": [
        {
          "id": "A",
          "text": "[Option A text]",
          "is_correct": false,
          "explanation": "[Explanation for Option A]"
        },
        {
          "id": "B",
          "text": "[Option B text]",
          "is_correct": true,
          "explanation": "[Explanation for Option B]"
        },
        {
          "id": "C",
          "text": "[Option C text]",
          "is_correct": false,
          "explanation": "[Explanation for Option C]"
        },
        {
          "id": "D",
          "text": "[Option D text]",
          "is_correct": false,
          "explanation": "[Explanation for Option D]"
        }
      ]
    }
  ]
}`;
};
