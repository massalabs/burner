import { useState } from 'react';

interface BurnFormProps {
  onBurn: (amount: number) => Promise<boolean>;
  isBurning: boolean;
  isConnected: boolean;
  onConnect: () => void;
}

export function BurnForm({ onBurn, isBurning, isConnected, onConnect }: BurnFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    const result = await onBurn(numAmount);
    if (result) {
      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  const presetAmounts = [0.1, 1, 5, 10];

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.5)',
      border: '2px solid rgba(255, 107, 53, 0.4)',
      borderRadius: '20px',
      padding: '32px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 40px rgba(255, 107, 53, 0.2)',
      maxWidth: '450px',
      margin: '0 auto',
    }}>
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '24px',
        textAlign: 'center',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        🔥 Throw MAS into the Fire 🔥
      </h3>

      {!isConnected ? (
        <button
          onClick={onConnect}
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: '18px',
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(135deg, #228b22 0%, #006400 100%)',
            border: '2px solid rgba(34, 139, 34, 0.6)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(34, 139, 34, 0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 139, 34, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 139, 34, 0.3)';
          }}
        >
          Connect Wallet to Burn
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
            }}>
              Amount to Burn (MAS)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              disabled={isBurning}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '18px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '10px',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.6)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                disabled={isBurning}
                style={{
                  flex: 1,
                  minWidth: '70px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  background: 'rgba(255, 107, 53, 0.2)',
                  border: '1px solid rgba(255, 107, 53, 0.4)',
                  borderRadius: '8px',
                  cursor: isBurning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isBurning ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isBurning) {
                    e.currentTarget.style.background = 'rgba(255, 107, 53, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)';
                }}
              >
                {preset} MAS
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              background: 'rgba(220, 20, 60, 0.2)',
              border: '1px solid rgba(220, 20, 60, 0.5)',
              borderRadius: '8px',
              color: '#ff6b6b',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              background: 'rgba(34, 139, 34, 0.2)',
              border: '1px solid rgba(34, 139, 34, 0.5)',
              borderRadius: '8px',
              color: '#90EE90',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              🔥 Successfully burned! Thank you for contributing! 🔥
            </div>
          )}

          <button
            type="submit"
            disabled={isBurning || !amount}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              background: isBurning 
                ? 'linear-gradient(135deg, #666 0%, #444 100%)'
                : 'linear-gradient(135deg, #ff6b35 0%, #dc143c 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: isBurning || !amount ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isBurning ? 'none' : '0 4px 20px rgba(255, 107, 53, 0.4)',
              animation: isBurning ? 'none' : 'glow 2s ease-in-out infinite',
              opacity: !amount ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isBurning && amount) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isBurning ? '🔥 Burning...' : '🔥 BURN MAS 🔥'}
          </button>
        </form>
      )}
    </div>
  );
}

