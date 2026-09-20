import { type ReactNode, useId } from "react";
import { siApple } from "simple-icons";

/** The Apple logo in the button's text colour; Apple has no colour version of it. */
export function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d={siApple.path} fill="currentColor" />
    </svg>
  );
}

/** The current Google Calendar logo (svgrepo vector 381004) with a white face so the 31 reads on any button. */
export function GoogleMark() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M22 4.5v6H10v11H4V6.5a2 2 0 0 1 2-2z" fill="#4285f4" />
      <path d="M28 6.5v4h-6v-6h4a2 2 0 0 1 2 2z" fill="#0066da" />
      <rect x="22" y="9.5" width="6" height="12" fill="#ffba00" />
      <path d="M22 27.5v-6h6z" fill="#ea4435" />
      <rect x="10" y="21.5" width="12" height="6" fill="#00ac47" />
      <path d="M10 21.5v6H6a2 2 0 0 1-2-2v-4z" fill="#188038" />
      <rect x="10" y="10.5" width="12" height="11" fill="#fff" />
      <path
        fill="#4285f4"
        d="M15.69 17.09c0 .89-.66 1.79-2.15 1.79a3 3 0 0 1-1.52-.39l-.08-.06.29-.82.13.08a2.36 2.36 0 0 0 1.17.34 1.19 1.19 0 0 0 .88-.31.86.86 0 0 0 .25-.65c-.01-.73-.68-.99-1.31-.99h-.54v-.81h.54c.45 0 1.12-.22 1.12-.82 0-.45-.31-.71-.85-.71a1.89 1.89 0 0 0-1.04.34l-.14.1-.28-.79.07-.06a2.83 2.83 0 0 1 1.53-.45c1.19 0 1.72.73 1.72 1.45a1.44 1.44 0 0 1-.81 1.3 1.52 1.52 0 0 1 1.02 1.46zM18.71 12.98v5.81h-.98V14l-.94.51-.21-.82 1.37-.71z"
      />
    </svg>
  );
}

interface FlagProps {
  children: ReactNode;
}

function Flag({ children }: FlagProps) {
  return (
    <svg viewBox="0 5 36 26" width="20" height="15" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** The Union Jack for English (svgrepo vector 405643, Twemoji). */
export function FlagGb() {
  return (
    <Flag>
      <path
        fill="#00247D"
        d="M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z"
      />
      <path
        fill="#CF1B2B"
        d="M25.14 23l9.712 6.801a3.977 3.977 0 0 0 .99-1.749L28.627 23H25.14zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943V23zm10-10h2.141l9.711-6.8a3.988 3.988 0 0 0-1.937-1.085L23 12.057V13zm-12.141 0L1.148 6.2a3.994 3.994 0 0 0-.991 1.749L7.372 13h3.487z"
      />
      <path
        fill="#EEE"
        d="M36 21H21v10h2v-5.836L31.335 31H32a3.99 3.99 0 0 0 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36v-2zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21H0zM36 9a3.983 3.983 0 0 0-1.148-2.8L25.141 13H23v-.943l9.915-6.942A4.001 4.001 0 0 0 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059V9zM13 5v5.837L4.664 5H4a3.985 3.985 0 0 0-2.852 1.2l9.711 6.8H7.372L.157 7.949A3.968 3.968 0 0 0 0 9v.059L5.628 13H0v2h15V5h-2z"
      />
      <path fill="#CF1B2B" d="M21 15V5h-6v10H0v6h15v10h6V21h15v-6z" />
    </Flag>
  );
}

/** The Italian tricolour (svgrepo vector 405517, Twemoji). */
export function FlagIt() {
  return (
    <Flag>
      <path fill="#CE2B37" d="M36 27a4 4 0 0 1-4 4h-8V5h8a4 4 0 0 1 4 4v18z" />
      <path fill="#009246" d="M4 5a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h8V5H4z" />
      <path fill="#EEE" d="M12 5h12v26H12z" />
    </Flag>
  );
}

/** The current Outlook logo (svgrepo vector 452067); gradient ids come from useId so two copies can share a page. */
export function OutlookMark() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const blue = `outlook-blue-${id}`;
  const left = `outlook-left-${id}`;
  const right = `outlook-right-${id}`;
  const clip = `outlook-clip-${id}`;
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={blue}>
          <stop stopColor="#064484" />
          <stop offset="1" stopColor="#0F65B5" />
        </linearGradient>
        <linearGradient id={right} gradientUnits="userSpaceOnUse" x1="32" y1="23" x2="8" y2="23">
          <stop stopColor="#44DCFD" />
          <stop offset="0.45" stopColor="#259ED0" />
        </linearGradient>
        <linearGradient id={left} gradientUnits="userSpaceOnUse" x1="8" y1="23" x2="32" y2="23">
          <stop stopColor="#259ED0" />
          <stop offset="1" stopColor="#44DCFD" />
        </linearGradient>
        <clipPath id={clip}>
          <path d="M8 14h22a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" />
        </clipPath>
      </defs>
      <rect x="10" y="2" width="20" height="28" rx="2" fill={`url(#${blue})`} />
      <rect x="10" y="5" width="10" height="10" fill="#32A9E7" />
      <rect x="20" y="5" width="10" height="10" fill="#58D9FD" />
      <rect x="10" y="15" width="10" height="10" fill="#167EB4" />
      <rect x="20" y="15" width="10" height="10" fill="#32A9E7" />
      <g clipPath={`url(#${clip})`}>
        <path d="M32 14v4h-2v-4z" fill="#135298" />
        <path d="M32 30V16L7 30z" fill={`url(#${right})`} />
        <path d="M8 30V16l25 14z" fill={`url(#${left})`} />
      </g>
      <path
        d="M8 12a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8z"
        fill="#000"
        fillOpacity="0.3"
      />
      <rect y="7" width="18" height="18" rx="2" fill={`url(#${blue})`} />
      <path
        fill="#fff"
        d="M14 16.0693V15.903C14 13.0222 11.9272 11 9.01582 11C6.08861 11 4 13.036 4 15.9307V16.097C4 18.9778 6.07278 21 9 21C11.9114 21 14 18.964 14 16.0693ZM11.6424 16.097C11.6424 18.0083 10.5665 19.1579 9.01582 19.1579C7.46519 19.1579 6.37342 17.9806 6.37342 16.0693V15.903C6.37342 13.9917 7.44937 12.8421 9 12.8421C10.5348 12.8421 11.6424 14.0194 11.6424 15.9307V16.097Z"
      />
    </svg>
  );
}
