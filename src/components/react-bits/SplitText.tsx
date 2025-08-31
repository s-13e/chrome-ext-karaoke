import { useRef, useEffect, CSSProperties, FC } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

type TweenValue =
  | number
  | string
  | boolean
  | ((target: unknown, index?: number, targets?: unknown[]) => number | string | boolean);
type Ease = string | ((t: number) => number);

interface TweenVars {
  [key: string]: TweenValue | TweenValue[] | undefined;
}

interface SplitTextProps {
  text: string;
  className?: string;
  color?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  delay?: number;
  duration?: number;
  ease?: Ease | string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: Partial<TweenVars>;
  to?: Partial<TweenVars>;

  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

export const SplitText: FC<SplitTextProps> = ({
  text,
  className = '',
  color,
  fontFamily,
  fontWeight,
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current || !text) return;

    const el = ref.current as HTMLElement | null;
    if (!el) return;

    animationCompletedRef.current = false;

    const absoluteLines = splitType === 'lines';
    if (absoluteLines) el.style.position = 'relative';

    let splitter;
    try {
      splitter = new GSAPSplitText(el, {
        type: splitType,
        absolute: absoluteLines,
        linesClass: 'split-line',
      });
    } catch (error) {
      console.error('Failed to create SplitText:', error);
      return;
    }

    let targets: HTMLElement[] = [];
    switch (splitType) {
      case 'lines':
        targets = splitter.lines as HTMLElement[];
        break;
      case 'words':
        targets = splitter.words as HTMLElement[];
        break;
      case 'chars':
        targets = splitter.chars as HTMLElement[];
        break;
      default:
        targets = splitter.chars as HTMLElement[];
    }

    if (!targets || targets.length === 0) {
      console.warn('No targets found for SplitText animation');
      splitter.revert();
      return;
    }

    targets.forEach((t) => {
      t.style.willChange = 'transform, opacity';
      if (color) t.style.color = color;
      if (fontFamily) t.style.fontFamily = fontFamily;
      if (fontWeight) t.style.fontWeight = fontWeight.toString();
    });

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch && marginMatch[1] !== undefined ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign = marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
        once: true,
        onToggle: (self) => {
          scrollTriggerRef.current = self;
        },
      },
      smoothChildTiming: true,
      onComplete: () => {
        animationCompletedRef.current = true;
        gsap.set(targets, {
          ...to,
          clearProps: 'willChange',
          immediateRender: true,
        });
        onLetterAnimationComplete?.();
      },
    });

    tl.set(targets, { ...from, immediateRender: false, force3D: true });
    tl.to(targets, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true,
    });

    return () => {
      tl.kill();
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      gsap.killTweensOf(targets);
      if (splitter) {
        splitter.revert();
      }
    };
  }, [
    text,
    color,
    fontFamily,
    fontWeight,
    delay,
    duration,
    ease,
    splitType,
    from,
    to,
    threshold,
    rootMargin,
    onLetterAnimationComplete,
  ]);

  return (
    <p
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}
    >
      {text}
    </p>
  );
};
