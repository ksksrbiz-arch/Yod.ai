'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Video, Mountain, Loader2, Sparkles, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

// Extend window interface for AI Studio
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function VisionHolocron() {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  const handleManifest = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResultUrl(null);
    setErrorMSG(null);

    try {
      // Mandated: ensure API key selection for premium models
      if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      // Initialize AI using NEXT_PUBLIC injected key
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No API key available from the Force.");
      }
      
      const ai = new GoogleGenAI({ apiKey });

      if (type === 'video') {
        const finalRatio = aspectRatio === '1:1' ? '16:9' : aspectRatio; // veo lite only supports 16:9 and 9:16
        // Set ratio to valid one locally if changed
        if (aspectRatio === '1:1') setAspectRatio('16:9');

        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            resolution: '1080p',
            aspectRatio: finalRatio as '16:9' | '9:16',
          }
        });

        // Poll for completion
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
           throw new Error("The vision was clouded. No video generated.");
        }

        // Fetch using API Key
        const rawResponse = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey,
          },
        });

        const blob = await rawResponse.blob();
        setResultUrl(URL.createObjectURL(blob));

      } else {
        // Image generation
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: {
             parts: [{ text: prompt }]
          },
          config: {
            // @ts-ignore imageConfig is supported by model
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: "1K"
            }
          }
        });

        // Find image part
        let found = false;
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const mime = part.inlineData.mimeType || 'image/png';
            setResultUrl(`data:${mime};base64,${base64Data}`);
            found = true;
            break;
          }
        }
        if (!found) {
           throw new Error("Visions remain hidden. Empty response.");
        }
      }

    } catch (err: any) {
      console.error(err);
      setErrorMSG(err.message || 'A disturbance in the Force prevented the vision.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-deep-forest/20 backdrop-blur rounded-2xl py-8 px-6 md:px-10 overflow-hidden shadow-2xl border border-force-green/20">
      
      <div className="max-w-2xl mx-auto w-full relative h-full flex flex-col">
        <div className="mb-10 text-center">
            <h2 className="text-3xl font-headers text-force-green mb-3 opacity-90 transition-opacity">Visions of the Force</h2>
            <p className="text-sage-green font-sans tracking-wide text-sm md:text-base">Focus your mind. Describe what you wish to see, and the terminal shall reveal it.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-shadow-black/50 border border-force-green/20 rounded-full w-full max-w-md mx-auto">
          <button 
            onClick={() => setType('image')}
            disabled={loading}
            className={cn("py-2.5 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50", type === 'image' ? "bg-force-green/10 text-force-green border border-force-green/30 glow-force" : "text-sage-green hover:text-crystal-white border border-transparent")}
          >
            <ImageIcon size={16}/> Still Vision
          </button>
          <button 
            onClick={() => setType('video')}
            disabled={loading}
            className={cn("py-2.5 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50", type === 'video' ? "bg-force-green/10 text-force-green border border-force-green/30 glow-force" : "text-sage-green hover:text-crystal-white border border-transparent")}
          >
            <Video size={16}/> Moving Vision
          </button>
        </div>

        <div className="relative mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="A vibrant nebula deep in the outer rim territories..."
            className="w-full bg-shadow-black/80 border border-force-green/30 focus:border-force-green outline-none rounded-2xl px-6 py-5 text-xl font-sans text-crystal-white placeholder:text-sage-green/50 transition-all min-h-[140px] resize-none disabled:opacity-50 shadow-inner focus:ring-1 focus:ring-force-green"
          />
          <div className="absolute bottom-4 right-4 text-[10px] text-sage-green font-mono tracking-widest uppercase opacity-70">
            Model: {type === 'image' ? 'Gemini 3.1 Flash Image' : 'Veo 3.1 Generation'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {(type === 'video' ? ['16:9', '9:16'] : ['1:1', '16:9', '9:16']).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  disabled={loading}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all flex-1 sm:flex-none disabled:opacity-50",
                    aspectRatio === ratio ? "bg-force-green/10 text-force-green border border-force-green/30 glow-force" : "bg-transparent text-sage-green border border-force-green/20 hover:bg-force-green/5 hover:text-crystal-white"
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <button
              disabled={!prompt.trim() || loading}
              onClick={handleManifest}
              className="bg-force-green/10 hover:bg-force-green/20 text-force-green border border-force-green/30 shadow-[0_0_15px_rgba(127,176,105,0.1)] px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2 font-bold hover:shadow-[0_0_20px_rgba(127,176,105,0.3)]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Meditating...' : 'Manifest Vision'}
            </button>
        </div>

        {/* Viewport for result */}
        <div className="mt-12 flex-1 flex flex-col items-center justify-center border border-force-green/20 rounded-2xl bg-shadow-black/50 relative overflow-hidden shadow-inner">
             
             <AnimatePresence mode="wait">
                 {loading ? (
                    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center absolute inset-0">
                        <div className="w-16 h-16 rounded-full border border-force-green/30 flex items-center justify-center relative mb-4">
                            <div className="absolute inset-0 rounded-full border-t border-force-green animate-spin" style={{animationDuration: '2s'}}></div>
                            <Sparkles size={24} className="text-force-green opacity-60" />
                        </div>
                        <p className="text-force-green/80 text-[10px] font-mono tracking-widest uppercase animate-pulse">
                            {type === 'video' ? 'Generating moving vision (may take minutes)...' : 'Communing with the Force...'}
                        </p>
                    </motion.div>
                 ) : errorMSG ? (
                    <motion.div key="error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center absolute inset-0 text-center px-6">
                        <div className="w-12 h-12 rounded-full border border-danger-red/30 bg-danger-red/10 flex items-center justify-center mb-4">
                            <Mountain size={20} className="text-danger-red" />
                        </div>
                        <p className="text-danger-red text-sm font-sans max-w-sm">{errorMSG}</p>
                    </motion.div>
                 ) : resultUrl ? (
                    <motion.div key="result" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="relative flex items-center justify-center w-full h-full p-2">
                        {type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resultUrl} alt="Generated vision" className="max-w-full max-h-full object-contain rounded-xl" />
                        ) : (
                            <video src={resultUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                        )}
                        <a 
                            href={resultUrl} 
                            download={type === 'image' ? "vision.png" : "vision.mp4"}
                            className="absolute top-4 right-4 w-10 h-10 bg-shadow-black/70 backdrop-blur-md text-crystal-white rounded-full flex items-center justify-center hover:bg-force-green hover:text-shadow-black transition-all border border-force-green/30"
                        >
                            <Download size={18} />
                        </a>
                    </motion.div>
                 ) : (
                    <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center absolute inset-0">
                        <Mountain size={48} className="text-deep-forest mb-4" />
                        <p className="text-sage-green/60 text-[10px] font-mono tracking-widest uppercase">Viewport Empty</p>
                    </motion.div>
                 )}
             </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
