const { useEffect, useMemo, useState } = React;

const SCHEMA_URL = "./aas_schema.json";

const buildUrn = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `urn:uuid:${crypto.randomUUID()}`;
  }
  return `urn:uuid:${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
};

const emptyEnvironment = () => ({
  assetAdministrationShells: [],
  submodels: [],
  conceptDescriptions: [],
});

const buildExportEnvironment = (environment) => {
  const clone = JSON.parse(JSON.stringify(environment || {}));

  const cleanArray = (obj, key) => {
    if (!Array.isArray(obj[key]) || obj[key].length === 0) {
      delete obj[key];
    }
  };

  cleanArray(clone, "assetAdministrationShells");
  cleanArray(clone, "submodels");
  cleanArray(clone, "conceptDescriptions");

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

const buildReference = (type, keyType, keyValue) => {
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

const useHashRoute = () => {
  const getRoute = () => {
    const hash = window.location.hash || "";
    const value = hash.replace("#/", "").replace("#", "");
    return value || "home";
  };
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
};

const Landing = () => {
  return (
    <main className="scene">
      <div className="container hero fade">
        <span className="tag">AAS Editor</span>
        <h1>Construa AAS direto no navegador.</h1>
        <p>
          Crie, valide e exporte um Environment completo seguindo o schema oficial.
          Sem backend, sem deploy complicado. Tudo no cliente.
        </p>
        <div className="cta-row">
          <button className="btn primary" onClick={() => (window.location.hash = "#/editor")}>
            Abrir editor
          </button>
          <button className="btn secondary" onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}>
            Ver detalhes
          </button>
        </div>
        <div className="grid two" style={{ marginTop: "32px" }}>
          <div className="card">
            <h2>Editor AAS</h2>
            <p>
              Gere Asset Administration Shells, adicione Submodels e SubmodelElements e valide o JSON
              com o schema oficial do IDTA.
            </p>
            <button className="btn primary" onClick={() => (window.location.hash = "#/editor")}>
              Ir para o editor
            </button>
          </div>
          <div className="card">
            <h2>100% client-side</h2>
            <p>
              O editor roda direto no navegador e usa validacao via JSON Schema. Nenhum dado sai da
              maquina.
            </p>
            <span className="pill">Sem backend</span>
          </div>
        </div>
      </div>
    </main>
  );
};

const Editor = () => {
  const [schema, setSchema] = useState(null);
  const [schemaError, setSchemaError] = useState("");
  const [validator, setValidator] = useState(null);

  const [environment, setEnvironment] = useState(emptyEnvironment());

  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonMessage, setJsonMessage] = useState("");

  const [validation, setValidation] = useState({ valid: false, errors: [], parseError: "" });
  const [lastValidData, setLastValidData] = useState(null);

  const assetKindOptions = useMemo(
    () => schema?.definitions?.AssetKind?.enum || ["Instance", "Type", "Role", "NotApplicable"],
    [schema]
  );
  const modellingKindOptions = useMemo(
    () => schema?.definitions?.ModellingKind?.enum || ["Instance", "Template"],
    [schema]
  );
  const dataTypeOptions = useMemo(
    () =>
      schema?.definitions?.DataTypeDefXsd?.enum || [
        "string",
        "normalizedString",
        "boolean",
        "decimal",
        "float",
        "double",
        "date",
        "dateTime",
        "time",
        "anyURI",
        "base64Binary",
        "hexBinary",
        "int",
        "long",
      ],
    [schema]
  );
  const referenceTypeOptions = useMemo(
    () => schema?.definitions?.ReferenceTypes?.enum || ["ModelReference", "ExternalReference"],
    [schema]
  );
  const keyTypeOptions = useMemo(
    () =>
      schema?.definitions?.KeyTypes?.enum || [
        "AssetAdministrationShell",
        "Submodel",
        "Property",
        "SubmodelElement",
        "GlobalReference",
      ],
    [schema]
  );

  const [aasForm, setAasForm] = useState(() => ({
    id: buildUrn(),
    idShort: "",
    assetKind: assetKindOptions[0],
    globalAssetId: "",
    assetType: "",
  }));

  const [submodelForm, setSubmodelForm] = useState(() => ({
    id: buildUrn(),
    idShort: "",
    kind: modellingKindOptions[0],
    aasId: "",
  }));

  const [elementForm, setElementForm] = useState(() => ({
    submodelId: "",
    type: "Property",
    idShort: "",
    valueType: dataTypeOptions[0],
    value: "",
    min: "",
    max: "",
    contentType: "",
    fileValue: "",
    blobValue: "",
    language: "en",
    text: "",
    referenceType: referenceTypeOptions[0],
    referenceKeyType: keyTypeOptions[0],
    referenceKeyValue: "",
    relationFirstKeyType: keyTypeOptions[0],
    relationFirstKeyValue: "",
    relationSecondKeyType: keyTypeOptions[0],
    relationSecondKeyValue: "",
  }));

  useEffect(() => {
    let alive = true;
    fetch(SCHEMA_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Schema nao encontrado em ${SCHEMA_URL}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!alive) return;
        setSchema(data);
        const AjvCtor = window.Ajv2019 || window.ajv2019 || window.Ajv || window.ajv;
        if (!AjvCtor) {
          setSchemaError("Ajv nao carregado. Verifique o script do Ajv no index.html.");
          return;
        }
        const ajv = new AjvCtor({ allErrors: true, strict: false });
        const compiled = ajv.compile(data);
        setValidator(() => compiled);
      })
      .catch((err) => {
        if (!alive) return;
        setSchemaError(err.message || "Erro ao carregar schema.");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (assetKindOptions.length) {
      setAasForm((prev) => ({ ...prev, assetKind: prev.assetKind || assetKindOptions[0] }));
    }
  }, [assetKindOptions]);

  useEffect(() => {
    if (modellingKindOptions.length) {
      setSubmodelForm((prev) => ({ ...prev, kind: prev.kind || modellingKindOptions[0] }));
    }
  }, [modellingKindOptions]);

  useEffect(() => {
    if (dataTypeOptions.length) {
      setElementForm((prev) => ({ ...prev, valueType: prev.valueType || dataTypeOptions[0] }));
    }
  }, [dataTypeOptions]);

  useEffect(() => {
    if (referenceTypeOptions.length && keyTypeOptions.length) {
      setElementForm((prev) => ({
        ...prev,
        referenceType: prev.referenceType || referenceTypeOptions[0],
        referenceKeyType: prev.referenceKeyType || keyTypeOptions[0],
        relationFirstKeyType: prev.relationFirstKeyType || keyTypeOptions[0],
        relationSecondKeyType: prev.relationSecondKeyType || keyTypeOptions[0],
      }));
    }
  }, [referenceTypeOptions, keyTypeOptions]);

  const exportEnvironment = useMemo(() => buildExportEnvironment(environment), [environment]);
  const exportJson = useMemo(() => JSON.stringify(exportEnvironment, null, 2), [exportEnvironment]);

  useEffect(() => {
    if (!jsonDirty) {
      setJsonDraft(exportJson);
    }
  }, [exportJson, jsonDirty]);

  useEffect(() => {
    if (!validator || !jsonDraft) {
      setValidation({ valid: false, errors: [], parseError: "" });
      setLastValidData(null);
      return;
    }
    try {
      const parsed = JSON.parse(jsonDraft);
      const isValid = validator(parsed);
      if (isValid) {
        setValidation({ valid: true, errors: [], parseError: "" });
        setLastValidData(parsed);
      } else {
        setValidation({
          valid: false,
          errors: (validator.errors || []).slice(0, 8),
          parseError: "",
        });
        setLastValidData(null);
      }
    } catch (err) {
      setValidation({ valid: false, errors: [], parseError: err.message || "JSON invalido." });
      setLastValidData(null);
    }
  }, [jsonDraft, validator]);

  const aasList = Array.isArray(environment.assetAdministrationShells)
    ? environment.assetAdministrationShells
    : [];
  const submodelList = Array.isArray(environment.submodels) ? environment.submodels : [];

  useEffect(() => {
    if (!submodelForm.aasId && aasList.length) {
      setSubmodelForm((prev) => ({ ...prev, aasId: aasList[0].id }));
    }
  }, [aasList, submodelForm.aasId]);

  useEffect(() => {
    if (!elementForm.submodelId && submodelList.length) {
      setElementForm((prev) => ({ ...prev, submodelId: submodelList[0].id }));
    }
  }, [submodelList, elementForm.submodelId]);

  const addAas = () => {
    if (!aasForm.id || !aasForm.assetKind) {
      setJsonMessage("ID e AssetKind sao obrigatorios.");
      return;
    }
    const assetInformation = {
      assetKind: aasForm.assetKind,
    };
    if (aasForm.globalAssetId) assetInformation.globalAssetId = aasForm.globalAssetId;
    if (aasForm.assetType) assetInformation.assetType = aasForm.assetType;

    const aas = {
      modelType: "AssetAdministrationShell",
      id: aasForm.id,
      assetInformation,
    };
    if (aasForm.idShort) aas.idShort = aasForm.idShort;

    setEnvironment((prev) => {
      const shells = Array.isArray(prev.assetAdministrationShells) ? [...prev.assetAdministrationShells] : [];
      shells.push(aas);
      return { ...prev, assetAdministrationShells: shells };
    });

    setAasForm({
      id: buildUrn(),
      idShort: "",
      assetKind: assetKindOptions[0],
      globalAssetId: "",
      assetType: "",
    });
    setJsonMessage("AAS adicionado.");
  };

  const removeAas = (id) => {
    setEnvironment((prev) => {
      const shells = (prev.assetAdministrationShells || []).filter((aas) => aas.id !== id);
      return { ...prev, assetAdministrationShells: shells };
    });
  };

  const addSubmodel = () => {
    if (!submodelForm.id || !submodelForm.aasId) {
      setJsonMessage("Selecione um AAS e informe o ID do Submodel.");
      return;
    }
    const submodel = {
      modelType: "Submodel",
      id: submodelForm.id,
    };
    if (submodelForm.idShort) submodel.idShort = submodelForm.idShort;
    if (submodelForm.kind) submodel.kind = submodelForm.kind;

    const reference = {
      type: "ModelReference",
      keys: [
        {
          type: "Submodel",
          value: submodel.id,
        },
      ],
    };

    setEnvironment((prev) => {
      const submodels = Array.isArray(prev.submodels) ? [...prev.submodels] : [];
      submodels.push(submodel);

      const shells = Array.isArray(prev.assetAdministrationShells) ? [...prev.assetAdministrationShells] : [];
      const idx = shells.findIndex((aas) => aas.id === submodelForm.aasId);
      if (idx >= 0) {
        const target = { ...shells[idx] };
        const refs = Array.isArray(target.submodels) ? [...target.submodels] : [];
        refs.push(reference);
        target.submodels = refs;
        shells[idx] = target;
      }

      return { ...prev, submodels, assetAdministrationShells: shells };
    });

    setSubmodelForm({
      id: buildUrn(),
      idShort: "",
      kind: modellingKindOptions[0],
      aasId: submodelForm.aasId,
    });
    setJsonMessage("Submodel adicionado.");
  };

  const removeSubmodel = (id) => {
    setEnvironment((prev) => {
      const submodels = (prev.submodels || []).filter((sm) => sm.id !== id);
      const shells = (prev.assetAdministrationShells || []).map((aas) => {
        const refs = (aas.submodels || []).filter(
          (ref) => !ref?.keys?.some((key) => key.type === "Submodel" && key.value === id)
        );
        return { ...aas, submodels: refs };
      });
      return { ...prev, submodels, assetAdministrationShells: shells };
    });
  };

  const addElement = () => {
    if (!elementForm.submodelId) {
      setJsonMessage("Selecione um Submodel para receber o elemento.");
      return;
    }

    const base = {
      modelType: elementForm.type,
    };
    if (elementForm.idShort) base.idShort = elementForm.idShort;

    let element = { ...base };

    if (elementForm.type === "Property") {
      if (!elementForm.valueType) {
        setJsonMessage("valueType e obrigatorio para Property.");
        return;
      }
      element.valueType = elementForm.valueType;
      if (elementForm.value) element.value = elementForm.value;
    }

    if (elementForm.type === "Range") {
      if (!elementForm.valueType) {
        setJsonMessage("valueType e obrigatorio para Range.");
        return;
      }
      element.valueType = elementForm.valueType;
      if (elementForm.min) element.min = elementForm.min;
      if (elementForm.max) element.max = elementForm.max;
    }

    if (elementForm.type === "File") {
      if (elementForm.fileValue) element.value = elementForm.fileValue;
      if (elementForm.contentType) element.contentType = elementForm.contentType;
    }

    if (elementForm.type === "Blob") {
      if (elementForm.blobValue) element.value = elementForm.blobValue;
      if (elementForm.contentType) element.contentType = elementForm.contentType;
    }

    if (elementForm.type === "MultiLanguageProperty") {
      if (elementForm.language && elementForm.text) {
        element.value = [{ language: elementForm.language, text: elementForm.text }];
      }
    }

    if (elementForm.type === "ReferenceElement") {
      const ref = buildReference(
        elementForm.referenceType,
        elementForm.referenceKeyType,
        elementForm.referenceKeyValue
      );
      if (ref) element.value = ref;
    }

    if (elementForm.type === "RelationshipElement") {
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

    setEnvironment((prev) => {
      const submodels = Array.isArray(prev.submodels) ? [...prev.submodels] : [];
      const idx = submodels.findIndex((sm) => sm.id === elementForm.submodelId);
      if (idx >= 0) {
        const target = { ...submodels[idx] };
        const elements = Array.isArray(target.submodelElements) ? [...target.submodelElements] : [];
        elements.push(element);
        target.submodelElements = elements;
        submodels[idx] = target;
      }
      return { ...prev, submodels };
    });

    setElementForm((prev) => ({
      ...prev,
      idShort: "",
      value: "",
      min: "",
      max: "",
      contentType: "",
      fileValue: "",
      blobValue: "",
      text: "",
      referenceKeyValue: "",
      relationFirstKeyValue: "",
      relationSecondKeyValue: "",
    }));
    setJsonMessage("Elemento adicionado.");
  };

  const removeElement = (submodelId, index) => {
    setEnvironment((prev) => {
      const submodels = Array.isArray(prev.submodels) ? [...prev.submodels] : [];
      const idx = submodels.findIndex((sm) => sm.id === submodelId);
      if (idx >= 0) {
        const target = { ...submodels[idx] };
        const elements = Array.isArray(target.submodelElements) ? [...target.submodelElements] : [];
        elements.splice(index, 1);
        target.submodelElements = elements;
        submodels[idx] = target;
      }
      return { ...prev, submodels };
    });
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      setEnvironment((prev) => {
        const next = { ...parsed };
        next.assetAdministrationShells = Array.isArray(parsed.assetAdministrationShells)
          ? parsed.assetAdministrationShells
          : [];
        next.submodels = Array.isArray(parsed.submodels) ? parsed.submodels : [];
        next.conceptDescriptions = Array.isArray(parsed.conceptDescriptions)
          ? parsed.conceptDescriptions
          : [];
        return next;
      });
      setJsonDirty(false);
      setJsonMessage("JSON aplicado ao editor.");
    } catch (err) {
      setJsonMessage("JSON invalido. Corrija antes de aplicar.");
    }
  };

  const resetEnvironment = () => {
    setEnvironment(emptyEnvironment());
    setJsonDirty(false);
    setJsonMessage("Environment limpo.");
  };

  const downloadJson = () => {
    if (!lastValidData) return;
    const payload = JSON.stringify(lastValidData, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "aas-environment.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const totalElements = submodelList.reduce(
    (sum, sm) => sum + (Array.isArray(sm.submodelElements) ? sm.submodelElements.length : 0),
    0
  );

  return (
    <main className="scene">
      <div className="container fade">
        <div className="nav">
          <a href="#/" className="title">
            ONPPROD
          </a>
          <div className="toolbar">
            <button className="btn secondary" onClick={() => (window.location.hash = "#/")}>
              Voltar
            </button>
          </div>
        </div>

        <div className="grid two">
          <div className="card">
            <h2>AAS Editor</h2>
            <p>Crie AAS, submodels e elementos. O JSON e validado contra o schema oficial.</p>
            <div className="toolbar">
              <span className="pill">AAS: {aasList.length}</span>
              <span className="pill">Submodels: {submodelList.length}</span>
              <span className="pill">Elementos: {totalElements}</span>
            </div>
          </div>
          <div className="card">
            <h2>Status do schema</h2>
            {schemaError ? (
              <div className="status warn">{schemaError}</div>
            ) : (
              <div className="status ok">
                {schema ? "Schema carregado." : "Carregando schema..."}
                <small>Origem: {SCHEMA_URL}</small>
              </div>
            )}
          </div>
        </div>

        <div className="grid two" style={{ marginTop: "24px" }}>
          <div className="card">
            <h3>Novo AAS</h3>
            <div className="field">
              <label>ID</label>
              <input value={aasForm.id} onChange={(e) => setAasForm({ ...aasForm, id: e.target.value })} />
            </div>
            <div className="field">
              <label>ID Short</label>
              <input value={aasForm.idShort} onChange={(e) => setAasForm({ ...aasForm, idShort: e.target.value })} />
            </div>
            <div className="inline">
              <div className="field">
                <label>Asset Kind</label>
                <select
                  value={aasForm.assetKind}
                  onChange={(e) => setAasForm({ ...aasForm, assetKind: e.target.value })}
                >
                  {assetKindOptions.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Asset Type</label>
                <input
                  value={aasForm.assetType}
                  onChange={(e) => setAasForm({ ...aasForm, assetType: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Global Asset ID</label>
              <input
                value={aasForm.globalAssetId}
                onChange={(e) => setAasForm({ ...aasForm, globalAssetId: e.target.value })}
              />
            </div>
            <div className="toolbar">
              <button className="btn primary" onClick={addAas}>
                Adicionar AAS
              </button>
              <button className="btn secondary" onClick={() => setAasForm({ ...aasForm, id: buildUrn() })}>
                Gerar ID
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Submodels</h3>
            <div className="field">
              <label>Vincular ao AAS</label>
              <select
                value={submodelForm.aasId}
                onChange={(e) => setSubmodelForm({ ...submodelForm, aasId: e.target.value })}
                disabled={!aasList.length}
              >
                {aasList.length ? (
                  aasList.map((aas) => (
                    <option key={aas.id} value={aas.id}>
                      {aas.idShort ? `${aas.idShort} (${aas.id})` : aas.id}
                    </option>
                  ))
                ) : (
                  <option value="">Crie um AAS primeiro</option>
                )}
              </select>
            </div>
            <div className="field">
              <label>ID</label>
              <input
                value={submodelForm.id}
                onChange={(e) => setSubmodelForm({ ...submodelForm, id: e.target.value })}
              />
            </div>
            <div className="inline">
              <div className="field">
                <label>ID Short</label>
                <input
                  value={submodelForm.idShort}
                  onChange={(e) => setSubmodelForm({ ...submodelForm, idShort: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Kind</label>
                <select
                  value={submodelForm.kind}
                  onChange={(e) => setSubmodelForm({ ...submodelForm, kind: e.target.value })}
                >
                  {modellingKindOptions.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="toolbar">
              <button className="btn primary" onClick={addSubmodel} disabled={!aasList.length}>
                Adicionar Submodel
              </button>
              <button className="btn secondary" onClick={() => setSubmodelForm({ ...submodelForm, id: buildUrn() })}>
                Gerar ID
              </button>
            </div>
          </div>
        </div>

        <div className="grid two" style={{ marginTop: "24px" }}>
          <div className="card">
            <h3>Submodel Elements</h3>
            <div className="field">
              <label>Submodel destino</label>
              <select
                value={elementForm.submodelId}
                onChange={(e) => setElementForm({ ...elementForm, submodelId: e.target.value })}
                disabled={!submodelList.length}
              >
                {submodelList.length ? (
                  submodelList.map((sm) => (
                    <option key={sm.id} value={sm.id}>
                      {sm.idShort ? `${sm.idShort} (${sm.id})` : sm.id}
                    </option>
                  ))
                ) : (
                  <option value="">Crie um Submodel primeiro</option>
                )}
              </select>
            </div>
            <div className="inline">
              <div className="field">
                <label>Tipo</label>
                <select
                  value={elementForm.type}
                  onChange={(e) => setElementForm({ ...elementForm, type: e.target.value })}
                >
                  {[
                    "Property",
                    "Range",
                    "File",
                    "Blob",
                    "MultiLanguageProperty",
                    "ReferenceElement",
                    "RelationshipElement",
                    "SubmodelElementCollection",
                    "SubmodelElementList",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>ID Short</label>
                <input
                  value={elementForm.idShort}
                  onChange={(e) => setElementForm({ ...elementForm, idShort: e.target.value })}
                />
              </div>
            </div>

            {(elementForm.type === "Property" || elementForm.type === "Range") && (
              <div className="inline">
                <div className="field">
                  <label>Value Type</label>
                  <select
                    value={elementForm.valueType}
                    onChange={(e) => setElementForm({ ...elementForm, valueType: e.target.value })}
                  >
                    {dataTypeOptions.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>
                {elementForm.type === "Property" ? (
                  <div className="field">
                    <label>Value</label>
                    <input value={elementForm.value} onChange={(e) => setElementForm({ ...elementForm, value: e.target.value })} />
                  </div>
                ) : (
                  <>
                    <div className="field">
                      <label>Min</label>
                      <input value={elementForm.min} onChange={(e) => setElementForm({ ...elementForm, min: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Max</label>
                      <input value={elementForm.max} onChange={(e) => setElementForm({ ...elementForm, max: e.target.value })} />
                    </div>
                  </>
                )}
              </div>
            )}

            {elementForm.type === "File" && (
              <div className="inline">
                <div className="field">
                  <label>Content Type</label>
                  <input
                    value={elementForm.contentType}
                    onChange={(e) => setElementForm({ ...elementForm, contentType: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Value (URI)</label>
                  <input
                    value={elementForm.fileValue}
                    onChange={(e) => setElementForm({ ...elementForm, fileValue: e.target.value })}
                  />
                </div>
              </div>
            )}

            {elementForm.type === "Blob" && (
              <div className="inline">
                <div className="field">
                  <label>Content Type</label>
                  <input
                    value={elementForm.contentType}
                    onChange={(e) => setElementForm({ ...elementForm, contentType: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Value (base64)</label>
                  <input
                    value={elementForm.blobValue}
                    onChange={(e) => setElementForm({ ...elementForm, blobValue: e.target.value })}
                  />
                </div>
              </div>
            )}

            {elementForm.type === "MultiLanguageProperty" && (
              <div className="inline">
                <div className="field">
                  <label>Language</label>
                  <input
                    value={elementForm.language}
                    onChange={(e) => setElementForm({ ...elementForm, language: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Text</label>
                  <input
                    value={elementForm.text}
                    onChange={(e) => setElementForm({ ...elementForm, text: e.target.value })}
                  />
                </div>
              </div>
            )}

            {elementForm.type === "ReferenceElement" && (
              <div className="inline">
                <div className="field">
                  <label>Reference Type</label>
                  <select
                    value={elementForm.referenceType}
                    onChange={(e) => setElementForm({ ...elementForm, referenceType: e.target.value })}
                  >
                    {referenceTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Key Type</label>
                  <select
                    value={elementForm.referenceKeyType}
                    onChange={(e) => setElementForm({ ...elementForm, referenceKeyType: e.target.value })}
                  >
                    {keyTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Key Value</label>
                  <input
                    value={elementForm.referenceKeyValue}
                    onChange={(e) => setElementForm({ ...elementForm, referenceKeyValue: e.target.value })}
                  />
                </div>
              </div>
            )}

            {elementForm.type === "RelationshipElement" && (
              <div className="inline">
                <div className="field">
                  <label>First Key Type</label>
                  <select
                    value={elementForm.relationFirstKeyType}
                    onChange={(e) => setElementForm({ ...elementForm, relationFirstKeyType: e.target.value })}
                  >
                    {keyTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>First Key Value</label>
                  <input
                    value={elementForm.relationFirstKeyValue}
                    onChange={(e) => setElementForm({ ...elementForm, relationFirstKeyValue: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Second Key Type</label>
                  <select
                    value={elementForm.relationSecondKeyType}
                    onChange={(e) => setElementForm({ ...elementForm, relationSecondKeyType: e.target.value })}
                  >
                    {keyTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Second Key Value</label>
                  <input
                    value={elementForm.relationSecondKeyValue}
                    onChange={(e) => setElementForm({ ...elementForm, relationSecondKeyValue: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="toolbar">
              <button className="btn primary" onClick={addElement} disabled={!submodelList.length}>
                Adicionar Elemento
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Estrutura atual</h3>
            <div className="panel">
              {jsonMessage && <div className="status ok">{jsonMessage}</div>}
              <div className="list">
                {aasList.length ? (
                  aasList.map((aas) => (
                    <div className="list-item" key={aas.id}>
                      <div>
                        <strong>{aas.idShort || "AAS"}</strong>
                        <span className="mono"> {aas.id}</span>
                      </div>
                      <button className="btn secondary" onClick={() => removeAas(aas.id)}>
                        Remover
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="muted">Nenhum AAS criado.</div>
                )}
              </div>
              <div className="list" style={{ marginTop: "12px" }}>
                {submodelList.length ? (
                  submodelList.map((sm) => (
                    <div className="list-item" key={sm.id}>
                      <div>
                        <strong>{sm.idShort || "Submodel"}</strong>
                        <span className="mono"> {sm.id}</span>
                        <span className="muted">
                          {" "}
                          ({Array.isArray(sm.submodelElements) ? sm.submodelElements.length : 0} elementos)
                        </span>
                      </div>
                      <button className="btn secondary" onClick={() => removeSubmodel(sm.id)}>
                        Remover
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="muted">Nenhum Submodel criado.</div>
                )}
              </div>
            </div>
            {submodelList.length > 0 && (
              <div className="panel" style={{ marginTop: "16px" }}>
                <h3 style={{ marginTop: 0 }}>Elementos do Submodel selecionado</h3>
                {elementForm.submodelId ? (
                  <div className="list">
                    {(submodelList.find((sm) => sm.id === elementForm.submodelId)?.submodelElements || []).map(
                      (el, idx) => (
                        <div className="list-item" key={`${el.modelType}-${idx}`}>
                          <div>
                            <strong>{el.modelType}</strong>
                            <span className="muted"> {el.idShort || ""}</span>
                          </div>
                          <button className="btn secondary" onClick={() => removeElement(elementForm.submodelId, idx)}>
                            Remover
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="muted">Selecione um Submodel.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid two" style={{ marginTop: "24px" }}>
          <div className="card">
            <h3>JSON Editor</h3>
            {validation.valid ? (
              <div className="status ok">JSON valido para download.</div>
            ) : (
              <div className="status warn">
                JSON ainda invalido.
                {validation.parseError && <small>Parse: {validation.parseError}</small>}
                {validation.errors.length > 0 && (
                  <small>
                    {validation.errors.map((err, idx) => (
                      <div key={`${err.instancePath}-${idx}`}>
                        {err.instancePath || "/"} {err.message}
                      </div>
                    ))}
                  </small>
                )}
              </div>
            )}
            <textarea
              value={jsonDraft}
              onChange={(e) => {
                setJsonDraft(e.target.value);
                setJsonDirty(true);
              }}
            />
            <div className="toolbar" style={{ marginTop: "12px" }}>
              <button className="btn primary" onClick={applyJson}>
                Aplicar JSON
              </button>
              <button className="btn secondary" onClick={() => setJsonDirty(false)}>
                Reverter
              </button>
              <button className="btn secondary" onClick={resetEnvironment}>
                Limpar
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Exportacao</h3>
            <p>Baixe o Environment somente quando o JSON estiver valido.</p>
            <div className="toolbar">
              <button className="btn primary" onClick={downloadJson} disabled={!validation.valid}>
                Baixar JSON
              </button>
              <span className="muted">Arquivo: aas-environment.json</span>
            </div>
            <div className="panel" style={{ marginTop: "16px" }}>
              <h3 style={{ marginTop: 0 }}>Preview</h3>
              <textarea value={exportJson} readOnly />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const App = () => {
  const route = useHashRoute();
  if (route === "editor") {
    return <Editor />;
  }
  return <Landing />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
