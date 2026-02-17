import { Link } from 'react-router-dom';

const BidsMonitorPage = () => (
  <main className="page editor">
    <header className="page-header">
      <Link className="brand-link" to="/">
        ONPPROD
      </Link>
      <div className="page-header-meta">
        <span className="section-eyebrow">AAS Workspace</span>
        <h2>Monitor de Licitações</h2>
      </div>
    </header>
  </main>
);

export default BidsMonitorPage;
