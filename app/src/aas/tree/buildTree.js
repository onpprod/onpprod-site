import { buildPathKey, containerKeyForElement } from './pathUtils';

const buildElementNode = (element, submodelId, path) => {
  const containerKey = containerKeyForElement(element);
  const children = [];

  if (containerKey) {
    const items = Array.isArray(element[containerKey]) ? element[containerKey] : [];
    items.forEach((child, index) => {
      children.push(
        buildElementNode(child, submodelId, [
          ...path,
          { key: containerKey, index },
        ])
      );
    });
  }

  return {
    id: `element:${submodelId}:${buildPathKey(path)}`,
    label: `\"${element.idShort || element.modelType}\"`,
    tag: 'El',
    kind: 'element',
    data: element,
    meta: {
      submodelId,
      path,
      containerKey,
    },
    children,
  };
};

const buildSubmodelNode = (submodel) => {
  const elements = Array.isArray(submodel.submodelElements)
    ? submodel.submodelElements
    : [];

  const elementNodes = elements.map((element, index) =>
    buildElementNode(element, submodel.id, [{ key: 'submodelElements', index }])
  );

  return {
    id: `submodel:${submodel.id}`,
    label: `\"${submodel.idShort || 'Submodel'}\"`,
    tag: 'Sm',
    kind: 'submodel',
    data: submodel,
    meta: {
      submodelId: submodel.id,
    },
    children: elementNodes.length
      ? [
          {
            id: `submodel:${submodel.id}:elements`,
            label: '\"SubmodelElements\"',
            tag: 'El',
            kind: 'group',
            group: 'elements',
            children: elementNodes,
          },
        ]
      : [],
  };
};

export const buildTreeData = (environment) => {
  const aasList = Array.isArray(environment.assetAdministrationShells)
    ? environment.assetAdministrationShells
    : [];
  const submodels = Array.isArray(environment.submodels) ? environment.submodels : [];

  const submodelIndex = new Map(submodels.map((sm) => [sm.id, sm]));

  const aasNodes = aasList.map((aas) => {
    const refs = Array.isArray(aas.submodels) ? aas.submodels : [];
    const refNodes = refs.map((ref, idx) => {
      const key = ref?.keys?.find((item) => item.type === 'Submodel');
      const submodelId = key?.value || `ref-${idx}`;
      const submodel = submodelIndex.get(submodelId);
      return {
        id: `aas:${aas.id}:submodel:${submodelId}`,
        label: `\"${submodel?.idShort || 'Submodel'}\"`,
        tag: 'Sm',
        kind: 'submodel',
        data: submodel || { id: submodelId },
        meta: {
          submodelId,
          refOnly: !submodel,
        },
        children: submodel ? buildSubmodelNode(submodel).children : [],
      };
    });

    return {
      id: `aas:${aas.id}`,
      label: `\"${aas.idShort || 'AAS'}\"`,
      tag: 'AAS',
      kind: 'aas',
      data: aas,
      children: refNodes.length
        ? [
            {
              id: `aas:${aas.id}:submodels`,
              label: '\"Submodels\"',
              tag: 'Ref',
              kind: 'group',
              group: 'aas-submodels',
              children: refNodes,
            },
          ]
        : [],
    };
  });

  const submodelNodes = submodels.map((submodel) => buildSubmodelNode(submodel));

  const envNode = {
    id: 'environment',
    label: '\"Environment\"',
    tag: 'Env',
    kind: 'environment',
    children: [
      {
        id: 'group-aas',
        label: '\"AdministrationShells\"',
        tag: 'Env',
        kind: 'group',
        group: 'aas',
        children: aasNodes,
      },
      {
        id: 'group-submodels',
        label: '\"All Submodels\"',
        tag: 'Env',
        kind: 'group',
        group: 'submodels',
        children: submodelNodes,
      },
      {
        id: 'group-concepts',
        label: '\"ConceptDescriptions\"',
        tag: 'Env',
        kind: 'group',
        group: 'concepts',
        children: [],
      },
    ],
  };

  return [
    {
      id: 'package',
      label: '\"Package\"',
      tag: 'Pkg',
      kind: 'root',
      children: [
        envNode,
        {
          id: 'supplemental-files',
          label: '\"Supplemental files\"',
          tag: 'Env',
          kind: 'supplemental',
          children: [],
        },
      ],
    },
  ];
};

export const buildNodeMap = (nodes, map = {}) => {
  nodes.forEach((node) => {
    map[node.id] = node;
    if (node.children) {
      buildNodeMap(node.children, map);
    }
  });
  return map;
};
