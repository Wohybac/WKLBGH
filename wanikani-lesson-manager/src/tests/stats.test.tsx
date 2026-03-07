import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

vi.mock('$', () => ({
  GM_getValue: vi.fn((key, defaultValue) => {
    if (key === 'wk_api_key') return 'test_api_key';
    if (key.startsWith('wklbgh_stats_')) return defaultValue;
    return defaultValue;
  }),
  GM_setValue: vi.fn(),
  GM_xmlhttpRequest: vi.fn(),
  unsafeWindow: { wkof: null }
}));

describe('Global User Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the stats button and open the stats view', () => {
    render(<App />);
    
    // Stats view should be hidden initially
    expect(screen.queryByText('Ushi Statistics')).toBeNull();
    
    // Find and click the stats button
    const statsButton = screen.getByTitle('Global Stats');
    fireEvent.click(statsButton);
    
    // Stats view should now be visible
    expect(screen.getByText('Ushi Statistics')).toBeTruthy();
    expect(screen.getByText('Correct')).toBeTruthy();
    expect(screen.getByText('Incorrect')).toBeTruthy();
    expect(screen.getByText('Skipped')).toBeTruthy();
  });
});
