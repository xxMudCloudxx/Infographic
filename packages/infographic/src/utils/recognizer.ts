const INDEX_KEY = '\\d+(_\\d+)*';
const ITEM_PATTERN = `item-${INDEX_KEY}`;

const REGEXP = {
  btnAdd: new RegExp(`^btn-add-${INDEX_KEY}$`),
  btnRemove: new RegExp(`^btn-remove-${INDEX_KEY}$`),
  btnsGroup: /^btns-group$/,
  desc: /^desc$/,
  editArea: /^edit-area$/,
  illus: /^illus(?:-\w+)+$/,
  itemDesc: new RegExp(`^${ITEM_PATTERN}-desc$`),
  itemElement: new RegExp(`^${ITEM_PATTERN}`),
  itemGroup: new RegExp(`^${ITEM_PATTERN}$`),
  itemIcon: new RegExp(`^${ITEM_PATTERN}-icon`),
  itemIconGroup: new RegExp(`^${ITEM_PATTERN}-group-icon$`),
  itemIllus: new RegExp(`^${ITEM_PATTERN}-illus(?:-\\w+)*$`),
  itemLabel: new RegExp(`^${ITEM_PATTERN}-label$`),
  itemsGroup: /^items-group$/,
  itemShape: new RegExp(`^${ITEM_PATTERN}-shape(?:-\\w+)*$`),
  itemShapesGroup: new RegExp(`^${ITEM_PATTERN}-union-shapes(?:-\\w+)*$`),
  itemStaticElement: new RegExp(`^${ITEM_PATTERN}-static(?:-\\w+)*$`),
  itemValue: new RegExp(`^${ITEM_PATTERN}-value$`),
  shape: /^shape-/,
  shapesGroup: /^union-shapes(?:-\w+)*$/,
  title: /^title$/,
};

export const isTitle = (id: string) => REGEXP.title.test(id);
export const isDesc = (id: string) => REGEXP.desc.test(id);
export const isShape = (id: string) => REGEXP.shape.test(id);
export const isIllus = (id: string) => REGEXP.illus.test(id);
export const isShapeGroup = (id: string) => REGEXP.shapesGroup.test(id);
export const isItemsGroup = (id: string) => REGEXP.itemsGroup.test(id);
export const isItemElement = (id: string) => REGEXP.itemElement.test(id);
export const isItemGroup = (id: string) => REGEXP.itemGroup.test(id);
export const isItemIcon = (id: string) => REGEXP.itemIcon.test(id);
export const isItemIconGroup = (id: string) => REGEXP.itemIconGroup.test(id);
export const isItemLabel = (id: string) => REGEXP.itemLabel.test(id);
export const isItemDesc = (id: string) => REGEXP.itemDesc.test(id);
export const isItemValue = (id: string) => REGEXP.itemValue.test(id);
export const isItemIllus = (id: string) => REGEXP.itemIllus.test(id);
export const isItemShape = (id: string) => REGEXP.itemShape.test(id);
export const isItemShapesGroup = (id: string) =>
  REGEXP.itemShapesGroup.test(id);
export const isItemStaticElement = (id: string) =>
  REGEXP.itemStaticElement.test(id);
export const isEditArea = (id: string) => REGEXP.editArea.test(id);
export const isBtnsGroup = (id: string) => REGEXP.btnsGroup.test(id);
export const isBtnAdd = (id: string) => REGEXP.btnAdd.test(id);
export const isBtnRemove = (id: string) => REGEXP.btnRemove.test(id);
