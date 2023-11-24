import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <button aria-label="Toggle Theme Switcher" type="button" className="py-2 transition duration-300 ease-in-out cursor-pointer" onClick={handleClick}>
      {isMounted && theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeSwitcher;
