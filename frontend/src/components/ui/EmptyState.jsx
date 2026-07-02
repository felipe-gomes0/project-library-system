import { TrayIcon } from '@phosphor-icons/react';

export default function EmptyState({ icon = <TrayIcon />, title, message, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
