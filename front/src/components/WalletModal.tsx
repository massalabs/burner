import { Wallet } from "@massalabs/wallet-provider";
import { Provider } from "@massalabs/massa-web3";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  accounts: Provider[];
  selectedAccount: Provider | null;
  onSelectWallet: (wallet: Wallet | null) => void;
  onSelectAccount: (account: Provider | null) => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  address: string | null;
}

export function WalletModal({
  isOpen,
  onClose,
  wallets,
  selectedWallet,
  accounts,
  selectedAccount,
  onSelectWallet,
  onSelectAccount,
  onDisconnect,
  isConnecting,
  address,
}: WalletModalProps) {
  if (!isOpen) return null;

  const handleWalletClick = (wallet: Wallet) => {
    onSelectWallet(wallet);
  };

  const handleAccountClick = (account: Provider) => {
    onSelectAccount(account);
    onClose();
  };

  const handleBackToWallets = () => {
    onSelectWallet(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a12 100%)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '450px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 60px rgba(255, 107, 53, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '24px',
            background: 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}>
            {address ? 'Wallet Connected' : selectedWallet ? 'Select Account' : 'Connect Wallet'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Connected State */}
        {address ? (
          <div>
            <div style={{
              background: 'rgba(34, 139, 34, 0.2)',
              border: '1px solid rgba(34, 139, 34, 0.4)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
              }}>
                Wallet
              </div>
              <div style={{
                fontSize: '14px',
                color: '#90EE90',
                marginBottom: '12px',
              }}>
                {selectedWallet?.name()}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
              }}>
                Connected Address
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                wordBreak: 'break-all',
                color: '#90EE90',
              }}>
                {address}
              </div>
            </div>
            <button
              onClick={() => {
                onDisconnect();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #dc143c 0%, #8b0000 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Disconnect
            </button>
          </div>
        ) : selectedWallet && accounts.length > 0 ? (
          /* Account Selection */
          <div>
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: 'rgba(255, 107, 53, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '14px' }}>
                🔥 {selectedWallet.name()}
              </span>
              <button
                onClick={handleBackToWallets}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 107, 53, 0.4)',
                  color: 'var(--color-fire-orange)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Change Wallet
              </button>
            </div>

            <div style={{ 
              marginBottom: '12px', 
              color: 'var(--color-text-secondary)', 
              fontSize: '14px' 
            }}>
              Select an account to connect:
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {accounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleAccountClick(account)}
                  style={{
                    padding: '14px 16px',
                    background: selectedAccount?.address === account.address
                      ? 'rgba(255, 215, 0, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedAccount?.address === account.address
                      ? '2px solid rgba(255, 215, 0, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    wordBreak: 'break-all',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (selectedAccount?.address !== account.address) {
                      e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedAccount?.address !== account.address) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {account.address}
                </button>
              ))}
            </div>
          </div>
        ) : isConnecting ? (
          /* Loading */
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{
              animation: 'flicker 1s ease-in-out infinite',
              fontSize: '48px',
              marginBottom: '16px',
            }}>🔥</div>
            <div>Connecting to wallet...</div>
          </div>
        ) : wallets.length === 0 ? (
          /* No Wallets */
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
            <p style={{ marginBottom: '16px', lineHeight: 1.6 }}>
              No Massa wallets detected.<br />
              Please install Massa Station to connect.
            </p>
            <a
              href="https://station.massa.net/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #228b22 0%, #006400 100%)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              Get Massa Station
            </a>
          </div>
        ) : (
          /* Wallet Selection */
          <div>
            <div style={{ 
              marginBottom: '16px', 
              color: 'var(--color-text-secondary)', 
              fontSize: '14px' 
            }}>
              Select a wallet to connect:
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {wallets.map((wallet, index) => (
                <button
                  key={index}
                  onClick={() => handleWalletClick(wallet)}
                  style={{
                    padding: '18px 20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '28px' }}>🔥</span>
                  <span>{wallet.name()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
