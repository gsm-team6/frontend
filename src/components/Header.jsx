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
              style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', position: 'relative' }}
            >
              🔔️
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '0', right: '-5px',
                  backgroundColor: '#ff7675', color: 'white', fontSize: '0.5em',
                  padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotiOpen && (
              <div ref={notiRef} style={{
                position: 'absolute', top: '40px', right: '0', width: '320px',
                backgroundColor: 'var(--admin-noti-bg)', borderRadius: '16px', boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
                padding: '15px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--admin-accent-border)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--admin-noti-text)', borderBottom: '1px solid var(--admin-accent-border)', paddingBottom: '10px' }}>
                  내 알림
                </h4>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>새로운 알림이 없습니다.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.map((noti) => (
                      <li key={noti.id} style={{ 
                        padding: '14px 14px 14px 16px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '14px', border: '1px solid var(--admin-accent-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 8px 20px rgba(15,23,42,0.06)'
                      }}>
                        <div style={{ flexGrow: 1, paddingRight: '10px' }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.95em', color: 'var(--admin-noti-text)', lineHeight: '1.6', fontWeight: '500' }}>{noti.message}</p>
                          <span style={{ fontSize: '0.75em', color: 'var(--text-secondary)' }}>{new Date(noti.created_at).toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteNotification(noti.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.05em', padding: '0', lineHeight: '1' }}
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