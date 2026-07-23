import React, { useEffect, useState } from 'react';

const NotificationInbox = ({ refreshKey }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      // 프론트에서 user_id 1번 학생으로 하드코딩하여 테스트
      const response = await fetch(apiUrl('/api/reports/notifications/me?user_id=1'));
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('알림 조회 에러:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [refreshKey]); // refreshKey가 바뀔 때마다(관리자가 완료 처리할 때마다) 새로고침

  return (
    <div style={{ border: '1px solid #4a90e2', padding: '20px', borderRadius: '8px', maxWidth: '500px', marginBottom: '20px' }}>
      <h3 style={{ color: '#4a90e2', marginTop: 0 }}>내 알림함</h3>
      {notifications.length === 0 ? (
        <p style={{ color: '#666' }}>도착한 알림이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notifications.map((noti) => (
            <li key={noti.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '0.95em' }}>
              <span style={{ display: 'block', marginBottom: '5px' }}>{noti.message}</span>
              <span style={{ fontSize: '0.8em', color: '#999' }}>
                {new Date(noti.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationInbox;