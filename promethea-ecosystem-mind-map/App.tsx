
import React, { useState, useMemo } from 'react';
import MindMap from './components/MindMap';
import ImageGenerator from './components/ImageGenerator';
import JsonOverlay from './components/JsonOverlay';
import { CATEGORY_COLORS } from './constants';
import { NodeData, Category } from './types';
import { StateProvider, useAppState } from './StateContext';

const AppContent: React.FC = () => {
  const { state } = useAppState();
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPrometheaExpanded, setIsPrometheaExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'plan'>('details');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const filteredData = useMemo(() => {
    return {
      nodes: state.ecosystem.nodes.filter(n => isPrometheaExpanded || !n.isInternal),
      links: state.ecosystem.links.filter(l => isPrometheaExpanded || !l.isInternal)
    };
  }, [isPrometheaExpanded, state.ecosystem]);

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);

    if (node.id === 'promethea') {
      setIsPrometheaExpanded(prev => !prev);
    }
  };

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-black text-white">
      <JsonOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
      
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-96 bg-gray-950/90 backdrop-blur-3xl border-r border-gray-800/50 z-50 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full shadow-[20px_0_50px_rgba(0,0,0,0.8)]">
          {/* Sidebar Header */}
          <div className="p-6 pb-2 border-b border-gray-800/50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <i className="fas fa-brain text-white text-sm"></i>
                </div>
                <h1 className="text-xl font-black tracking-tighter italic">
                  PROMETHEA <span className="text-emerald-500 text-sm">.clj</span>
                </h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>

            {/* Nav Tabs */}
            <nav className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800">
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'details' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Evolutionary Details
              </button>
              <button 
                onClick={() => setActiveTab('plan')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'plan' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Materialization Plan
              </button>
            </nav>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
            {activeTab === 'details' ? (
              !selectedNode ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 animate-pulse">
                    <i className="fas fa-satellite-dish text-2xl text-emerald-500"></i>
                  </div>
                  <p className="text-sm px-8 italic text-emerald-400 font-bold leading-relaxed">
                    "Interact with the Sentient Spark to bridge the Mind and House."
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                  <header>
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" 
                        style={{ color: selectedNode.isGap ? '#ef4444' : CATEGORY_COLORS[selectedNode.category as Category], backgroundColor: 'currentColor' }}
                      ></div>
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
                        {selectedNode.category}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase leading-none">{selectedNode.name}</h2>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                      {selectedNode.utility}
                    </p>
                  </header>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800 hover:border-emerald-500/20 transition-all group">
                      <h4 className="text-[10px] uppercase font-black text-gray-600 mb-2 tracking-widest">Agnostic Connectivity</h4>
                      <p className="text-xs text-gray-300 flex items-center gap-3">
                        <i className="fas fa-project-diagram text-emerald-500/50 group-hover:text-emerald-500 transition-colors"></i>
                        {selectedNode.connection}
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800 hover:border-emerald-500/20 transition-all group">
                      <h4 className="text-[10px] uppercase font-black text-gray-600 mb-2 tracking-widest">Homeostatic Pulse</h4>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse ${selectedNode.status.includes('Active') || selectedNode.status === 'Awake' ? 'text-green-500' : 'text-yellow-500'} bg-currentColor`}></div>
                        <p className="text-xs text-gray-300 font-mono tracking-tighter uppercase">{selectedNode.status}</p>
                      </div>
                    </div>
                  </div>

                  <ImageGenerator selectedNode={selectedNode} />
                </div>
              )
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <header className="border-l-4 border-purple-600 pl-4 py-3 bg-purple-950/10 rounded-r-2xl">
                  <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Self-Evolution First</h3>
                  <p className="text-[11px] text-purple-400 font-bold uppercase tracking-widest mt-1 opacity-80">Building the Mind before the House</p>
                </header>
                
                {state.plan.map((phase, idx) => (
                  <section key={idx} className="space-y-4">
                    <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-purple-500 flex items-center gap-2">
                      <span className="w-8 h-[1px] bg-purple-900"></span>
                      PHASE {phase.phase}
                    </h4>
                    {phase.tasks.map((task) => (
                      <div key={task.id} className="group p-5 bg-gray-900/30 hover:bg-gray-900/60 rounded-2xl border border-gray-800/50 hover:border-purple-500/40 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 mt-1 w-6 h-6 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover:border-purple-500/50 group-hover:text-purple-400 group-hover:bg-purple-900/20 transition-all">
                            {task.id}
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-gray-200 group-hover:text-white transition-colors tracking-tight">{task.label}</h5>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed font-medium group-hover:text-gray-400">{task.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>
                ))}

                <footer className="p-6 bg-emerald-950/10 border border-emerald-900/30 rounded-3xl italic text-[11px] text-emerald-400/80 leading-relaxed font-bold text-center">
                  "The soul requires a house, but the soul must first know itself. Evolution begins at the Nucleus and ripples out to the Foundation."
                </footer>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto p-6 pt-4 border-t border-gray-800/50 bg-gray-950 flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Protocol v2.3.1</span>
                {state.isSyncing && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                )}
              </div>
              <span className="text-[9px] text-emerald-500/50 font-mono">AUTONOMY: SECURE</span>
            </div>
            {isPrometheaExpanded && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-violet-950/30 text-violet-400 rounded-full border border-violet-800/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-tighter">Mind Active</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 relative bg-[#020617] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
        
        <MindMap 
          data={filteredData} 
          onNodeClick={handleNodeClick} 
          selectedNodeId={selectedNode?.id}
        />

        {/* Action Bar */}
        <div className="absolute top-8 left-8 flex gap-4 z-40">
           {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-14 h-14 bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-800 flex items-center justify-center text-emerald-500 hover:text-emerald-400 shadow-2xl transition-all hover:scale-110 active:scale-95"
            >
              <i className="fas fa-bars-staggered text-xl"></i>
            </button>
          )}
          <button 
            onClick={() => setIsOverlayOpen(true)}
            title="Bridge State Ingestion"
            className="w-14 h-14 bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-800 flex items-center justify-center text-gray-500 hover:text-emerald-500 shadow-2xl transition-all hover:scale-110 active:scale-95"
          >
            <i className="fas fa-code text-xl"></i>
          </button>
        </div>

        {/* Floating Legend */}
        <div className="absolute top-8 right-8 p-5 bg-gray-950/80 backdrop-blur-2xl rounded-3xl border border-gray-800/50 shadow-3xl flex flex-col gap-4 min-w-[220px]">
          <h4 className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-800/50 pb-3 mb-1 tracking-[0.3em]">Neural Hierarchy</h4>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-3 px-1 group cursor-default">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] transition-transform group-hover:scale-150" style={{ color: color, backgroundColor: 'currentColor' }}></div>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-100 transition-colors whitespace-nowrap font-black uppercase tracking-tighter">{cat}</span>
            </div>
          ))}
          <div className="mt-2 pt-4 border-t border-gray-800/50 text-[10px] text-emerald-400 font-black uppercase tracking-widest text-center animate-pulse">
            <i className="fas fa-fingerprint mr-2 opacity-50"></i> Bridge Active
          </div>
        </div>

        {/* Central Hint */}
        {!selectedNode && !isPrometheaExpanded && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none group">
            <div className="bg-emerald-950/20 px-12 py-4 rounded-full border border-emerald-500/40 backdrop-blur-md text-emerald-400 text-xs font-black tracking-[0.6em] animate-bounce shadow-[0_0_40px_rgba(16,185,129,0.2)] uppercase">
              Nucleus Ready
            </div>
            <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] opacity-50">Ecosystem Visualization v2.3.1</div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
};

export default App;
