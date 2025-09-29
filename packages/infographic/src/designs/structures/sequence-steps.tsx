/** @jsxImportSource @antv/infographic-jsx */
import type {
  ComponentType,
  JSXElement,
  RectProps,
} from '@antv/infographic-jsx';
import { Defs, getElementBounds, Group, Polygon } from '@antv/infographic-jsx';
import { BtnAdd, BtnRemove, BtnsGroup, ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { getColorPrimary } from '../utils';
import { registerStructure } from './registry';
import type { BaseStructureProps } from './types';

export interface SequenceStepsProps extends BaseStructureProps {
  gap?: number;
}

export const SequenceSteps: ComponentType<SequenceStepsProps> = (props) => {
  const { Title, Item, data, gap = 40, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;
  const colorPrimary = getColorPrimary(options);
  const btnBounds = getElementBounds(<BtnAdd indexes={[0]} />);
  const itemBounds = getElementBounds(
    <Item indexes={[0]} data={data} datum={items[0]} positionH="center" />,
  );

  const btnElements: JSXElement[] = [];
  const itemElements: JSXElement[] = [];
  const decorElements: JSXElement[] = [];

  const arrowWidth = 25;
  const arrowHeight = 25;
  const topMargin = Math.max(btnBounds.height + 20, 30);

  items.forEach((item, index) => {
    const itemX = index * (itemBounds.width + gap);
    const indexes = [index];

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={itemX}
        y={topMargin}
        positionH="center"
      />,
    );

    btnElements.push(
      <BtnRemove
        indexes={indexes}
        x={itemX + (itemBounds.width - btnBounds.width) / 2}
        y={topMargin + itemBounds.height + 10}
      />,
    );

    if (index === 0) {
      btnElements.push(
        <BtnAdd
          indexes={indexes}
          x={itemX + (itemBounds.width - btnBounds.width) / 2}
          y={topMargin - btnBounds.height - 10}
        />,
      );
    } else {
      btnElements.push(
        <BtnAdd
          indexes={indexes}
          x={itemX - gap / 2 - btnBounds.width / 2}
          y={topMargin - btnBounds.height - 10}
        />,
      );
    }

    if (index < items.length - 1) {
      const arrowX = itemX + itemBounds.width + (gap - arrowWidth) / 2;
      const arrowY = topMargin + itemBounds.height / 2 - arrowHeight / 2;

      decorElements.push(
        <Arrow
          x={arrowX}
          y={arrowY}
          width={arrowWidth}
          height={arrowHeight}
          colorPrimary={colorPrimary}
        />,
      );
    }
  });

  if (items.length > 0) {
    const lastItemX = (items.length - 1) * (itemBounds.width + gap);
    btnElements.push(
      <BtnAdd
        indexes={[items.length]}
        x={lastItemX + itemBounds.width + (gap - btnBounds.width) / 2}
        y={topMargin - btnBounds.height - 10}
      />,
    );
  }

  return (
    <FlexLayout
      id="infographic-container"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {titleContent}
      <Group>
        <Group>{decorElements}</Group>
        <ItemsGroup>{itemElements}</ItemsGroup>
        <BtnsGroup>{btnElements}</BtnsGroup>
      </Group>
    </FlexLayout>
  );
};

const Arrow = ({
  width = 25,
  height = 25,
  colorPrimary = '#6699FF',
  ...rest
}: RectProps & {
  colorPrimary: string;
}) => {
  const strokeId = `gradient-arrow-stroke-${colorPrimary.replace('#', '')}`;
  const fillId = `gradient-arrow-fill-${colorPrimary.replace('#', '')}`;

  const shaftWidth = Math.round(width * 0.515);
  const shaftTop = Math.round(height * 0.275);
  const shaftBottom = Math.round(height * 0.875);
  const points = [
    { x: 0, y: shaftTop }, // 左上角
    { x: shaftWidth, y: shaftTop }, // 柄部右上角
    { x: shaftWidth, y: height * 0.075 }, // 箭头上顶点
    { x: width, y: height * 0.575 }, // 箭头尖端
    { x: shaftWidth, y: height * 1.075 }, // 箭头下顶点
    { x: shaftWidth, y: shaftBottom }, // 柄部右下角
    { x: 0, y: shaftBottom }, // 左下角
  ];

  return (
    <>
      <Polygon
        {...rest}
        width={width}
        height={height}
        points={points}
        fill={`url(#${fillId})`}
        stroke={`url(#${strokeId})`}
      />
      <Defs>
        <linearGradient id={fillId} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color={colorPrimary} stop-opacity="0.36" />
          <stop offset="100%" stop-color={colorPrimary} stop-opacity="0" />
        </linearGradient>
        <linearGradient id={strokeId} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color={colorPrimary} />
          <stop offset="58%" stop-color={colorPrimary} stop-opacity="0" />
        </linearGradient>
      </Defs>
    </>
  );
};

registerStructure('sequence-steps', { component: SequenceSteps });
