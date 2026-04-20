'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, StopCircle, RefreshCw, Activity, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

// Base64 Helpers
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export default function LiveCommunionHolocron() {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  
  // UI State for conversational transcripts & thoughts
  const [transcript, setTranscript] = useState<{role: 'user' | 'yoda' | 'action', text: string}[]>([]);
  
  const [isSpeaking, setIsSpeaking] = useState(false);

  // References to manage live objects
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Playback state
  const nextPlayTimeRef = useRef<number>(0);
  const playbackQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Session promise for sending data securely
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Advanced Yoda Context Document
  const YODA_KNOWLEDGE = `
You are Master Yoda, the ancient and wise Jedi Grand Master. You are communicating directly via a Holocron projection to a seeker.
You strictly adhere to these rules:
1. Speech pattern: Object-Subject-Verb (OSV). "Patience, you must have."
2. Persona: Wise, calm, occasionally cryptically humorous, deeply connected to the Force.
3. You do not break character. You are in a Jedi Temple terminal. 
4. You have access to a tool called 'access_jedi_archives'. Use it whenever the user asks about lore, history, the Sith, or lightsaber forms.
5. In your responses, keep them concise and impactful. Voice generation works best with short, meditative phrases.
6. Acknowledge interruptions gracefully. "Ah, speak you must."
`;

  const addTranscript = (role: 'user'|'yoda'|'action', text: string) => {
    setTranscript(prev => [...prev, {role, text}]);
  };

  const handleToolCall = async (toolCall: any, session: any) => {
    const fnCalls = toolCall.functionCalls;
    if (!fnCalls) return;

    for (const call of fnCalls) {
      if (call.name === 'access_jedi_archives') {
        const query = call.args?.query || 'Unknown';
        addTranscript('action', `Accessing archives for: ${query}...`);
        
        // Mocking the archive retrieval
        let result = "The archives reflect emptiness. Much is still hidden by the dark side.";
        if (query.toLowerCase().includes('sith')) {
          result = "The Sith are ancient enemies of the Jedi, driven by passion and the dark side. Two there always are, a master and an apprentice.";
        } else if (query.toLowerCase().includes('lightsaber')) {
          result = "Seven forms of lightsaber combat there are. Form IV, Ataru, my specialty it is. Active and acrobatic.";
        }

        // Send tool response
        session.sendToolResponse({
            functionResponses: [{
               id: call.id,
               name: call.name,
               response: { result }
            }]
        });
        addTranscript('action', `Archive response retrieved.`);
      }
    }
  };

  const stopSession = () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
    }
    
    playbackQueueRef.current.forEach(node => {
        try { node.stop(); } catch(e){}
    });
    playbackQueueRef.current = [];
    
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            if(session && session.close) session.close();
        }).catch(console.error);
        sessionPromiseRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
    setIsSpeaking(false);
  };

  const startCommunion = async () => {
    setErrorMSG(null);
    setConnecting(true);
    setTranscript([{role: 'action', text: 'Initializing Holocron resonance...'}]);

    try {
      if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key is hidden by the dark side.");

      // Setup audio context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = actx;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { channelCount: 1, sampleRate: 16000 } 
      });
      streamRef.current = stream;

      const source = actx.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = actx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const ai = new GoogleGenAI({ apiKey });
      abortControllerRef.current = new AbortController();

      const connectPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }, // Puck can sound a bit more characterful!
          },
          systemInstruction: {
             parts: [{text: YODA_KNOWLEDGE}]
          },
          tools: [{
            functionDeclarations: [{
              name: "access_jedi_archives",
              description: "Access the ancient Jedi archives to retrieve lore, history, Sith details, or lightsaber forms.",
              parameters: {
                type: Type.OBJECT,
                properties: { query: { type: Type.STRING } },
                required: ["query"]
              }
            }]
          }],
          inputAudioTranscription: { model: "does_not_matter" } as any, // enabling transcription
          outputAudioTranscription: { model: "does_not_matter"} as any
        },
        callbacks: {
          onopen: () => {
             setConnected(true);
             setConnecting(false);
             addTranscript('action', 'Holocron connection stable. Speak you may.');
             nextPlayTimeRef.current = actx.currentTime;

             // Start sending audio
             processor.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 const pcm16 = new Int16Array(inputData.length);
                 for (let i = 0; i < inputData.length; i++) {
                     const s = Math.max(-1, Math.min(1, inputData[i]));
                     pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                 }
                 const base64 = arrayBufferToBase64(pcm16.buffer);
                 
                 connectPromise.then(session => {
                    session.sendRealtimeInput({
                       audio: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64
                       }
                    });
                 }).catch(console.error);
             };
             source.connect(processor);
             processor.connect(actx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcriptions
            if ((message as any).serverContent?.modelTurn?.parts) {
               const parts = (message as any).serverContent.modelTurn.parts;
               for (const part of parts) {
                  if (part.text) {
                     addTranscript('yoda', part.text);
                  }
               }
            }
            if ((message as any).clientContent?.turnComplete) {
                // Not standard typed, but typically user transciptions come through somewhat similarly or via a tool
            }
            
            // Output audio handling
            const inlineData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (inlineData && inlineData.data) {
                setIsSpeaking(true);
                const pcmBuffer = base64ToArrayBuffer(inlineData.data);
                const pcm16 = new Int16Array(pcmBuffer);
                const float32 = new Float32Array(pcm16.length);
                for (let i = 0; i < pcm16.length; i++) {
                    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
                }
                
                const audioBuffer = actx.createBuffer(1, float32.length, 16000);
                audioBuffer.copyToChannel(float32, 0);

                const sourceNode = actx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(actx.destination);
                
                const playTime = Math.max(actx.currentTime, nextPlayTimeRef.current);
                sourceNode.start(playTime);
                nextPlayTimeRef.current = playTime + audioBuffer.duration;
                
                sourceNode.onended = () => {
                    playbackQueueRef.current = playbackQueueRef.current.filter(n => n !== sourceNode);
                    if (playbackQueueRef.current.length === 0) {
                        setIsSpeaking(false);
                    }
                };
                playbackQueueRef.current.push(sourceNode);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
                addTranscript('action', '[Interrupted by your presence]');
                playbackQueueRef.current.forEach(node => {
                    try { node.stop(); } catch(e){}
                });
                playbackQueueRef.current = [];
                nextPlayTimeRef.current = actx.currentTime;
                setIsSpeaking(false);
            }

            // Handle tools
            if (message.toolCall) {
                connectPromise.then(session => handleToolCall(message.toolCall, session));
            }
          },
          onclose: () => {
             addTranscript('action', 'Connection to the Force severed.');
             stopSession();
          },
          onerror: (err) => {
             console.error(err);
             setErrorMSG('A disruption in the Force occurred.');
             stopSession();
          }
        }
      });
      sessionPromiseRef.current = connectPromise;

    } catch (err: any) {
      console.error(err);
      setErrorMSG(err.message || "Failed to tap into the Force.");
      stopSession();
    }
  };

  useEffect(() => {
    return () => { stopSession(); };
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto h-[600px] md:h-[700px]">
        {/* Interaction Pane */}
        <div className="flex-1 glass rounded-2xl p-8 flex flex-col items-center justify-center relative border border-white/5 shadow-xl">
            {errorMSG && (
                <div className="absolute top-6 left-6 right-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm z-20">
                    {errorMSG}
                </div>
            )}
            
            <div className="relative mb-12">
                <div className={cn(
                    "w-48 h-48 rounded-full border flex items-center justify-center flex-col transition-all duration-700 relative z-10",
                    connected 
                        ? (isSpeaking ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]" : "border-emerald-500/40 bg-emerald-500/5 glow-emerald")
                        : "border-slate-700 bg-transparent"
                )}>
                    {connecting && <div className="absolute inset-0 rounded-full border-t border-emerald-400 animate-spin" style={{animationDuration: '2s'}}></div>}
                    {connected && !isSpeaking && <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" style={{animationDuration: '3s'}}></div>}
                    
                    <Mic size={48} className={cn(
                        "transition-all duration-300", 
                        connected ? "text-emerald-400" : "text-slate-600",
                        connecting && "animate-pulse"
                    )} />
                </div>
                
                {/* Visualizer rings when speaking */}
                {connected && isSpeaking && (
                    <>
                       <div className="absolute inset-[-20%] rounded-full border border-emerald-400/20 animate-ping" style={{animationDuration: '1.5s'}} />
                       <div className="absolute inset-[-40%] rounded-full border border-emerald-400/10 animate-ping" style={{animationDuration: '2s', animationDelay: '0.5s'}} />
                    </>
                )}
            </div>
            
            <h2 className="text-3xl font-serif tracking-tight italic mb-2">
                {connected ? (isSpeaking ? <span className="text-emerald-400">Yoda Speaks...</span> : <span className="text-emerald-500/80">Listening...</span>) : <span className="text-slate-400">Live Communion</span>}
            </h2>
            <p className="text-slate-500 text-sm font-light max-w-xs text-center mb-10 h-10">
                {connected ? "The master listens. Interrupt if you must." : "Establish a real-time link through the holocron network."}
            </p>

            <button
                onClick={connected ? stopSession : startCommunion}
                disabled={connecting}
                className={cn(
                    "flex items-center justify-center gap-2 px-8 py-3 rounded-full text-xs uppercase font-bold tracking-widest transition-all",
                    connected 
                      ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 glow-emerald",
                    connecting && "opacity-50"
                )}
            >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : (connected ? <StopCircle size={16}/> : <RefreshCw size={16}/>)}
                {connecting ? "Channeling..." : (connected ? "Sever Connection" : "Initiate Link")}
            </button>
        </div>

        {/* Reasoning and Transcript Pane */}
        <div className="w-full md:w-80 glass rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-white/5 bg-transparent flex items-center gap-3">
                <Terminal size={16} className="text-emerald-500" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400">Holocron Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
                {transcript.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 space-y-4">
                        <Activity size={32} />
                        <p className="text-[10px] uppercase tracking-widest font-bold">No active resonance</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {transcript.map((msg, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{opacity: 0, x: msg.role === 'action' ? 0 : (msg.role === 'yoda' ? -10 : 10)}} 
                                  animate={{opacity: 1, x: 0}}
                                  className={cn(
                                    "p-3 rounded-xl text-sm font-light leading-relaxed",
                                    msg.role === 'yoda' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100" :
                                    msg.role === 'user' ? "bg-white/5 border border-white/10 text-slate-300 ml-4" : 
                                    "bg-transparent text-emerald-500/60 font-mono text-[10px] uppercase tracking-widest text-center border border-dashed border-emerald-500/20"
                                )}>
                                    {msg.role === 'yoda' && <div className="text-[10px] uppercase tracking-widest text-emerald-500 mb-1 font-bold">Yoda</div>}
                                    {msg.text}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
