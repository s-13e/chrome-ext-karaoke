// TunePanel.tsx
// Tune 탭 — 피치(Key) 및 템포(Speed) 조절 패널
// playbackRate + preservesPitch 조합으로 피치/템포 조절

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MdMusicNote, MdSpeed, MdRefresh } from 'react-icons/md';

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
 * - 피치: Web Audio API의 playbackRate + preservesPitch 조합으로 근사 처리
 *   (반음 단위 ±6, detune 방식)
 * - 템포: video.playbackRate + preservesPitch로 속도만 변경
 */
export const TunePanel: React.FC = () => {
  const { t } = useTranslation();
  const [pitch, setPitch] = useState(0); // 반음 단위 (-6 ~ +6)
  const [tempo, setTempo] = useState(1.0); // 배속 (0.5 ~ 2.0)
  /** YouTube 비디오 요소 가져오기 */
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    return document.querySelector<HTMLVideoElement>('video.html5-main-video');
  }, []);

  /** 피치 변경 적용 — playbackRate + preservesPitch 조합 */
  const applyPitch = useCallback(
    (semitones: number) => {
      const video = getVideoElement();
      if (!video) return;

      if (semitones === 0) {
        // 피치 리셋: 템포만 반영
        video.playbackRate = tempo;
        video.preservesPitch = true;
        return;
      }

      // 피치 시프트: playbackRate로 피치 변경 후 preservesPitch=false
      // 반음 = 2^(1/12) 비율
      const pitchRate = Math.pow(2, semitones / 12);
      // 최종 playbackRate = 템포 × 피치 비율
      video.playbackRate = tempo * pitchRate;
      video.preservesPitch = false;
    },
    [tempo, getVideoElement],
  );

  /** 템포 변경 적용 */
  const applyTempo = useCallback(
    (rate: number) => {
      const video = getVideoElement();
      if (!video) return;

      if (pitch === 0) {
        // 피치 없으면 단순 속도 변경
        video.playbackRate = rate;
        video.preservesPitch = true;
      } else {
        // 피치 있으면 함께 적용
        const pitchRate = Math.pow(2, pitch / 12);
        video.playbackRate = rate * pitchRate;
        video.preservesPitch = false;
      }
    },
    [pitch, getVideoElement],
  );

  /** 피치 변경 핸들러 */
  const handlePitchChange = useCallback(
    (value: number) => {
      const rounded = Math.round(value);
      setPitch(rounded);
      applyPitch(rounded);
    },
    [applyPitch],
  );

  /** 템포 변경 핸들러 */
  const handleTempoChange = useCallback(
    (value: number) => {
      const rounded = Math.round(value * 10) / 10;
      setTempo(rounded);
      applyTempo(rounded);
    },
    [applyTempo],
  );

  /** 전체 리셋 */
  const handleResetAll = useCallback(() => {
    setPitch(0);
    setTempo(1.0);
    const video = getVideoElement();
    if (video) {
      video.playbackRate = 1.0;
      video.preservesPitch = true;
    }
  }, [getVideoElement]);

  // 언마운트 시 원래 상태로 복구
  useEffect(() => {
    return () => {
      const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
      if (video) {
        video.playbackRate = 1.0;
        video.preservesPitch = true;
      }
    };
  }, []);

  const isModified = pitch !== 0 || Math.abs(tempo - 1.0) > 0.01;

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
