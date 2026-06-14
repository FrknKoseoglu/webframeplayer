import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('User-Agent Header Character Encoding', () => {
  it('should not contain non-ASCII characters in User-Agent header in Xtream API route', () => {
    const filePath = path.resolve(__dirname, '../src/app/api/xtream/route.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Ensure 'Yayın-Player' is not present
    expect(content).not.toContain('Yayın-Player');
    // Ensure 'Yayin-Player' is present
    expect(content).toContain('Yayin-Player');
  });

  it('should not contain non-ASCII characters in User-Agent header in Stream API route', () => {
    const filePath = path.resolve(__dirname, '../src/app/api/stream/route.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Ensure 'Yayın-Player' is not present
    expect(content).not.toContain('Yayın-Player');
    // Ensure 'Yayin-Player' is present
    expect(content).toContain('Yayin-Player');
  });
});
