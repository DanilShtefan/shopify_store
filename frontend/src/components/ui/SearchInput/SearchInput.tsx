import { useEffect, useState } from 'react';
import { SearchInputDesktop } from './SearchInputDesktop';
import { SearchInputMobile } from './SearchInputMobile';

export function SearchInput() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <SearchInputMobile />;
  }
  
  return <SearchInputDesktop />;
}
