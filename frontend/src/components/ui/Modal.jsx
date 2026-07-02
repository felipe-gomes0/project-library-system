import { createContext, useContext } from 'react';
import { XIcon } from '@phosphor-icons/react';
import Button from './Button';

// Compound component com Context: o Modal compartilha onClose com seus
// subcomponentes (ex.: Modal.CloseButton), sem precisar repassar props.
// Uso:
//   <Modal onClose={close} title="...">
//     <Modal.Body>...</Modal.Body>
//     <Modal.Footer>
//       <Button onClick={close}>Cancelar</Button>
//     </Modal.Footer>
//   </Modal>
const ModalContext = createContext(null);

export default function Modal({ title, onClose, wide = false, children }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? 'modal-wide' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ModalContext.Provider value={{ onClose }}>
          <div className="modal-header">
            <h3>{title}</h3>
            <Modal.CloseButton />
          </div>
          {children}
        </ModalContext.Provider>
      </div>
    </div>
  );
}

function Body({ children }) {
  return <div className="modal-body">{children}</div>;
}

function Footer({ children }) {
  return <div className="modal-footer">{children}</div>;
}

function CloseButton() {
  const { onClose } = useContext(ModalContext);
  return (
    <button className="modal-close" onClick={onClose} aria-label="Fechar">
      <XIcon />
    </button>
  );
}

// Botão de cancelar pronto, que já conhece o onClose do modal por contexto
function CancelButton({ children = 'Cancelar' }) {
  const { onClose } = useContext(ModalContext);
  return (
    <Button variant="ghost" onClick={onClose}>
      {children}
    </Button>
  );
}

Modal.Body = Body;
Modal.Footer = Footer;
Modal.CloseButton = CloseButton;
Modal.CancelButton = CancelButton;
