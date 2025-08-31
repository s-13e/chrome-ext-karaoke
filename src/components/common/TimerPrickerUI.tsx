import { Picker } from '@web-lite/scroll-picker';

interface TimerPickerUIProps {
  hours: number;
  minutes: number;
  seconds: number;
  onChange: (h: number, m: number, s: number) => void;
}

export function TimerPickerUI({ hours, minutes, seconds, onChange }: TimerPickerUIProps) {
  const hourList = Array.from({ length: 7 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const secondList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const values = [
    {
      selectedIndex: hours,
      items: hourList,
      onUpdate: (idx: number) => onChange(idx, minutes, seconds),
    },
    {
      selectedIndex: minutes,
      items: minuteList,
      onUpdate: (idx: number) => onChange(hours, idx, seconds),
    },
    {
      selectedIndex: seconds,
      items: secondList,
      onUpdate: (idx: number) => onChange(hours, minutes, idx),
    },
  ];

  return (
    <div style={{ margin: '24px auto', width: 'fit-content' }}>
      <Picker values={values} />
    </div>
  );
}
