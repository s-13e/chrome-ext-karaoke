import { useEffect, useState } from 'react';
import styles from './styles.modules.css';
import { CiPause1 } from 'react-icons/ci';
import { TimerPickerUI } from '@components/common/TimerPrickerUI';
import { ExtensionMessage } from '@background/background';
import { RiResetRightLine } from 'react-icons/ri';
import { FiPlay } from 'react-icons/fi';
import { MdAccessAlarm } from 'react-icons/md';
import { FaMaxcdn } from 'react-icons/fa';
import Tooltip from '@mui/material/Tooltip';

const ICON_SIZE = 18;
interface TimerProps {
  onPlayStateChange?: (playing: boolean) => void;
}
export function Timer({ onPlayStateChange }: TimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // 재생 중인지
  const [isEditing, setIsEditing] = useState(true); // 재생 중일 때 style 변경
  const [showToast, setShowToast] = useState(false);

  // totalSeconds를 시/분/초로 분리 계산
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 타이머 재생 상태 변화 시 부모 콜백 호출
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // 사용자가 시/분/초 변경 시
  const handleTimeChange = (h: number, m: number, s: number) => {
    setTotalSeconds(h * 3600 + m * 60 + s);
  };

  // 타이머 작동 처리
  useEffect(() => {
    if (!isPlaying) return;

    if (totalSeconds <= 0) {
      setIsPlaying(false);
      setIsEditing(true);
      return;
    }
    const intervalId = setInterval(() => {
      setTotalSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, totalSeconds]);

  // 초기화
  const resetTimer = () => {
    setTotalSeconds(0);
    setIsPlaying(false);
    setIsEditing(true);
  };

  // 최대치 설정
  const maxTimer = () => {
    const maxSeconds = 6 * 3600 + 59 * 60 + 59;
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

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
      setTotalSeconds(response.totalSeconds);
      setIsPlaying(response.isPlaying);
      setIsEditing(!response.isPlaying);
    });

    const listener = (message: ExtensionMessage) => {
      if (message.type === 'tick') {
        setTotalSeconds(message.totalSeconds);
        setIsEditing(false);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  // 재생 버튼 토글
  const togglePlay = () => {
    if (totalSeconds === 0) {
      setShowToast(true);
      return;
    }
    if (isPlaying) {
      chrome.runtime.sendMessage({ type: 'stopTimer' });
      setIsPlaying(false);
    } else {
      chrome.runtime.sendMessage({ type: 'startTimer', totalSeconds });
      setIsPlaying(true);
    }
  };

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
          onChange={handleTimeChange} // (h, m, s) => setTotalSeconds(...)
        />
      ) : (
        <div className={styles.timer}>
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </div>
      )}

      {/* 타이머 컨트롤 아이콘 버튼 */}
      <div className={styles.timerControls}>
        <Tooltip title="초기화" arrow>
          <button
            className={styles.iconButton}
            aria-label="초기화"
            onClick={resetTimer}
            disabled={isPlaying}
            data-tip
            data-for="resetTip"
          >
            <RiResetRightLine size={ICON_SIZE} color={isPlaying ? '#c1c1c1cf' : 'white'} />
          </button>
        </Tooltip>

        <Tooltip title="타이머 시작" arrow>
          <button className={styles.iconButton} aria-label={isPlaying ? '일시정지' : '재생'} onClick={togglePlay}>
            {isPlaying ? (
              <CiPause1 size={ICON_SIZE} style={{ color: 'white' }} />
            ) : (
              <FiPlay size={ICON_SIZE} style={{ color: 'white' }} />
            )}
          </button>
        </Tooltip>
        <Tooltip title="알림" arrow>
          <button className={styles.iconButton} aria-label="알림">
            <MdAccessAlarm size={ICON_SIZE} style={{ color: 'white' }} />
          </button>
        </Tooltip>
        <Tooltip title="최대치" arrow>
          <button className={styles.iconButton} aria-label="최대치" onClick={maxTimer}>
            <FaMaxcdn size={ICON_SIZE} style={{ color: 'white' }} />
          </button>
        </Tooltip>
      </div>

      {/* 설명 문구 */}
      <div className={styles.popupGuide}>타이머를 설정하고, 유튜브에서 신나게 노래해보세요!</div>
      {/* 토스트 메시지 */}
      {showToast && <div className={styles.toast}>시간 설정 후 다시 눌러주세요</div>}
    </>
  );
}
