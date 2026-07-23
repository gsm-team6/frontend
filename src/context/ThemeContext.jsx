// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. localStorage에 저장된 테마가 있으면 가져오고, 없으면 'light' 기본 적용
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // 2. 테마 변경 시 html (<body> 태그)에 data-theme 속성을 업데이트하고 localStorage에 저장
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. 토글 함수
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 다른 컴포넌트에서 쉽게 커스텀 훅으로 불러와 사용할 수 있도록 수출
export const useTheme = () => useContext(ThemeContext);