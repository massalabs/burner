import { nanoMasToMas } from '../hooks/useBurner';

interface CounterProps {
  label: string;
  value: bigint;
  multiplier?: number;
  color: 'fire' | 'gold';
}

export function Counter({ label, value, multiplier = 1, color }: CounterProps) {
  const displayValue = BigInt(multiplier) * value;
  
  const colorStyles = {
    fire: {
      gradient: 'linear-gradient(135deg, #ff6b35 0%, #ff4500 50%, #dc143c 100%)',
      shadow: '0 0 30px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 69, 0, 0.2)',
      textShadow: '0 0 20px rgba(255, 107, 53, 0.8)',
    },
    gold: {
      gradient: 'linear-gradient(135deg, #ffd700 0%, #daa520 50%, #b8860b 100%)',
      shadow: '0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(218, 165, 32, 0.2)',
      textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
    },
  };

  const styles = colorStyles[color];

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '16px',
      padding: '24px 32px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      boxShadow: styles.shadow,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      flex: 1,
      minWidth: '280px',
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'var(--color-text-secondary)',
        marginBottom: '12px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Cinzel', 'Playfair Display', serif",
        fontSize: '42px',
        fontWeight: 700,
        background: styles.gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        filter: `drop-shadow(${styles.textShadow})`,
        animation: 'pulse 3s ease-in-out infinite',
      }}>
        {nanoMasToMas(displayValue)}
      </div>
      <div style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginTop: '4px',
      }}>
        MAS
      </div>
    </div>
  );
}

