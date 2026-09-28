/**
 * Homepage hero, right side (wide desktop only): the Zona Scule mark,
 * oversized, as a light grey dashed outline that draws itself, holds, wipes
 * off and rests — a slow loop, pure CSS. The dashes (3px / 5px on screen,
 * via non-scaling-stroke) stay put; a mask of the same paths, stroked solid
 * and animated with a pathLength dash, reveals and wipes them. Reduced
 * motion: the finished outline.
 */
const PATHS = [
  'M18.213 12.0338L30.8793 0.5C24.2231 0.503334 17.8019 3.0075 12.8326 7.53234L0 19.2162H13.7136L1.32144 30.5C7.62846 30.5 13.7038 28.0759 18.3403 23.7111L23.1138 19.2162L31 12.0338H18.213Z',
  'M0 12.4575V0.506836H12.4901L0 12.4575Z',
  'M17.1201 30.5H31.0001V18.4727L17.1201 30.5Z',
]

export default function HeroMark() {
  return (
    <svg className="hero-mark" viewBox="-0.5 0 32 31" aria-hidden="true">
      <style>{`
        .hero-mark { display: block; width: 100%; height: auto; overflow: visible; }
        .hero-mark .hm-line {
          fill: none; stroke: rgba(0,0,0,0.13); stroke-width: 1px;
          stroke-dasharray: 3px 5px; vector-effect: non-scaling-stroke;
        }
        .hero-mark .hm-reveal {
          fill: none; stroke: #fff; stroke-width: 1.2;
          stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: hero-mark 16s cubic-bezier(0.45, 0, 0.35, 1) infinite both;
        }
        .hero-mark mask:nth-of-type(2) .hm-reveal { animation-delay: 0.5s; }
        .hero-mark mask:nth-of-type(3) .hm-reveal { animation-delay: 0.9s; }
        /* draw · hold · wipe (same direction) · rest */
        @keyframes hero-mark {
          0%   { stroke-dashoffset: 1; }
          28%  { stroke-dashoffset: 0; }
          58%  { stroke-dashoffset: 0; }
          80%  { stroke-dashoffset: -1; }
          100% { stroke-dashoffset: -1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-mark .hm-reveal { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <defs>
        {PATHS.map((d, i) => (
          <mask key={i} id={`hm-m${i}`} maskUnits="userSpaceOnUse" x="-2" y="-2" width="36" height="35">
            <path className="hm-reveal" pathLength={1} d={d} />
          </mask>
        ))}
      </defs>
      {PATHS.map((d, i) => <path key={i} className="hm-line" d={d} mask={`url(#hm-m${i})`} />)}
    </svg>
  )
}
