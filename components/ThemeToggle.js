import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    const isDark = saved !== 'light';
    setDark(isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <button onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
