import { useEffect, useState } from 'react';
import styles from './styles.modules.css';
import { PauseIcon } from '@components/icons/PauseIcon';
import { PlayIcon } from '@components/icons/PlayIcon';
import { TimerPickerUI } from '@components/common/TimerPrickerUI';

export function Timer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  // 시간 입력값이 바뀔 때 totalSeconds 업데이트
  useEffect(() => {
    setTotalSeconds(hours * 3600 + minutes * 60 + seconds);
  }, [hours, minutes, seconds]);

  // 타이머 작동 처리
  useEffect(() => {
    if (!isPlaying) return;

    if (totalSeconds <= 0) {
      setIsPlaying(false);
      return;
    }
    const intervalId = setInterval(() => {
      setTotalSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, totalSeconds]);

  // totalSeconds가 바뀌면 시, 분, 초 값 동기화
  useEffect(() => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  }, [totalSeconds]);

  // 재생 버튼 토글
  const togglePlay = () => {
    if (totalSeconds === 0) {
      setShowToast(true);
      return;
    }
    setIsPlaying((prev) => !prev); // 재생과 멈춤을 토글하도록 수정
    setIsEditing(false);
  };

  // 초기화
  const resetTimer = () => {
    setTotalSeconds(0);
    setIsPlaying(false);
    setIsEditing(true);
  };

  // 최대치 설정
  const maxTimer = () => {
    const maxSeconds = 6 * 3600 + 45 * 60;
    setTotalSeconds(maxSeconds);
    setIsPlaying(false);
    setIsEditing(true);
  };

  // 2초 후 토스트 자동 사라지기
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <>
      {/* 현재 곡 정보 */}
      <div className={styles.songInfo}>
        <span>✨ 아티스트 - 타이틀곡 ✨</span>
      </div>

      {/* 시간/분 타이머 */}
      {isEditing ? (
        <TimerPickerUI
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          setHours={setHours}
          setMinutes={setMinutes}
          setSeconds={setSeconds}
        />
      ) : (
        <div className={styles.timer}>
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </div>
      )}

      {/* 타이머 컨트롤 아이콘 버튼 */}
      <div className={styles.timerControls}>
        <button className={styles.iconButton} aria-label="초기화" onClick={resetTimer}>
          <span role="img" aria-label="초기화">
            ↩️
          </span>
        </button>
        <button className={styles.iconButton} aria-label={isPlaying ? '일시정지' : '재생'} onClick={togglePlay}>
          {isPlaying ? <PauseIcon width={24} height={24} /> : <PlayIcon width={24} height={24} />}
        </button>
        <button className={styles.iconButton} aria-label="알림">
          <span role="img" aria-label="알림">
            ⏰
          </span>
        </button>
        <button className={styles.iconButton} aria-label="최대치" onClick={maxTimer}>
          <span role="img" aria-label="최대치">
            MAX
          </span>
        </button>
      </div>

      {/* 설명 문구 */}
      <div className={styles.popupGuide}>타이머를 설정하고, 유튜브에서 신나게 노래해보세요!</div>
      {/* 토스트 메시지 */}
      {showToast && <div className={styles.toast}>시간 설정 후 다시 눌러주세요</div>}
    </>
  );
}
