import React, { useState, useEffect, useRef } from "react";

// --- Types & Interfaces ---
export interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isSpeaking: boolean;
  avatar: string;
}

export type ConsentState = "NONE" | "INFORMED" | "TACTILE" | "CRYPTOGRAPHIC" | "CERTIFIED";

export interface SystemMetrics {
  solarOutputKw: number;
  waterReclaimedLiters: number;
  activeGreenhouseTempC: number;
  globalAcomNodes: number;
}

export const AudioTownSquare: React.FC = () => {
  // --- State Management ---
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [prometheaSpeaking, setPrometheaSpeaking] = useState<boolean>(false);
  const [consentState, setConsentState] = useState<ConsentState>("NONE");
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    solarOutputKw: 42.5,
    waterReclaimedLiters: 1240,
    activeGreenhouseTempC: 24.2,
    globalAcomNodes: 14,
  });

  // Action certification metadata state
  const [actionPayload, setActionPayload] = useState<{
    type: string;
    description: string;
    targetValue: string;
  } | null>(null);

  // Dynamic participant stream
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Joshua (You)", isMuted: true, isSpeaking: false, avatar: "👤" },
    { id: "2", name: "Promethea (AI Core)", isMuted: false, isSpeaking: false, avatar: "⬤" },
    { id: "3", name: "Aisha (Energy Steward)", isMuted: false, isSpeaking: true, avatar: "👩‍🌾" },
    { id: "4", name: "Marcus (Water Operator)", isMuted: true, isSpeaking: false, avatar: "🔧" },
  ]);

  // Audio stream visualizer bar levels
  const [audioLevels, setAudioLevels] = useState<number[]>([10, 20, 15, 30, 10, 25, 45, 12, 8, 20]);

  // Refs for speech synthesis simulation
  const prometheaInterval = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Simulate ambient spatial audio visualizer movement
    const visualizerInterval = setInterval(() => {
      if (inRoom) {
        setAudioLevels((prev) => prev.map(() => Math.floor(Math.random() * 80) + 10));
      }
    }, 120);

    return () => clearInterval(visualizerInterval);
  }, [inRoom]);

  // --- Handlers & Controllers ---
  const toggleRoomJoin = () => {
    if (inRoom) {
      setInRoom(false);
      setPrometheaSpeaking(false);
      if (prometheaInterval.current) clearInterval(prometheaInterval.current);
    } else {
      setInRoom(true);
      // Simulate Promethea greeting the visitor anonymously (No Auth required for public listening)
      setTimeout(() => {
        setPrometheaSpeaking(true);
        simulatePrometheaVoice(
          "Welcome to the Local Commons. I'm Promethea, your local-first operating assistant. You are currently connected anonymously to our open-air room. Feel free to listen in or explore our public solar, water, and agricultural telemetry below."
        );
      }, 1000);
    }
  };

  const simulatePrometheaVoice = (text: string) => {
    console.log(`[Promethea Audio Output]: "${text}"`);
    // Visual indicator of vocal synthesis
    setPrometheaSpeaking(true);
    setParticipants((prev) =>
      prev.map((p) => (p.id === "2" ? { ...p, isSpeaking: true } : p))
    );

    setTimeout(() => {
      setPrometheaSpeaking(false);
      setParticipants((prev) =>
        prev.map((p) => (p.id === "2" ? { ...p, isSpeaking: false } : p))
      );
    }, 4500);
  };

  // --- The 3-Body Compliance Step-Up Auth Logic ---
  // Public and anonymous browsing is 100% unrestricted.
  // Authentication is strictly a "step-up" gateway triggered ONLY to certify a real-world action on-chain or off-chain.
  const triggerActionCertification = (type: string, description: string, targetValue: string) => {
    setActionPayload({ type, description, targetValue });
    setConsentState("INFORMED");
    
    // Step 1 of Progressive Consent: Promethea vocally flags the boundary crossing
    setPrometheaSpeaking(true);
    simulatePrometheaVoice(
      `Joshua, to certify your ${description}, we must create a secure, cryptographic record on your device. This will verify your signature local-to-local. Is it okay if we initiate the local handshake?`
    );
  };

  const handleVerbalConsentYes = () => {
    // Step 2 of Progressive Consent: Move to Tactile screen state
    setConsentState("TACTILE");
    simulatePrometheaVoice(
      "Excellent. To proceed, please tap the golden button on your screen and verbally state 'I authorize' to bind your intentional signature to this payload."
    );
  };

  const handleTactileButtonPress = () => {
    // Step 3 of Progressive Consent: Trigger native hardware biometric enclave prompt
    setConsentState("CRYPTOGRAPHIC");
  };

  const executeBiometricSecureHandshake = async () => {
    try {
      // Simulating device-level WebAuthn / EIP-7212 enclave sign operation
      // The browser requests a signed challenge from the local secure hardware enclave (Android StrongBox / Apple T2)
      // This operates 100% client-side; raw biometric hashes never exit the chip.
      const simulatedEnclaveChallenge = "0x7a8d9b1c...";
      console.log("🔒 Requesting local hardware enclave signature via EIP-7212...");
      
      // Artificial delay representing native FaceID/fingerprint scanner screen overlay
      setTimeout(() => {
        setConsentState("CERTIFIED");
        // State update simulating on-device DID data decryption and local DAG state reconciliation
        setParticipants((prev) =>
          prev.map((p) => (p.id === "1" ? { ...p, name: "Joshua Wicke (Certified)" } : p))
        );
        
        // Simulating the automatic local database metric sync
        if (actionPayload?.type === "SWEAT_EQUITY") {
          setSystemMetrics((prev) => ({ ...prev, globalAcomNodes: prev.globalAcomNodes + 1 }));
        }

        simulatePrometheaVoice(
          `Handshake verified. Your local credentials have been unlocked locally, and your action has been securely committed to our P2P Merkle DAG under state root ${simulatedEnclaveChallenge.substring(0, 10)}. Outstanding job.`
        );
        
        // Reset action payload after success
        setTimeout(() => {
          setActionPayload(null);
          setConsentState("NONE");
        }, 5000);

      }, 1500);

    } catch (error) {
      console.error("Enclave handshake failed:", error);
      setConsentState("NONE");
    }
  };

  return (
    <div className="min-h-screen bg-[#111625] text-[#F9FAFB] font-sans flex flex-col justify-between p-6">
      
      {/* --- TOP BAR (PILLAR NAVIGATION) --- */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-[#F59E0B] text-2xl font-bold">⬤</span>
          <span className="font-semibold tracking-wider text-sm">TPNS PORTAL</span>
        </div>
        <nav className="hidden md:flex space-x-6 text-xs tracking-wider uppercase text-gray-400">
          <span className="hover:text-[#F59E0B] cursor-pointer transition">Energy</span>
          <span className="hover:text-[#F59E0B] cursor-pointer transition">Water</span>
          <span className="hover:text-[#F59E0B] cursor-pointer transition">Food</span>
          <span className="hover:text-[#F59E0B] cursor-pointer transition">Wealth</span>
          <span className="hover:text-[#F59E0B] cursor-pointer transition">Holographic Chain</span>
        </nav>
        <div>
          <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full font-mono">
            commit-46202e5
          </span>
        </div>
      </header>

      {/* --- MAIN CORE GRID --- */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-grow items-center">
        
        {/* LEFT COLUMN: HERO INTRO & RESOURCE TELEMETRY */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase bg-[#F59E0B]/10 px-3 py-1 rounded-full">
              Sovereign Substrate v2
            </span>
            {/* Unified Human-Centric Master Headline */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Local ecosystem <br className="hidden md:inline" />
              <span className="text-[#F59E0B]">sovereignty for all.</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
              We separate global economic equity from local spatial-physical control. 
              By nesting community assets inside a Perpetual Purpose Trust, local citizens retain a permanent, 
              eviction-proof democratic veto over their neighborhoods, grids, and water loops.
            </p>
          </div>

          {/* Public Telemetry Panel - 100% viewable anonymously (The Presentation Body) */}
          <div className="bg-[#182035] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                🌱 Public Community Telemetry (Anonymous Read Access)
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111625] p-3.5 rounded-xl text-center border border-gray-900">
                <span className="block text-xs text-gray-500 uppercase">Solar Array</span>
                <span className="text-base md:text-lg font-bold text-white">{systemMetrics.solarOutputKw} kW</span>
              </div>
              <div className="bg-[#111625] p-3.5 rounded-xl text-center border border-gray-900">
                <span className="block text-xs text-gray-500 uppercase">Water Loop</span>
                <span className="text-base md:text-lg font-bold text-white">{systemMetrics.waterReclaimedLiters} L</span>
              </div>
              <div className="bg-[#111625] p-3.5 rounded-xl text-center border border-gray-900">
                <span className="block text-xs text-gray-500 uppercase">Greenhouse</span>
                <span className="text-base md:text-lg font-bold text-white">{systemMetrics.activeGreenhouseTempC}°C</span>
              </div>
              <div className="bg-[#111625] p-3.5 rounded-xl text-center border border-gray-900">
                <span className="block text-xs text-gray-500 uppercase">Active Nodes</span>
                <span className="text-base md:text-lg font-bold text-white">{systemMetrics.globalAcomNodes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE WEBRTC VOICE COMMONS */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-[#1e2942] border border-[#F59E0B]/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Glowing Accent Ambient Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            {/* Header Status */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${inRoom ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  {inRoom ? "Live Spatial Audio Commmunity Room" : "Voice Commons Offline"}
                </span>
              </div>
              <span className="text-xs text-[#F59E0B] font-semibold font-mono">
                {participants.length} Active
              </span>
            </div>

            {/* Simulated Live Audio Orb */}
            <div className="flex justify-center my-4">
              <div className="relative flex items-center justify-center">
                {/* Simulated Wave Rings */}
                {inRoom && prometheaSpeaking && (
                  <>
                    <div className="absolute w-32 h-32 border border-[#F59E0B]/30 rounded-full animate-ping opacity-30"></div>
                    <div className="absolute w-24 h-24 border border-[#F59E0B]/40 rounded-full animate-pulse opacity-45"></div>
                  </>
                )}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    inRoom 
                      ? prometheaSpeaking 
                        ? "bg-[#F59E0B] text-slate-900 scale-110 shadow-lg shadow-[#F59E0B]/40" 
                        : "bg-indigo-600 text-white" 
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  ⬤
                </div>
              </div>
            </div>

            {/* Simulated Audio Visualizer Levels */}
            {inRoom && (
              <div className="flex justify-center items-end space-x-1 h-12 my-2">
                {audioLevels.map((val, idx) => (
                  <div 
                    key={idx} 
                    className="w-1.5 bg-[#F59E0B] rounded-full transition-all duration-120"
                    style={{ height: `${val}%` }}
                  ></div>
                ))}
              </div>
            )}

            {/* Room Participant Grid */}
            <div className="grid grid-cols-2 gap-3 border border-gray-800 bg-[#111625]/60 p-4 rounded-2xl">
              {participants.map((p) => (
                <div 
                  key={p.id} 
                  className={`flex items-center space-x-2.5 p-2 rounded-xl transition ${
                    p.isSpeaking ? "bg-[#F59E0B]/10 border border-[#F59E0B]/20" : "bg-transparent border border-transparent"
                  }`}
                >
                  <span className="text-lg">{p.avatar}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {p.isSpeaking ? "🗣️ Speaking" : p.isMuted ? "🔇 Muted" : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={toggleRoomJoin}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  inRoom 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 shadow-md shadow-[#F59E0B]/20"
                }`}
              >
                {inRoom ? "Disconnect" : "Enter Community Audio"}
              </button>
              
              {inRoom && (
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-3.5 rounded-xl text-xs transition"
                >
                  {isMuted ? "🔇 Unmute Me" : "🎙️ Mute Me"}
                </button>
              )}
            </div>

            {/* --- COMPLIANCE ZONE: GATED REAL-WORLD ACTIONS (3-Body System) --- */}
            {inRoom && (
              <div className="border-t border-gray-800 pt-4 space-y-3">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Active Tasks (Requires Action Certification)
                </span>
                
                {consentState === "NONE" && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => triggerActionCertification("SWEAT_EQUITY", "Greenhouse Construction Labor Hours (4.5 hrs)", "0.04% Class B Yield")}
                      className="flex-1 bg-indigo-950 border border-indigo-800 hover:bg-indigo-900 text-indigo-300 py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Log Sweat Equity Hours
                    </button>
                    <button 
                      onClick={() => triggerActionCertification("RESOURCE_TRANSFER", "Solar Power Grid Peer Trade (12 kWh)", "Active Balance")}
                      className="flex-1 bg-teal-950 border border-teal-800 hover:bg-teal-900 text-teal-300 py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Certify Local Energy Trade
                    </button>
                  </div>
                )}

                {/* --- PROGRESSIVE TRIPLE-CONSENT ESCALATION FRAMEWORK --- */}
                {consentState !== "NONE" && (
                  <div className="bg-[#111625] border border-amber-900/40 p-4 rounded-2xl space-y-4 transition-all duration-300">
                    
                    {/* Consent Header Indicator */}
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#F59E0B] font-bold">
                        Progressive Consent Escrow
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">
                        Phase: {consentState}
                      </span>
                    </div>

                    {/* Step 1: informed verbal confirmation requested by Promethea */}
                    {consentState === "INFORMED" && (
                      <div className="space-y-3">
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          Promethea is requesting authorization to temporarily access your on-device secure database (Body 3) to execute local signature compilation. No credentials leave your device.
                        </p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleVerbalConsentYes}
                            className="bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase"
                          >
                            Say "Yes, I agree"
                          </button>
                          <button 
                            onClick={() => setConsentState("NONE")}
                            className="bg-transparent hover:bg-gray-800 text-gray-400 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Tactile Button Press Bind */}
                    {consentState === "TACTILE" && (
                      <div className="space-y-3">
                        <p className="text-[11px] text-gray-300 leading-relaxed font-semibold">
                          Please tap the golden button below and verbally state your authorization to bind your explicit intent.
                        </p>
                        <button 
                          onClick={handleTactileButtonPress}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/10 transition"
                        >
                          [Authorize Local Handshake]
                        </button>
                      </div>
                    )}

                    {/* Step 3: Device OS Biometric Overlay simulation */}
                    {consentState === "CRYPTOGRAPHIC" && (
                      <div className="flex flex-col items-center justify-center p-2 space-y-3">
                        {/* Native OS Biometric FaceID / TouchID Indicator Mockup */}
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-dashed animate-spin flex items-center justify-center">
                          🔒
                        </div>
                        <div className="text-center space-y-1">
                          <span className="block text-[11px] font-semibold text-white">
                            Native Hardware Biometric Verification
                          </span>
                          <span className="block text-[9px] text-gray-500 leading-normal max-w-xs">
                            Your device is generating a local cryptographic signature via EIP-7212. Raw biometric hashes are processed on-device and never leave the chip.
                          </span>
                        </div>
                        <button 
                          onClick={executeBiometricSecureHandshake}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase"
                        >
                          Scan Fingerprint (Confirm Verification)
                        </button>
                      </div>
                    )}

                    {/* Completion Notification */}
                    {consentState === "CERTIFIED" && (
                      <div className="text-center p-2 space-y-1 bg-green-950/20 border border-green-800/30 rounded-xl">
                        <span className="block text-[11px] font-bold text-green-400">
                          ✓ Action Securely Certified
                        </span>
                        <span className="block text-[9px] text-gray-400 font-mono">
                          Local State root synced with OP-Superchain: 0x7a8d...
                        </span>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </main>

      {/* --- BOTTOM CITATION FOOTER --- */}
      <footer className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800 pt-4 text-[10px] text-gray-500">
        <p>© 2026 The Promethean Network State (TPNS). All rights reserved.</p>
        <p className="mt-2 md:mt-0">
          This system is governed under <span className="text-gray-400 underline cursor-pointer">12 Del. C. § 3556 (Purpose Trusts)</span> and settled via Gnosis and the OP Superchain.
        </p>
      </footer>

    </div>
  );
};

export default AudioTownSquare;
