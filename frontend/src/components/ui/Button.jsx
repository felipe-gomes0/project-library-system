// Botão base. Composição por variação: a aparência vem das props,
// o conteúdo vem por children (ícone + texto, só texto, etc.).
export default function Button({
  variant = 'default',
  size,
  block = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'btn',
    variant !== 'default' && `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
