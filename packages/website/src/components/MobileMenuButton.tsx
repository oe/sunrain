import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 获取菜单元素的引用
    menuRef.current = document.getElementById('mobile-menu') as HTMLDivElement;
  }, []);

  // 处理外部点击和键盘事件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const button = buttonRef.current;
      const menu = menuRef.current;
      
      if (
        isOpen &&
        button &&
        menu &&
        !button.contains(target) &&
        !menu.contains(target)
      ) {
        setIsOpen(false);
        menu.classList.add('hidden');
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        menuRef.current?.classList.add('hidden');
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      // 使用 setTimeout 避免立即触发
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
      }, 0);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    const mobileMenu = menuRef.current;
    if (mobileMenu) {
      if (newIsOpen) {
        mobileMenu.classList.remove('hidden');
        // 聚焦第一个菜单项
        setTimeout(() => {
          const firstMenuItem = mobileMenu.querySelector('a') as HTMLElement;
          firstMenuItem?.focus();
        }, 100);
      } else {
        mobileMenu.classList.add('hidden');
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle navigation menu"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      {isOpen ? (
        <X className="w-5 h-5 transition-transform duration-200" />
      ) : (
        <Menu className="w-5 h-5 transition-transform duration-200" />
      )}
    </button>
  );
}