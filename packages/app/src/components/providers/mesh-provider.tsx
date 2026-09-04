'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type * as Y from 'yjs';
import type { WebrtcProvider } from 'y-webrtc';

interface MeshContextType {
  doc: Y.Doc | null;
  provider: WebrtcProvider | null;
  synced: boolean;
  themeState: any;
  setTheme: (theme: string) => void;
}

const MeshContext = createContext<MeshContextType>({
  doc: null,
  provider: null,
  synced: false,
  themeState: { theme: 'dark' },
  setTheme: () => {},
});

export const useMesh = () => useContext(MeshContext);

function normalizeTheme(t?: string): string {
  if (!t) return 'dark';
  if (t === 'theme-latex' || t === 'latex') return 'theme-latex';
  if (t === 'theme-16bit' || t === '16bit') return 'theme-16bit';
  if (t === 'theme-phosphor' || t === 'phosphor') return 'theme-phosphor';
  return 'dark';
}

function applyThemeToDom(themeKey: string) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.classList.remove('dark', 'theme-latex', 'theme-16bit', 'theme-phosphor', 'theme-promethean-citadel', 'theme-citadel');

  if (themeKey === 'dark' || themeKey === 'theme-citadel') {
    html.classList.add('dark', 'theme-promethean-citadel');
  } else {
    html.classList.add(themeKey);
    // 16bit and phosphor are also dark backgrounds
    if (themeKey === 'theme-16bit' || themeKey === 'theme-phosphor') {
      html.classList.add('dark');
    }
  }
}

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

  const [themeState, setThemeState] = useState<any>({ theme: 'dark' });

  // Initial load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pns_theme');
      if (saved) {
        const canonical = normalizeTheme(saved);
        setThemeState((prev: any) => ({ ...prev, theme: canonical }));
        applyThemeToDom(canonical);
      } else {
        applyThemeToDom('dark');
      }
    } catch {}
  }, []);

  const setTheme = React.useCallback((newTheme: string) => {
    const canonical = normalizeTheme(newTheme);
    setThemeState((prev: any) => ({ ...prev, theme: canonical }));
    applyThemeToDom(canonical);

    try {
      localStorage.setItem('pns_theme', canonical);
    } catch {}

    if (doc) {
      try {
        const ymap = doc.getMap('ui-theme');
        ymap.set('theme', canonical);
        ymap.set('isAdaptive', false);
      } catch {}
    }
  }, [doc]);

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
      const initialMapData = ymap.toJSON();
      if (!isCancelled && initialMapData && initialMapData.theme) {
        const canonical = normalizeTheme(initialMapData.theme);
        setThemeState(initialMapData);
        applyThemeToDom(canonical);
      }

      // Observe changes from local or remote peers
      ymap.observe(() => {
        if (!isCancelled) {
          const data = ymap.toJSON();
          if (data && data.theme) {
            const canonical = normalizeTheme(data.theme);
            setThemeState(data);
            applyThemeToDom(canonical);
          }
        }
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
    <MeshContext.Provider value={{ doc, provider, synced, themeState, setTheme }}>
      {children}
    </MeshContext.Provider>
  );
};
