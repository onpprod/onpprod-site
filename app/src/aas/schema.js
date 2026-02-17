import schema from '../aas_schema.json';

const fallback = (value, fallbackValue) =>
  Array.isArray(value) && value.length ? value : fallbackValue;

export { schema };

export const assetKindOptions = fallback(schema?.definitions?.AssetKind?.enum, [
  'Instance',
  'NotApplicable',
  'Role',
  'Type',
]);

export const modellingKindOptions = fallback(
  schema?.definitions?.ModellingKind?.enum,
  ['Instance', 'Template']
);

export const dataTypeOptions = fallback(
  schema?.definitions?.DataTypeDefXsd?.enum,
  ['xs:string', 'xs:int', 'xs:double']
);

export const referenceTypeOptions = fallback(
  schema?.definitions?.ReferenceTypes?.enum,
  ['ModelReference', 'ExternalReference']
);

export const keyTypeOptions = fallback(schema?.definitions?.KeyTypes?.enum, [
  'AssetAdministrationShell',
  'Submodel',
  'Property',
  'SubmodelElement',
  'GlobalReference',
]);

const supportedElementTypes = new Set([
  'Property',
  'Range',
  'File',
  'Blob',
  'MultiLanguageProperty',
  'ReferenceElement',
  'RelationshipElement',
  'SubmodelElementCollection',
  'SubmodelElementList',
  'Entity',
]);

export const elementTypeOptions = fallback(
  schema?.definitions?.AasSubmodelElements?.enum,
  Array.from(supportedElementTypes)
).filter((type) => supportedElementTypes.has(type));
