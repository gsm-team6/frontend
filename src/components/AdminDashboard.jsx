import React, { useEffect, useState, useCallback } from 'react';
import { apiUrl } from '../apiConfig';

const AdminDashboard = ({ refreshKey, onStatusChanged }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]); // 체크된 항목 ID 배열
  const [selectedReport, setSelectedReport] = useState(null); // 상세 보기용 모달 상태
  const [cleanupDays, setCleanupDays] = useState('30');

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/reports'));
      const result = await response.json();
      if (result.success) {
        setReports(result.data);
        setSelectedIds([]); // 새로고침 시 체크박스 초기화
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

  // 1. 상태 변경 함수
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
        fetchReports();
        if (onStatusChanged) onStatusChanged();
      }
    } catch (error) {
      console.error('상태 변경 에러:', error);
    }
  };

  // 2. 체크박스 단일/전체 선택 로직
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(reports.map(r => r.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (e, id) => {
    e.stopPropagation(); // 행 클릭(상세보기) 이벤트 방지
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 4. 선택 일괄 삭제 함수 ('완료' 상태만 삭제됨)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert('삭제할 항목을 먼저 선택해주세요.');
    if (!window.confirm(`선택한 ${selectedIds.length}개의 신고를 모두 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(apiUrl('/api/reports/bulk-delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedIds([]); // 삭제 후 체크박스 초기화
        fetchReports();
      }
    } catch (error) {
      console.error('일괄 삭제 에러:', error);
    }
  };

  // 5. 완료된 신고 정리 함수 (조건 3: 드롭다운 기간 반영되도록 수정)
  const handleCleanup = async () => {
    const periodText = cleanupDays === 'all' ? '전체' : `${cleanupDays}일 경과된`;
    if (!window.confirm(`${periodText} '완료' 상태의 신고를 모두 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(apiUrl('/api/reports/cleanup'), { 
        method: 'POST', // 백엔드 설정에 맞게 POST로 변경
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: cleanupDays })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchReports();
      }
    } catch (error) {
      console.error('오래된 신고 정리 에러:', error);
    }
  };
  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>목록을 불러오는 중입니다...</div>;

  return (
    <div style={{ backgroundColor: 'var(--admin-panel-bg)', borderRadius: '20px', boxShadow: '0 18px 55px rgba(15,23,42,0.14)', overflow: 'hidden' }}>
      
      {/* --- 상세 보기 모달 --- */}
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
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>유형 및 상태</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1em', marginRight: '10px' }}>{selectedReport.report_type}</span>
                <span style={{ color: selectedReport.status === '완료' ? '#2e7d32' : '#1976d2', fontWeight: 'bold' }}>[{selectedReport.status}]</span>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>위치</span>
                <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', color: 'var(--text-primary)' }}>{selectedReport.location}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>상세 내용</span>
                <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', minHeight: '80px', lineHeight: '1.5', color: 'var(--text-primary)', fontFamily: 'inherit' }}>{selectedReport.content || selectedReport.description || '신고 내용이 없습니다.'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- 상세 보기 모달 끝 --- */}

      {/* 메일함 툴바 (버튼 영역) */}
      <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--admin-accent-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--admin-accent-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <input 
            type="checkbox" 
            style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
            onChange={handleSelectAll}
            checked={reports.length > 0 && selectedIds.length === reports.length}
          />
          {/* ★ 버튼 텍스트 변경: (완료만) 제거 */}
          <button 
            onClick={handleBulkDelete}
            style={{ padding: '7px 14px', backgroundColor: 'var(--admin-accent)', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', color: '#ffffff', fontSize: '0.9em', fontWeight: '700', boxShadow: '0 8px 20px rgba(116,185,255,0.16)' }}
          >
            선택 삭제
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9em', color: 'var(--admin-accent-strong)', marginRight: '5px', fontWeight: '700' }}>총 {reports.length}건</span>
          
          {/* ★ 새로 추가된 드롭다운 */}
          <select 
            value={cleanupDays} 
            onChange={(e) => setCleanupDays(e.target.value)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
          >
            <option value="1">1일</option>
            <option value="7">7일</option>
            <option value="14">14일</option>
            <option value="30">30일</option>
            <option value="all">전체</option>
          </select>

          <button 
            onClick={handleCleanup}
            style={{ padding: '7px 14px', backgroundColor: 'var(--admin-accent)', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', color: '#ffffff', fontSize: '0.9em', fontWeight: '700', boxShadow: '0 8px 20px rgba(116,185,255,0.16)' }}
          >
            완료건 정리
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div style={{ marginTop: '20px' }}>
        {reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>접수된 신고가 없습니다.</div>
        ) : (
          reports.map((report) => {
            const isNew = report.status === '접수';
            const isCompleted = report.status === '완료';

            return (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)} // 행 클릭 시 상세 모달 오픈
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '16px 22px', 
                  borderRadius: '18px', margin: '0 16px 12px', 
                  backgroundColor: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-accent-border)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(15,23,42,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* 1. 체크박스 & 아이콘 */}
                <div style={{ marginRight: '15px', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                    checked={selectedIds.includes(report.id)}
                    onChange={(e) => handleSelectOne(e, report.id)}
                    onClick={(e) => e.stopPropagation()} // 클릭 시 행 이벤트 무시
                  />
                  <span>{isCompleted ? '✓' : ''}</span>
                </div>

                {/* 2. 발신자 (신고자) */}
                <div style={{ width: '100px', fontWeight: isNew ? 'bold' : 'normal', color: 'var(--text-primary)', flexShrink: 0 }}>
                  {report.users ? report.users.name : '알수없음'}
                </div>

                {/* 3. 제목 및 내용 요약 */}
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <span style={{ 
                    backgroundColor: isCompleted ? 'var(--surface-alt)' : 'var(--admin-accent-soft)', 
                    color: isCompleted ? 'var(--text-secondary)' : 'var(--admin-accent)',
                    padding: '4px 10px', borderRadius: '999px', fontSize: '0.75em', marginRight: '10px', fontWeight: '700'
                  }}>
                    {report.report_type}
                  </span>
                  <span style={{ fontWeight: isNew ? 'bold' : 'normal', color: 'var(--text-primary)', marginRight: '8px' }}>
                    [{report.location}]
                  </span>
                  <span style={{ color: isNew ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.95em' }}>
                    - {report.content}
                  </span>
                </div>

                {/* 4. 우측 컨트롤 (상태, 날짜, 개별삭제) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0, marginLeft: '20px' }}>
                  <select 
                    value={report.status}
                    onClick={(e) => e.stopPropagation()} // 드롭다운 클릭 시 행 이벤트 무시
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(report.id, e.target.value);
                    }}
                    style={{ 
                      padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', 
                      backgroundColor: isCompleted ? 'var(--surface)' : 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="접수">접수</option>
                    <option value="처리중">처리중</option>
                    <option value="완료">완료</option>
                  </select>
                  
                  <div style={{ width: '80px', textAlign: 'center', fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;