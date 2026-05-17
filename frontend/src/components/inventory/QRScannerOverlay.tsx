import { useEffect, useRef, useState } from "react";
import { Camera, X, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScannerOverlay({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or not available.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Mock scanning logic for demo purposes
  // In a real app, you'd use a library like jsQR or html5-qrcode
  useEffect(() => {
    if (!scanned && !error) {
      const timer = setTimeout(() => {
        setScanned(true);
        onScan("ITEM-772-COMPOSITE");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanned, error, onScan]);

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-lg aspect-square rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-rose-500 p-10 text-center gap-4">
             <AlertCircle size={48} />
             <p className="font-black uppercase tracking-widest">{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Scanner UI Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="w-64 h-64 border-2 border-indigo-500 rounded-3xl relative">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-3xl animate-pulse" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
                  
                  {/* Moving line */}
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                  />
               </div>
            </div>

            <AnimatePresence>
               {scanned && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center gap-4"
                 >
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-emerald-500">
                       <Check size={40} />
                    </div>
                    <p className="font-black uppercase tracking-widest text-white">Item Recognized</p>
                 </motion.div>
               )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="mt-12 text-center space-y-4">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Inventory Scanner</p>
        <h3 className="text-xl font-bold text-white">Align QR code within the frame</h3>
      </div>

      <button 
        onClick={onClose}
        className="mt-12 h-20 w-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-rose-500 transition-all"
      >
        <X size={32} />
      </button>
    </div>
  );
}
