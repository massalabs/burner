import { BurnRecord, nanoMasToMas } from '../hooks/useBurner';

interface BurnListProps {
  burns: BurnRecord[];
  isLoading: boolean;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function BurnList({ burns, isLoading }: BurnListProps) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '2px solid rgba(255, 215, 0, 0.2)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(10px)',
      maxHeight: '400px',
      overflowY: 'auto',
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
        <span>🔥</span>
        <span>Recent Burns</span>
        <span style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          fontFamily: "'Source Sans 3', sans-serif",
          fontWeight: 400,
        }}>
          (Latest 100)
        </span>
      </h3>

      {isLoading && burns.length === 0 ? (
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
          Loading burn history...
        </div>
      ) : burns.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🪵</div>
          No burns yet. Be the first to ignite the bonfire!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {burns.map((burn, index) => (
            <div
              key={`${burn.id}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255, 107, 53, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 107, 53, 0.2)',
                transition: 'all 0.2s ease',
                animation: index < 3 ? 'pulse 2s ease-in-out infinite' : 'none',
                animationDelay: `${index * 0.2}s`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🔥</span>
                <div>
                  <div style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {truncateAddress(burn.address)}
                  </div>
                </div>
              </div>
              <div style={{
                fontWeight: 600,
                fontSize: '16px',
                color: 'var(--color-fire-yellow)',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              }}>
                {nanoMasToMas(burn.amount)} MAS
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

