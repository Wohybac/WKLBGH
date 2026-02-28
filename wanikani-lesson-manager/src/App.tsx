import { useState, useEffect } from 'react';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from '$';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState(GM_getValue('wk_api_key', ''));
  const [geminiKey, setGeminiKey] = useState(GM_getValue('gemini_api_key', ''));
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [status, setStatus] = useState('Idle');
  const [userData, setUserData] = useState<any>(null);
  const [learnedCount, setLearnedCount] = useState({ kanji: 0, vocabulary: 0 });
  const [exercise, setExercise] = useState('');

  useEffect(() => {
    if (apiKey) {
      verifyApiKey(apiKey);
    }
  }, []);

  const saveSettings = () => {
    GM_setValue('wk_api_key', apiKey);
    GM_setValue('gemini_api_key', geminiKey);
    setShowSettings(false);
    verifyApiKey(apiKey);
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
      },
      onerror: () => {
        setStatus('Error connecting to WaniKani');
        setShowSettings(true);
      }
    });
  };

  const scanLearnedItems = () => {
    if (!apiKey) return;
    setStatus('Scanning learned items...');
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://api.wanikani.com/v2/assignments?subject_types=kanji,vocabulary&started=true',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Wanikani-Revision': '20170710'
      },
      onload: (response) => {
        if (response.status === 200) {
          const data = JSON.parse(response.responseText);
          const learned = data.data.filter((a: any) => a.data.srs_stage > 0);
          const counts = learned.reduce((acc: any, curr: any) => {
            acc[curr.object] = (acc[curr.object] || 0) + 1;
            return acc;
          }, { kanji: 0, vocabulary: 0 });
          setLearnedCount(counts);
          setStatus(`Dictionary ready: ${counts.kanji} Kanji, ${counts.vocabulary} Vocab.`);
        }
      }
    });
  };

  const generateExercise = () => {
    if (!geminiKey) {
      setStatus('Please set your Gemini API Key in settings.');
      setShowSettings(true);
      return;
    }
    setStatus('Gemini is generating an exercise...');
    
    const prompt = `I am a WaniKani student at level ${userData?.level || 'unknown'}. 
    I have learned ${learnedCount.kanji} Kanji and ${learnedCount.vocabulary} Vocabulary words.
    Please generate a short Japanese grammar explanation and 3 practice sentences.
    IMPORTANT: Use ONLY simple Kanji and vocabulary suitable for my level.
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
          setStatus('Gemini API Error. Check your key.');
        }
      }
    });
  };

  return (
    <div className="wklbgh-panel" style={{
      border: '4px solid #f03', 
      padding: '25px', 
      margin: '10px 0', 
      backgroundColor: '#fff', 
      color: '#333',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      display: 'block',
      width: '100%',
      minHeight: '100px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#f03', fontWeight: '900' }}>WKLBGH - WaniKani Lesson Based Grammar Helper</h1>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>⚙️</button>
      </div>

      {showSettings ? (
        <div style={{ padding: '20px', border: '2px dashed #ccc', borderRadius: '8px', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0 }}>API Settings</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>WaniKani Key:</label>
            <input type="password" placeholder="v2 API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Gemini Key:</label>
            <input type="password" placeholder="Gemini API Key" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
          <button onClick={saveSettings} style={{ padding: '12px 24px', backgroundColor: '#f03', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save & Verify</button>
        </div>
      ) : (
        <div>
          <div style={{ backgroundColor: '#f7f7f7', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
             <strong>Status:</strong> {status}
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button onClick={scanLearnedItems} style={{ flex: 1, padding: '12px', backgroundColor: '#f03', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Scan Progress</button>
            <button onClick={generateExercise} disabled={learnedCount.kanji === 0} style={{ flex: 1, padding: '12px', backgroundColor: learnedCount.kanji > 0 ? '#4CAF50' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Generate Lesson</button>
          </div>

          {exercise && (
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '6px', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto', fontSize: '16px', border: '2px solid #f03', lineHeight: '1.6' }}>
              {exercise}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
