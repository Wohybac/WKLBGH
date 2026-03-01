import { useState, useEffect } from 'react';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest, unsafeWindow } from '$';
import './App.css';

declare global {
  interface Window {
    wkof: any;
  }
}

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
  const [exercise, setExercise] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  const levelSpreads = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  useEffect(() => {
    if (apiKey) verifyApiKey(apiKey);
  }, []);

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
      const filtered = items.filter((item: any) => {
        const ass = item.assignments;
        if (!ass || ass.srs_stage < 1) return false;
        if (focusSettings.includes('all')) return true;
        let keep = false;
        focusSettings.forEach(s => { if (s.includes('-')) { const [min, max] = s.split('-').map(Number); if (item.data.level >= min && item.data.level <= max) keep = true; } });
        if (focusSettings.includes('recent') && item.data.level >= (userData?.level - 2)) keep = true;
        if (focusSettings.includes('leeches')) {
          const stats = item.review_statistics;
          if (stats) {
            const total_incorrect = (stats.meaning_incorrect || 0) + (stats.reading_incorrect || 0);
            const score = total_incorrect / Math.pow(ass.srs_stage || 1, 1.5);
            if (score > 1.0 || total_incorrect > 3 || (ass.srs_stage === 9 && total_incorrect > 8)) keep = true;
          }
        }
        return keep;
      });
      const kanjiCount = filtered.filter((i: any) => i.object === 'kanji').length;
      const vocabCount = filtered.filter((i: any) => i.object === 'vocabulary').length;
      setLearnedCount({ kanji: kanjiCount, vocabulary: vocabCount });
      setLearnedItems(filtered);
      setStatus(`Scan Complete: ${kanjiCount} Kanji, ${vocabCount} Vocab found.`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const generateExercise = () => {
    if (!geminiKey) { setShowSettings(true); return; }
    setStatus('Generating...');
    const sampled = learnedItems.sort(() => 0.5 - Math.random()).slice(0, 50);
    const itemStrings = sampled.map(i => i.data.characters || i.data.slug).join(', ');
    const prompt = `I am WaniKani level ${userData?.level}. FOCUS ITEMS: ${itemStrings}. Generate grammar lesson and 3 sentences using these items.`;
    GM_xmlhttpRequest({
      method: 'POST',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      onload: (response) => {
        if (response.status === 200) {
          const data = JSON.parse(response.responseText);
          setExercise(data.candidates[0].content.parts[0].text);
          setStatus('Generated!');
        } else { setStatus('API Error'); }
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
          <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #007bff' }}><strong>Status:</strong> {status}</div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={scanLearnedItems} style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Scan Progress</button>
            <button onClick={generateExercise} disabled={learnedCount.kanji === 0} style={{ flex: 1, padding: '12px', backgroundColor: learnedCount.kanji > 0 ? '#28a745' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px' }}>Generate Lesson</button>
          </div>
          {exercise && <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '6px', whiteSpace: 'pre-wrap', border: '1px solid #ddd' }}>{exercise}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
