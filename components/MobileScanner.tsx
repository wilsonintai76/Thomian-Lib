
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap, AlertCircle, RefreshCw, Keyboard } from 'lucide-react';

interface MobileScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const MobileScanner: React.FC<MobileScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const regionId = "reader";

  const startScanner = async () => {
    setIsInitializing(true);
    setError(null);
    
    if (scannerRef.current) {
        try {
            if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
            }
        } catch (e) {
            console.warn("Cleanup error", e);
        }
    }

    scannerRef.current = new Html5Qrcode(regionId);
    
    const config = { 
      fps: 15, 
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0
    };

    try {
        // Attempt 1: Back Camera (Environment)
        await scannerRef.current.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
                onScan(decodedText);
                handleStop();
            },
            () => {} // Ignore frame-level errors
        );
        setIsInitializing(false);
    } catch (err: any) {
        console.warn("Primary camera fail, trying fallback...", err);
        
        try {
            // Attempt 2: Fallback to any camera (Desktop compatibility)
            await scannerRef.current.start(
                { facingMode: "user" }, // Try front if back fails
                config,
                (decodedText) => {
                    onScan(decodedText);
                    handleStop();
                },
                () => {}
            );
            setIsInitializing(false);
        } catch (fallbackErr: any) {
            console.error("All camera attempts failed", fallbackErr);
            
            // Format user-friendly error
            if (fallbackErr.name === 'NotAllowedError' || fallbackErr === 'Permission denied') {
                setError("Camera access was blocked. Please enable permissions in your browser settings.");
            } else if (fallbackErr.name === 'NotFoundError') {
                setError("No camera hardware found on this device.");
            } else {
                setError("Failed to initialize camera. Check if another app is using it.");
            }
            setIsInitializing(false);
        }
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      handleStop();
    };
  }, []);

  const handleStop = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn("Scanner stop failed", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-white">
          <div className="p-2 bg-blue-600 rounded-full">
            <Camera className="h-5 w-5" />
          </div>
          <span className="font-black text-lg tracking-tight uppercase">Scanner Station</span>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors border border-white/10"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Viewfinder Area */}
      <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-white/20 shadow-2xl flex items-center justify-center">
        
        {/* The Video Element Container */}
        <div id={regionId} className="w-full h-full"></div>
        
        {/* Loading Overlay */}
        {isInitializing && (
            <div className="absolute inset-0 bg-slate-900 z-10 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Waking Camera Hardware...</p>
            </div>
        )}

        {/* Viewfinder Overlay (Shown only when scanning is actually active) */}
        {!error && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-[250px] h-[150px] border-4 border-blue-400 rounded-2xl relative overflow-hidden bg-blue-400/5 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                    <div className="scanner-laser"></div>
                    
                    {/* Corner accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl-sm"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/50 rounded-tr-sm"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/50 rounded-bl-sm"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br-sm"></div>
                </div>
                <div className="absolute bottom-10 text-center text-white/60 text-[10px] font-black uppercase tracking-[0.2em] px-8">
                    Center Barcode for AI Sync
                </div>
            </div>
        )}

        {/* Error State */}
        {error && (
            <div className="absolute inset-0 bg-slate-900 z-20 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="h-20 w-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
                    <AlertCircle className="h-10 w-10" />
                </div>
                <h3 className="text-white font-black text-xl mb-3 tracking-tight">Camera Not Available</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">
                    {error}
                </p>
                
                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                    <button 
                        onClick={startScanner}
                        className="bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" /> Retry Connection
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Keyboard className="h-4 w-4" /> Use Manual Entry
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Footer Meta */}
      {!error && !isInitializing && (
          <div className="mt-8 flex flex-col items-center gap-4 text-center animate-fade-in">
            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 px-5 py-2.5 rounded-full border border-emerald-400/20 text-[10px] font-black uppercase tracking-widest">
                <Zap className="h-4 w-4 fill-current" />
                Precision Neural Scanning Active
            </div>
            <p className="text-slate-500 text-[11px] max-w-xs font-medium uppercase tracking-tight">
                Scanning works best in bright light. Place label flat against the desk surface.
            </p>
          </div>
      )}
    </div>
  );
};

export default MobileScanner;
