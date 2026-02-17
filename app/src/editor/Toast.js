const Toast = ({ message, tone = 'success' }) => (
  <div className={`toast ${tone}`} role="status" aria-live="polite">
    <span className="toast-dot" />
    <span className="toast-message">{message}</span>
  </div>
);

export default Toast;
