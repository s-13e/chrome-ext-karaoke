// ConfirmModal.tsx
// 녹음 저장 확인을 위한 커스텀 모달
import React from 'react';
import styles from './ConfirmModal.module.css';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  onCancel: () => void; // 취소 (돌아가기)
  onDiscardAndLeave: () => void; // 저장 안 하고 나가기
  onSaveAndLeave: () => void; // 저장하고 나가기
}

/**
 * 녹음 저장 확인 모달
 * - 취소: 녹음 화면으로 돌아가기
 * - 저장 안 함: 저장하지 않고 나가기
 * - 저장: 저장하고 나가기
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({ onCancel, onDiscardAndLeave, onSaveAndLeave }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{t('extAcapellaSaveAndLeaveConfirm')}</h2>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {t('extCancel')}
          </button>
          <button className={styles.discardButton} onClick={onDiscardAndLeave}>
            {t('extDontSave')}
          </button>
          <button className={styles.saveButton} onClick={onSaveAndLeave}>
            {t('extSave')}
          </button>
        </div>
      </div>
    </div>
  );
};
