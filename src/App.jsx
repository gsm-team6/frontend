import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  const [user, setUser] = useState(null); 
  const [viewMode, setViewMode] = useState('STUDENT'); // 현재 보고 있는 화면 모드
  const [refreshKey, setRefreshKey] = useState(0);

  // 새로고침해도 로그인이 풀리지 않도록 localStorage에서 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // 관리자면 기본으로 관리자 화면, 학생이면 학생 화면 띄우기
      setViewMode(parsedUser.role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
    }
  }, []);

  // Auth.jsx에서 로그인 성공 시 호출될 함수
  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setViewMode(userData.role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
  };

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setViewMode('STUDENT');
  };

  // 데이터 갱신용 트리거
  const handleDataUpdate = () => setRefreshKey(old => old + 1);

  // 로그인을 안 했다면 Auth 컴포넌트(로그인/회원가입 창)만 보여줌
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Header 
        user={user} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        onLogout={handleLogout}
        refreshKey={refreshKey} 
      />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        {viewMode === 'ADMIN' ? (
          <AdminDashboard refreshKey={refreshKey} onStatusChanged={handleDataUpdate} />
        ) : (
          <StudentDashboard refreshKey={refreshKey} onDataUpdate={handleDataUpdate} user={user} /> // 👈 끝에 user={user} 가 있는지!
        )}
      </div>
    </div>
  );
};

export default App;