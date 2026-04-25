// TunePanel.tsx
// Tune 탭 — 피치(Key) 및 템포(Speed) 조절 UI
// 오디오 처리는 tunePipelineManager 싱글톤에 위임 (탭 전환에도 유지)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdMusicNote, MdSpeed, MdRefresh, MdMicOff, MdSend } from 'react-icons/md';
import { STORAGE_KEYS } from '@constants/storageKeys';
import {
  getTuneState,
  setPitch as setPipelinePitch,
  setTempo as setPipelineTempo,
  setVocalMode as setPipelineVocalMode,
  resetAll as resetPipeline,
  subscribe,
  type VocalMode,
  type VocalEqParams,
  DEFAULT_VOCAL_EQ,
  getVocalEqParams,
  setVocalEqParams as setPipelineVocalEqParams,
  captureVocalDebugSnapshot,
  ensurePipelineRunning,
} from './tunePipelineManager';

const IS_DEV_MODE = process.env.DEV_MODE === 'true';

/** Dev UI 전용 — 1 밴드 (freq/Q/gain 묶음) 슬라이더 행 */
interface EqBandParam<K extends string> {
  key: K;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}
interface EqBandProps<K extends string> {
  title: string;
  params: ReadonlyArray<EqBandParam<K>>;
  onChange: (key: K, value: number) => void;
}
const EqBand = <K extends string>({ title, params, onChange }: EqBandProps<K>): React.ReactElement => (
  <div>
    <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {params.map((p) => (
        <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
          <span style={{ width: '34px', color: 'rgba(255,255,255,0.45)' }}>{p.label}</span>
          <input
            type="range"
            min={p.min}
            max={p.max}
            step={p.step}
            value={p.value}
            onChange={(e) => onChange(p.key, parseFloat(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <span
            style={{
              width: '58px',
              textAlign: 'right',
              fontFamily: 'monospace',
              color: '#ff9f43',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {p.value.toFixed(p.label === 'Freq' ? 0 : 1)}
            {p.unit}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/** 슬라이더 컨트롤 공통 Props */
interface TuneSliderProps {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (v: number) => void;
  color: string;
}

/** 슬라이더 컨트롤 컴포넌트 — v0 레퍼런스 기반 */
const TuneSlider: React.FC<TuneSliderProps> = ({
  label,
  sublabel,
  icon,
  value,
  displayValue,
  min,
  max,
  step,
  defaultValue,
  onChange,
  color,
}) => {
  const isModified = Math.abs(value - defaultValue) > 0.001;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 라벨 + 값 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: isModified ? color : 'rgba(255,255,255,0.4)', transition: 'color 0.15s' }}>{icon}</span>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{label}</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>{sublabel}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: isModified ? color : '#fff',
              transition: 'color 0.15s',
            }}
          >
            {displayValue}
          </span>
          {isModified && (
            <span
              role="button"
              tabIndex={0}
              onClick={() => onChange(defaultValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onChange(defaultValue);
              }}
              title="Reset"
              style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              <MdRefresh size={14} />
            </span>
          )}
        </div>
      </div>

      {/* - 슬라이더 + */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          role="button"
          tabIndex={0}
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange(Math.max(min, Math.round((value - step) * 100) / 100));
          }}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            flexShrink: 0,
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          -
        </span>
        <div style={{ position: 'relative', flex: 1, height: '28px', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              appearance: 'none',
              cursor: 'pointer',
              background: `linear-gradient(to right, ${color} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
              outline: 'none',
            }}
          />
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange(Math.min(max, Math.round((value + step) * 100) / 100));
          }}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            flexShrink: 0,
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          +
        </span>
      </div>
    </div>
  );
};

/**
 * Tune 패널 — 피치(Key)와 템포(Speed) 조절
 * 오디오 처리는 tunePipelineManager 싱글톤에 위임
 * - 피치: SoundTouch pitchSemitones (video.playbackRate는 건드리지 않음)
 * - 템포: video.playbackRate + preservesPitch (브라우저 내장)
 */
export const TunePanel: React.FC = () => {
  const { t } = useTranslation();
  const initial = getTuneState();
  const [pitch, setPitch] = useState(initial.pitch);
  const [tempo, setTempo] = useState(initial.tempo);
  const [vocalMode, setVocalMode] = useState<VocalMode>(initial.vocalMode);
  // 복원 중 사용자가 라디오를 직접 건드렸으면 지연 활성화를 스킵하기 위한 플래그
  const userInteractedRef = useRef(false);
  // 보컬 제거 "NEW" 배지 — 초기값은 true(배지 숨김)로 시작해서 깜빡임 방지
  const [vocalRemovalBadgeSeen, setVocalRemovalBadgeSeen] = useState(true);
  // Dev 튜닝 UI (DEV_MODE에서만 렌더) — 3밴드 EQ 실시간 조정 + 스냅샷 복사
  const [eqParams, setEqParams] = useState<VocalEqParams>(getVocalEqParams);
  const [copiedHint, setCopiedHint] = useState(false);

  // NEW 배지 상태 로드 (처음 본 사용자에게만 배지 표시)
  useEffect(() => {
    chrome.storage.sync.get([STORAGE_KEYS.VOCAL_REMOVAL_BADGE_SEEN], (result) => {
      setVocalRemovalBadgeSeen(result[STORAGE_KEYS.VOCAL_REMOVAL_BADGE_SEEN] === true);
    });
  }, []);

  // 저장된 vocalMode 복원 (chrome.storage.sync)
  // 파이프라인 활성화는 영상 재생 시점으로 지연 — 초기 로드 중 AudioContext/
  // MediaElementSource 생성이 YouTube 오디오를 끊어 렉을 유발하는 걸 방지.
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    chrome.storage.sync.get([STORAGE_KEYS.VOCAL_MODE], (result) => {
      if (cancelled) return;

      const stored = result[STORAGE_KEYS.VOCAL_MODE] as string | undefined;
      // 'hd'는 미구현 → 'off' 강등. 구버전 'multiband'는 'basic'으로 마이그레이션.
      const safe: VocalMode = stored === 'basic' || stored === 'multiband' ? 'basic' : 'off';
      if (safe === 'off') return;
      // 마이그레이션: 저장값이 'multiband'이면 'basic'으로 갱신해 storage 일관성 유지
      if (stored === 'multiband') {
        chrome.storage.sync.set({ [STORAGE_KEYS.VOCAL_MODE]: 'basic' });
      }

      // UI 상태는 즉시 반영 (사용자 시각 피드백)
      setVocalMode(safe);

      const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
      if (!video) return;

      const activate = () => {
        if (cancelled || userInteractedRef.current) return;
        setPipelineVocalMode(safe);
      };

      if (!video.paused && video.currentTime > 0) {
        // 이미 재생 중이면 짧은 지연 후 활성화 (초기 로드가 안정화될 시간 확보)
        const timeoutId = window.setTimeout(activate, 400);
        cleanup = () => window.clearTimeout(timeoutId);
      } else {
        const onPlaying = () => {
          activate();
          video.removeEventListener('playing', onPlaying);
        };
        video.addEventListener('playing', onPlaying);
        cleanup = () => video.removeEventListener('playing', onPlaying);
      }
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // 싱글톤 상태 변경 구독 (다른 곳에서 변경 시 UI 동기화)
  useEffect(() => {
    return subscribe(() => {
      const state = getTuneState();
      setPitch(state.pitch);
      setTempo(state.tempo);
      setVocalMode(state.vocalMode);
    });
  }, []);

  const handlePitchChange = useCallback((value: number) => {
    const rounded = Math.round(value);
    setPitch(rounded);
    setPipelinePitch(rounded);
  }, []);

  const handleTempoChange = useCallback((value: number) => {
    const rounded = Math.round(value * 10) / 10;
    setTempo(rounded);
    setPipelineTempo(rounded);
  }, []);

  const handleVocalModeChange = useCallback((mode: VocalMode) => {
    // 'hd'는 현재 비활성 (Tier 2 준비 중) — UI 레벨에서 한 번 더 가드
    if (mode === 'hd') return;
    userInteractedRef.current = true; // 지연 복원이 사용자 의도를 덮어쓰지 않도록
    setVocalMode(mode);
    setPipelineVocalMode(mode);
    // 라디오 클릭 = 기능 발견으로 간주 → NEW 배지 해제 (사이드바 아이콘 배지도 storage 구독으로 자동 사라짐)
    setVocalRemovalBadgeSeen(true);
    chrome.storage.sync.set({
      [STORAGE_KEYS.VOCAL_MODE]: mode,
      [STORAGE_KEYS.VOCAL_REMOVAL_BADGE_SEEN]: true,
    });
  }, []);

  // ─── Dev 튜닝 UI 핸들러 ───────────────────────────────────────
  const handleEqChange = useCallback((next: VocalEqParams) => {
    setEqParams(next);
    setPipelineVocalEqParams(next);
  }, []);

  const handleEqReset = useCallback(() => {
    const defaults = {
      lowShelf: { ...DEFAULT_VOCAL_EQ.lowShelf },
      midPeak: { ...DEFAULT_VOCAL_EQ.midPeak },
      highPeak: { ...DEFAULT_VOCAL_EQ.highPeak },
      crossover: { ...DEFAULT_VOCAL_EQ.crossover },
    };
    setEqParams(defaults);
    setPipelineVocalEqParams(defaults);
  }, []);

  const handleCopyDebugSnapshot = useCallback(async () => {
    // 1) AudioContext가 suspended면 먼저 재개 (Chrome 정책 우회)
    const running = await ensurePipelineRunning();
    if (!running) {
      console.warn(
        '[TunePanel] AudioContext를 running 상태로 만들지 못했습니다. 보컬 제거 "기본" 라디오를 한 번 클릭해주세요.',
      );
    }
    // 2) 재개 직후 analyzer가 실제 데이터를 받을 때까지 한 FFT 주기 대기 (~50ms)
    await new Promise((resolve) => window.setTimeout(resolve, 80));

    const snapshot = captureVocalDebugSnapshot();
    if (!snapshot) {
      setCopiedHint(false);
      console.warn('[TunePanel] 스냅샷 생성 실패 — 파이프라인이 아직 초기화되지 않음 (보컬 제거를 먼저 켜주세요)');
      return;
    }

    if (snapshot.audio.isSilent) {
      console.warn(
        '[TunePanel] analyzer가 무음 상태. AudioContext state:',
        snapshot.audio.audioCtxState,
        '— 보컬 제거를 "기본"으로 켠 뒤 영상을 재생 중인 상태에서 다시 시도해주세요.',
      );
    }

    // YouTube DOM에서 영상 메타 추출
    const titleEl = document.querySelector(
      'h1.ytd-watch-metadata, ytd-watch-metadata h1, h1.title yt-formatted-string, ytd-video-primary-info-renderer h1',
    );
    const channelEl = document.querySelector(
      '#channel-name yt-formatted-string a, ytd-channel-name a, ytd-video-owner-renderer a',
    );
    const videoEl = document.querySelector<HTMLVideoElement>('video.html5-main-video');
    const urlParams = new URL(window.location.href).searchParams;

    const payload = {
      timestamp: snapshot.timestamp,
      video: {
        title: titleEl?.textContent?.trim() ?? '',
        channel: channelEl?.textContent?.trim() ?? '',
        videoId: urlParams.get('v') ?? '',
        duration: videoEl ? Math.round(videoEl.duration) : 0,
        url: window.location.href,
      },
      audio: snapshot.audio,
      eq: snapshot.eq,
      note: '', // 사용자가 수동 추가 가능 (예: "보컬 너무 남음", "드럼 깎임")
    };

    const json = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopiedHint(true);
      window.setTimeout(() => setCopiedHint(false), 1500);
      console.log('[TunePanel] 스냅샷 복사 완료:', payload);
    } catch (err) {
      console.error('[TunePanel] 클립보드 쓰기 실패:', err);
      console.log('[TunePanel] 아래 JSON을 수동 복사하세요:\n', json);
    }
  }, []);

  const handleResetAll = useCallback(() => {
    setPitch(0);
    setTempo(1.0);
    setVocalMode('off');
    chrome.storage.sync.set({ [STORAGE_KEYS.VOCAL_MODE]: 'off' });
    resetPipeline();
  }, []);

  const isModified = pitch !== 0 || Math.abs(tempo - 1.0) > 0.01 || vocalMode !== 'off';

  const presets = [
    { labelKey: 'extTunePresetOriginal', pitch: 0, tempo: 1.0 },
    { labelKey: 'extTunePresetPractice', pitch: 0, tempo: 0.8 },
    { labelKey: 'extTunePresetHigher', pitch: 2, tempo: 1.0 },
    { labelKey: 'extTunePresetLower', pitch: -2, tempo: 1.0 },
  ];

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 }}>{t('extTuneTitle')}</h3>
        {isModified && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleResetAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleResetAll();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00d4aa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <MdRefresh size={12} />
            {t('extTuneResetAll')}
          </span>
        )}
      </div>

      {/* 피치 (Key) 슬라이더 */}
      <TuneSlider
        label={t('extTuneKey')}
        sublabel={t('extTuneKeySub')}
        icon={<MdMusicNote size={16} />}
        value={pitch}
        displayValue={pitch > 0 ? `+${pitch}` : `${pitch}`}
        min={-6}
        max={6}
        step={1}
        defaultValue={0}
        onChange={handlePitchChange}
        color="#00d4aa"
      />

      {/* 템포 (Speed) 슬라이더 */}
      <TuneSlider
        label={t('extTuneSpeed')}
        sublabel={t('extTuneSpeedSub')}
        icon={<MdSpeed size={16} />}
        value={tempo}
        displayValue={`${tempo.toFixed(1)}x`}
        min={0.5}
        max={2.0}
        step={0.1}
        defaultValue={1.0}
        onChange={handleTempoChange}
        color="#ff6b9d"
      />

      {/* 보컬 감쇠 (Vocal Reduction, Beta) */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{ color: vocalMode !== 'off' ? '#ff9f43' : 'rgba(255,255,255,0.4)', transition: 'color 0.15s' }}
            >
              <MdMicOff size={16} />
            </span>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{t('extTuneVocalTitle')}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>
                {t('extTuneVocalSub')}
              </span>
            </div>
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#ff9f43',
                background: 'rgba(255, 159, 67, 0.12)',
                border: '1px solid rgba(255, 159, 67, 0.3)',
              }}
            >
              {t('extTuneVocalBeta')}
            </span>
            {/* 피드백 버튼 — 클릭 시 Settings 탭으로 이동 (피드백 폼이 거기 있음) */}
            <span
              role="button"
              tabIndex={0}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('tutorial-navigate-tab', { detail: { tab: 'settings' } }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.dispatchEvent(new CustomEvent('tutorial-navigate-tab', { detail: { tab: 'settings' } }));
                }
              }}
              title={t('extTuneVocalFeedbackTooltip')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              <MdSend size={10} />
              {t('extTuneVocalFeedback')}
            </span>
          </div>
          {/* NEW 배지 — 라디오 한 번이라도 클릭하면 해제 */}
          {!vocalRemovalBadgeSeen && (
            <span
              aria-hidden="true"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff4444',
                boxShadow: '0 0 4px rgba(255, 68, 68, 0.7)',
                flexShrink: 0,
                alignSelf: 'flex-start',
                marginTop: '3px',
              }}
            />
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {(
            [
              { mode: 'off', labelKey: 'extTuneVocalOff', disabled: false },
              { mode: 'basic', labelKey: 'extTuneVocalBasic', disabled: false },
              { mode: 'hd', labelKey: 'extTuneVocalHd', disabled: true },
            ] as const
          ).map(({ mode, labelKey, disabled }) => {
            const isActive = vocalMode === mode;
            return (
              <span
                key={mode}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                onClick={() => {
                  if (!disabled) handleVocalModeChange(mode as VocalMode);
                }}
                onKeyDown={(e) => {
                  if (!disabled && e.key === 'Enter') handleVocalModeChange(mode as VocalMode);
                }}
                title={disabled ? t('extTuneVocalHdComingSoon') : undefined}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                  opacity: disabled ? 0.4 : 1,
                  background: isActive ? 'rgba(255, 159, 67, 0.12)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#ff9f43' : 'rgba(255,255,255,0.7)',
                  border: isActive ? '1px solid rgba(255, 159, 67, 0.3)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !disabled) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !disabled) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                {t(labelKey)}
              </span>
            );
          })}
        </div>
        {vocalMode === 'basic' && (
          <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
            {t('extTuneVocalHint')}
          </div>
        )}

        {/* ───── Dev 튜닝 UI (프로덕션 빌드에서는 데드코드로 제거됨) ───── */}
        {IS_DEV_MODE && (
          <details style={{ marginTop: '12px' }}>
            <summary
              style={{
                cursor: 'pointer',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                padding: '4px 0',
                userSelect: 'none',
              }}
            >
              ▶ Debug EQ (DEV only)
            </summary>
            <div
              style={{
                marginTop: '8px',
                padding: '10px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <EqBand
                title="Low Shelf"
                params={[
                  {
                    key: 'freq',
                    label: 'Freq',
                    value: eqParams.lowShelf.freq,
                    min: 40,
                    max: 300,
                    step: 10,
                    unit: 'Hz',
                  },
                  {
                    key: 'gain',
                    label: 'Gain',
                    value: eqParams.lowShelf.gain,
                    min: -12,
                    max: 0,
                    step: 0.5,
                    unit: 'dB',
                  },
                ]}
                onChange={(key, v) => handleEqChange({ ...eqParams, lowShelf: { ...eqParams.lowShelf, [key]: v } })}
              />
              <EqBand
                title="Mid Peak"
                params={[
                  {
                    key: 'freq',
                    label: 'Freq',
                    value: eqParams.midPeak.freq,
                    min: 500,
                    max: 5000,
                    step: 50,
                    unit: 'Hz',
                  },
                  { key: 'Q', label: 'Q', value: eqParams.midPeak.Q, min: 0.3, max: 5, step: 0.1, unit: '' },
                  {
                    key: 'gain',
                    label: 'Gain',
                    value: eqParams.midPeak.gain,
                    min: -12,
                    max: 0,
                    step: 0.5,
                    unit: 'dB',
                  },
                ]}
                onChange={(key, v) => handleEqChange({ ...eqParams, midPeak: { ...eqParams.midPeak, [key]: v } })}
              />
              <EqBand
                title="High Peak"
                params={[
                  {
                    key: 'freq',
                    label: 'Freq',
                    value: eqParams.highPeak.freq,
                    min: 1500,
                    max: 8000,
                    step: 100,
                    unit: 'Hz',
                  },
                  { key: 'Q', label: 'Q', value: eqParams.highPeak.Q, min: 0.3, max: 5, step: 0.1, unit: '' },
                  {
                    key: 'gain',
                    label: 'Gain',
                    value: eqParams.highPeak.gain,
                    min: -12,
                    max: 0,
                    step: 0.5,
                    unit: 'dB',
                  },
                ]}
                onChange={(key, v) => handleEqChange({ ...eqParams, highPeak: { ...eqParams.highPeak, [key]: v } })}
              />

              {/* 'basic' 모드는 내부적으로 멀티밴드 구조라 crossover 슬라이더 의미 있음 */}
              {vocalMode === 'basic' && (
                <EqBand
                  title="Crossover (multiband)"
                  params={[
                    {
                      key: 'lowHz',
                      label: 'Low',
                      value: eqParams.crossover.lowHz,
                      min: 50,
                      max: 500,
                      step: 10,
                      unit: 'Hz',
                    },
                    {
                      key: 'highHz',
                      label: 'High',
                      value: eqParams.crossover.highHz,
                      min: 2000,
                      max: 10000,
                      step: 100,
                      unit: 'Hz',
                    },
                  ]}
                  onChange={(key, v) => handleEqChange({ ...eqParams, crossover: { ...eqParams.crossover, [key]: v } })}
                />
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleCopyDebugSnapshot}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    background: copiedHint ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 159, 67, 0.15)',
                    color: copiedHint ? '#00d4aa' : '#ff9f43',
                    border: `1px solid ${copiedHint ? 'rgba(0, 212, 170, 0.4)' : 'rgba(255, 159, 67, 0.3)'}`,
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {copiedHint ? '✓ Copied' : '📋 Copy snapshot (video + audio + EQ)'}
                </button>
                <button
                  type="button"
                  onClick={handleEqReset}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                {
                  'Adjust sliders while playing audio. Click Copy to capture the current snapshot (YouTube metadata + L/R correlation + frequency bands + EQ) to clipboard. Send it back to refine default EQ values.'
                }
              </div>
            </div>
          </details>
        )}
      </div>

      {/* 퀵 프리셋 */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
        <h4
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px',
          }}
        >
          {t('extTunePresets')}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {presets.map((preset) => {
            const isActive = pitch === preset.pitch && Math.abs(tempo - preset.tempo) < 0.01;
            return (
              <span
                key={preset.labelKey}
                role="button"
                tabIndex={0}
                onClick={() => {
                  handlePitchChange(preset.pitch);
                  handleTempoChange(preset.tempo);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePitchChange(preset.pitch);
                    handleTempoChange(preset.tempo);
                  }
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                  background: isActive ? 'rgba(0, 212, 170, 0.12)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#00d4aa' : 'rgba(255,255,255,0.7)',
                  border: isActive ? '1px solid rgba(0, 212, 170, 0.3)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                {t(preset.labelKey)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
