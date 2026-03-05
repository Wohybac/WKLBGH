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
      <button onClick={() => !disabled && toggleFocus(id)} disabled={disabled} style={{
        padding: '10px', borderRadius: '6px', border: '1px solid #ddd',
        backgroundColor: isSelected ? '#007bff' : (disabled ? '#f0f0f0' : '#fff'),
        color: isSelected ? '#fff' : (disabled ? '#aaa' : '#333'),
        cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: disabled ? 0.6 : 1
      }}>{label}</button>
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
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '18px', color: '#555', marginBottom: '15px' }}>Question {currentQuestionIndex + 1} of {lessonData.questions.length}</h2>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{currentQuestion.sentence_with_blank}</div>
        
        {isAnswered && (
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
            {currentQuestion.english_translation}
          </div>
        )}
        {!isAnswered && <div style={{ marginBottom: '20px' }}></div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
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
                style={{
                  padding: '15px', borderRadius: '8px', border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor, color: textColor,
                  textAlign: 'left', fontSize: '16px', cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: isAnswered && (option.is_correct || option.id === answeredOptionId) ? '8px' : '0' }}>
                  {option.id}. {option.text}
                </div>
                {isAnswered && (option.is_correct || option.id === answeredOptionId) && (
                  <div style={{ fontSize: '14px', marginTop: '5px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '4px' }}>
                    {option.explanation}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button 
          onClick={handleNext}
          style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {currentQuestionIndex < lessonData.questions.length - 1 ? 'Next Question' : 'Results'}
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
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Lesson Complete!</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', color: '#28a745' }}>✅ {correct}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', color: '#dc3545' }}>❌ {incorrect}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Incorrect</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', color: '#6c757d' }}>⚪ {skipped}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Skipped</div>
          </div>
        </div>

        <button 
          onClick={resetLesson}
          style={{ width: '100%', padding: '15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Return to Menu
        </button>
      </div>
    );
  };

  return (
    <div className="wklbgh-panel" style={{ border: '4px solid #007bff', padding: '25px', backgroundColor: '#fff', color: '#333', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#007bff', fontWeight: 'bold' }}>WKLBGH</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>⚙️</button>
            <button onClick={() => setIsDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#ccc' }}>✖</button>
        </div>
      </div>

      {showSettings ? (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '13px' }}>WaniKani Key:</label><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: '100%', padding: '10px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px' }}>Gemini Key:</label><input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ width: '100%', padding: '10px' }} /></div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Widget Placement:</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                <option value="top">Top of Dashboard</option>
                <option value="below_level_progress">Below Level Progress</option>
                <option value="bottom">Bottom of Dashboard</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Focus Area:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <FocusButton id="all" label="All" /><FocusButton id="recent" label="Recent" /><FocusButton id="leeches" label="Leeches" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {levelSpreads.map(s => <FocusButton key={s} id={s} label={s} disabled={isLevelDisabled(s)} />)}
            </div>
          </div>
          <button onClick={saveSettings} style={{ padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Save & Reload</button>
        </div>
      ) : (
        <div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #007bff' }}>
            <strong>Status:</strong> {status}
          </div>
          
          {appState === 'idle' && (
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={scanLearnedItems} style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Scan Progress</button>
              <button onClick={generateExercise} disabled={learnedCount.kanji === 0} style={{ flex: 1, padding: '12px', backgroundColor: learnedCount.kanji > 0 ? '#28a745' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', cursor: learnedCount.kanji > 0 ? 'pointer' : 'not-allowed' }}>Generate Lesson</button>
            </div>
          )}

          {appState === 'generating' && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Generating your personalized lesson... Please wait.
            </div>
          )}

          {appState === 'ready' && (
            <button onClick={() => setAppState('active')} style={{ width: '100%', padding: '15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
              Start Lesson!
            </button>
          )}

          {appState === 'active' && renderActiveLesson()}
          {appState === 'results' && renderResults()}

        </div>
      )}
    </div>
  );
}

export default App;
