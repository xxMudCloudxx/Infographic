import { describe, expect, it, vi } from 'vitest';
import { UpdateOptionsCommand } from '../../../../src/editor/commands/UpdateOptions';
import { ZoomWheel } from '../../../../src/editor/interactions/zoom-wheel';

// Polyfill DOMMatrix for JSDOM
if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    inverse() {
      return new DOMMatrix();
    }
  };
}

// Polyfill DOMPoint for JSDOM (it's not available in JSDOM)
if (typeof globalThis.DOMPoint === 'undefined') {
  (globalThis as any).DOMPoint = class DOMPoint {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    matrixTransform(_matrix?: DOMMatrix): DOMPoint {
      // For testing, just return the same point (identity transform)
      return new DOMPoint(this.x, this.y, this.z, this.w);
    }
  };
}

// Helper to create SVG with viewBox attribute
const createSVG = (viewBox: string) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  // Mock getScreenCTM for clientToViewport
  (svg as any).getScreenCTM = () => new DOMMatrix();
  return svg;
};

// Helper to parse viewBox string from command
const parseViewBox = (command: UpdateOptionsCommand) => {
  const viewBoxStr = command.serialize().options.viewBox as string;
  if (!viewBoxStr) return null;
  const [x, y, width, height] = viewBoxStr.split(' ').map(Number);
  return { x, y, width, height };
};

describe('ZoomWheel interaction', () => {
  describe('center zoom (Shift + Wheel)', () => {
    it('zooms out (deltaY > 0, Shift) - increases viewBox size', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120, shiftKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(commander.execute).toHaveBeenCalledTimes(1);
      const viewBox = parseViewBox(commander.execute.mock.calls[0][0]);
      // deltaY > 0 => factor = 1.1, viewBox gets larger (zoom out)
      expect(viewBox?.width).toBeCloseTo(110, 1);
      expect(viewBox?.height).toBeCloseTo(110, 1);

      instance.destroy();
    });

    it('zooms in (deltaY < 0, Shift) - decreases viewBox size', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: -120, shiftKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).toHaveBeenCalledTimes(1);
      const viewBox = parseViewBox(commander.execute.mock.calls[0][0]);
      // deltaY < 0 => factor = 1/1.1, viewBox gets smaller (zoom in)
      expect(viewBox?.width).toBeCloseTo(90.9, 1);
      expect(viewBox?.height).toBeCloseTo(90.9, 1);

      instance.destroy();
    });

    it('maintains center point when zooming', () => {
      const svg = createSVG('50 50 100 100'); // center at (100, 100)
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120, shiftKey: true });
      document.dispatchEvent(event);

      const viewBox = parseViewBox(commander.execute.mock.calls[0][0]);
      // Center should remain at (100, 100): x + width/2 = 100
      const newCenter = {
        x: viewBox!.x + viewBox!.width / 2,
        y: viewBox!.y + viewBox!.height / 2,
      };
      expect(newCenter.x).toBeCloseTo(100, 1);
      expect(newCenter.y).toBeCloseTo(100, 1);

      instance.destroy();
    });
  });

  describe('mouse zoom (Ctrl/Meta + Wheel)', () => {
    it('zooms with Ctrl key (mouse point zoom)', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).toHaveBeenCalledTimes(1);
      const viewBox = parseViewBox(commander.execute.mock.calls[0][0]);
      expect(viewBox?.width).toBeCloseTo(110, 1);

      instance.destroy();
    });

    it('zooms with Meta key (Cmd on Mac)', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120, metaKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).toHaveBeenCalledTimes(1);
      const viewBox = parseViewBox(commander.execute.mock.calls[0][0]);
      expect(viewBox?.width).toBeCloseTo(110, 1);

      instance.destroy();
    });
  });

  describe('reset zoom (Ctrl/Meta + Shift + Wheel)', () => {
    it('resets viewBox when Ctrl + Shift are both pressed', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', {
        deltaY: 120,
        ctrlKey: true,
        shiftKey: true,
      });
      document.dispatchEvent(event);

      expect(commander.execute).toHaveBeenCalledTimes(1);
      const command = commander.execute.mock
        .calls[0][0] as UpdateOptionsCommand;
      expect(command.serialize().options.viewBox).toBeUndefined();

      instance.destroy();
    });
  });

  describe('modifier keys', () => {
    it('does not zoom without modifier keys (Ctrl/Meta/Shift)', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120 });
      document.dispatchEvent(event);

      expect(commander.execute).not.toHaveBeenCalled();
      instance.destroy();
    });
  });

  describe('interaction state', () => {
    it('does not zoom when interaction is not active', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => false) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).not.toHaveBeenCalled();
      instance.destroy();
    });
  });

  describe('boundary conditions', () => {
    it('prevents zoom out when viewBox would exceed MAX_VIEWBOX_SIZE', () => {
      // ViewBox at 1900, zooming out by 1.1 = 2090 > 2000
      const svg = createSVG('0 0 1900 1900');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      // deltaY > 0 => zoom out => viewBox gets larger
      const event = new WheelEvent('wheel', { deltaY: 120, shiftKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).not.toHaveBeenCalled();
      instance.destroy();
    });

    it('prevents zoom in when viewBox would be below MIN_VIEWBOX_SIZE', () => {
      // ViewBox at 21, zooming in by 1/1.1 ≈ 19 < 20
      const svg = createSVG('0 0 21 21');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      // deltaY < 0 => zoom in => viewBox gets smaller
      const event = new WheelEvent('wheel', { deltaY: -120, shiftKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).not.toHaveBeenCalled();
      instance.destroy();
    });
  });

  describe('edge cases', () => {
    it('does not zoom when deltaY is zero (no scrolling)', () => {
      const svg = createSVG('0 0 100 100');
      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 0, shiftKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(commander.execute).not.toHaveBeenCalled();
      instance.destroy();
    });

    it('handles SVG without viewBox attribute (falls back to width/height)', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '200');
      svg.setAttribute('height', '150');
      (svg as any).getScreenCTM = () => new DOMMatrix();

      const commander = { execute: vi.fn() } as any;
      const interaction = { isActive: vi.fn(() => true) } as any;
      const state = { getOptions: vi.fn(() => ({})) } as any;

      const instance = new ZoomWheel();
      instance.init({
        emitter: {} as any,
        editor: { getDocument: () => svg } as any,
        commander,
        interaction,
        state,
      });

      const event = new WheelEvent('wheel', { deltaY: 120, shiftKey: true });
      document.dispatchEvent(event);

      expect(commander.execute).toHaveBeenCalledTimes(1);
      const viewBox = parseViewBox(commander.execute.mock.calls[0][0]);
      expect(viewBox?.width).toBeCloseTo(220, 1);
      expect(viewBox?.height).toBeCloseTo(165, 1);

      instance.destroy();
    });
  });
});
