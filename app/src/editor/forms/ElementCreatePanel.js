import {
  dataTypeOptions,
  elementTypeOptions,
  keyTypeOptions,
  referenceTypeOptions,
} from '../../aas/schema';

const ElementCreatePanel = ({ form, setForm, onAdd }) => (
  <div className="create-panel">
    <h4>Novo Submodel Element</h4>
    <form className="editor-form">
      <label>
        Tipo
        <select
          value={form.type}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, type: event.target.value }))
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
        IdShort
        <input
          type="text"
          value={form.idShort}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, idShort: event.target.value }))
          }
        />
      </label>

      {(form.type === 'Property' || form.type === 'Range') && (
        <label>
          Value Type
          <select
            value={form.valueType}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, valueType: event.target.value }))
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

      {form.type === 'Property' && (
        <label>
          Value
          <input
            type="text"
            value={form.value}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, value: event.target.value }))
            }
          />
        </label>
      )}

      {form.type === 'Range' && (
        <>
          <label>
            Min
            <input
              type="text"
              value={form.min}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, min: event.target.value }))
              }
            />
          </label>
          <label>
            Max
            <input
              type="text"
              value={form.max}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, max: event.target.value }))
              }
            />
          </label>
        </>
      )}

      {form.type === 'File' && (
        <>
          <label>
            Content Type
            <input
              type="text"
              value={form.contentType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contentType: event.target.value }))
              }
            />
          </label>
          <label>
            Value (URI)
            <input
              type="text"
              value={form.fileValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fileValue: event.target.value }))
              }
            />
          </label>
        </>
      )}

      {form.type === 'Blob' && (
        <>
          <label>
            Content Type
            <input
              type="text"
              value={form.contentType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contentType: event.target.value }))
              }
            />
          </label>
          <label>
            Value (base64)
            <input
              type="text"
              value={form.blobValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, blobValue: event.target.value }))
              }
            />
          </label>
        </>
      )}

      {form.type === 'MultiLanguageProperty' && (
        <>
          <label>
            Language
            <input
              type="text"
              value={form.language}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, language: event.target.value }))
              }
            />
          </label>
          <label>
            Text
            <input
              type="text"
              value={form.text}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, text: event.target.value }))
              }
            />
          </label>
        </>
      )}

      {form.type === 'ReferenceElement' && (
        <>
          <label>
            Reference Type
            <select
              value={form.referenceType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, referenceType: event.target.value }))
              }
            >
              {referenceTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Key Type
            <select
              value={form.referenceKeyType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, referenceKeyType: event.target.value }))
              }
            >
              {keyTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Key Value
            <input
              type="text"
              value={form.referenceKeyValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, referenceKeyValue: event.target.value }))
              }
            />
          </label>
        </>
      )}

      {form.type === 'RelationshipElement' && (
        <>
          <label>
            First Key Type
            <select
              value={form.relationFirstKeyType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  relationFirstKeyType: event.target.value,
                }))
              }
            >
              {keyTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            First Key Value
            <input
              type="text"
              value={form.relationFirstKeyValue}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  relationFirstKeyValue: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Second Key Type
            <select
              value={form.relationSecondKeyType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  relationSecondKeyType: event.target.value,
                }))
              }
            >
              {keyTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Second Key Value
            <input
              type="text"
              value={form.relationSecondKeyValue}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  relationSecondKeyValue: event.target.value,
                }))
              }
            />
          </label>
        </>
      )}

      {form.type === 'SubmodelElementList' && (
        <>
          <label>
            Type List Element
            <select
              value={form.typeValueListElement}
              onChange={(event) =>
                setForm((prev) => ({
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
              value={form.valueTypeListElement}
              onChange={(event) =>
                setForm((prev) => ({
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
    <div className="editor-actions">
      <button type="button" className="btn primary" onClick={onAdd}>
        Adicionar Elemento
      </button>
    </div>
  </div>
);

export default ElementCreatePanel;
