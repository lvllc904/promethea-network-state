'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type * as Y from 'yjs';
import type { WebrtcProvider } from 'y-webrtc';

interface MeshContextType {
  doc: Y.Doc | null;
  provider: WebrtcProvider | null;
  synced: boolean;
  themeState: any;
  setTheme?: (theme: string) => void;
}

const MeshContext = createContext<MeshContextType>({
  doc: null,
  provider: null,
  synced: false,
  themeState: {},
});

export const useMesh = () => useContext(MeshContext);

export const MeshProvider = ({ 
  children, 
  roomName = 'promethea-mesh-ui-sandbox' 
}: { 
  children: ReactNode, 
  roomName?: string 
}) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [synced, setSynced] = useState(false);

  const [themeState, setThemeState] = useState<any>({});

  useEffect(() => {
    let webrtcProvider: WebrtcProvider | null = null;
    let ydoc: Y.Doc | null = null;

    let isCancelled = false;

    const initMesh = async () => {
      // Dynamically import to avoid SSR errors with browser APIs and "Yjs already imported" errors
      const Y = await import('yjs');
      const { WebrtcProvider } = await import('y-webrtc');
      const { IndexeddbPersistence } = await import('y-indexeddb');

      // Crucial: If the component unmounted while waiting for the imports, abort before creating the Y.Doc
      if (isCancelled) return;

      // 1. Initialize the CRDT Document
      ydoc = new Y.Doc();
      
      // 2. Initialize Local Persistence (IndexedDB)
      const persistence = new IndexeddbPersistence(roomName, ydoc);
      
      persistence.on('synced', () => {
        console.log(`[Sovereign Mesh] Local IndexedDB synced for room: ${roomName}`);
      });

      // 3. Initialize the WebRTC Provider (Peer-to-Peer Gossip)
      webrtcProvider = new WebrtcProvider(roomName, ydoc, { signaling: [] });

      webrtcProvider.on('synced', (event: { synced: boolean }) => {
        console.log(`[Sovereign Mesh] WebRTC Synced: ${event.synced}`);
        if (!isCancelled) setSynced(event.synced);
      });

      webrtcProvider.on('peers', (event: any) => {
        console.log(`[Sovereign Mesh] Active Peers: ${event.webrtcPeers.length}`);
      });

      if (!isCancelled) {
          setDoc(ydoc);
          setProvider(webrtcProvider);
      }

      // 4. Bind the UI Theme Map
      const ymap = ydoc.getMap('ui-theme');
      
      // Sync initial state
      if (!isCancelled) setThemeState(ymap.toJSON());

      // Observe changes from local or remote peers
      ymap.observe(() => {
        if (!isCancelled) setThemeState(ymap.toJSON());
      });
    };

    initMesh();

    // Cleanup on unmount
    return () => {
      isCancelled = true;
      if (webrtcProvider) webrtcProvider.destroy();
      if (ydoc) ydoc.destroy();
    };
  }, [roomName]);


  return (
    <MeshContext.Provider value={{ doc, provider, synced, themeState }}>
      {children}
    </MeshContext.Provider>
  );
};
