import React, { useEffect, useState, useCallback } from 'react';
import { apiUrl } from '../apiConfig';

// App.jsx에서 userRole과 onStatusChanged(알림함 갱신용)를 추가로 받습니다.
const ReportDashboard = ({ refreshKey, userRole, onStatusChanged }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/reports'));
      const result = await response.json();
      
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('목록 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, [refreshKey, fetchReports]);

  // ★ 관리자용 상태 변경 API 호출 함수
  const handleStatusChange = async (reportId, newStatus) => {
    const confirmChange = window.confirm(`상태를 '${newStatus}'(으)로 변경하시겠습니까?`);
    if (!confirmChange) return;

    try {
      const response = await fetch(apiUrl(`/api/reports/${reportId}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();

      if (result.success) {
        alert('상태가 변경되었습니다.');
        fetchReports(); // 목록 다시 불러오기
        if (onStatusChanged) onStatusChanged(); // App.jsx에 알려서 알림함도 새로고침
      }
    } catch (error) {
      console.error('상태 변경 에러:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status) => {
    if (status === '완료') return 'green';
    if (status === '처리중') return 'orange';
    return 'red';
  };

  if (loading) return <div>목록을 불러오는 중입니다...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '20px 0' }}>
      <h3>교내 안전 위험 신고 현황</h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px' }}>상태</th>
            <th style={{ padding: '10px' }}>유형</th>
            <th style={{ padding: '10px' }}>위치</th>
            <th style={{ padding: '10px' }}>내용</th>
            <th style={{ padding: '10px' }}>신고자</th>
            <th style={{ padding: '10px' }}>신고일</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>접수된 신고가 없습니다.</td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold', color: getStatusColor(report.status) }}>
                  {/* ★ 관리자일 경우 드롭다운, 학생일 경우 단순 텍스트 렌더링 */}
                  {userRole === 'ADMIN' ? (
                    <select 
                      value={report.status} 
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      style={{ padding: '4px', fontWeight: 'bold', color: getStatusColor(report.status) }}
                    >
                      <option value="접수">접수</option>
                      <option value="처리중">처리중</option>
                      <option value="완료">완료</option>
                    </select>
                  ) : (
                    report.status
                  )}
                </td>
                <td style={{ padding: '10px' }}>{report.report_type}</td>
                <td style={{ padding: '10px' }}>{report.location}</td>
                <td style={{ padding: '10px' }}>{report.content}</td>
                <td style={{ padding: '10px' }}>{report.users ? report.users.name : '알수없음'}</td>
                <td style={{ padding: '10px', fontSize: '0.9em', color: '#666' }}>
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDashboard;