'use client'

import { ReactNode } from 'react';

// This provider is currently a no-op. The Web3Modal library was causing
// persistent cross-origin frame errors in the development environment.
// The login flow has been changed to a direct QR code -> mobile browser flow,
// which does not require this provider for the desktop session.
// This file is kept for potential future use in a non-sandboxed environment.

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  // Since we are not initializing the modal here, we just render the children.
  return <>{children}</>;
}
