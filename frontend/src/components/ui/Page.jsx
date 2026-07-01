// Composição de layout de página. O cabeçalho recebe título/subtítulo e,
// por children, os botões de ação (slot de ações).
// Uso:
//   <Page>
//     <Page.Header title="Livros" subtitle="Acervo">
//       <Button variant="primary">+ Novo</Button>
//     </Page.Header>
//     ...conteúdo...
//   </Page>
export default function Page({ children }) {
  return <div className="page">{children}</div>;
}

function Header({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

Page.Header = Header;
