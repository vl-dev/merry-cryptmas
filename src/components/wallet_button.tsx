import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const LABELS = {
  'change-wallet': 'Change wallet',
  connecting: 'Connecting ...',
  'copy-address': 'Copy address',
  copied: 'Copied',
  disconnect: 'Disconnect',
  'has-wallet': 'Connect',
  'no-wallet': 'Select Wallet',
} as const;

export function WalletButton() {
  const { setVisible: setModalVisible } = useWalletModal();
  const { buttonState, onConnect, onDisconnect, publicKey } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);

  let klass = "mx-auto text-xl bg-green-700 hover:bg-green-500 text-white md:py-3 py-2 px-6 rounded-md cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
  if (publicKey) {
    klass = "mx-auto text-xl border-2 border-green-700 hover:bg-green-500 text-white md:py-3 py-2 px-6 rounded-md cursor-pointer"
  }
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      setMenuOpen(false);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, []);
  const content = useMemo(() => {
    if (publicKey) {
      const base58 = publicKey.toBase58();
      return base58.slice(0, 4) + '..' + base58.slice(-4);
    } else if (buttonState === 'connecting' || buttonState === 'has-wallet') {
      return LABELS[buttonState];
    } else {
      return 'Connect Wallet';
    }
  }, [buttonState, publicKey]);
  return (
    <div className="wallet-adapter-dropdown">
      <button
        className={klass}
        aria-expanded={menuOpen}
        onClick={() => {
          switch (buttonState) {
            case 'no-wallet':
              setModalVisible(true);
              break;
            case 'has-wallet':
              if (onConnect) {
                onConnect();
              }
              break;
            case 'connected':
              setMenuOpen(true);
              break;
          }
        }}
      >
        {content}
      </button>
      <ul
        aria-label="dropdown-list"
        className={`wallet-adapter-dropdown-list ${menuOpen && 'wallet-adapter-dropdown-list-active'}`}
        ref={ref}
        role="menu"
      >
        {publicKey ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={async () => {
              await navigator.clipboard.writeText(publicKey.toBase58());
              setCopied(true);
              setTimeout(() => setCopied(false), 400);
            }}
            role="menuitem"
          >
            {copied ? LABELS['copied'] : LABELS['copy-address']}
          </li>
        ) : null}
        <li
          className="wallet-adapter-dropdown-list-item"
          onClick={() => {
            setModalVisible(true);
            setMenuOpen(false);
          }}
          role="menuitem"
        >
          {LABELS['change-wallet']}
        </li>
        {onDisconnect ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              onDisconnect();
              setMenuOpen(false);
            }}
            role="menuitem"
          >
            {LABELS['disconnect']}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
