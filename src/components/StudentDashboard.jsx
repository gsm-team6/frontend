import React, { useState, useEffect, useCallback } from 'react';
import ReportForm from './ReportForm';
import { apiUrl } from '../apiConfig';

const StudentDashboard = ({ refreshKey, onDataUpdate, user }) => {
  const [reports, setReports] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 상세 보기 모달 상태 관리
  const [selectedReport, setSelectedReport] = useState(null); 

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/reports'));
      const result = await response.json();
      if (result.success) setReports(result.data);
    } catch (error) {
      console.error('목록 조회 에러:', error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, [refreshKey, fetchReports]);

  const getBadgeStyle = (status) => {
    if (status === '완료') return { bg: '#d1fae5', color: '#166534' };
    if (status === '처리중') return { bg: '#ffedd5', color: '#c2410c' };
    return { bg: '#dbeafe', color: '#1d4ed8' };
  };

  return (
    <div>
      {/* 1. 신고 작성 모달 */}
      <ReportForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onReportSubmitted={onDataUpdate} 
        user={user}
      />

      {/* 2. 상세 보기 모달 */}
      {selectedReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--modal-bg)', padding: '30px', borderRadius: '24px',
            width: '90%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>신고 상세 정보</h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>신고 유형 및 상태</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1em', marginRight: '10px', color: 'var(--text-primary)' }}>{selectedReport.report_type}</span>
                <span style={{ 
                  backgroundColor: getBadgeStyle(selectedReport.status).bg, 
                  color: getBadgeStyle(selectedReport.status).color, 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold' 
                }}>
                  {selectedReport.status}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>위치</span>
                <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                  {selectedReport.location}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>상세 내용</span>
                <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', color: 'var(--text-primary)', minHeight: '80px', lineHeight: '1.5', fontFamily: 'inherit' }}>
                  {selectedReport.content || selectedReport.description || '신고 내용이 없습니다.'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '5px', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                <span>작성자: {selectedReport.users ? selectedReport.users.name : '알수없음'}</span>
                <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상단 안내 배너 및 신고 버튼 */}
      <div style={{ 
        backgroundColor: 'var(--primary)', color: 'var(--primary-text)', padding: '30px', 
        borderRadius: '24px', display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: '30px', boxShadow: '0 4px 15px rgba(116, 185, 255, 0.3)'
      }}>
        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5em' }}>교내 안전 위험 신고</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>위험한 곳을 발견하셨나요? 즉시 알려주세요!</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ 
            backgroundColor: 'var(--card-bg)', color: 'var(--primary)', border: 'none', 
            padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', 
            cursor: 'pointer', fontSize: '1em', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          + 신고하기
        </button>
      </div>

      {/* 가로 리스트 영역 */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', padding: '10px 0' }}>
        <h3 style={{ padding: '0 20px', color: 'var(--text-primary)', marginBottom: '10px' }}>최근 신고 목록</h3>
        
        {reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>접수된 신고가 없습니다.</div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              style={{ 
                display: 'flex', alignItems: 'center', padding: '15px 20px', 
                borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '80px', flexShrink: 0 }}>
                <span style={{ 
                  backgroundColor: getBadgeStyle(report.status).bg, 
                  color: getBadgeStyle(report.status).color, 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold' 
                }}>
                  {report.status}
                </span>
              </div>
              <div style={{ width: '100px', fontWeight: 'bold', color: 'var(--text-primary)', flexShrink: 0 }}>
                {report.report_type}
              </div>
              <div style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>[{report.location}]</span>
                {report.content}
              </div>
              <div style={{ width: '100px', textAlign: 'right', fontSize: '0.85em', color: 'var(--text-secondary)', flexShrink: 0 }}>
                {new Date(report.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;