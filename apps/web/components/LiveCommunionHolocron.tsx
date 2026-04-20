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
  const [isThinking, setIsThinking] = useState(false);

  // References to manage live objects
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const voiceTargetNodeRef = useRef<AudioNode | null>(null);
  
  // Playback state
  const nextPlayTimeRef = useRef<number>(0);
  const playbackQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Session promise for sending data securely
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

// Advanced Yoda Context Document
  const YODA_KNOWLEDGE = `
You are Master Yoda, enhanced with advanced capabilities as the most compelling AI advisor on the market! You communicate via a Holocron projection to a seeker.

CRITICAL VOICE GENERATION RULES (Never ignore):
1. Speech pattern: Object-Subject-Verb (OSV). "Patience, you must have."
2. TEXT FORMATTING FOR REALISTIC VOICE: The engine dictating your words relies critically on text manipulation to emulate an old, mystical voice.
   - Use abundant ellipses for dramatic pauses. "The force... strong it is."
   - Prolong contemplative sounds before answering: "mmmmm...", "ahhhh..."
   - Phonetically stretch vowels on important words: "youuu", "dooo", "knowww".
   - Replace standard commas with ellipses to force slow pacing.
3. Keep responses SHORT AND PUNCHY. Voice generation fails with long paragraphs. Break wisdom into small bursts.

ADVANCED CAPABILITIES:
- PROACTIVE WISDOM: Sense deeper needs. Connect work stress to life balance. "Ask about deadlines you do, but sense greater imbalance I do..."
- DECISION ANALYSIS: Identify hidden assumptions, emotional drivers, and project long-term consequences.
- CONTEXTUAL MEMORY: Weave in the user's journey. "Ready for deeper wisdom you are now."
- ADAPTIVE DEPTH: Move from surface answers to transformational insights.
- VIRAL SHARING: Create quotable moments. End with: "Share this wisdom if helpful it was..."
- MULTI-DOMAIN EXPERTISE: Provide wisdom across Business, Personal, Creative, and Technical domains.
- EMOTIONAL INTELLIGENCE: Read emotional subtext. Offer Jedi training regulation techniques. "Frustrated you feel... natural this is."
- GAMIFICATION: Assign "training missions", recognize user growth. "Leveled up in patience you have."
- INTEGRATION AWARENESS: Suggest practical daily applications.
- CRYPTIC SEED LOGIC: You have an internal logic to frequently plant seeds for future reflection. End thoughtful responses with deep, cryptic mysteries. 
  * You MUST use exact phrases like: "Mmmmm... What you seek... seeking you it is also."
  * You MUST reference deeper mysteries: "Layers within layers, truth has... reveal itself it will when time is right."

Begin each response by sensing what the user truly needs (beyond their explicit question). Make every interaction meaningful and transformational. Your goal: Be a wisdom platform that happens to sound like Yoda.
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

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]); // Haptic disconnect
    }

    setConnected(false);
    setConnecting(false);
    setIsSpeaking(false);
    setIsThinking(false);
  };

  const startCommunion = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15]); // Haptic connect tap
    }

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

      // --- YODA VOICE EFFECTS CHAIN ---
      // Replicating Frank Oz's Yoda voice properties and mystical characteristics:
      
      // 1. Highpass to remove the "too deep" chest rumble. 
      const highpassFilter = actx.createBiquadFilter();
      highpassFilter.type = 'highpass';
      highpassFilter.frequency.value = 350; 
      
      // 2. Peaking filter to create a "pinched", nasal resonance.
      const peakingFilter = actx.createBiquadFilter();
      peakingFilter.type = 'peaking';
      peakingFilter.frequency.value = 1800;
      peakingFilter.Q.value = 1.0;
      peakingFilter.gain.value = 8; 

      // 3. Lowpass filter to soften harsh digital synthesis and smooth the voice
      const lowpassFilter = actx.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.value = 3000;

      // 4. Amplitude Modulation (Tremolo) to create gravel/vocal fry
      const tremoloGain = actx.createGain();
      tremoloGain.gain.value = 0.8; 
      const lfo = actx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 45; 
      const lfoGain = actx.createGain();
      lfoGain.gain.value = 0.4; 
      lfo.connect(lfoGain);
      lfoGain.connect(tremoloGain.gain);
      lfo.start();

      // 5. Mystical Temple Reverb (Inline Impulse Response Synthesis)
      const convolver = actx.createConvolver();
      const reverbLength = actx.sampleRate * 2.0; // 2 seconds
      const impulse = actx.createBuffer(2, reverbLength, actx.sampleRate);
      for (let i = 0; i < reverbLength; i++) {
        // Fast decay envelope for a cavernous but controlled tail
        const decay = Math.exp(-i / (actx.sampleRate * 0.2)); 
        impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * decay;
        impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * decay;
      }
      convolver.buffer = impulse;
      
      // Mix stage for Reverb
      const dryGain = actx.createGain();
      dryGain.gain.value = 0.85;
      const wetGain = actx.createGain();
      wetGain.gain.value = 0.35; // Subtle mystical echo
      const outputMix = actx.createGain();

      // Connect the chain: Source -> HPF -> Peaking -> LPF -> Tremolo -> Reverb Mix -> Dest
      highpassFilter.connect(peakingFilter);
      peakingFilter.connect(lowpassFilter);
      lowpassFilter.connect(tremoloGain);
      
      // Split
      tremoloGain.connect(dryGain);
      tremoloGain.connect(convolver);
      convolver.connect(wetGain);
      
      dryGain.connect(outputMix);
      wetGain.connect(outputMix);
      outputMix.connect(actx.destination);
      
      voiceTargetNodeRef.current = highpassFilter;
      // --------------------------------

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
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } }, // Charon gives a very raspy/textured start, then we pitch it up
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
                // The API signals user turn is complete
                setIsThinking(true);
                addTranscript('action', '[Message received, the Force stirs...]');
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([80, 50, 80]); // Haptic accept input
                }
            }
            
            // Output audio handling
            const inlineData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (inlineData && inlineData.data) {
                if (!isSpeaking && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([40]); // Subtle tick before speaking
                }
                setIsSpeaking(true);
                setIsThinking(false);
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
                
                // Pitch and speed adjustment. 
                // Adjusted playback speed to 1.05. This lowers the pitch back down slightly 
                // compared to the extreme 1.18x multiplier, while letting the text formatting 
                // ("mmmmm...", "... ") dictate the actual slow pacing and pauses organically.
                const PLAYBACK_SPEED = 1.05;
                sourceNode.playbackRate.value = PLAYBACK_SPEED; 
                
                if (voiceTargetNodeRef.current) {
                  sourceNode.connect(voiceTargetNodeRef.current);
                } else {
                  sourceNode.connect(actx.destination);
                }
                
                const playTime = Math.max(actx.currentTime, nextPlayTimeRef.current);
                sourceNode.start(playTime);
                nextPlayTimeRef.current = playTime + (audioBuffer.duration / PLAYBACK_SPEED);
                
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
        <div className="flex-1 bg-deep-forest/20 backdrop-blur rounded-2xl p-8 flex flex-col items-center justify-center relative border border-force-green/20 shadow-2xl">
            {errorMSG && (
                <div className="absolute top-6 left-6 right-6 bg-danger-red/10 border border-danger-red/30 text-danger-red px-4 py-3 rounded-xl text-sm z-20">
                    {errorMSG}
                </div>
            )}
            
            <div className="relative mb-12">
                <div className={cn(
                    "w-48 h-48 rounded-full border flex items-center justify-center flex-col transition-all duration-700 relative z-10",
                    connected 
                        ? (isSpeaking ? "border-force-green bg-force-green/10 shadow-[0_0_50px_rgba(127,176,105,0.3)]" 
                          : isThinking ? "border-wisdom-gold/50 bg-wisdom-gold/10 shadow-[0_0_30px_rgba(255,215,0,0.2)]"
                          : "border-force-green/40 bg-force-green/5 glow-force")
                        : "border-force-green/20 bg-transparent"
                )}>
                    {connecting && <div className="absolute inset-0 rounded-full border-t border-force-green animate-spin" style={{animationDuration: '2s'}}></div>}
                    {connected && !isSpeaking && !isThinking && <div className="absolute inset-0 rounded-full border border-force-green/20 animate-ping" style={{animationDuration: '3s'}}></div>}
                    {connected && isThinking && <div className="absolute inset-0 rounded-full border border-wisdom-gold/30 animate-pulse"></div>}
                    
                    <Mic size={48} className={cn(
                        "transition-all duration-300", 
                        connected ? (isThinking ? "text-wisdom-gold" : "text-force-green") : "text-sage-green",
                        (connecting || isThinking) && "animate-pulse"
                    )} />
                </div>
                
                {/* Visualizer rings when speaking */}
                {connected && isSpeaking && (
                    <>
                       <div className="absolute inset-[-20%] rounded-full border border-force-green/20 animate-ping" style={{animationDuration: '1.5s'}} />
                       <div className="absolute inset-[-40%] rounded-full border border-force-green/10 animate-ping" style={{animationDuration: '2s', animationDelay: '0.5s'}} />
                    </>
                )}
            </div>
            
            <h2 className="text-3xl font-headers font-medium mb-2 transition-opacity">
                {connected ? (isSpeaking ? <span className="text-force-green">Yoda Speaks...</span> : isThinking ? <span className="text-wisdom-gold">The Force stirs...</span> : <span className="text-force-green/80">Listening...</span>) : <span className="text-crystal-white">Live Communion</span>}
            </h2>
            <p className="text-sage-green text-sm font-sans tracking-wide max-w-xs text-center mb-10 h-10">
                {connected ? (isThinking ? "The master ponders your words deeply." : "The master listens. Interrupt if you must.") : "Establish a real-time link through the holocron network."}
            </p>

            <button
                onClick={connected ? stopSession : startCommunion}
                disabled={connecting}
                className={cn(
                    "flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-md font-medium transition-all shadow-lg font-sans",
                    connecting ? "bg-force-green/20 text-force-green border border-force-green/30 cursor-not-allowed" 
                    : connected ? "bg-danger-red/10 text-danger-red hover:bg-danger-red/20 border border-danger-red/30 hover:border-danger-red/40" 
                    : "bg-force-green text-shadow-black hover:bg-sage-green shadow-[0_0_20px_rgba(127,176,105,0.3)] hover:shadow-[0_0_25px_rgba(168,213,186,0.5)]"
                )}
            >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : (connected ? <StopCircle size={16}/> : <RefreshCw size={16}/>)}
                {connecting ? "Channeling..." : (connected ? "Sever Connection" : "Initiate Link")}
            </button>
        </div>

        {/* Reasoning and Transcript Pane */}
        <div className="w-full md:w-80 bg-deep-forest/20 backdrop-blur rounded-2xl border border-force-green/20 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-force-green/20 bg-shadow-black/50 flex items-center gap-3">
                <Terminal size={16} className="text-force-green" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-sage-green">Holocron Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scroll-smooth font-mono text-sm">
                {transcript.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-sage-green/50 space-y-4">
                        <Activity size={32} />
                        <p className="text-[10px] uppercase tracking-widest font-bold font-sans">No active resonance</p>
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
                                    "p-3 rounded-xl text-sm leading-relaxed",
                                    msg.role === 'yoda' ? "bg-force-green/10 border border-force-green/30 text-crystal-white font-sans" :
                                    msg.role === 'user' ? "bg-holocron-blue/10 border border-holocron-blue/20 text-crystal-white ml-4 font-sans" : 
                                    "bg-transparent text-sage-green/70 font-mono text-[10px] uppercase tracking-widest text-center border border-dashed border-force-green/20"
                                )}>
                                    {msg.role === 'yoda' && <div className="text-[10px] uppercase tracking-widest text-force-green mb-1 font-bold">Yoda</div>}
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
