import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, X, Check, Zap, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUri: string) => void;
  documentTitle?: string;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  documentTitle = 'Yarn Passbook',
}: CameraCaptureModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsCameraActive(true);
      } else {
        setIsCameraActive(false);
      }
    } catch (e) {
      console.warn('Camera fallback to simulated viewfinder', e);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleTakeSnapshot = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (isCameraActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        return;
      }
    }

    const simulatedSnapshot = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
        <rect width="600" height="400" fill="#0F172A"/>
        <rect x="20" y="20" width="560" height="360" rx="16" fill="#1E293B" stroke="#475569" stroke-width="2"/>
        <rect x="40" y="40" width="520" height="80" rx="12" fill="#312E81"/>
        <text x="60" y="75" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="20">MINISTRY OF TEXTILES - GOVT OF INDIA</text>
        <text x="60" y="102" fill="#A5B4FC" font-family="sans-serif" font-size="14">Yarn Supply Scheme &amp; e-Dhaga Passbook</text>
        <rect x="40" y="140" width="520" height="220" rx="12" fill="#0F172A"/>
        <text x="60" y="175" fill="#38BDF8" font-family="sans-serif" font-weight="bold" font-size="14">HATHKARGHA YARN PASSBOOK LEDGER</text>
        <line x1="60" y1="190" x2="540" y2="190" stroke="#334155" stroke-width="2"/>
        <text x="60" y="220" fill="#E2E8F0" font-family="sans-serif" font-size="13">12 Jul 2024 - Lakshmi Yarn Traders (Cotton 25kg) : ₹4,500 [PAID]</text>
        <text x="60" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="13">18 Jul 2024 - Kashi Silk Depot (Silk 10kg) : ₹2,800 [PAID]</text>
        <text x="60" y="280" fill="#E2E8F0" font-family="sans-serif" font-size="13">23 Jul 2024 - Banarasi Weavers Co-op (Saree Deposit) : ₹6,700 [REC]</text>
        <text x="60" y="310" fill="#E2E8F0" font-family="sans-serif" font-size="13">02 Aug 2024 - Sahkari Samiti Payout : ₹11,500 [REC]</text>
        <circle cx="510" cy="80" r="24" fill="#6366F1" opacity="0.3"/>
        <text x="500" y="86" fill="#FFFFFF" font-size="20">🧵</text>
      </svg>
    `)}`;
    setCapturedImage(simulatedSnapshot);
  };

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { stopCamera(); onClose(); }} title={`${t('documents.capture', 'Capture')} ${documentTitle}`} size="lg">
      <div className="space-y-4">
        {flash && <div className="fixed inset-0 bg-white z-50 animate-pulse pointer-events-none" />}

        {capturedImage ? (
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-primary-500 shadow-xl bg-slate-900 aspect-[4/3] flex items-center justify-center">
              <img src={capturedImage} alt="Captured Passbook" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-success-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Check size={14} /> {t('documents.photoCaptured', 'Photo Captured')}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setCapturedImage(null)}
                leftIcon={<RefreshCw size={16} />}
              >
                {t('documents.retakePhoto', 'Retake Photo')}
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirmCapture}
                leftIcon={<Check size={16} />}
                className="shadow-md shadow-primary-200"
              >
                {t('documents.useThisPhoto', 'Use This Photo')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 aspect-[4/3] flex items-center justify-center">
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mb-4 animate-pulse">
                    <Camera size={32} />
                  </div>
                  <p className="text-white font-bold text-base mb-1">{t('documents.cameraViewfinder', 'Passbook Viewfinder')}</p>
                  <p className="text-slate-400 text-xs max-w-xs">{t('documents.alignPassbookText', 'Align your Yarn Passbook ledger within the box below')}</p>
                </div>
              )}

              <div className="absolute inset-6 border-2 border-dashed border-indigo-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                </div>
                <div className="text-center bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-indigo-200 text-xs font-semibold self-center border border-indigo-500/30">
                  {documentTitle}: {t('documents.holdSteady', 'Hold Steady')}
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleTakeSnapshot}
                className="w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 active:scale-95 transition-all border-4 border-white"
                title={t('documents.takeSnapshot', 'Take Snapshot')}
              >
                <Camera size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
