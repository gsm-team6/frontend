import React, { useState } from 'react';
import { apiUrl } from '../apiConfig';
import { useDialog } from '../context/DialogContext';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // 입력 시 에러 메시지 초기화
  };

  // 탭 전환 시 폼 초기화
  const toggleTab = (loginState) => {
    setIsLogin(loginState);
    setErrorMsg('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const { alert } = useDialog();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // --- 회원가입 시 클라이언트 1차 유효성 검사 ---
    if (!isLogin) {
      if (!formData.email.endsWith('@gsm.hs.kr')) {
        return setErrorMsg('이메일은 @gsm.hs.kr 도메인만 사용할 수 있습니다.');
      }
      if (formData.password.length < 6 || formData.password.length > 20) {
        return setErrorMsg('비밀번호는 6자리 이상 20자리 이하이어야 합니다.');
      }
      if (formData.password !== formData.confirmPassword) {
        return setErrorMsg('비밀번호가 일치하지 않습니다.');
      }
    }

    // API 호출
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        return setErrorMsg(result.message || '오류가 발생했습니다.');
      }

      if (isLogin) {
        // 로그인 성공 시 토큰과 유저 정보 상위(App)로 전달
        await alert(`${result.user.name}님, 환영합니다!`);
        onLoginSuccess(result.token, result.user);
      } else {
        // 회원가입 성공 시 로그인 탭으로 이동
        await alert('회원가입이 완료되었습니다! 로그인해 주세요.');
        toggleTab(true);
      }
    } catch (error) {
      console.error('인증 에러:', error);
      setErrorMsg('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '80vh', padding: '20px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)', padding: '40px 30px', borderRadius: '24px',
        width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}>
        
        {/* 상단 탭 (로그인 / 회원가입) */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #f0f0f0' }}>
          <button
            onClick={() => toggleTab(true)}
            style={{
              flex: 1, padding: '12px', border: 'none', background: 'none',
              fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer',
              color: isLogin ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: isLogin ? '3px solid var(--primary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            로그인
          </button>
          <button
            onClick={() => toggleTab(false)}
            style={{
              flex: 1, padding: '12px', border: 'none', background: 'none',
              fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer',
              color: !isLogin ? '#74B9FF' : '#aaa',
              borderBottom: !isLogin ? '3px solid #74B9FF' : 'none',
              marginBottom: '-2px'
            }}
          >
            회원가입
          </button>
        </div>

        {/* 에러 메시지 상자 */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#ffeaea', color: '#e74c3c', padding: '10px 14px',
            borderRadius: '10px', fontSize: '0.85em', marginBottom: '20px',
            textAlign: 'center', fontWeight: 'bold'
          }}>
            {errorMsg}
          </div>
        )}

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 회원가입 시에만 이름 입력 필드 노출 */}
          {!isLogin && (
            <div>
              <label style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="이름을 입력해주세요."
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd',
                  boxSizing: 'border-box', outline: 'none', fontSize: '0.95em'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@gsm.hs.kr"
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd',
                boxSizing: 'border-box', outline: 'none', fontSize: '0.95em'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              비밀번호 { !isLogin && <span style={{ color: '#999', fontWeight: 'normal' }}>(6~20자)</span> }
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="6자 이상 20자 이하로 입력 해주세요."
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd',
                boxSizing: 'border-box', outline: 'none', fontSize: '0.95em'
              }}
            />
          </div>

          {/* 회원가입 시에만 비밀번호 확인 필드 노출 */}
          {!isLogin && (
            <div>
              <label style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="6자 이상 20자 이하로 입력 해주세요."
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd',
                  boxSizing: 'border-box', outline: 'none', fontSize: '0.95em'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: '14px', backgroundColor: 'var(--primary)', color: 'var(--primary-text)',
              border: 'none', borderRadius: '12px', fontWeight: 'bold',
              fontSize: '1em', cursor: 'pointer', marginTop: '10px',
              boxShadow: '0 4px 12px rgba(116, 185, 255, 0.3)'
            }}
          >
            {isLogin ? '로그인하기' : '회원가입 신청'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Auth;