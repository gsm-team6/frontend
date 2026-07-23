import React, { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import { apiUrl } from '../apiConfig';

const Header = ({ user, viewMode, setViewMode, onLogout, refreshKey }) => {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notiRef = useRef(null);
  const notiButtonRef = useRef(null);

  // 실제 로그인한 유저의 ID로 알림 불러오기
  const fetchNotifications = async () => {
    if (viewMode !== 'STUDENT') return;
    try {
      const response = await fetch(apiUrl(`/api/reports/notifications/me?user_id=${user.id}`));
      const result = await response.json();
      if (result.success) setNotifications(result.data);
    } catch (error) {
      console.error('알림 조회 에러:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [refreshKey, viewMode, user.id]);

  useEffect(() => {
    if (!isNotiOpen) return;

    const handleClickOutside = (event) => {
      if (
        notiRef.current && !notiRef.current.contains(event.target) &&
        notiButtonRef.current && !notiButtonRef.current.contains(event.target)
      ) {
        setIsNotiOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotiOpen]);

  const unreadCount = notifications.filter(noti => !noti.is_read).length;

  const handleNotiToggle = async () => {
    const willOpen = !isNotiOpen;
    setIsNotiOpen(willOpen);

    if (willOpen && unreadCount > 0) {
      try {
        await fetch(apiUrl('/api/reports/notifications/read'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        setNotifications(prev => prev.map(noti => ({ ...noti, is_read: true })));
      } catch (error) {
        console.error('알림 읽음 처리 에러:', error);
      }
    }
  };

  const handleDeleteNotification = async (notiId) => {
    try {
      const response = await fetch(apiUrl(`/api/reports/notifications/${notiId}`), {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(prev => prev.filter(noti => noti.id !== notiId));
      }
    } catch (error) {
      console.error('알림 삭제 에러:', error);
    }
  };

  return (
    <header style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '15px 30px', backgroundColor: 'var(--bg-secondary)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' 
    }}>
      <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4em' }}>
        <span style={{ color: '#74B9FF', marginRight: '8px' }}></span>
        안전 관리 시스템
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* 접속자 환영 메시지 */}
        <span style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
          <b>{user.name}</b> 님
        </span>

        {/* ★ 권한 제어: DB의 role이 'ADMIN'인 계정에게만 전환 버튼 노출! */}
        {user.role === 'ADMIN' && (
          <button 
            onClick={() => {
              setViewMode(viewMode === 'STUDENT' ? 'ADMIN' : 'STUDENT');
              setIsNotiOpen(false); 
            }}
            style={{ 
              padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            {viewMode === 'STUDENT' ? '관리자 모드' : '학생 모드'}
          </button>
        )}

        {/* 학생 화면을 보고 있을 때만 알림 아이콘 표시 */}
        {viewMode === 'STUDENT' && (
          <div style={{ position: 'relative' }}>
            <button 
              ref={notiButtonRef}
              onClick={handleNotiToggle}
              className="notification-toggle-btn"
              style={{ position: 'relative' }}
            >
              🔔️
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  backgroundColor: '#ff7675', color: 'white', fontSize: '0.65em',
                  padding: '4px 7px', borderRadius: '999px', fontWeight: '700', minWidth: '22px', textAlign: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotiOpen && (
              <div ref={notiRef} className="notification-panel">
                <h4>내 알림</h4>
                {notifications.length === 0 ? (
                  <p className="notification-empty">새로운 알림이 없습니다.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.map((noti) => (
                      <li key={noti.id} className={`notification-item ${noti.is_read ? '' : 'unread'}`}>
                        <div style={{ flexGrow: 1, paddingRight: '10px' }}>
                          <p>{noti.message}</p>
                          <span>{new Date(noti.created_at).toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteNotification(noti.id)}
                          className="notification-delete-btn"
                          title="삭제"
                        >&times;</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <ThemeToggle />

        {/* 로그아웃 버튼 추가 */}
        <button 
          onClick={onLogout}
          style={{ 
            padding: '8px 16px', backgroundColor: '#ff7675', color: 'white', 
            border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em'
          }}
        >
          로그아웃
        </button>

      </div>
    </header>
  );
};

export default Header;