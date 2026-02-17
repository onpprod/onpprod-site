import { Link } from 'react-router-dom';

const HomePage = () => (
  <main className="page home">
    <section className="frame">
      <span className="signal" aria-hidden="true">
        <span className="signal-dot"></span>
        <span className="signal-dot"></span>
        <span className="signal-dot"></span>
      </span>
      <h1>ONPPROD</h1>
      <p className="lead">Estamos criando algo interessante.</p>

      <section className="cta-card">
        <div>
          <span className="section-eyebrow">AAS Workspace</span>
          <h2>Abra o editor de AAS</h2>
          <p>
            Acesse a TreeView, selecione elementos e edite os campos em um painel
            dedicado.
          </p>
        </div>
        <Link className="cta-link" to="/editor">
          Ir para o Editor
        </Link>
      </section>
    </section>
  </main>
);

export default HomePage;
