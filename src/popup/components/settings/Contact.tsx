import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfVhvBVQBG5kfS3npBTMBlTfR1t5uYTg73iRJJG612MmdNhKw/viewform?usp=header';

export function Contact() {
  const { t } = useTranslation();
  const handleClick = () => {
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.settingsContent} style={{ textAlign: 'center', padding: '40px 20px' }}>
      <button
        className={styles.settingsButton}
        type="button"
        onClick={handleClick}
        style={{ fontSize: '1.1rem', padding: '12px 24px' }}
      >
        {t('extContactUs')}
      </button>
    </div>
  );
}
