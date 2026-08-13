import React from 'react';

export const LeetCodeLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863 0-.713.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.824.662l2.697 2.606c.514.515 1.365.515 1.879 0 .514-.514.514-1.365 0-1.879l-2.697-2.607c-1.001-1.002-2.335-1.503-3.703-1.503s-2.702.501-3.703 1.503L4.166 10.96c-1.001 1.002-1.502 2.336-1.502 3.704 0 1.368.501 2.702 1.502 3.704l4.331 4.363c1.001 1.002 2.336 1.503 3.704 1.503s2.703-.501 3.704-1.503l2.697-2.607c.514-.514.514-1.365 0-1.879-.514-.514-1.365-.514-1.879 0z" fill="#FFA116"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M10.826 13.654h7.565c.728 0 1.318-.59 1.318-1.318 0-.728-.59-1.318-1.318-1.318h-7.565c-.728 0-1.318.59-1.318 1.318 0 .728.59 1.318 1.318 1.318z" fill="#262626" className="dark:fill-white"/>
  </svg>
);

export const CodeChefLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#5B4638"/>
    <path d="M12 5c-2.5 0-4.5 2-4.5 4.5 0 1.1.4 2.1 1.1 2.9C7.2 13.3 6 15 6 17.5h12c0-2.5-1.2-4.2-2.6-5.1.7-.8 1.1-1.8 1.1-2.9C16.5 7 14.5 5 12 5z" fill="#FFFFFF"/>
    <circle cx="10" cy="9.5" r="1" fill="#5B4638"/>
    <circle cx="14" cy="9.5" r="1" fill="#5B4638"/>
    <path d="M10 13c1 1 3 1 4 0" stroke="#5B4638" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const HackerRankLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#2EC866" />
    <path d="M6.5 5h3v5.5h5V5h3v14h-3v-5.5h-5V19h-3V5z" fill="#FFFFFF" />
  </svg>
);

export const GitHubLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
