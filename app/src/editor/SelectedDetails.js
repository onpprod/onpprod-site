import {
  assetKindOptions,
  modellingKindOptions,
  dataTypeOptions,
  elementTypeOptions,
} from '../aas/schema';

const SelectedDetails = ({
  selectedNode,
  editorDraft,
  setEditorDraft,
  isEditing,
  onToggleEdit,
  onApply,
}) => {
  const renderEmpty = () => (
    <div className="panel-muted">Selecione um item para ver detalhes.</div>
  );

  if (!selectedNode) {
    return renderEmpty();
  }

  return (
    <>
      <div className="editor-selected">
        <div>
          <span className="section-eyebrow">Selected element</span>
          <h3>{selectedNode.label || 'Environment'}</h3>
        </div>
        <div className="editor-actions">
          <button type="button" className="btn primary" onClick={onToggleEdit}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
          <button type="button" className="btn" onClick={onApply} disabled={!isEditing}>
            Aplicar
          </button>
        </div>
      </div>

      {selectedNode.kind === 'aas' && (
        <form className="editor-form">
          <label>
            ID
            <input type="text" value={editorDraft.id || ''} disabled />
          </label>
          <label>
            IdShort
            <input
              type="text"
              value={editorDraft.idShort || ''}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({ ...prev, idShort: event.target.value }))
              }
            />
          </label>
          <label>
            Asset Kind
            <select
              value={editorDraft.assetKind || assetKindOptions[0]}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({ ...prev, assetKind: event.target.value }))
              }
            >
              {assetKindOptions.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>
          <label>
            Asset Type
            <input
              type="text"
              value={editorDraft.assetType || ''}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({ ...prev, assetType: event.target.value }))
              }
            />
          </label>
          <label className="full">
            Global Asset ID
            <input
              type="text"
              value={editorDraft.globalAssetId || ''}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({
                  ...prev,
                  globalAssetId: event.target.value,
                }))
              }
            />
          </label>
        </form>
      )}

      {selectedNode.kind === 'submodel' && (
        <form className="editor-form">
          <label>
            ID
            <input type="text" value={editorDraft.id || ''} disabled />
          </label>
          <label>
            IdShort
            <input
              type="text"
              value={editorDraft.idShort || ''}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({ ...prev, idShort: event.target.value }))
              }
            />
          </label>
          <label>
            Kind
            <select
              value={editorDraft.kind || modellingKindOptions[0]}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({ ...prev, kind: event.target.value }))
              }
            >
              {modellingKindOptions.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>
        </form>
      )}

      {selectedNode.kind === 'element' && (
        <form className="editor-form">
          <label>
            Tipo
            <input type="text" value={editorDraft.modelType || ''} disabled />
          </label>
          <label>
            IdShort
            <input
              type="text"
              value={editorDraft.idShort || ''}
              disabled={!isEditing}
              onChange={(event) =>
                setEditorDraft((prev) => ({ ...prev, idShort: event.target.value }))
              }
            />
          </label>
          {(editorDraft.modelType === 'Property' || editorDraft.modelType === 'Range') && (
            <label>
              Value Type
              <select
                value={editorDraft.valueType || dataTypeOptions[0]}
                disabled={!isEditing}
                onChange={(event) =>
                  setEditorDraft((prev) => ({ ...prev, valueType: event.target.value }))
                }
              >
                {dataTypeOptions.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </label>
          )}
          {editorDraft.modelType === 'Property' && (
            <label>
              Value
              <input
                type="text"
                value={editorDraft.value || ''}
                disabled={!isEditing}
                onChange={(event) =>
                  setEditorDraft((prev) => ({ ...prev, value: event.target.value }))
                }
              />
            </label>
          )}
          {editorDraft.modelType === 'Range' && (
            <>
              <label>
                Min
                <input
                  type="text"
                  value={editorDraft.min || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({ ...prev, min: event.target.value }))
                  }
                />
              </label>
              <label>
                Max
                <input
                  type="text"
                  value={editorDraft.max || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({ ...prev, max: event.target.value }))
                  }
                />
              </label>
            </>
          )}
          {(editorDraft.modelType === 'File' || editorDraft.modelType === 'Blob') && (
            <>
              <label>
                Content Type
                <input
                  type="text"
                  value={editorDraft.contentType || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      ...prev,
                      contentType: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Value
                <input
                  type="text"
                  value={editorDraft.value || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({ ...prev, value: event.target.value }))
                  }
                />
              </label>
            </>
          )}
          {editorDraft.modelType === 'MultiLanguageProperty' && (
            <>
              <label>
                Language
                <input
                  type="text"
                  value={editorDraft.language || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      ...prev,
                      language: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Text
                <input
                  type="text"
                  value={editorDraft.text || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({ ...prev, text: event.target.value }))
                  }
                />
              </label>
            </>
          )}
          {editorDraft.modelType === 'SubmodelElementList' && (
            <>
              <label>
                Type List Element
                <select
                  value={editorDraft.typeValueListElement || elementTypeOptions[0]}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      ...prev,
                      typeValueListElement: event.target.value,
                    }))
                  }
                >
                  {elementTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Value Type List Element
                <select
                  value={editorDraft.valueTypeListElement || ''}
                  disabled={!isEditing}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      ...prev,
                      valueTypeListElement: event.target.value,
                    }))
                  }
                >
                  <option value="">Selecione</option>
                  {dataTypeOptions.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </form>
      )}
    </>
  );
};

export default SelectedDetails;
