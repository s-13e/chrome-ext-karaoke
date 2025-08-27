// FAQ.tsx
import styles from './FAQ.module.css';

const faqList = [
  {
    question: '외국어 가사를 번역하는 기능은 없나요?',
    answer: '네. 현재 번역 기능은 없으며, 앞으로도 구현할 예정은 없습니다.',
  },
  {
    question: '싱크가 안 맞아요.',
    answer:
      '불편을 드려서 죄송합니다. 현재 영상에서 가사 싱크 최적화 작업을 진행하고 있으며, 현재로서는 커스텀 싱크 조절 기능을 이용하여 조절해주세요. 다시 한번 불편을 드려서 죄송합니다!',
  },
  // ... 더 많은 FAQ 항목을 추가할 수 있습니다
];

export function FAQ() {
  return (
    <div className={styles.faqContent}>
      {faqList.map((item, idx) => (
        <div key={idx} className={styles.faqItem}>
          <div className={styles.faqQuestion}>{item.question}</div>
          <div className={styles.faqAnswer}>{item.answer}</div>
        </div>
      ))}
    </div>
  );
}
