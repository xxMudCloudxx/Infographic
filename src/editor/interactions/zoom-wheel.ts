import { getViewBox } from '../../utils/viewbox';
import { UpdateOptionsCommand } from '../commands';
import type { IInteraction, InteractionInitOptions } from '../types';
import { Interaction } from './base';

const MIN_VIEWBOX_SIZE = 1;
const ZOOM_FACTOR = 1.1;

export class ZoomWheel extends Interaction implements IInteraction {
  name = 'zoom-wheel';

  private wheelListener = (event: WheelEvent) => {
    if (!this.interaction.isActive()) return;
    if (!event.ctrlKey && !event.metaKey) return;
    // Ignore events with zero deltaY (no actual scrolling)
    if (event.deltaY === 0) return;
    event.preventDefault();

    // Standard Zoom: Scroll Up (deltaY < 0) = Zoom In
    const isZoomIn = event.deltaY < 0;
    const factor = isZoomIn ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;

    const svg = this.editor.getDocument();
    const viewBox = getViewBox(svg);
    const { width, height, x, y } = viewBox;

    const newWidth = width * factor;
    const newHeight = height * factor;

    if (newWidth <= MIN_VIEWBOX_SIZE || newHeight <= MIN_VIEWBOX_SIZE) return;

    // Center zoom
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;

    const command = new UpdateOptionsCommand({
      viewBox: `${newX} ${newY} ${newWidth} ${newHeight}`,
    });
    void this.commander.execute(command);
  };

  init(options: InteractionInitOptions) {
    super.init(options);
    document.addEventListener('wheel', this.wheelListener, { passive: false });
  }

  destroy() {
    document.removeEventListener('wheel', this.wheelListener);
  }
}
