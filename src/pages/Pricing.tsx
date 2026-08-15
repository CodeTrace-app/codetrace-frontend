import { Link } from 'react-router-dom';
import './pricing.css';

export default function Pricing() {
  return (
    <div className="pricing-container">
      <div className="pricing-wrapper">
        {/* 1. 상단 타이틀 */}
        <section className="pricing-header">
          <h1>코드 트레이스 요금제</h1>
          <p>조직당 정액 구독 · 인원 무제한 · 인덱싱 레포 수 기준</p>
        </section>

        {/* 2. 요금제 카드 */}
        <section className="pricing-cards">
          {/* Starter 플랜 */}
          <div className="pricing-card">
            <p className="pricing-card__subtitle">소규모 팀을 위한 시작 플랜</p>
            <h2 className="pricing-card__title">Starter</h2>
            <p className="pricing-card__price">월 29,000원</p>
            <Link to="/pricing/subscribe" state={{ plan: 'Starter' }} className="pricing-card__btn">구독 신청하기</Link>
            <ul className="pricing-card__features">
              <li>조직당 / 월정액</li>
              <li>인덱싱 레포 3개</li>
              <li>인원 무제한</li>
              <li>작성 배경 요약</li>
              <li>영향 범위 조회 (2단계)</li>
              <li>PR 경고 코멘트</li>
            </ul>
          </div>

          {/* Team 플랜 */}
          <div className="pricing-card">
            <p className="pricing-card__subtitle">성장하는 개발 조직의 표준 플랜</p>
            <h2 className="pricing-card__title">Team</h2>
            <p className="pricing-card__price">월 89,000원</p>
            <Link to="/pricing/subscribe" state={{ plan: 'Team' }} className="pricing-card__btn">구독 신청하기</Link>
            <ul className="pricing-card__features">
              <li>조직당 / 월정액</li>
              <li>인덱싱 레포 10개</li>
              <li>인원 무제한</li>
              <li>작성 배경 요약</li>
              <li>영향 범위 조회 (2단계)</li>
              <li>PR 경고 코멘트</li>
              <li>질의 이력 기록 및 관리자 조회</li>
            </ul>
          </div>

          {/* Pro/Enterprise 플랜 (디자인 원본 오타 감안) */}
          <div className="pricing-card">
            <p className="pricing-card__subtitle">대규모 레거시 코드베이스 전용</p>
            <h2 className="pricing-card__title">Pro</h2>
            <p className="pricing-card__price">월 249,000원</p>
            <Link to="/pricing/subscribe" state={{ plan: 'Pro' }} className="pricing-card__btn">구독 신청하기</Link>
            <ul className="pricing-card__features">
              <li>조직당 / 월정액</li>
              <li>인덱싱 레포 무제한</li>
              <li>인원 무제한</li>
              <li>작성 배경 요약</li>
              <li>영향 범위 조회 (2단계)</li>
              <li>PR 경고 코멘트</li>
              <li>질의 이력 기록 및 관리자 조회</li>
              <li>우선 기술 지원</li>
            </ul>
          </div>
        </section>

        {/* 3. 플랜 비교 표 */}
        <section className="pricing-table-section">
          <h2>플랜 비교</h2>
          <div className="pricing-table-wrapper">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>사용자</th>
                  <th>대상 파일</th>
                  <th>대상 함수</th>
                  <th>질의 요청</th>
                </tr>
              </thead>
              <tbody>
                {/* 임시 데이터 행 5개 생성 */}
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><span className="placeholder-pill"></span></td>
                    <td><span className="placeholder-pill"></span></td>
                    <td><span className="placeholder-pill"></span></td>
                    <td><span className="placeholder-pill"></span></td>
                    <td><span className="placeholder-pill"></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 자주 묻는 질문 */}
        <section className="pricing-faq">
          <h2>자주 묻는 질문</h2>
          
          <div className="faq-item">
            <p className="faq-q">Q. 인원 추가 비용이 있나요?</p>
            <p className="faq-a">아니오. 모든 플랜은 조직당 정액이며 인원 수에 따른 추가 요금이 없습니다.</p>
          </div>
          
          <div className="faq-item">
            <p className="faq-q">Q. 레포 수를 초과하면 어떻게 되나요?</p>
            <p className="faq-a">인덱싱 대상 레포 수가 플랜 한도를 초과하면 추가 레포 선택이 제한됩니다.<br/>상위 플랜으로 업그레이드하면 즉시 해제됩니다.</p>
          </div>

          <div className="faq-item">
            <p className="faq-q">Q. 언제든지 해지할 수 있나요?</p>
            <p className="faq-a">네, 구독은 언제든지 해지될 수 있으며 남은 기간은 정상 사용 가능합니다.</p>
          </div>
        </section>

        {/* 5. 하단 CTA 버튼 */}
        <section className="pricing-cta">
          <h2>지금 바로 시작하세요</h2>
          <p>레거시 코드의 맥락을 팀 전체가 공유할 수 있습니다.</p>
          <Link to="/pricing/subscribe" className="pricing-card__btn">구독 신청하기</Link>
        </section>
      </div>
    </div>
  );
}