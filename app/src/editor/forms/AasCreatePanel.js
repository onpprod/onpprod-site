import { assetKindOptions } from '../../aas/schema';

const AasCreatePanel = ({ form, setForm, onAdd, onGenerateId }) => (
  <div className="create-panel">
    <h4>Novo AAS</h4>
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
        Asset Kind
        <select
          value={form.assetKind}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, assetKind: event.target.value }))
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
          value={form.assetType}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, assetType: event.target.value }))
          }
        />
      </label>
      <label className="full">
        Global Asset ID
        <input
          type="text"
          value={form.globalAssetId}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, globalAssetId: event.target.value }))
          }
        />
      </label>
    </form>
    <div className="editor-actions">
      <button type="button" className="btn primary" onClick={onAdd}>
        Adicionar AAS
      </button>
      <button type="button" className="btn ghost" onClick={onGenerateId}>
        Gerar ID
      </button>
    </div>
  </div>
);

export default AasCreatePanel;
