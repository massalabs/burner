import { LeaderboardEntry, nanoMasToMas } from '../hooks/useBurner';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '🔥';
  }
}

function getRankStyle(rank: number): React.CSSProperties {
  switch (rank) {
    case 1:
      return {
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 100%)',
        borderColor: 'rgba(255, 215, 0, 0.5)',
      };
    case 2:
      return {
        background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.3) 0%, rgba(192, 192, 192, 0.1) 100%)',
        borderColor: 'rgba(192, 192, 192, 0.5)',
      };
    case 3:
      return {
        background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.3) 0%, rgba(205, 127, 50, 0.1) 100%)',
        borderColor: 'rgba(205, 127, 50, 0.5)',
      };
    default:
      return {
        background: 'rgba(255, 107, 53, 0.1)',
        borderColor: 'rgba(255, 107, 53, 0.2)',
      };
  }
}

export function Leaderboard({ entries, isLoading }: LeaderboardProps) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(10px)',
    }}>
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '20px',
        marginBottom: '20px',
        color: 'var(--color-fire-yellow)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span>🏆</span>
        <span>Top Burners</span>
      </h3>

      {isLoading && entries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{
            animation: 'flicker 1s ease-in-out infinite',
            fontSize: '32px',
            marginBottom: '10px',
          }}>🔥</div>
          Loading leaderboard...
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
          No burns yet. Be the first on the leaderboard!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.slice(0, 10).map((entry) => (
            <div
              key={entry.address}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid',
                transition: 'all 0.2s ease',
                ...getRankStyle(entry.rank),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontSize: entry.rank <= 3 ? '24px' : '18px',
                  minWidth: '32px',
                  textAlign: 'center',
                }}>
                  {getRankEmoji(entry.rank)}
                </span>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '2px',
                  }}>
                    #{entry.rank}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: entry.rank <= 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}>
                    {truncateAddress(entry.address)}
                  </div>
                </div>
              </div>
              <div style={{
                fontWeight: 700,
                fontSize: entry.rank <= 3 ? '18px' : '16px',
                color: entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : entry.rank === 3 ? '#cd7f32' : 'var(--color-fire-orange)',
                textShadow: entry.rank <= 3 ? '0 0 10px currentColor' : 'none',
              }}>
                {nanoMasToMas(entry.totalBurned)} MAS
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

