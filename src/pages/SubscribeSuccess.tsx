import { useLocation, useNavigate } from 'react-router-dom';
import './SubscribeSuccess.css';

export default function SubscribeSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    inquiryId = 381,
    message = '구독 신청이 정상적으로 접수되었습니다. 영업일 기준 1~2일 내 검토 후 안내드립니다.',
    plan = 'Business',
    orgName = 'Acme Corp',
    email = 'admin@acme.com'
  } = location.state || {};

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="success-container">
      <div className="success-header">
        <h1>신청이 접수되었습니다.</h1>
        <p>{message}</p>
      </div>

      <div className="receipt-box">
        <div className="receipt-header">
          <h2>접수 정보</h2>
          <span className="receipt-status">접수 완료</span>
        </div>
        
        <div className="receipt-grid">
          <div className="receipt-item">
            <label>접수 번호</label>
            <span>CT-{today.getFullYear()}-{String(inquiryId).padStart(5, '0')}</span>
          </div>
          <div className="receipt-item">
            <label>신청 일시</label>
            <span>{formattedDate}</span>
          </div>
          <div className="receipt-item">
            <label>신청 플랜</label>
            <span>{plan} 플랜</span>
          </div>
          <div className="receipt-item">
            <label>신청 조직</label>
            <span>{orgName}</span>
          </div>
          <div className="receipt-item">
            <label>담당자 이메일</label>
            <span>{email}</span>
          </div>
          <div className="receipt-item">
            <label>청구 주기</label>
            <span>월간 결제</span>
          </div>
        </div>
      </div>

      <div className="procedure-section">
        <h2>검토 절차 안내</h2>
        <ol className="procedure-list">
          <li>신청 내용 검토: 접수된 신청 내용을 영업일 기준 1~2일 내에 확인합니다.</li>
          <li>이메일 안내 발송: 검토 완료 후 담당자 이메일로 승인 여부와 활성화 방법을 안내드립니다.</li>
          <li>서비스 활성화: 안내에 따라 결제를 완료하면 즉시 서비스를 이용할 수 있습니다.</li>
        </ol>
      </div>

      <div className="success-footer">
        <p className="success-contact">문의가 있으시면 support@codetrace.io로 연락해 주세요.</p>
        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>대시보드로 이동</button>
          <button className="btn-secondary" onClick={() => navigate('/pricing')}>요금제 확인</button>
        </div>
      </div>
    </div>
  );
}