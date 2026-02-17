import { useEffect, useMemo, useRef, useState } from 'react';
import Ajv from 'ajv/dist/2019';
import {
  assetKindOptions,
  dataTypeOptions,
  elementTypeOptions,
  keyTypeOptions,
  modellingKindOptions,
  referenceTypeOptions,
  schema,
} from '../aas/schema';
import {
  buildExportEnvironment,
  buildReference,
  buildUrn,
  emptyEnvironment,
  formatAjvError,
  normalizeEnvironment,
} from '../aas/utils';
import { buildNodeMap, buildTreeData } from '../aas/tree/buildTree';
import { buildPathKey, getElementAtPath, updateElementAtPath } from '../aas/tree/pathUtils';
import AasCreatePanel from './forms/AasCreatePanel';
import ElementCreatePanel from './forms/ElementCreatePanel';
import SubmodelCreatePanel from './forms/SubmodelCreatePanel';
import SelectedDetails from './SelectedDetails';
import TreeView from './TreeView';
import Toast from './Toast';

const buildEditorDraft = (node) => {
  if (!node) return {};
  if (node.kind === 'aas') {
    const assetInformation = node.data.assetInformation || {};
    return {
      id: node.data.id || '',
      idShort: node.data.idShort || '',
      assetKind: assetInformation.assetKind || assetKindOptions[0],
      assetType: assetInformation.assetType || '',
      globalAssetId: assetInformation.globalAssetId || '',
    };
  }
  if (node.kind === 'submodel') {
    return {
      id: node.data.id || '',
      idShort: node.data.idShort || '',
      kind: node.data.kind || modellingKindOptions[0],
    };
  }
  if (node.kind === 'element') {
    const draft = {
      modelType: node.data.modelType || '',
      idShort: node.data.idShort || '',
    };
    if (node.data.modelType === 'Property') {
      draft.valueType = node.data.valueType || dataTypeOptions[0];
      draft.value = node.data.value || '';
    }
    if (node.data.modelType === 'Range') {
      draft.valueType = node.data.valueType || dataTypeOptions[0];
      draft.min = node.data.min || '';
      draft.max = node.data.max || '';
    }
    if (node.data.modelType === 'File' || node.data.modelType === 'Blob') {
      draft.contentType = node.data.contentType || '';
      draft.value = node.data.value || '';
    }
    if (node.data.modelType === 'MultiLanguageProperty') {
      const entry = Array.isArray(node.data.value) ? node.data.value[0] : null;
      draft.language = entry?.language || 'en';
      draft.text = entry?.text || '';
    }
    if (node.data.modelType === 'SubmodelElementList') {
      draft.typeValueListElement =
        node.data.typeValueListElement || elementTypeOptions[0];
      draft.valueTypeListElement = node.data.valueTypeListElement || '';
    }
    return draft;
  }
  return {};
};

const EditorWorkspace = () => {
  const ajv = useMemo(() => new Ajv({ allErrors: true, strict: false }), []);
  const validate = useMemo(() => ajv.compile(schema), [ajv]);

  const [environment, setEnvironment] = useState(emptyEnvironment());
  const [selectedId, setSelectedId] = useState('environment');
  const [expandedIds, setExpandedIds] = useState(
    () => new Set(['package', 'environment', 'group-aas', 'group-submodels'])
  );
  const [actionMessage, setActionMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorDraft, setEditorDraft] = useState({});
  const [activeCreate, setActiveCreate] = useState(null);
  const uploadInputRef = useRef(null);

  const [aasForm, setAasForm] = useState(() => ({
    id: buildUrn(),
    idShort: '',
    assetKind: assetKindOptions[0],
    globalAssetId: '',
    assetType: '',
  }));

  const [submodelForm, setSubmodelForm] = useState(() => ({
    id: buildUrn(),
    idShort: '',
    kind: modellingKindOptions[0],
  }));

  const [elementForm, setElementForm] = useState(() => ({
    type: elementTypeOptions[0],
    idShort: '',
    valueType: dataTypeOptions[0],
    value: '',
    min: '',
    max: '',
    contentType: '',
    fileValue: '',
    blobValue: '',
    language: 'en',
    text: '',
    referenceType: referenceTypeOptions[0],
    referenceKeyType: keyTypeOptions[0],
    referenceKeyValue: '',
    relationFirstKeyType: keyTypeOptions[0],
    relationFirstKeyValue: '',
    relationSecondKeyType: keyTypeOptions[0],
    relationSecondKeyValue: '',
    typeValueListElement: elementTypeOptions[0],
    valueTypeListElement: '',
  }));

  const treeData = useMemo(() => buildTreeData(environment), [environment]);
  const nodeMap = useMemo(() => buildNodeMap(treeData), [treeData]);
  const selectedNode = nodeMap[selectedId] || nodeMap.environment;

  useEffect(() => {
    if (!nodeMap[selectedId]) {
      setSelectedId('environment');
    }
  }, [nodeMap, selectedId]);

  useEffect(() => {
    setEditorDraft(buildEditorDraft(selectedNode));
    setIsEditing(false);
    setActionMessage('');
    setActiveCreate(null);
  }, [selectedNode]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleExpanded = (nodeId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const commitEnvironment = (next, message, nextSelectedId, options = {}) => {
    const exported = buildExportEnvironment(next);
    const isValid = validate(exported);
    if (!isValid) {
      setActionMessage(formatAjvError(validate.errors));
      return false;
    }
    setEnvironment(next);
    if (message) {
      if (options.toast) {
        setActionMessage('');
        setToast({ message, tone: options.tone || 'success' });
      } else {
        setActionMessage(message);
      }
    }
    if (nextSelectedId) setSelectedId(nextSelectedId);
    return true;
  };

  const expandNodes = (ids) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const addAas = () => {
    if (!aasForm.id || !aasForm.assetKind) {
      setActionMessage('ID e AssetKind sao obrigatorios.');
      return;
    }

    const assetInformation = {
      assetKind: aasForm.assetKind,
    };
    if (aasForm.globalAssetId) assetInformation.globalAssetId = aasForm.globalAssetId;
    if (aasForm.assetType) assetInformation.assetType = aasForm.assetType;

    const aas = {
      modelType: 'AssetAdministrationShell',
      id: aasForm.id,
      assetInformation,
    };
    if (aasForm.idShort) aas.idShort = aasForm.idShort;

    const next = {
      ...environment,
      assetAdministrationShells: [
        ...(environment.assetAdministrationShells || []),
        aas,
      ],
    };

    if (commitEnvironment(next, 'AAS adicionado.', `aas:${aas.id}`)) {
      setAasForm((prev) => ({
        ...prev,
        id: buildUrn(),
        idShort: '',
        globalAssetId: '',
        assetType: '',
      }));
      setActiveCreate(null);
      expandNodes([`aas:${aas.id}`, 'group-aas']);
    }
  };

  const addSubmodel = () => {
    if (!selectedNode || selectedNode.kind !== 'aas') {
      setActionMessage('Selecione um AAS para adicionar o submodel.');
      return;
    }
    if (!submodelForm.id) {
      setActionMessage('ID do Submodel e obrigatorio.');
      return;
    }

    const submodel = {
      modelType: 'Submodel',
      id: submodelForm.id,
    };
    if (submodelForm.idShort) submodel.idShort = submodelForm.idShort;
    if (submodelForm.kind) submodel.kind = submodelForm.kind;

    const reference = buildReference('ModelReference', 'Submodel', submodel.id);

    const updatedShells = (environment.assetAdministrationShells || []).map((aas) => {
      if (aas.id !== selectedNode.data.id) return aas;
      const refs = Array.isArray(aas.submodels) ? [...aas.submodels] : [];
      if (reference) refs.push(reference);
      return { ...aas, submodels: refs };
    });

    const next = {
      ...environment,
      assetAdministrationShells: updatedShells,
      submodels: [...(environment.submodels || []), submodel],
    };

    if (commitEnvironment(next, 'Submodel adicionado.', `submodel:${submodel.id}`)) {
      setSubmodelForm((prev) => ({
        ...prev,
        id: buildUrn(),
        idShort: '',
      }));
      setActiveCreate(null);
      expandNodes([
        `aas:${selectedNode.data.id}`,
        `aas:${selectedNode.data.id}:submodels`,
        `submodel:${submodel.id}`,
        `submodel:${submodel.id}:elements`,
        'group-submodels',
      ]);
    }
  };

  const buildElementFromForm = () => {
    const element = {
      modelType: elementForm.type,
    };
    if (elementForm.idShort) element.idShort = elementForm.idShort;

    if (elementForm.type === 'Property') {
      if (!elementForm.valueType) {
        setActionMessage('valueType e obrigatorio para Property.');
        return null;
      }
      element.valueType = elementForm.valueType;
      if (elementForm.value) element.value = elementForm.value;
    }

    if (elementForm.type === 'Range') {
      if (!elementForm.valueType) {
        setActionMessage('valueType e obrigatorio para Range.');
        return null;
      }
      element.valueType = elementForm.valueType;
      if (elementForm.min) element.min = elementForm.min;
      if (elementForm.max) element.max = elementForm.max;
    }

    if (elementForm.type === 'File') {
      if (elementForm.fileValue) element.value = elementForm.fileValue;
      if (elementForm.contentType) element.contentType = elementForm.contentType;
    }

    if (elementForm.type === 'Blob') {
      if (elementForm.blobValue) element.value = elementForm.blobValue;
      if (elementForm.contentType) element.contentType = elementForm.contentType;
    }

    if (elementForm.type === 'MultiLanguageProperty') {
      if (elementForm.language && elementForm.text) {
        element.value = [{ language: elementForm.language, text: elementForm.text }];
      }
    }

    if (elementForm.type === 'ReferenceElement') {
      const ref = buildReference(
        elementForm.referenceType,
        elementForm.referenceKeyType,
        elementForm.referenceKeyValue
      );
      if (ref) element.value = ref;
    }

    if (elementForm.type === 'RelationshipElement') {
      const first = buildReference(
        elementForm.referenceType,
        elementForm.relationFirstKeyType,
        elementForm.relationFirstKeyValue
      );
      const second = buildReference(
        elementForm.referenceType,
        elementForm.relationSecondKeyType,
        elementForm.relationSecondKeyValue
      );
      if (first) element.first = first;
      if (second) element.second = second;
    }

    if (elementForm.type === 'SubmodelElementList') {
      const typeValue = elementForm.typeValueListElement || elementTypeOptions[0];
      if (!typeValue) {
        setActionMessage('typeValueListElement e obrigatorio para SubmodelElementList.');
        return null;
      }
      element.typeValueListElement = typeValue;
      if (elementForm.valueTypeListElement) {
        element.valueTypeListElement = elementForm.valueTypeListElement;
      }
    }

    return element;
  };

  const addElement = () => {
    const element = buildElementFromForm();
    if (!element) return;

    if (selectedNode.kind === 'submodel' && !selectedNode.meta?.refOnly) {
      const submodels = (environment.submodels || []).map((sm) => {
        if (sm.id !== selectedNode.data.id) return sm;
        const elements = Array.isArray(sm.submodelElements)
          ? [...sm.submodelElements]
          : [];
        const nextIndex = elements.length;
        elements.push(element);
        const next = { ...sm, submodelElements: elements };
        next.__nextSelectedId = `element:${sm.id}:${buildPathKey([
          { key: 'submodelElements', index: nextIndex },
        ])}`;
        return next;
      });

      let nextSelected = null;
      const cleaned = submodels.map((sm) => {
        if (sm.__nextSelectedId) {
          nextSelected = sm.__nextSelectedId;
          const { __nextSelectedId, ...rest } = sm;
          return rest;
        }
        return sm;
      });

      const next = { ...environment, submodels: cleaned };
      if (commitEnvironment(next, 'Elemento adicionado.', nextSelected)) {
        setElementForm((prev) => ({
          ...prev,
          idShort: '',
          value: '',
          min: '',
          max: '',
          contentType: '',
          fileValue: '',
          blobValue: '',
          text: '',
          referenceKeyValue: '',
          relationFirstKeyValue: '',
          relationSecondKeyValue: '',
        }));
        setActiveCreate(null);
        expandNodes([`submodel:${selectedNode.data.id}`, `submodel:${selectedNode.data.id}:elements`]);
      }
      return;
    }

    if (selectedNode.kind === 'element' && selectedNode.meta?.containerKey) {
      const { submodelId, path, containerKey } = selectedNode.meta;
      const submodels = (environment.submodels || []).map((sm) => {
        if (sm.id !== submodelId) return sm;
        const target = getElementAtPath(sm, path);
        if (!target) return sm;
        const list = Array.isArray(target[containerKey]) ? target[containerKey] : [];
        const nextIndex = list.length;
        const updated = updateElementAtPath(sm, path, (entry) => {
          const currentList = Array.isArray(entry[containerKey])
            ? [...entry[containerKey]]
            : [];
          currentList.push(element);
          return { ...entry, [containerKey]: currentList };
        });
        updated.__nextSelectedId = `element:${submodelId}:${buildPathKey([
          ...path,
          { key: containerKey, index: nextIndex },
        ])}`;
        return updated;
      });

      let nextSelected = null;
      const cleaned = submodels.map((sm) => {
        if (sm.__nextSelectedId) {
          nextSelected = sm.__nextSelectedId;
          const { __nextSelectedId, ...rest } = sm;
          return rest;
        }
        return sm;
      });

      const next = { ...environment, submodels: cleaned };
      if (commitEnvironment(next, 'Elemento adicionado.', nextSelected)) {
        setElementForm((prev) => ({
          ...prev,
          idShort: '',
          value: '',
          min: '',
          max: '',
          contentType: '',
          fileValue: '',
          blobValue: '',
          text: '',
          referenceKeyValue: '',
          relationFirstKeyValue: '',
          relationSecondKeyValue: '',
        }));
        setActiveCreate(null);
        expandNodes([selectedNode.id]);
      }
      return;
    }

    setActionMessage('Selecione um Submodel ou um elemento com filhos para adicionar.');
  };

  const applyEdits = () => {
    if (!selectedNode) return;

    if (selectedNode.kind === 'aas') {
      const updatedShells = (environment.assetAdministrationShells || []).map((aas) => {
        if (aas.id !== selectedNode.data.id) return aas;
        const assetInformation = {
          ...(aas.assetInformation || {}),
          assetKind: editorDraft.assetKind || assetKindOptions[0],
        };
        if (editorDraft.assetType) assetInformation.assetType = editorDraft.assetType;
        else delete assetInformation.assetType;
        if (editorDraft.globalAssetId) assetInformation.globalAssetId = editorDraft.globalAssetId;
        else delete assetInformation.globalAssetId;
        const next = { ...aas, assetInformation };
        if (editorDraft.idShort) next.idShort = editorDraft.idShort;
        else delete next.idShort;
        return next;
      });
      const next = { ...environment, assetAdministrationShells: updatedShells };
      if (commitEnvironment(next, 'AAS atualizado.', undefined, { toast: true })) {
        setIsEditing(false);
      }
      return;
    }

    if (selectedNode.kind === 'submodel') {
      const updated = (environment.submodels || []).map((sm) => {
        if (sm.id !== selectedNode.data.id) return sm;
        const next = { ...sm };
        if (editorDraft.idShort) next.idShort = editorDraft.idShort;
        else delete next.idShort;
        if (editorDraft.kind) next.kind = editorDraft.kind;
        return next;
      });
      const next = { ...environment, submodels: updated };
      if (commitEnvironment(next, 'Submodel atualizado.', undefined, { toast: true })) {
        setIsEditing(false);
      }
      return;
    }

    if (selectedNode.kind === 'element') {
      const { submodelId, path } = selectedNode.meta;
      const updated = (environment.submodels || []).map((sm) => {
        if (sm.id !== submodelId) return sm;
        return updateElementAtPath(sm, path, (element) => {
          const draft = { ...element };
          if (editorDraft.idShort) draft.idShort = editorDraft.idShort;
          else delete draft.idShort;
          if (element.modelType === 'Property' || element.modelType === 'Range') {
            if (editorDraft.valueType) draft.valueType = editorDraft.valueType;
          }
          if (element.modelType === 'Property') {
            if (editorDraft.value) draft.value = editorDraft.value;
            else delete draft.value;
          }
          if (element.modelType === 'Range') {
            if (editorDraft.min) draft.min = editorDraft.min;
            else delete draft.min;
            if (editorDraft.max) draft.max = editorDraft.max;
            else delete draft.max;
          }
          if (element.modelType === 'File' || element.modelType === 'Blob') {
            if (editorDraft.contentType) draft.contentType = editorDraft.contentType;
            else delete draft.contentType;
            if (editorDraft.value) draft.value = editorDraft.value;
            else delete draft.value;
          }
          if (element.modelType === 'MultiLanguageProperty') {
            if (editorDraft.language && editorDraft.text) {
              draft.value = [{ language: editorDraft.language, text: editorDraft.text }];
            }
          }
          if (element.modelType === 'SubmodelElementList') {
            if (editorDraft.typeValueListElement) {
              draft.typeValueListElement = editorDraft.typeValueListElement;
            }
            if (editorDraft.valueTypeListElement) {
              draft.valueTypeListElement = editorDraft.valueTypeListElement;
            }
          }
          return draft;
        });
      });
      const next = { ...environment, submodels: updated };
      if (commitEnvironment(next, 'Elemento atualizado.', undefined, { toast: true })) {
        setIsEditing(false);
      }
    }
  };

  const canAddAas =
    selectedNode?.kind === 'environment' ||
    (selectedNode?.kind === 'group' && selectedNode.group === 'aas');
  const canAddSubmodel = selectedNode?.kind === 'aas';
  const canAddElement =
    (selectedNode?.kind === 'submodel' && !selectedNode?.meta?.refOnly) ||
    (selectedNode?.kind === 'element' && selectedNode?.meta?.containerKey);

  const selectedTitle =
    selectedNode?.kind === 'aas'
      ? 'Asset Administration Shell'
      : selectedNode?.kind === 'submodel'
        ? 'Submodel'
        : selectedNode?.kind === 'element'
          ? selectedNode.data.modelType
          : 'Environment';

  const validation = useMemo(() => {
    const valid = validate(buildExportEnvironment(environment));
    return { valid, errors: validate.errors || [] };
  }, [environment, validate]);

  const downloadJson = () => {
    const exported = buildExportEnvironment(environment);
    const isValid = validate(exported);
    if (!isValid) {
      setActionMessage(formatAjvError(validate.errors));
      return;
    }
    const payload = JSON.stringify(exported, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'aas-environment.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeEnvironment(parsed);
      const exported = buildExportEnvironment(normalized);
      const isValid = validate(exported);
      if (!isValid) {
        setActionMessage(formatAjvError(validate.errors));
        return;
      }
      setEnvironment(normalized);
      setSelectedId('environment');
      setActiveCreate(null);
      setActionMessage('JSON carregado.');
    } catch (err) {
      setActionMessage('JSON invalido.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="editor-card">
      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
      <div className="editor-header">
        <div>
          <h2>Editor de Estruturas</h2>
          <p>
            Crie AAS, Submodels e SubmodelElements com validacao baseada no schema
            oficial.
          </p>
        </div>
        <div className="editor-header-actions">
          <span className={`status-line ${validation.valid ? 'ok' : 'warn'}`}>
            {validation.valid ? 'Schema valido.' : 'Schema invalido.'}
          </span>
          <input
            ref={uploadInputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={handleUpload}
          />
          <button
            type="button"
            className="btn ghost"
            onClick={() => uploadInputRef.current?.click()}
          >
            Upload JSON
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={downloadJson}
            disabled={!validation.valid}
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="tree-panel">
          <div className="panel-title">Workspace</div>
          <div className="tree-scroll" role="tree">
            <TreeView
              treeData={treeData}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggle={toggleExpanded}
            />
          </div>
        </div>

        <div className="editor-panel">
          <div className="tabs">
            <button type="button" className="tab active">
              Element
            </button>
            <button type="button" className="tab">
              Content
            </button>
          </div>

          <div className="panel-highlight">{selectedTitle}</div>

          {actionMessage ? <div className="panel-alert">{actionMessage}</div> : null}

          <div className="panel-actions">
            <span className="panel-actions-label">Actions:</span>
            {canAddAas && (
              <button
                type="button"
                className="btn subtle"
                onClick={() =>
                  setActiveCreate((prev) => (prev === 'aas' ? null : 'aas'))
                }
              >
                Add AAS
              </button>
            )}
            {canAddSubmodel && (
              <button
                type="button"
                className="btn subtle"
                onClick={() =>
                  setActiveCreate((prev) => (prev === 'submodel' ? null : 'submodel'))
                }
              >
                Add Submodel
              </button>
            )}
            {canAddElement && (
              <button
                type="button"
                className="btn subtle"
                onClick={() =>
                  setActiveCreate((prev) => (prev === 'element' ? null : 'element'))
                }
              >
                Add Element
              </button>
            )}
          </div>

          <SelectedDetails
            selectedNode={selectedNode}
            editorDraft={editorDraft}
            setEditorDraft={setEditorDraft}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing((prev) => !prev)}
            onApply={applyEdits}
          />

          {canAddAas && activeCreate === 'aas' && (
            <AasCreatePanel
              form={aasForm}
              setForm={setAasForm}
              onAdd={addAas}
              onGenerateId={() => setAasForm((prev) => ({ ...prev, id: buildUrn() }))}
            />
          )}

          {canAddSubmodel && activeCreate === 'submodel' && (
            <SubmodelCreatePanel
              form={submodelForm}
              setForm={setSubmodelForm}
              onAdd={addSubmodel}
              onGenerateId={() =>
                setSubmodelForm((prev) => ({ ...prev, id: buildUrn() }))
              }
            />
          )}

          {canAddElement && activeCreate === 'element' && (
            <ElementCreatePanel
              form={elementForm}
              setForm={setElementForm}
              onAdd={addElement}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default EditorWorkspace;
