import React from 'react';

export function ResetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={props.width || 48}
      height={props.height || 48}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* 원형의 회전 경로 */}
      <path
        d="M24 5
           a19 19 0 1 1 -16 9"
        stroke="currentColor"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      {/* 두껍고 넓은 (좌방향) 화살표 머리 */}
      <polyline
        points="13,7 13,13 19,13"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
