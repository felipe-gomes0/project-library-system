export default function Card({ className = '', children }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Header({ children }) {
  return <div className="card-header">{children}</div>;
}

function Title({ children }) {
  return <h2 className="card-title">{children}</h2>;
}

function Body({ children }) {
  return <div className="card-body">{children}</div>;
}

Card.Header = Header;
Card.Title = Title;
Card.Body = Body;
