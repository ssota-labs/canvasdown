import { describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../index';

describe('Canvasdown Core Exports', () => {
  it('should export CanvasdownCore', () => {
    expect(CanvasdownCore).toBeDefined();
    expect(typeof CanvasdownCore).toBe('function');
  });

  it('should create CanvasdownCore instance', () => {
    const core = new CanvasdownCore();
    expect(core).toBeInstanceOf(CanvasdownCore);
  });
});
