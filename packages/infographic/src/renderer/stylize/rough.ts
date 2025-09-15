import rough from 'roughjs';
import { createElement, getAttributes, setAttributes } from '../../utils';
import type { RoughConfig } from '../types';

export function applyRoughStyle(
  node: SVGElement,
  svg: SVGSVGElement,
  config: RoughConfig,
) {
  if (!node || !svg) {
    console.warn('Invalid node or svg element');
    return;
  }

  const rc = rough.svg(svg, {
    options: {
      seed: 1000,
    },
  });

  const g = createElement('g');
  const volume = node.cloneNode() as SVGElement;
  setAttributes(volume, {
    fill: '#fff',
    stroke: 'transparent',
  });
  volume.classList.add('rough-volume');
  g.appendChild(volume);

  const element = createRoughShape(rc, node, config);
  if (element) {
    element.classList.add('rough-element');
    element.style.pointerEvents = 'none';
    g.appendChild(element);
  }

  if (node.id) {
    g.id = node.id;
    volume.setAttribute('id', `${node.id}-volume`);
    if (element) element.setAttribute('id', `${node.id}-rough`);
  }

  if (g.childElementCount > 0) node.replaceWith(g);
  else node.remove();
}

function createRoughShape(
  rc: ReturnType<typeof rough.svg>,
  node: SVGElement,
  config: RoughConfig,
) {
  const shapeType = node.nodeName;

  const getAttrs = (node: SVGElement, attrs: string[]): Record<string, any> => {
    const {
      fill,
      stroke = fill || 'currentColor',
      ...restAttrs
    } = getAttributes(
      node,
      [
        ...attrs,
        'fill',
        'fill-opacity',
        'stroke',
        'stroke-opacity',
        'stroke-width',
        'opacity',
      ],
      true,
    );

    return { fill, stroke, ...restAttrs, ...config };
  };

  if (shapeType === 'circle') {
    const {
      cx = '0',
      cy = '0',
      r = '0',
      ...attrs
    } = getAttrs(node, ['cx', 'cy', 'r']);
    return rc.circle(+cx, +cy, +r * 2, attrs);
  } else if (shapeType === 'ellipse') {
    const {
      cx = '0',
      cy = '0',
      rx = '0',
      ry = '0',
      ...attrs
    } = getAttrs(node, ['cx', 'cy', 'rx', 'ry']);
    return rc.ellipse(+cx, +cy, +rx * 2, +ry * 2, attrs);
  } else if (shapeType === 'line') {
    const {
      x1 = '0',
      y1 = '0',
      x2 = '0',
      y2 = '0',
      ...attrs
    } = getAttrs(node, ['x1', 'y1', 'x2', 'y2']);
    return rc.line(+x1, +y1, +x2, +y2, attrs);
  } else if (shapeType === 'rect') {
    const {
      x = '0',
      y = '0',
      width = '0',
      height = '0',
      ...attrs
    } = getAttrs(node, ['x', 'y', 'width', 'height']);
    return rc.rectangle(+x, +y, +width, +height, attrs);
  } else if (shapeType === 'path') {
    const { d = '', ...attrs } = getAttrs(node, ['d']);
    return rc.path(d, attrs);
  } else if (shapeType === 'polygon') {
    const { points, ...attrs } = getAttrs(node, ['points']);
    return rc.polygon(parsePolygonPoints(points), attrs);
  } else if (shapeType === 'polyline') {
    const { points, ...attrs } = getAttrs(node, ['points']);
    const parsedPoints = parsePolygonPoints(points);
    if (parsedPoints.length > 1) {
      return rc.linearPath(parsedPoints, attrs);
    }
  }
}

function parsePolygonPoints(points: string): [number, number][] {
  if (!points) return [];

  try {
    return points
      .trim()
      .replace(/,/g, ' ') // 处理逗号分隔的坐标
      .split(/\s+/) // 按空白字符分割
      .filter(Boolean) // 过滤空字符串
      .reduce((acc: [number, number][], curr, index, arr) => {
        if (index % 2 === 0 && index + 1 < arr.length) {
          const x = parseFloat(curr);
          const y = parseFloat(arr[index + 1]);
          if (!isNaN(x) && !isNaN(y)) {
            acc.push([x, y]);
          }
        }
        return acc;
      }, []);
  } catch {
    console.warn('Failed to parse polygon points:', points);
    return [];
  }
}
