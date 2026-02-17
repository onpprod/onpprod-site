export const buildUrn = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `urn:uuid:${crypto.randomUUID()}`;
  }
  return `urn:uuid:${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
};

export const emptyEnvironment = () => ({
  assetAdministrationShells: [],
  submodels: [],
  conceptDescriptions: [],
});

export const normalizeEnvironment = (data) => ({
  ...(data || {}),
  assetAdministrationShells: Array.isArray(data?.assetAdministrationShells)
    ? data.assetAdministrationShells
    : [],
  submodels: Array.isArray(data?.submodels) ? data.submodels : [],
  conceptDescriptions: Array.isArray(data?.conceptDescriptions)
    ? data.conceptDescriptions
    : [],
});

export const buildExportEnvironment = (environment) => {
  const clone = JSON.parse(JSON.stringify(environment || {}));

  const cleanArray = (obj, key) => {
    if (!Array.isArray(obj[key]) || obj[key].length === 0) {
      delete obj[key];
    }
  };

  cleanArray(clone, 'assetAdministrationShells');
  cleanArray(clone, 'submodels');
  cleanArray(clone, 'conceptDescriptions');

  if (Array.isArray(clone.assetAdministrationShells)) {
    clone.assetAdministrationShells = clone.assetAdministrationShells.map((aas) => {
      const next = { ...aas };
      if (!Array.isArray(next.submodels) || next.submodels.length === 0) {
        delete next.submodels;
      }
      return next;
    });
  }

  if (Array.isArray(clone.submodels)) {
    clone.submodels = clone.submodels.map((submodel) => {
      const next = { ...submodel };
      if (!Array.isArray(next.submodelElements) || next.submodelElements.length === 0) {
        delete next.submodelElements;
      }
      return next;
    });
  }

  return clone;
};

export const buildReference = (type, keyType, keyValue) => {
  if (!type || !keyType || !keyValue) {
    return null;
  }
  return {
    type,
    keys: [
      {
        type: keyType,
        value: keyValue,
      },
    ],
  };
};

export const formatAjvError = (errors = []) => {
  if (!errors.length) return 'Erro de validacao no schema.';
  const err = errors[0];
  const path = err.instancePath || '/';
  return `${path} ${err.message || 'invalido'}`;
};
