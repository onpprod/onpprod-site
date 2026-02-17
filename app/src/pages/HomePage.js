import { Link } from 'react-router-dom';

const HomePage = () => (
  <main className="page home">
    <div className="bubble-field" aria-hidden="true">
      <span className="bubble"></span>
      <span className="bubble"></span>
      <span className="bubble"></span>
      <span className="bubble"></span>
    </div>
    <section className="frame">
      <h1>ONPPROD</h1>
    </section>

    <section className="feature-frame">
      <section className="cta-card">
        <div>
          <span className="section-eyebrow">AAS Workspace</span>
          <h2>Editor de AAS</h2>
          <p>
            Acesse a TreeView, selecione elementos e edite os campos em um painel
            dedicado.
          </p>
        </div>
        <Link className="cta-link" to="/editor">
          Ir para o Editor
        </Link>
      </section>
      <section className="cta-card">
        <div>
          <span className="section-eyebrow">AAS Workspace</span>
          <h2>Monitor de Licitações</h2>
          <p>Visualize as licitações em andamento a partir de um broker mqtt</p>
        </div>
        <Link className="cta-link" to="/monitor-licitacoes">
          Abrir o Monitor
        </Link>
      </section>
    </section>
  </main>
);

export default HomePage;
