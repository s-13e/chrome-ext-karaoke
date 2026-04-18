// TunePanel.tsx
// Tune 탭 — 피치(Key) 및 템포(Speed) 조절 UI
// 오디오 처리는 tunePipelineManager 싱글톤에 위임 (탭 전환에도 유지)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdMusicNote, MdSpeed, MdRefresh, MdMicOff } from 'react-icons/md';
import { STORAGE_KEYS } from '@constants/storageKeys';
import {
  getTuneState,
  setPitch as setPipelinePitch,
  setTempo as setPipelineTempo,
  setVocalMode as setPipelineVocalMode,
  resetAll as resetPipeline,
  subscribe,
  type VocalMode,
} from './tunePipelineManager';

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

  // 저장된 vocalMode 복원 (chrome.storage.sync)
  // 파이프라인 활성화는 영상 재생 시점으로 지연 — 초기 로드 중 AudioContext/
  // MediaElementSource 생성이 YouTube 오디오를 끊어 렉을 유발하는 걸 방지.
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    chrome.storage.sync.get([STORAGE_KEYS.VOCAL_MODE], (result) => {
      if (cancelled) return;

      const stored = result[STORAGE_KEYS.VOCAL_MODE] as VocalMode | undefined;
      // 'hd'는 아직 미구현이므로 복원 시 'off'로 강등
      const safe: VocalMode = stored === 'basic' ? 'basic' : 'off';
      if (safe === 'off') return;

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
    chrome.storage.sync.set({ [STORAGE_KEYS.VOCAL_MODE]: mode });
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
          </div>
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
