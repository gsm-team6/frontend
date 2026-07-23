import React, { useState } from 'react';
import { apiUrl } from '../apiConfig';

// isOpen(열림 상태)과 onClose(닫기 함수)를 추가로 받습니다.
const ReportForm = ({ isOpen, onClose, onReportSubmitted, user }) => { // 👈 user 추가
  const [formData, setFormData] = useState({
    location: '',
    report_type: '시설파손',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/reports'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: formData.report_type,
          location: formData.location,
          content: formData.content,
          title: `${formData.report_type} 신고`,
          description: formData.content,
          user_id: user.id,
          author: user.name
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('신고가 성공적으로 접수되었습니다.');
        setFormData({ location: '', report_type: '시설파손', content: '' });
        if (onReportSubmitted) onReportSubmitted();
        onClose(); // 제출 성공 시 팝업 닫기
      } else {
        alert(result.message || '신고 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 호출 에러:', error);
      alert('서버와 연결할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // isOpen이 false면 아무것도 렌더링하지 않음(숨김)
  if (!isOpen) return null;

  return (
    // 반투명한 검은색 배경 (클릭 시 닫히도록 설정할 수도 있지만 여기선 생략)
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1100,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      {/* 팝업 컨텐츠 창 */}
      <div style={{
        backgroundColor: 'var(--modal-bg)', padding: '30px', borderRadius: '24px',
        width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>위험물 신고하기</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.9em', color: 'var(--text-secondary)', fontWeight: 'bold' }}>신고 유형</label>
            <select name="report_type" value={formData.report_type} onChange={handleChange}
              style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '12px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', outline: 'none', fontFamily: 'inherit' }}>
              <option value="시설파손">시설파손</option>
              <option value="화재위험">화재위험</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>위치 (자세히)</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="예: 본관 3층 복도 끝"
              style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '12px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>신고 내용</label>
            <textarea name="content" value={formData.content} onChange={handleChange} required placeholder="상세한 내용을 적어주세요." rows="4"
              style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '12px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', boxSizing: 'border-box', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
          </div>
          <button type="submit"
            disabled={isSubmitting}
            style={{
              padding: '15px',
              backgroundColor: isSubmitting ? '#a4c9ff' : 'var(--primary)',
              color: 'var(--primary-text)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: isSubmitting ? 0.7 : 1,
              fontFamily: 'inherit'
            }}>
            {isSubmitting ? '제출 중...' : '신고 제출하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;