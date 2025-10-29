import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const { pathname } = useRouter();
  const isActive = (href) => (pathname === href || pathname.startsWith(href + '/'));
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">SupportDesk</Link>
        <Link className={isActive('/tickets') ? 'active' : ''} href="/tickets">Tickets</Link>
        <Link className={isActive('/tickets/new') ? 'active' : ''} href="/tickets/new">New</Link>
        <Link className={isActive('/admin') ? 'active' : ''} href="/admin">Admin</Link>
        <span style={{ marginLeft: 'auto' }} />
        <Link className={isActive('/auth') ? 'active' : ''} href="/auth">Auth</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
