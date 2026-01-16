import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    active?: boolean;
}

export const IconHome: React.FC<IconProps> = ({ size = 24, className = '', active }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M9.5 2H14.5C15.9001 2 16.6002 2 17.1594 2.19692C18.0699 2.51868 18.8475 3.19796 19.2899 4.07599C19.5616 4.61516 19.7028 5.29348 19.9852 6.65012L20.8178 10.6501C21.3664 13.2858 21.6406 14.6036 21.1417 15.6558C20.6429 16.708 19.4673 17.2023 17.1162 18.1913L15.3529 18.9332C13.8812 19.5524 13.1453 19.8621 12.3529 19.9576C11.5605 20.0531 10.7675 19.9238 9.18146 19.6649L6.5 19.2272V6C6.5 4.11438 6.5 3.17157 7.08579 2.58579C7.67157 2 8.61438 2 10.5 2H9.5Z"
                fill={active ? "url(#gradient-home)" : "currentColor"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth={active ? 0 : 2}
                opacity={active ? 1 : 0.6}
            />
            {/* Custom playful shape */}
            <path
                d="M3 8.5C3 6.5 4.5 5.5 6 6V19.5C4 19.5 3 17.5 3 15.5V8.5Z"
                fill={active ? "#FB923C" : "currentColor"}
                opacity={active ? 0.8 : 0.4}
                stroke="none"
            />
            <defs>
                <linearGradient id="gradient-home" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
};

// Alt Home - Simpler, cuter rounded house
export const IconHomeRounding: React.FC<IconProps> = ({ size = 24, className = '', active }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="9" width="18" height="12" rx="4"
                fill={active ? "url(#grad-home-body)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <path d="M2.5 9.5L10.2 3.2C11.2 2.4 12.8 2.4 13.8 3.2L21.5 9.5"
                stroke={active ? "url(#grad-home-roof)" : "currentColor"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {active && <circle cx="12" cy="14" r="2.5" fill="white" />}
            <defs>
                <linearGradient id="grad-home-body" x1="12" y1="9" x2="12" y2="21">
                    <stop stopColor="#ff9a9e" />
                    <stop offset="1" stopColor="#fecfef" />
                </linearGradient>
                <linearGradient id="grad-home-roof" x1="2" y1="3" x2="22" y2="10">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
}


export const IconAssets: React.FC<IconProps> = ({ size = 24, className = '', active }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="3" width="7" height="7" rx="2.5"
                fill={active ? "url(#grad-grid)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <rect x="14" y="3" width="7" height="7" rx="2.5"
                fill={active ? "url(#grad-grid)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                opacity={active ? 0.8 : 1}
            />
            <rect x="14" y="14" width="7" height="7" rx="2.5"
                fill={active ? "url(#grad-grid)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                opacity={active ? 0.6 : 1}
            />
            <rect x="3" y="14" width="7" height="7" rx="2.5"
                fill={active ? "url(#grad-grid)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                opacity={active ? 0.4 : 1}
            />
            <defs>
                <linearGradient id="grad-grid" x1="0" y1="0" x2="24" y2="24">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconSettings: React.FC<IconProps> = ({ size = 24, className = '', active }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="3"
                fill={active ? "white" : "transparant"}
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                fill={active ? "url(#grad-settings)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="grad-settings" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconUser: React.FC<IconProps> = ({ size = 24, className = '', active }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="7" r="4"
                fill={active ? "url(#grad-user)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <path d="M4 21V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V21"
                fill={active ? "url(#grad-user)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={active ? 0.7 : 1}
            />
            <defs>
                <linearGradient id="grad-user" x1="4" y1="3" x2="20" y2="21">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconLogout: React.FC<IconProps> = ({ size = 24, className = '', active }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke={active ? "#EF4444" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M16 17L21 12L16 7"
                stroke={active ? "#EF4444" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M21 12H9"
                stroke={active ? "#EF4444" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export const IconSparkles: React.FC<IconProps> = ({ size = 24, className = '', active = true }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path
                d="M12 2L14.4 7.2L20 9L14.4 10.8L12 16L9.6 10.8L4 9L9.6 7.2L12 2Z"
                fill={active ? "url(#grad-sparkles-1)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <path
                d="M19 15L20.2 17.8L23 19L20.2 20.2L19 23L17.8 20.2L15 19L17.8 17.8L19 15Z"
                fill={active ? "url(#grad-sparkles-2)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                opacity={active ? 0.8 : 1}
            />
            <path
                d="M5 16L5.8 17.8L8 19L5.8 20.2L5 22L4.2 20.2L2 19L4.2 17.8L5 16Z"
                fill={active ? "url(#grad-sparkles-3)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                opacity={active ? 0.6 : 1}
            />
            <defs>
                <linearGradient id="grad-sparkles-1" x1="4" y1="2" x2="20" y2="16">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
                <linearGradient id="grad-sparkles-2" x1="15" y1="15" x2="23" y2="23">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
                <linearGradient id="grad-sparkles-3" x1="2" y1="16" x2="8" y2="22">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconPalette: React.FC<IconProps> = ({ size = 24, className = '', active = true }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.86 22 13.62 21.6 14.16 21.03C14.46 20.72 14.65 20.3 14.65 19.86C14.65 19.56 14.54 19.3 14.36 19.12C14.28 19.04 14.22 18.96 14.18 18.87C14.12 18.73 14.09 18.57 14.09 18.4C14.09 17.52 14.81 16.8 15.69 16.8H17.5C19.98 16.8 22 14.78 22 12.3C22 6.61 17.52 2 12 2ZM6.5 13C5.67 13 5 12.33 5 11.5C5 10.67 5.67 10 6.5 10C7.33 10 8 10.67 8 11.5C8 12.33 7.33 13 6.5 13ZM9.5 9C8.67 9 8 8.33 8 7.5C8 6.67 8.67 6 9.5 6C10.33 6 11 6.67 11 7.5C11 8.33 10.33 9 9.5 9ZM14.5 9C13.67 9 13 8.33 13 7.5C13 6.67 13.67 6 14.5 6C15.33 6 16 6.67 16 7.5C16 8.33 15.33 9 14.5 9ZM17.5 13C16.67 13 16 12.33 16 11.5C16 10.67 16.67 10 17.5 10C18.33 10 19 10.67 19 11.5C19 12.33 18.33 13 17.5 13Z"
                fill={active ? "url(#grad-palette)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <defs>
                <linearGradient id="grad-palette" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconHeart: React.FC<IconProps> = ({ size = 24, className = '', active = true }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
                fill={active ? "url(#grad-heart)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <defs>
                <linearGradient id="grad-heart" x1="2" y1="3" x2="22" y2="21">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#EC4899" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconImage: React.FC<IconProps> = ({ size = 24, className = '', active = true }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"
                fill={active ? "url(#grad-image-bg)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
            />
            <circle cx="8.5" cy="8.5" r="1.5"
                fill={active ? "white" : "currentColor"}
                fillOpacity={active ? 0.8 : 1}
            />
            <path d="M21 15L16 10L5 21"
                fill="none"
                stroke={active ? "white" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="grad-image-bg" x1="3" y1="3" x2="21" y2="21">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconMagic: React.FC<IconProps> = ({ size = 24, className = '', active = true }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path
                d="M7.5 5.6L10 7L7.5 8.4L6.1 10.9L4.7 8.4L2.2 7L4.7 5.6L6.1 3.1L7.5 5.6ZM22 5L19 2L16 5L13 2L16 8L13 11L16 14L19 11L22 14L19 8L22 5ZM9 12L7 16L3 18L7 20L9 24L11 20L15 18L11 16L9 12Z"
                fill={active ? "url(#grad-magic)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="grad-magic" x1="2" y1="2" x2="22" y2="24">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#F43F5E" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const IconZap: React.FC<IconProps> = ({ size = 24, className = '', active = true }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill={active ? "url(#grad-zap)" : "none"}
                stroke={active ? "none" : "currentColor"}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="grad-zap" x1="3" y1="2" x2="21" y2="22">
                    <stop stopColor="#F43F5E" />
                    <stop offset="1" stopColor="#FB923C" />
                </linearGradient>
            </defs>
        </svg>
    );
};
