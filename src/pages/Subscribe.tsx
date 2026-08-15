import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Subscribe.css';
import './Pricing.css';

const PLAN_DATA: Record<string, any> = {
  Starter: {
    subtitle: '소규모 팀을 위한 시작 플랜',
    price: '월 29,000원',
    features: ['조직당 / 월정액', '인덱싱 레포 3개', '인원 무제한', '작성 배경 요약', '영향 범위 조회 (2단계)', 'PR 경고 코멘트'],
  },
  Team: {
    subtitle: '성장하는 개발 조직의 표준 플랜',
    price: '월 89,000원',
    features: ['조직당 / 월정액', '인덱싱 레포 10개', '인원 무제한', '작성 배경 요약', '영향 범위 조회 (2단계)', 'PR 경고 코멘트', '질의 이력 기록 및 관리자 조회'],
  },
  Pro: {
    subtitle: '대규모 레거시 코드베이스 전용',
    price: '월 249,000원',
    features: ['조직당 / 월정액', '인덱싱 레포 무제한', '인원 무제한', '작성 배경 요약', '영향 범위 조회 (2단계)', 'PR 경고 코멘트', '질의 이력 기록 및 관리자 조회', '우선 기술 지원'],
  },
};

export default function Subscribe() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlanName = location.state?.plan || 'Starter';
  const currentPlan = PLAN_DATA[selectedPlanName];

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [userCount, setUserCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/pricing/success');
  };

  return (
    <div className="subscribe-container">
      <div className="subscribe-wrapper">
        <div 
          className="subscribe-header" onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>&lt;</span>
          <h1>구독 신청</h1>
        </div>

        <div className="subscribe-top">
          <div className="subscribe-left">
            <h2 className="section-title">구독 세부 정보</h2>
            <div className="billing-options">
              <div className={`billing-card ${billingCycle === 'monthly' ? 'active' : ''}`} onClick={() => setBillingCycle('monthly')}>
                <h3>월간 결제</h3>
                <p>팀 1개 당/월</p>
              </div>
              <div className={`billing-card ${billingCycle === 'yearly' ? 'active' : ''}`} onClick={() => setBillingCycle('yearly')}>
                <h3>연간 결제</h3>
                <p>팀 1개 당/월</p>
              </div>
            </div>

            <div className="box-input">
              <span>사용자 수</span>
              <div style={{ display: 'flex', gap: '15px', color: '#2b5fed', fontWeight: 'bold', fontSize: '18px' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setUserCount(Math.max(1, userCount - 1))}>－</span>
                <span style={{ color: '#333' }}>{userCount}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setUserCount(userCount + 1)}>＋</span>
              </div>
            </div>

            <h2 className="section-title">연락처</h2>
            <input type="email" className="box-input" placeholder="이메일" style={{ marginBottom: 0 }} />
          </div>

          <div className="subscribe-right">
            <div className="pricing-card" style={{ maxWidth: '100%', margin: 0 }}>
              <p className="pricing-card__subtitle">{currentPlan.subtitle}</p>
              <h2 className="pricing-card__title">{selectedPlanName}</h2>
              <p className="pricing-card__price">{currentPlan.price}</p>
              <ul className="pricing-card__features">
                {currentPlan.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <h2 className="section-title">신청 정보 입력</h2>
        <form className="subscribe-form-box" onSubmit={handleSubmit}>
          <div className="form-group"><label>담당자 이름</label><input type="text" required /></div>
          <div className="form-group"><label>회사(조직)명</label><input type="text" required /></div>
          <div className="form-group"><label>업무용 이메일</label><input type="email" required /></div>
          <div className="form-group"><label>연락처(전화번호)</label><input type="tel" required /></div>
          <div className="form-group"><label>인덱싱할 레포 수</label><input type="number" required /></div>
          <div className="form-group"><label>문의 사항(선택)</label><textarea></textarea></div>
          <button type="submit" className="submit-btn">신청서 제출</button>
        </form>

      </div>
    </div>
  );
}