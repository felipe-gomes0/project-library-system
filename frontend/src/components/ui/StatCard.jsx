// Cartão de indicador. Conteúdo principal por props; permite extras por children.
export default function StatCard({ icon, label, value, accent = 'blue', children }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {children}
      </div>
    </div>
  );
}
