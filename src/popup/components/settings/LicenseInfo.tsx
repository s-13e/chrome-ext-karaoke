import React from 'react';
import styles from './styles.module.css';

export const LicenseInfo: React.FC = () => {
  return (
    <div className={styles.menuSection}>
      <div className={styles.sectionLabel}>라이선스 정보</div>
      <p>본 확장 프로그램은 MIT 라이선스에 따라 배포됩니다. 소스 코드는 자유롭게 사용, 수정, 배포가 가능합니다.</p>
      <p>본 확장 프로그램은 다음 오픈소스 라이브러리를 사용하며, 각각의 라이선스 조건을 준수합니다.</p>
      <ul>
        <li>라이브러리 A - Apache 2.0 License</li>
        <li>라이브러리 B - MIT License</li>
        {/* 필요한 경우 추가 명시 */}
      </ul>
      <p>프로그램은 “있는 그대로” 제공되며, 사용 중 발생하는 문제에 대해서 개발자는 법적 책임을 지지 않습니다.</p>
      <p>개인정보 처리에 관한 자세한 내용은 개인정보처리방침 페이지를 참고하시기 바랍니다.</p>
      <p>저작권 © 2025 [개발자명 또는 회사명]. All rights reserved.</p>
    </div>
  );
};
