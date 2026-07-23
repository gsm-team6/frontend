import React, { useState, useEffect } from 'react';
import ReportForm from './ReportForm';

const StudentDashboard = ({ refreshKey, onDataUpdate, user }) => {
  const [reports, setReports] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 상세 보기 모달 상태 관리
  const [selectedReport, setSelectedReport] = useState(null); 

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reports');
        const result = await response.json();
        if (result.success) setReports(result.data);
      } catch (error) {
        console.error('목록 조회 에러:', error);
      }
    };
    fetchReports();
  }, [refreshKey]);

  const getBadgeStyle = (status) => {
    if (status === '완료') return { bg: '#e8f5e9', color: '#2e7d32' };
    if (status === '처리중') return { bg: '#fff3e0', color: '#ef6c00' };
    return { bg: '#e3f2fd', color: '#1976d2' };
  };

  return (
    <div>
      {/* 1. 신고 작성 모달 */}
      <ReportForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onReportSubmitted={onDataUpdate} 
        user={user} // 👈 여기에 user={user} 를 추가해 주세요!
      />

      {/* 2. 상세 보기 모달 */}
      {selectedReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '24px',
            width: '90%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>📄 신고 상세 정보</h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#999' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>신고 유형 및 상태</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1em', marginRight: '10px' }}>{selectedReport.report_type}</span>
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
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#333' }}>
                  {selectedReport.location}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>상세 내용</span>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#333', minHeight: '80px', lineHeight: '1.5' }}>
                  {selectedReport.content}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                <span>작성자: {selectedReport.users ? selectedReport.users.name : '알수없음'}</span>
                <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상단 안내 배너 및 신고 버튼 */}
      <div style={{ 
        backgroundColor: '#74B9FF', color: 'white', padding: '30px', 
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
            backgroundColor: 'white', color: '#74B9FF', border: 'none', 
            padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', 
            cursor: 'pointer', fontSize: '1em', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          + 신고하기
        </button>
      </div>

      {/* 가로 리스트 영역 */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', padding: '10px 0' }}>
        <h3 style={{ padding: '0 20px', color: '#333', marginBottom: '10px' }}>최근 신고 목록</h3>
        
        {reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>접수된 신고가 없습니다.</div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              style={{ 
                display: 'flex', alignItems: 'center', padding: '15px 20px', 
                borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
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
              <div style={{ width: '100px', fontWeight: 'bold', color: '#333', flexShrink: 0 }}>
                {report.report_type}
              </div>
              <div style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#555' }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>[{report.location}]</span>
                {report.content}
              </div>
              <div style={{ width: '100px', textAlign: 'right', fontSize: '0.85em', color: '#999', flexShrink: 0 }}>
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