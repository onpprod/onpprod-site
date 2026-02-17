export const buildPathKey = (path) =>
  path.map((segment) => `${segment.key}-${segment.index}`).join('.');

export const containerKeyForElement = (element) => {
  if (!element) return null;
  if (
    element.modelType === 'SubmodelElementCollection' ||
    element.modelType === 'SubmodelElementList'
  ) {
    return 'value';
  }
  if (element.modelType === 'Entity') {
    return 'statements';
  }
  return null;
};

export const getElementAtPath = (submodel, path) => {
  let current = submodel;
  for (const segment of path) {
    if (!current || !Array.isArray(current[segment.key])) return null;
    current = current[segment.key][segment.index];
  }
  return current;
};

const updateNestedElement = (element, path, updater) => {
  const [head, ...rest] = path;
  const list = Array.isArray(element[head.key]) ? [...element[head.key]] : [];
  const target = list[head.index];
  if (!target) return element;
  const updated = rest.length ? updateNestedElement(target, rest, updater) : updater(target);
  list[head.index] = updated;
  return { ...element, [head.key]: list };
};

export const updateElementAtPath = (submodel, path, updater) => {
  if (!path.length) return submodel;
  const [head, ...rest] = path;
  if (head.key !== 'submodelElements') return submodel;
  const elements = Array.isArray(submodel.submodelElements)
    ? [...submodel.submodelElements]
    : [];
  const target = elements[head.index];
  if (!target) return submodel;
  const updated = rest.length ? updateNestedElement(target, rest, updater) : updater(target);
  elements[head.index] = updated;
  return { ...submodel, submodelElements: elements };
};
