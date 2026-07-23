import React, { useEffect, useState } from 'react';

const AdminDashboard = ({ refreshKey, onStatusChanged }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]); // 체크된 항목 ID 배열
  const [selectedReport, setSelectedReport] = useState(null); // 상세 보기용 모달 상태

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports');
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
  };

  useEffect(() => {
    fetchReports();
  }, [refreshKey]);

  // 1. 상태 변경 함수
  const handleStatusChange = async (reportId, newStatus) => {
    const confirmChange = window.confirm(`상태를 '${newStatus}'(으)로 변경하시겠습니까?`);
    if (!confirmChange) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/status`, {
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

  // 3. 개별 삭제 함수 (상태 무관하게 삭제 가능)
  const handleDeleteIndividual = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('이 신고를 정말 삭제하시겠습니까? (상태와 무관하게 즉시 삭제됩니다)')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) fetchReports();
    } catch (error) {
      console.error('개별 삭제 에러:', error);
    }
  };

  // 4. 선택 일괄 삭제 함수 ('완료' 상태만 삭제됨)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert('삭제할 항목을 먼저 선택해주세요.');
    if (!window.confirm(`선택한 ${selectedIds.length}개의 항목 중 '완료' 상태인 신고만 삭제됩니다. 계속하시겠습니까?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/reports/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchReports();
      }
    } catch (error) {
      console.error('일괄 삭제 에러:', error);
    }
  };

  // 5. 오래된 신고 정리 함수 (30일 지난 '완료'만 삭제됨)
  const handleCleanup = async () => {
    if (!window.confirm("접수일로부터 30일이 지난 '완료' 상태의 신고를 모두 삭제하시겠습니까?")) return;

    try {
      const response = await fetch('http://localhost:5000/api/reports/cleanup', { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchReports();
      }
    } catch (error) {
      console.error('오래된 신고 정리 에러:', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>목록을 불러오는 중입니다...</div>;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      
      {/* --- 상세 보기 모달 --- */}
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
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>유형 및 상태</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1em', marginRight: '10px' }}>{selectedReport.report_type}</span>
                <span style={{ color: selectedReport.status === '완료' ? '#2e7d32' : '#1976d2', fontWeight: 'bold' }}>[{selectedReport.status}]</span>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>위치</span>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>{selectedReport.location}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#888', display: 'block', marginBottom: '4px' }}>상세 내용</span>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', minHeight: '80px', lineHeight: '1.5' }}>{selectedReport.content}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- 상세 보기 모달 끝 --- */}

      {/* 메일함 툴바 (버튼 영역) */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <input 
            type="checkbox" 
            style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
            onChange={handleSelectAll}
            checked={reports.length > 0 && selectedIds.length === reports.length}
          />
          <button 
            onClick={handleBulkDelete}
            style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#e74c3c', fontSize: '0.9em' }}
          >
            선택 삭제 (완료만)
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9em', color: '#666' }}>총 {reports.length}건</span>
          <button 
            onClick={handleCleanup}
            style={{ padding: '6px 12px', backgroundColor: '#f8fafc', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#555', fontSize: '0.9em' }}
          >
            🧹 30일 경과 정리
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div>
        {reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>접수된 신고가 없습니다.</div>
        ) : (
          reports.map((report) => {
            const isNew = report.status === '접수';
            const isCompleted = report.status === '완료';

            return (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)} // 행 클릭 시 상세 모달 오픈
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '12px 20px', 
                  borderBottom: '1px solid #f0f0f0', 
                  backgroundColor: isCompleted ? '#f9f9f9' : '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isCompleted ? '#f0f0f0' : '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isCompleted ? '#f9f9f9' : '#ffffff'}
              >
                {/* 1. 체크박스 & 아이콘 */}
                <div style={{ marginRight: '15px', color: '#ccc', display: 'flex', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                    checked={selectedIds.includes(report.id)}
                    onChange={(e) => handleSelectOne(e, report.id)}
                    onClick={(e) => e.stopPropagation()} // 클릭 시 행 이벤트 무시
                  />
                  <span>{isCompleted ? '✓' : '⭐'}</span>
                </div>

                {/* 2. 발신자 (신고자) */}
                <div style={{ width: '100px', fontWeight: isNew ? 'bold' : 'normal', color: '#333', flexShrink: 0 }}>
                  {report.users ? report.users.name : '알수없음'}
                </div>

                {/* 3. 제목 및 내용 요약 */}
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <span style={{ 
                    backgroundColor: isCompleted ? '#eee' : '#e3f2fd', 
                    color: isCompleted ? '#888' : '#1976d2',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em', marginRight: '10px', fontWeight: 'bold'
                  }}>
                    {report.report_type}
                  </span>
                  <span style={{ fontWeight: isNew ? 'bold' : 'normal', color: '#333', marginRight: '8px' }}>
                    [{report.location}]
                  </span>
                  <span style={{ color: isNew ? '#555' : '#999', fontSize: '0.95em' }}>
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
                      padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', 
                      backgroundColor: isCompleted ? '#f0f0f0' : '#fff', color: '#333', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="접수">접수</option>
                    <option value="처리중">처리중</option>
                    <option value="완료">완료</option>
                  </select>
                  
                  <div style={{ width: '80px', textAlign: 'center', fontSize: '0.85em', color: '#888' }}>
                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>

                  <button 
                    onClick={(e) => handleDeleteIndividual(e, report.id)} // 휴지통 버튼
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', 
                      color: '#ff7675', padding: '5px' 
                    }}
                    title="개별 삭제"
                  >
                    🗑️
                  </button>
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