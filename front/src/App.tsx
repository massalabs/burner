import { useState } from 'react';
import { JsonRpcPublicProvider, PublicApiUrl } from "@massalabs/massa-web3";
import { useWallet } from './hooks/useWallet';
import { useBurner } from './hooks/useBurner';
import { Snowflakes } from './components/Snowflakes';
import { FireAnimation } from './components/FireAnimation';
import { Counter } from './components/Counter';
import { BurnForm } from './components/BurnForm';
import { BurnList } from './components/BurnList';
import { Leaderboard } from './components/Leaderboard';
import { WalletModal } from './components/WalletModal';

// Default public provider for reading data
const defaultProvider = JsonRpcPublicProvider.fromRPCUrl(PublicApiUrl.Mainnet);

function App() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const {
    provider: walletProvider,
    wallets,
    selectedWallet,
    accounts,
    selectedAccount,
    isConnected,
    isConnecting,
    address,
    selectWallet,
    selectAccount,
    disconnect,
  } = useWallet();

  // Use wallet provider if connected, otherwise use default public provider
  const activeProvider = walletProvider || defaultProvider;

  const {
    totalBurned,
    recentBurns,
    leaderboard,
    isLoading,
    isBurning,
    burn,
  } = useBurner(activeProvider);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <Snowflakes />
      
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '28px' }}>🔥</span>
          <span style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            MASSA BURNER
          </span>
        </div>

        <button
          onClick={() => setIsWalletModalOpen(true)}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            background: isConnected 
              ? 'linear-gradient(135deg, #228b22 0%, #006400 100%)'
              : 'linear-gradient(135deg, #ff6b35 0%, #dc143c 100%)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isConnected 
              ? '0 4px 15px rgba(34, 139, 34, 0.3)'
              : '0 4px 15px rgba(255, 107, 53, 0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isConnected 
            ? `${address?.slice(0, 6)}...${address?.slice(-4)}` 
            : '🔗 Connect Wallet'}
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '40px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 5,
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
        }}>
          <FireAnimation />
          
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #ffd700 0%, #ff6b35 50%, #dc143c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 30px rgba(255, 107, 53, 0.5))',
          }}>
            End of Year Bonfire! 🎄
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 24px',
            lineHeight: 1.7,
          }}>
            Join the community and burn some MAS to celebrate the end of the year!
          </p>

          <div style={{
            display: 'inline-flex',
            gap: '8px',
            padding: '8px 20px',
            background: 'rgba(220, 20, 60, 0.2)',
            border: '1px solid rgba(220, 20, 60, 0.4)',
            borderRadius: '30px',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
          }}>
            <span>🎅</span>
            <span>Holiday Season Special Event</span>
            <span>🎄</span>
          </div>
        </div>

        {/* Counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '50px',
        }}>
          <Counter 
            label="Total MAS Burned" 
            value={totalBurned} 
            color="fire" 
          />
        </div>

        {/* Burn Form */}
        <div style={{
          marginBottom: '40px',
        }}>
          <BurnForm
            onBurn={burn}
            isBurning={isBurning}
            isConnected={isConnected}
            onConnect={() => setIsWalletModalOpen(true)}
          />
        </div>

        {/* Leaderboard and Recent Burns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Leaderboard */}
          <Leaderboard
            entries={leaderboard}
            isLoading={isLoading}
          />

          {/* Burn History */}
          <BurnList
            burns={recentBurns}
            isLoading={isLoading}
          />
        </div>

        {/* Info Section */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '2px solid rgba(34, 139, 34, 0.3)',
          borderRadius: '16px',
          padding: '24px 32px',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '20px',
            marginBottom: '16px',
            color: 'var(--color-christmas-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span>ℹ️</span> How It Works
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            color: 'var(--color-text-secondary)',
            fontSize: '15px',
            lineHeight: 1.6,
          }}>
            <div>
              <strong style={{ color: 'var(--color-fire-yellow)' }}>1. Connect Your Wallet</strong>
              <p>Connect your Massa wallet (e.g., Massa Station) to participate in the burn.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--color-fire-orange)' }}>2. Choose Amount</strong>
              <p>Select how much MAS you want to burn. Any amount counts!</p>
            </div>
            <div>
              <strong style={{ color: 'var(--color-fire-red)' }}>3. Burn It!</strong>
              <p>
                Your MAS is sent to the{' '}
                <a 
                  href="https://explorer.massa.net/mainnet/address/AU1111111111111111111111111111111112m1s9K/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-fire-yellow)', textDecoration: 'underline' }}
                >
                  null address
                </a>
                {' '}(AU111...m1s9K), permanently removing it from circulation. No one can access these funds ever again!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid rgba(255, 215, 0, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '14px',
        position: 'relative',
        zIndex: 10,
      }}>
        <p>
          Built with 🔥 on{' '}
          <a 
            href="https://massa.net" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--color-fire-yellow)' }}
          >
            Massa Blockchain
          </a>
        </p>
      </footer>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={wallets}
        selectedWallet={selectedWallet}
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectWallet={selectWallet}
        onSelectAccount={selectAccount}
        onDisconnect={disconnect}
        isConnecting={isConnecting}
        address={address}
      />
    </div>
  );
}

export default App;

