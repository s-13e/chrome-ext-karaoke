import { Picker } from '@web-lite/scroll-picker';

interface TimerPickerUIProps {
  hours: number;
  minutes: number;
  seconds: number;
  setHours: (v: number) => void;
  setMinutes: (v: number) => void;
  setSeconds: (v: number) => void;
}

export function TimerPickerUI({ hours, minutes, seconds, setHours, setMinutes, setSeconds }: TimerPickerUIProps) {
  const hourList = Array.from({ length: 7 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const secondList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const values = [
    {
      selectedIndex: hours,
      items: hourList,
      onUpdate: setHours,
    },
    {
      selectedIndex: minutes,
      items: minuteList,
      onUpdate: setMinutes,
    },
    {
      selectedIndex: seconds,
      items: secondList,
      onUpdate: setSeconds,
    },
  ];

  return (
    <div style={{ margin: '24px auto', width: 'fit-content' }}>
      <Picker values={values} />
    </div>
  );
}
