interface HeaderProps {
  hidden: boolean
}

export default function Header({ hidden }: HeaderProps) {
  return (
    <header className={`app-header${hidden ? ' app-header--hidden' : ''}`}>
      <h1 className="app-header__title">Template PWA</h1>
    </header>
  )
}
