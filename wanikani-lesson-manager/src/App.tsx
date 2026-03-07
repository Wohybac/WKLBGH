import { useState, useEffect } from 'react';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest, unsafeWindow } from '$';
import { filterItems, parseGeminiResponse, Lesson } from './logic';
import { buildGrammarLessonPrompt } from './prompts';
import './App.css';

declare global {
  interface Window {
    wkof: any;
  }
}

type AppState = 'idle' | 'generating' | 'ready' | 'active' | 'results';

const CowSVG = ({ chewing = false }: { chewing?: boolean }) => (
  <svg viewBox="0 0 120 90" width="120" height="90" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="25" cy="35" rx="12" ry="6" transform="rotate(-30 25 35)" fill="#fff" stroke="#333" strokeWidth="4"/>
    <ellipse cx="95" cy="35" rx="12" ry="6" transform="rotate(30 95 35)" fill="#fff" stroke="#333" strokeWidth="4"/>
    <path d="M 35 30 Q 30 10 45 20" fill="#f0f0f0" stroke="#333" strokeWidth="4" strokeLinecap="round"/>
    <path d="M 85 30 Q 90 10 75 20" fill="#f0f0f0" stroke="#333" strokeWidth="4" strokeLinecap="round"/>
    <rect x="25" y="25" width="70" height="60" rx="30" fill="#ffffff" stroke="#333" strokeWidth="4"/>
    <path d="M 60 25 Q 85 25 90 40 Q 85 60 65 50 Q 55 35 60 25 Z" fill="#333"/>
    <ellipse cx="60" cy="70" rx="28" ry="16" fill="#ffb6c1" stroke="#333" strokeWidth="4"/>
    <ellipse cx="50" cy="68" rx="3" ry="5" fill="#333"/>
    <ellipse cx="70" cy="68" rx="3" ry="5" fill="#333"/>
    <circle cx="45" cy="48" r="4" fill="#333"/>
    <circle cx="75" cy="48" r="4" fill="#fff"/>
    {chewing && (
      <g>
        <path d="M 60 78 Q 50 95 30 90" fill="none" stroke="#28a745" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 45 86 Q 35 85 30 75" fill="none" stroke="#28a745" strokeWidth="4" strokeLinecap="round"/>
      </g>
    )}
  </svg>
);

function App() {
  const [apiKey, setApiKey] = useState(GM_getValue('wk_api_key', ''));
  const [geminiKey, setGeminiKey] = useState(GM_getValue('gemini_api_key', ''));
  const [focusSettings, setFocusSettings] = useState<string[]>(GM_getValue('wklbgh_focus_settings', ['all']));
  const [placement, setPlacement] = useState(GM_getValue('wklbgh_placement', 'below_level_progress'));
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [status, setStatus] = useState('Idle');
  const [userData, setUserData] = useState<any>(null);
  const [learnedCount, setLearnedCount] = useState({ kanji: 0, vocabulary: 0 });
  const [learnedItems, setLearnedItems] = useState<any[]>([]);
  const [activeModel, setActiveModel] = useState(GM_getValue('wklbgh_active_model', ''));
  const [exercise, setExercise] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  // Lesson State
  const [appState, setAppState] = useState<AppState>('idle');
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const levelSpreads = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  useEffect(() => {
    if (apiKey) verifyApiKey(apiKey);
  }, []);

  const discoverAndTestModel = async () => {
    setStatus('Discovering models...');
    return new Promise<string>((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `https://generativelanguage.googleapis.com/v1/models?key=${geminiKey}`,
        onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);
            const models = data.models || [];
            const supported = models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'));
            
            const priorities = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro'];
            let bestModelName = '';

            for (const p of priorities) {
              const match = supported.find((m: any) => m.name.endsWith(p));
              if (match) { bestModelName = match.name; break; }
            }

            if (!bestModelName && supported.length > 0) bestModelName = supported[0].name;

            if (bestModelName) {
              console.log('Discovery found:', bestModelName);
              // Test it immediately
              GM_xmlhttpRequest({
                method: 'POST',
                url: `https://generativelanguage.googleapis.com/v1/${bestModelName}:generateContent?key=${geminiKey}`,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }),
                onload: (testRes) => {
                  if (testRes.status === 200) {
                    const modelId = bestModelName.split('/').pop() || bestModelName;
                    GM_setValue('wklbgh_active_model', modelId);
                    setActiveModel(modelId);
                    resolve(modelId);
                  } else {
                    reject(new Error(`Model ${bestModelName} failed test prompt.`));
                  }
                },
                onerror: () => reject(new Error('Network error during model test'))
              });
            } else {
              reject(new Error('No supported models found for this API key.'));
            }
          } catch (e) { reject(e); }
        },
        onerror: () => reject(new Error('Failed to list models.'))
      });
    });
  };

  if (isDismissed) {
    return (
      <div style={{ textAlign: 'right', padding: '10px' }}>
        <button onClick={() => setIsDismissed(false)} style={{ fontSize: '12px', color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>Show WKLBGH</button>
      </div>
    );
  }

  const saveSettings = () => {
    GM_setValue('wk_api_key', apiKey);
    GM_setValue('gemini_api_key', geminiKey);
    GM_setValue('wklbgh_focus_settings', focusSettings);
    GM_setValue('wklbgh_placement', placement);
    GM_setValue('wklbgh_active_model', ''); // Reset on key change
    setActiveModel('');
    setShowSettings(false);
    verifyApiKey(apiKey);
    window.location.reload();
  };

  const toggleFocus = (id: string) => {
    let newSettings = [...focusSettings];
    if (id === 'all') {
      if (!newSettings.includes('all')) {
        if (window.confirm('Selecting "All" is resource intensive. Proceed?')) newSettings = ['all'];
      } else {
        newSettings = [];
      }
    } else {
      newSettings = newSettings.filter(s => s !== 'all');
      if (newSettings.includes(id)) {
        newSettings = newSettings.filter(s => s !== id);
      } else {
        newSettings.push(id);
      }
    }
    setFocusSettings(newSettings);
  };

  const isLevelDisabled = (spread: string) => {
    if (!userData) return true;
    const [min] = spread.split('-').map(Number);
    return userData.level < min;
  };

  const verifyApiKey = (key: string) => {
    setStatus('Verifying API Key...');
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://api.wanikani.com/v2/user',
      headers: { 'Authorization': `Bearer ${key}`, 'Wanikani-Revision': '20170710' },
      onload: (response) => {
        if (response.status === 200) {
          const data = JSON.parse(response.responseText);
          setUserData(data.data);
          setStatus(`Logged in as ${data.data.username} (Level ${data.data.level})`);
        } else {
          setStatus('Invalid API Key');
          setShowSettings(true);
        }
      }
    });
  };

  const withTimeout = (promise: Promise<any>, ms: number, errorMessage: string) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms));
    return Promise.race([promise, timeout]);
  };

  const scanLearnedItems = async () => {
    const wkof = (unsafeWindow as any).wkof || (window as any).wkof;
    if (!wkof) { setStatus('WKOF not found.'); return; }
    setStatus('Scanning via WKOF...');
    try {
      await withTimeout(wkof.include('ItemData'), 5000, 'Load Timeout');
      await withTimeout(wkof.ready('ItemData'), 5000, 'Ready Timeout');
      if (focusSettings.length === 0) { setStatus('Select focus area'); return; }
      const items = await withTimeout(wkof.ItemData.get_items({ wk_items: { options: { assignments: true, review_statistics: true }, filters: { item_type: ['kan', 'voc'] } } }), 15000, 'Fetch Timeout');
      
      const filtered = filterItems(items, focusSettings, userData?.level || 1);

      const kanjiCount = filtered.filter((i: any) => i.object === 'kanji').length;
      const vocabCount = filtered.filter((i: any) => i.object === 'vocabulary').length;
      setLearnedCount({ kanji: kanjiCount, vocabulary: vocabCount });
      setLearnedItems(filtered);
      setStatus(`Scan Complete: ${kanjiCount} Kanji, ${vocabCount} Vocab found.`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const generateExercise = async () => {
    if (!geminiKey) { setShowSettings(true); return; }
    
    setAppState('generating');
    setStatus('Generating lesson...');

    let modelToUse = activeModel;
    if (!modelToUse) {
      try {
        modelToUse = await discoverAndTestModel();
      } catch (e: any) {
        setStatus(`Discovery Error: ${e.message}`);
        setAppState('idle');
        return;
      }
    }

    setStatus(`Generating with ${modelToUse}...`);
    
    const sampled = learnedItems.sort(() => 0.5 - Math.random()).slice(0, 50);
    const itemStrings = sampled.length > 0 ? sampled.map(i => i.data.characters || i.data.slug).join(', ') : "None";
    const prompt = buildGrammarLessonPrompt(itemStrings);

    GM_xmlhttpRequest({
      method: 'POST',
      url: `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent?key=${geminiKey}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      onload: (response) => {
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            const textResponse = data.candidates[0].content.parts[0].text;
            const parsedLesson = parseGeminiResponse(textResponse);
            setLessonData(parsedLesson);
            setAppState('ready');
            setStatus('Lesson Ready!');
          } catch (e) {
            console.error('Failed to parse lesson JSON:', e);
            setStatus('Error parsing lesson format.');
            setAppState('idle');
          }
        } else {
          console.error('Final API Error:', response.responseText);
          setStatus(`API Error: ${response.status}`);
          setActiveModel(''); // Reset for retry
          GM_setValue('wklbgh_active_model', '');
          setAppState('idle');
        }
      },
      onerror: () => {
        setStatus('Network Error');
        setAppState('idle');
      }
    });
  };

  const FocusButton = ({ id, label, disabled = false }: any) => {
    const isSelected = focusSettings.includes(id);
    return (
      <button onClick={() => !disabled && toggleFocus(id)} disabled={disabled} className={`wklbgh-focus-button ${isSelected ? 'selected' : ''}`}>
        {label}
      </button>
    );
  };

  const handleOptionClick = (optionId: string) => {
    if (selectedAnswers[currentQuestionIndex]) return; 
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionId }));
  };

  const handleNext = () => {
    if (lessonData && currentQuestionIndex < lessonData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setAppState('results');
    }
  };

  const resetLesson = () => {
    setLessonData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAppState('idle');
    setStatus(`Scan Complete: ${learnedCount.kanji} Kanji, ${learnedCount.vocabulary} Vocab found.`);
  };

  const renderActiveLesson = () => {
    if (!lessonData) return null;
    const currentQuestion = lessonData.questions[currentQuestionIndex];
    const answeredOptionId = selectedAnswers[currentQuestionIndex];
    const isAnswered = !!answeredOptionId;

    return (
      <div className="wklbgh-lesson-container">
        <h2 className="wklbgh-lesson-progress">Question {currentQuestionIndex + 1} of {lessonData.questions.length}</h2>
        <div className="wklbgh-lesson-sentence">{currentQuestion.sentence_with_blank}</div>
        
        {isAnswered && (
          <div className="wklbgh-lesson-translation">
            {currentQuestion.english_translation}
          </div>
        )}
        {!isAnswered && <div style={{ marginBottom: '20px' }}></div>}
        
        <div className="wklbgh-lesson-options">
          {currentQuestion.options.map(option => {
            let bgColor = '#f8f9fa';
            let borderColor = '#ddd';
            let textColor = '#333';

            if (isAnswered) {
              if (option.is_correct) {
                bgColor = '#d4edda'; borderColor = '#c3e6cb'; textColor = '#155724';
              } else if (option.id === answeredOptionId) {
                bgColor = '#f8d7da'; borderColor = '#f5c6cb'; textColor = '#721c24';
              }
            }

            return (
              <button 
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={isAnswered}
                className="wklbgh-lesson-option"
                style={{
                  borderColor, backgroundColor: bgColor, color: textColor,
                  cursor: isAnswered ? 'default' : 'pointer'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: isAnswered && (option.is_correct || option.id === answeredOptionId) ? '8px' : '0' }}>
                  {option.id}. {option.text}
                </div>
                {isAnswered && (option.is_correct || option.id === answeredOptionId) && (
                  <div className="wklbgh-lesson-explanation">
                    {option.explanation}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button onClick={handleNext} className="wklbgh-button wklbgh-button--primary" style={{ marginTop: '10px' }}>
          <span>{currentQuestionIndex < lessonData.questions.length - 1 ? 'Next Question' : 'Results'}</span>
          <span className="wklbgh-button-icon">›</span>
        </button>
      </div>
    );
  };

  const renderResults = () => {
    if (!lessonData) return null;
    
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    lessonData.questions.forEach((q, idx) => {
      const answeredId = selectedAnswers[idx];
      if (!answeredId) {
        skipped++;
      } else {
        const selectedOption = q.options.find(o => o.id === answeredId);
        if (selectedOption?.is_correct) correct++;
        else incorrect++;
      }
    });

    return (
      <div className="wklbgh-results-container">
        <h2 className="wklbgh-results-title">Lesson Complete!</h2>
        
        <div className="wklbgh-results-stats">
          <div className="wklbgh-result-stat">
            <div className="wklbgh-stat-value" style={{ color: '#28a745' }}>{correct}</div>
            <div className="wklbgh-stat-label">Correct</div>
          </div>
          <div className="wklbgh-result-stat">
            <div className="wklbgh-stat-value" style={{ color: '#dc3545' }}>{incorrect}</div>
            <div className="wklbgh-stat-label">Incorrect</div>
          </div>
          <div className="wklbgh-result-stat">
            <div className="wklbgh-stat-value" style={{ color: '#6c757d' }}>{skipped}</div>
            <div className="wklbgh-stat-label">Skipped</div>
          </div>
        </div>

        <button onClick={resetLesson} className="wklbgh-button wklbgh-button--primary">
          <span>Return to Menu</span>
          <span className="wklbgh-button-icon">›</span>
        </button>
      </div>
    );
  };

  return (
    <div className="wklbgh-panel">
      
      {showSettings ? (
        <div className="wklbgh-widget-layout">
          <div className="wklbgh-widget-icon" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
            <CowSVG chewing={true} />
          </div>
          <div className="wklbgh-widget-content">
            <div className="wklbgh-widget-header">
              <h2 className="wklbgh-widget-title">Ushi Settings</h2>
            <div className="wklbgh-widget-controls">
                <button className="wklbgh-btn-icon" onClick={() => setShowSettings(false)}>✖</button>
            </div>
          </div>
          <div className="wklbgh-settings-panel">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>WaniKani Key:</label><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: '100%', padding: '10px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Gemini Key:</label><input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ width: '100%', padding: '10px' }} /></div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Widget Placement:</label>
              <select value={placement} onChange={(e) => setPlacement(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                  <option value="top">Top of Dashboard</option>
                  <option value="below_level_progress">Below Level Progress</option>
                  <option value="bottom">Bottom of Dashboard</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Focus Area:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <FocusButton id="all" label="All" /><FocusButton id="recent" label="Recent" /><FocusButton id="leeches" label="Leeches" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {levelSpreads.map(s => <FocusButton key={s} id={s} label={s} disabled={isLevelDisabled(s)} />)}
              </div>
            </div>
            <button className="wklbgh-button wklbgh-button--primary" onClick={saveSettings}>
              <span>Save & Reload</span>
              <span className="wklbgh-button-icon">›</span>
            </button>
          </div>
        </div>
        </div>
      ) : (
        <div className="wklbgh-widget-layout">
          {appState === 'idle' && (
            <div className="wklbgh-widget-icon">
              <CowSVG />
            </div>
          )}

          <div className="wklbgh-widget-content">
            <div className="wklbgh-widget-header">
              <h2 className="wklbgh-widget-title">
                WaniKani Ushi {appState !== 'active' && appState !== 'results' && learnedCount.kanji > 0 && <span className="wklbgh-widget-pill">{learnedCount.kanji + learnedCount.vocabulary}</span>}
              </h2>
              <div className="wklbgh-widget-controls">
                  <button className="wklbgh-btn-icon" onClick={() => setShowSettings(true)} title="Settings">⚙️</button>
                  <button className="wklbgh-btn-icon" onClick={() => setIsDismissed(true)} title="Dismiss">✖</button>
              </div>
            </div>
            
            {appState === 'idle' && (
              <p className="wklbgh-widget-subtitle">
                {status === 'Idle' ? 'Do your Grammar Lessons to unlock new knowledge.' : status}
              </p>
            )}

            {appState === 'generating' && (
              <p className="wklbgh-widget-subtitle">Generating your personalized lesson... Please wait.</p>
            )}

            {appState === 'ready' && (
              <p className="wklbgh-widget-subtitle">Lesson Ready! Let's get started.</p>
            )}

            <div className="wklbgh-widget-actions">
              {appState === 'idle' && learnedCount.kanji === 0 && (
                <button className="wklbgh-button" onClick={scanLearnedItems}>
                  <span>Scan Progress</span>
                  <span className="wklbgh-button-icon">›</span>
                </button>
              )}
              {appState === 'idle' && learnedCount.kanji > 0 && (
                <button className="wklbgh-button" onClick={generateExercise}>
                  <span>Generate Lesson</span>
                  <span className="wklbgh-button-icon">›</span>
                </button>
              )}
              {appState === 'generating' && (
                <button className="wklbgh-button wklbgh-button--disabled" disabled>
                  <span>Generating...</span>
                </button>
              )}
              {appState === 'ready' && (
                <button className="wklbgh-button wklbgh-button--primary" onClick={() => setAppState('active')}>
                  <span>Start Lesson!</span>
                  <span className="wklbgh-button-icon">›</span>
                </button>
              )}
              {appState === 'active' && renderActiveLesson()}
              {appState === 'results' && renderResults()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
