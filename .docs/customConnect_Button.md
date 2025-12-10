Custom ConnectButton
Creating a custom ConnectButton
You can use the low-level ConnectButton.Custom to create your own custom connection button. This component renders a function, which includes everything you need to re-implement the built-in buttons.

A minimal re-implementation of the built-in buttons would look something like this:

import { ConnectButton } from '@rainbow-me/rainbowkit';

export const YourApp = () => {
return (
<ConnectButton.Custom>
{({
account,
chain,
openAccountModal,
openChainModal,
openConnectModal,
authenticationStatus,
mounted,
}) => {
// Note: If your app doesn't use authentication, you
// can remove all 'authenticationStatus' checks
const ready = mounted && authenticationStatus !== 'loading';
const connected =
ready &&
account &&
chain &&
(!authenticationStatus ||
authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>

);
};

The following props are passed to your render function.

Account properties
Prop Type Default
account object | undefined –
account.address string –
account.balanceDecimals string | undefined –
account.balanceFormatted string | undefined –
account.balanceSymbol string | undefined –
account.displayBalance string | undefined –
account.displayName string –
account.ensAvatar string | undefined –
account.ensName string | undefined –
account.hasPendingTransactions boolean –
Chain properties
Prop Type Default
chain object | undefined –
chain.hasIcon boolean –
chain.iconUrl string | undefined –
chain.iconBackground string | undefined –
chain.id number –
chain.name string | undefined –
chain.unsupported boolean | undefined –
Modal state properties
Prop Type Default
openAccountModal () => void –
openChainModal () => void –
openConnectModal () => void –
accountModalOpen boolean –
chainModalOpen boolean –
connectModalOpen boolean –
General state properties
Prop Type Default
mounted boolean –
authenticationStatus "loading" | "unauthenticated" | "authenticated" | undefined –
