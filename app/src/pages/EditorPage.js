import { Link } from 'react-router-dom';
import EditorWorkspace from '../editor/EditorWorkspace';

const EditorPage = () => (
  <main className="page editor">
    <header className="page-header">
      <Link className="brand-link" to="/">
        ONPPROD
      </Link>
      <div className="page-header-meta">
        <span className="section-eyebrow">Editor AAS</span>
        <h2>Ambiente de Edicao</h2>
      </div>
    </header>
    <EditorWorkspace />
  </main>
);

export default EditorPage;
