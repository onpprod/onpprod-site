import { modellingKindOptions } from '../../aas/schema';

const SubmodelCreatePanel = ({ form, setForm, onAdd, onGenerateId }) => (
  <div className="create-panel">
    <h4>Novo Submodel</h4>
    <form className="editor-form">
      <label>
        ID
        <input
          type="text"
          value={form.id}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, id: event.target.value }))
          }
        />
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
      <label>
        Kind
        <select
          value={form.kind}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, kind: event.target.value }))
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
    <div className="editor-actions">
      <button type="button" className="btn primary" onClick={onAdd}>
        Adicionar Submodel
      </button>
      <button type="button" className="btn ghost" onClick={onGenerateId}>
        Gerar ID
      </button>
    </div>
  </div>
);

export default SubmodelCreatePanel;
