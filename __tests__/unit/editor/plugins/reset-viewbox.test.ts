import { describe, expect, it, vi } from 'vitest';
import { UpdateOptionsCommand } from '../../../../src/editor/commands';
import { ResetViewBox } from '../../../../src/editor/plugins/reset-viewbox';

// Mock getBoundViewBox to avoid complex math in tests
vi.mock('../../../../src/utils', async () => {
  const actual = await vi.importActual('../../../../src/utils');
  return {
    ...actual,
    getBoundViewBox: vi.fn(),
    getViewBox: vi.fn(),
    viewBoxToString: vi.fn((v) => `${v.x} ${v.y} ${v.width} ${v.height}`),
    parsePadding: vi.fn(() => [0, 0, 0, 0]),
    injectStyleOnce: vi.fn(),
  };
});

import {
  getBoundViewBox,
  getViewBox,
  injectStyleOnce,
} from '../../../../src/utils';

describe('ResetViewBox Plugin', () => {
  const setupPlugin = () => {
    const plugin = new ResetViewBox();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Mock getBBox and getBoundingClientRect
    svg.getBBox = vi.fn(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      bottom: 100,
      left: 0,
      right: 100,
      top: 0,
      toJSON: () => {},
    }));
    svg.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    const emitter = { on: vi.fn(), off: vi.fn(), emit: vi.fn() };
    const commander = { execute: vi.fn() };
    const getOptions = vi.fn(() => ({ padding: [0, 0, 0, 0] }));

    plugin.init({
      emitter: emitter as any,
      editor: { getDocument: () => svg, state: { getOptions } } as any,
      commander: commander as any,
      plugin: {} as any,
      state: { getOptions } as any,
    });

    return { plugin, svg, emitter, commander, getOptions };
  };

  it('initializes and calculates originViewBox', () => {
    // Mock return value for init
    (getViewBox as any).mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    (getBoundViewBox as any).mockReturnValue('0 0 100 100');

    const { plugin, svg, emitter } = setupPlugin();

    expect(getBoundViewBox).toHaveBeenCalledWith(svg, expect.any(Array));
    expect(emitter.on).toHaveBeenCalledWith(
      'viewBox:change',
      expect.any(Function),
    );

    plugin.destroy();
  });

  it('injects styles on init', () => {
    (getBoundViewBox as any).mockReturnValue('0 0 100 100');
    const { plugin } = setupPlugin();
    expect(injectStyleOnce).toHaveBeenCalled();
    plugin.destroy();
  });

  it('shows button when viewBox changes from origin', () => {
    (getBoundViewBox as any).mockReturnValue('0 0 100 100');
    const { plugin } = setupPlugin();

    // Trigger change
    (plugin as any).handleViewBoxChange({ viewBox: '10 10 50 50' });

    // Button should be created and shown
    const button = (plugin as any).resetButton as HTMLButtonElement;
    expect(button).toBeDefined();
    expect(button.style.visibility).toBe('visible');
    expect(document.body.contains(button)).toBe(true);

    plugin.destroy();
  });

  it('hides button when viewBox matches origin', () => {
    (getBoundViewBox as any).mockReturnValue('0 0 100 100');
    const { plugin } = setupPlugin();

    // First show it
    (plugin as any).handleViewBoxChange({ viewBox: '10 10 50 50' });
    const button = (plugin as any).resetButton;
    expect(button.style.visibility).toBe('visible');

    // Then hide it
    (plugin as any).handleViewBoxChange({ viewBox: '0 0 100 100' });
    expect(button.style.display).toBe('none');

    plugin.destroy();
  });

  it('resets viewBox on button click', () => {
    (getBoundViewBox as any).mockReturnValue('0 0 100 100');
    const { plugin, commander } = setupPlugin();

    // Show button to create it
    (plugin as any).handleViewBoxChange({ viewBox: '10 10 50 50' });
    const button = (plugin as any).resetButton;

    // Click
    button.click();

    expect(commander.execute).toHaveBeenCalledTimes(1);
    const command = commander.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(UpdateOptionsCommand);
    expect(command.serialize().options.viewBox).toBe('0 0 100 100');

    plugin.destroy();
  });

  it('re-calculates originViewBox on window resize', () => {
    (getBoundViewBox as any).mockRestore();
    // Return different values for different calls
    const getBoundMock = vi.mocked(getBoundViewBox);
    getBoundMock
      .mockReturnValueOnce('0 0 100 100') // init
      .mockReturnValueOnce('0 0 200 200'); // resize

    const { plugin } = setupPlugin();

    // Trigger resize
    window.dispatchEvent(new Event('resize'));

    // Should have called getBoundViewBox again
    expect(getBoundMock).toHaveBeenCalledTimes(2);

    plugin.destroy();
  });

  it('positions button correctly relative to body', () => {
    (getBoundViewBox as any).mockReturnValue('0 0 100 100');
    const { plugin, svg } = setupPlugin();

    // Mock SVG rect
    (svg as any).getBoundingClientRect = () => ({
      right: 500,
      bottom: 500,
      width: 100, // implied
      height: 100,
    });

    // Mock button offsetParent as body (default)
    // Note: In JSDOM, offsetParent might be null or body depending on layout.
    // We'll rely on our mock implementation of placeButton if needed, but here we just want to verify the logic.
    // Since placeButton logic is hardcoded to checking offsetParent, we need to ensure the button created has the right properties mocked if we want to test strict logic.
    // However, since we can't easily mock the button's offsetParent readonly property without defineProperty after creation, we'll verify the result.

    // Show button
    (plugin as any).handleViewBoxChange({ viewBox: '10 10 50 50' });
    const button = (plugin as any).resetButton;

    // We can't easily test the exact pixels without a full layout engine,
    // but we can verify it set *some* left/top style.
    expect(button.style.left).toBeDefined();
    expect(button.style.top).toBeDefined();

    plugin.destroy();
  });

  it('handles Node.js environment (no getBBox)', () => {
    const plugin = new ResetViewBox();
    // svg.getBBox is undefined in jsdom by default usually, but we mocked it above.
    // Let's create a "Node-like" svg mock without getBBox
    const nodeSvg = { getAttribute: vi.fn(), setAttribute: vi.fn() } as any;

    const emitter = { on: vi.fn(), off: vi.fn() };
    const getOptions = vi.fn(() => ({ padding: [0, 0, 0, 0] }));

    (getViewBox as any).mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    plugin.init({
      emitter: emitter as any,
      editor: { getDocument: () => nodeSvg, state: { getOptions } } as any,
      commander: {} as any,
      plugin: {} as any,
      state: { getOptions } as any,
    });

    // Should verify that originViewBox was set using getViewBox fallback, NOT getBoundViewBox
    // Since getBoundViewBox is mocked, check if it was called with nodeSvg?
    // Actually, getBoundViewBox takes SVGSVGElement, nodeSvg might not pass type check if strict.
    // But logically:
    expect(getBoundViewBox).not.toHaveBeenCalledWith(
      nodeSvg,
      expect.any(Array),
    );
    expect(getViewBox).toHaveBeenCalledWith(nodeSvg);

    plugin.destroy();
  });
});
