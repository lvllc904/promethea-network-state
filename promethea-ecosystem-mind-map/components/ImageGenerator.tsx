
import React, { useState } from 'react';
import { ImageSize, NodeData } from '../types';
import { generateEcosystemImage } from '../services/geminiService';

interface ImageGeneratorProps {
  selectedNode: NodeData | null;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ selectedNode }) => {
  const [size, setSize] = useState<ImageSize>('1K');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // Proceeding assuming success as per instructions
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    const prompt = selectedNode 
      ? `A conceptual artistic representation of the ${selectedNode.name} component in the Promethea ecosystem: ${selectedNode.utility}`
      : "A high-level overview of a bioluminescent AI ecosystem architecture named Promethea";

    try {
      const imageUrl = await generateEcosystemImage(prompt, size);
      if (imageUrl) {
        setResultImage(imageUrl);
      } else {
        setError("Could not generate image. Please try again.");
      }
    } catch (err: any) {
      if (err.message === "API_KEY_RESET") {
        setError("Billing/API Key issue detected. Please re-select your key.");
        await window.aistudio.openSelectKey();
      } else {
        setError("Failed to generate: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-800 pt-6">
      <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <i className="fas fa-wand-magic-sparkles"></i>
        Visualizer (Nano Banana Pro)
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">Resolution:</span>
          <div className="flex gap-2">
            {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  size === s 
                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-emerald-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Synthesizing...
            </>
          ) : (
            <>
              <i className="fas fa-image"></i>
              Generate Visualization
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {resultImage && (
          <div className="mt-4 animate-in fade-in duration-500">
            <img 
              src={resultImage} 
              alt="Generated Ecosystem Visualization" 
              className="w-full rounded-lg border border-gray-700 shadow-xl"
            />
            <a 
              href={resultImage} 
              download="promethea-viz.png" 
              className="mt-2 block text-center text-[10px] text-gray-500 hover:text-white underline"
            >
              Download Original
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
