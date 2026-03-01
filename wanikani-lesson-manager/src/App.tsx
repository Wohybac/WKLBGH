import { useState, useEffect } from 'react';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from '$';
import './App.css';

// Declare wkof for TypeScript
declare global {
  interface Window {
    wkof: any;
  }
}

function App() {
  const [apiKey, setApiKey] = useState(GM_getValue('wk_api_key', ''));
  const [geminiKey, setGeminiKey] = useState(GM_getValue('gemini_api_key', ''));
  const [focusSettings, setFocusSettings] = useState<string[]>(GM_getValue('wklbgh_focus_settings', ['all']));
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [status, setStatus] = useState('Idle (WKOF Integrated)');
  const [userData, setUserData] = useState<any>(null);
  const [learnedCount, setLearnedCount] = useState({ kanji: 0, vocabulary: 0 });
  const [learnedItems, setLearnedItems] = useState<any[]>([]);
  const [exercise, setExercise] = useState('');

  const levelSpreads = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  useEffect(() => {
    if (apiKey) {
      verifyApiKey(apiKey);
    }
  }, []);

  const saveSettings = () => {
    GM_setValue('wk_api_key', apiKey);
    GM_setValue('gemini_api_key', geminiKey);
    GM_setValue('wklbgh_focus_settings', focusSettings);
    setShowSettings(false);
    verifyApiKey(apiKey);
  };

  const toggleFocus = (id: string) => {
    let newSettings = [...focusSettings];
    if (id === 'all') {
      if (!newSettings.includes('all')) {
        const confirmAll = window.confirm('Selecting "All" can be resource intensive and may take longer to generate. Proceed?');
        if (confirmAll) newSettings = ['all'];
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
    GM_setValue('wklbgh_focus_settings', newSettings);
  };

  const isLevelDisabled = (spread: string) => {
    if (!userData) return true;
    const [min] = spread.split('-').map(Number);
    return userData.level < min;
  };

  const verifyApiKey = (key: string) => {
    setStatus('Verifying WaniKani API Key...');
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://api.wanikani.com/v2/user',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Wanikani-Revision': '20170710'
      },
      onload: (response) => {
        if (response.status === 200) {
          const data = JSON.parse(response.responseText);
          setUserData(data.data);
          setStatus(`Logged in as ${data.data.username} (Level ${data.data.level})`);
        } else {
          setStatus('Invalid WaniKani API Key');
          setShowSettings(true);
        }
      }
    });
  };

  const scanLearnedItems = async () => {
    if (!window.wkof) {
      setStatus('WKOF not found. Please install WaniKani Open Framework.');
      return;
    }

    setStatus('Scanning via WKOF...');
    try {
      await window.wkof.include('ItemData');
      await window.wkof.ready('ItemData');

      if (focusSettings.length === 0) {
        setLearnedCount({ kanji: 0, vocabulary: 0 });
        setLearnedItems([]);
        setStatus('Ready (Please select a focus area in settings)');
        return;
      }

      const filterOptions: any = {
        item_type: ['kan', 'voc'],
        srs_stage: { value: 1, comparison: '>=' }
      };

      // Get all items initially, then filter manually for complex logic
      let items = await window.wkof.ItemData.get_items({
        wk_items: {
          options: { assignments: true },
          filters: filterOptions
        }
      });

      if (!focusSettings.includes('all')) {
        items = items.filter((item: any) => {
          let keep = false;
          
          // Level Spreads
          focusSettings.forEach(s => {
            if (s.includes('-')) {
              const [min, max] = s.split('-').map(Number);
              if (item.data.level >= min && item.data.level <= max) keep = true;
            }
          });

          // Most Recent (last 3 levels)
          if (focusSettings.includes('recent')) {
            if (item.data.level >= (userData.level - 2)) keep = true;
          }

          // Leeches (Heuristic: more than 5 total incorrect answers)
          if (focusSettings.includes('leeches')) {
            const ass = item.assignments;
            if (ass && (ass.meaning_incorrect + ass.reading_incorrect) > 5) keep = true;
          }

          return keep;
        });
      }

      const kanji = items.filter((i: any) => i.object === 'kanji');
      const vocab = items.filter((i: any) => i.object === 'vocabulary');

      setLearnedCount({ kanji: kanji.length, vocabulary: vocab.length });
      setLearnedItems(items);
      setStatus(`Scan Complete: ${kanji.length} Kanji, ${vocab.length} Vocab found.`);
    } catch (e) {
      console.error(e);
      setStatus('WKOF Scan Failed.');
    }
  };

  const generateExercise = () => {
    if (!geminiKey) {
      setStatus('Please set your Gemini API Key in settings.');
      setShowSettings(true);
      return;
    }
    setStatus('Gemini is generating an exercise...');
    
    // Sample items to keep prompt size manageable
    const sampledItems = learnedItems.sort(() => 0.5 - Math.random()).slice(0, 50);
    const itemStrings = sampledItems.map(i => i.data.characters || i.data.slug).join(', ');

    const prompt = `I am a WaniKani student at level ${userData?.level || 'unknown'}. 
    I have learned ${learnedCount.kanji} Kanji and ${learnedCount.vocabulary} Vocabulary words.
    FOCUS ITEMS: ${itemStrings}
    Please generate a short Japanese grammar explanation and 3 practice sentences.
    IMPORTANT: Use ONLY simple Kanji and vocabulary suitable for my level, prioritizing the FOCUS ITEMS provided.
    Provide the response in English, with Japanese sentences (and furigana/English translations).`;

    GM_xmlhttpRequest({
      method: 'POST',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      onload: (response) => {
        if (response.status === 200) {
          const data = JSON.parse(response.responseText);
          setExercise(data.candidates[0].content.parts[0].text);
          setStatus('Exercise generated!');
        } else {
          setStatus('Gemini API Error.');
        }
      }
    });
  };

  const FocusButton = ({ id, label, disabled = false, tooltip = '' }: any) => {
    const isSelected = focusSettings.includes(id);
    return (
      <button 
        onClick={() => !disabled && toggleFocus(id)}
        disabled={disabled}
        title={tooltip}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ddd',
          backgroundColor: isSelected ? '#007bff' : (disabled ? '#f0f0f0' : '#fff'),
          color: isSelected ? '#fff' : (disabled ? '#aaa' : '#333'),
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s'
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="wklbgh-panel" style={{
      border: '4px solid #007bff', 
      padding: '25px', 
      margin: '20px auto', 
      backgroundColor: '#fff', 
      color: '#333',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      maxWidth: '1100px',
      display: 'block'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#007bff', fontWeight: 'bold' }}>WKLBGH - WaniKani Lesson Based Grammar Helper</h1>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>⚙️</button>
      </div>

      {showSettings ? (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0 }}>Settings</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>WaniKani Key:</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Gemini Key:</label>
              <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>Focus Area:</label>
            {focusSettings.length === 0 && (
               <div style={{ color: '#dc3545', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>⚠️ Please select at least one focus area to scan items.</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <FocusButton id="all" label="All" />
              <FocusButton id="recent" label="Most Recent" />
              <FocusButton id="leeches" label="Leeches" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {levelSpreads.map(spread => (
                <FocusButton 
                  key={spread} 
                  id={spread} 
                  label={spread} 
                  disabled={isLevelDisabled(spread)}
                  tooltip={isLevelDisabled(spread) ? "Turtles not ready yet! Do at least one lesson from a level in this spread to select this option!" : ""}
                />
              ))}
            </div>
          </div>

          <button onClick={saveSettings} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>Save & Close</button>
        </div>
      ) : (
        <div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #007bff' }}>
             <strong>Status:</strong> {status}
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button onClick={scanLearnedItems} style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Scan Progress (WKOF)</button>
            <button 
                onClick={generateExercise} 
                disabled={learnedCount.kanji === 0 || focusSettings.length === 0} 
                style={{ 
                    flex: 1, 
                    padding: '12px', 
                    backgroundColor: (learnedCount.kanji > 0 && focusSettings.length > 0) ? '#28a745' : '#ccc', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: (learnedCount.kanji > 0 && focusSettings.length > 0) ? 'pointer' : 'not-allowed', 
                    fontWeight: 'bold' 
                }}
            >
                Generate Lesson
            </button>
          </div>
          {focusSettings.length === 0 && (
             <div style={{ textAlign: 'center', color: '#dc3545', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                Please go to settings (⚙️) and select a Focus Area first!
             </div>
          )}

          {exercise && (
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '6px', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto', fontSize: '16px', border: '1px solid #ddd', lineHeight: '1.6' }}>
              {exercise}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
