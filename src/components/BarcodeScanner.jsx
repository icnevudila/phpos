// ============================================
// CAMERA BARCODE SCANNER
// html5-qrcode ile kamera barkod okuma
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode/esm';

export default function BarcodeScanner({ onScan, onClose, tenantId }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    // Start scanning
    html5QrCode.start(
      { facingMode: 'environment' }, // Back camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      (decodedText, decodedResult) => {
        // Successfully scanned
        onScan(decodedText);
        stopScanning();
      },
      (errorMessage) => {
        // Ignore errors (just keep scanning)
      }
    ).then(() => {
      setIsScanning(true);
    }).catch((err) => {
      setError(err.message);
      console.error('Error starting scanner:', err);
    });

    return () => {
      stopScanning();
    };
  }, []);

  function stopScanning() {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setIsScanning(false);
      }).catch((err) => {
        console.error('Error stopping scanner:', err);
      });
    }
  }

  function handleClose() {
    stopScanning();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Scan Barcode</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold transition-all"
          >
            ×
          </button>
        </div>

        {/* Scanner Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div id="barcode-scanner" ref={scannerRef} className="w-full rounded-xl overflow-hidden"></div>
          
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 text-center text-white/70 text-sm">
            Point camera at barcode to scan
          </div>
        </div>

        {/* Manual Entry Fallback */}
        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <input
            type="text"
            placeholder="Or enter barcode manually"
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                onScan(e.target.value);
                handleClose();
              }
            }}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

