import { ORG } from '../lib/constants';

function getInitials(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ').filter(Boolean);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function PlayerAvatar({ fullName, avatarUrl, size = 48 }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'Player avatar'}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: ORG,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
    >
      {getInitials(fullName)}
    </div>
  );
}
