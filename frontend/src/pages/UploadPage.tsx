import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, File, X, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/Badge';
import { staggerContainer, staggerItem } from '../utils/animations';

interface UploadZoneProps {
  id: string;
  label: string;
  description: string;
  emoji: string;
  onUpload: (file: File) => void;
  uploadedFile: File | null;
  progress: number;
  onRemove: () => void;
}

function UploadZone({
  id,
  label,
  description,
  emoji,
  onUpload,
  uploadedFile,
  progress,
  onRemove,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="relative">
      {uploadedFile ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-emerald-300 bg-emerald-50 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <File size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{uploadedFile.name}</p>
              <p className="text-xs text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors p-1">
              <X size={16} />
            </button>
          </div>
          <ProgressBar value={progress} height="h-2" />
          {progress === 100 && (
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">Uploaded successfully</span>
            </div>
          )}
        </motion.div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={[
            'flex flex-col items-center gap-3 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
              : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50',
          ].join(' ')}
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <span className="text-2xl">{emoji}</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold">
            <Upload size={14} />
            Browse or Drag & Drop
          </div>
          <input id={id} type="file" accept="image/*,.pdf" onChange={handleChange} className="sr-only" />
        </label>
      )}
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<{ aadhaar: File | null; weaverId: File | null; passbook: File | null }>({
    aadhaar: null,
    weaverId: null,
    passbook: null,
  });
  const [progress, setProgress] = useState({ aadhaar: 0, weaverId: 0, passbook: 0 });

  const simulateUpload = (key: 'aadhaar' | 'weaverId' | 'passbook', file: File) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
    setProgress((prev) => ({ ...prev, [key]: 0 }));
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 30;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setProgress((prev) => ({ ...prev, [key]: Math.round(p) }));
    }, 150);
  };

  const removeFile = (key: 'aadhaar' | 'weaverId' | 'passbook') => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setProgress((prev) => ({ ...prev, [key]: 0 }));
  };

  const canContinue = files.aadhaar !== null && files.weaverId !== null;

  const handleContinue = () => {
    navigate('/verifying');
  };

  const uploadedCount = [files.aadhaar, files.weaverId, files.passbook].filter(Boolean).length;

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <Upload size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Upload Documents</h1>
        <p className="text-slate-500 text-sm mt-2">We need a few documents to verify your identity</p>

        {/* Progress */}
        <div className="mt-4 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 inline-flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-8 h-1.5 rounded-full transition-all duration-500 ${
                  i < uploadedCount ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">{uploadedCount}/3 uploaded</span>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4 mb-6"
      >
        <motion.div variants={staggerItem}>
          <UploadZone
            id="aadhaar-upload"
            label="Aadhaar Card *"
            description="Upload front side of your Aadhaar card"
            emoji="🪪"
            onUpload={(file) => simulateUpload('aadhaar', file)}
            uploadedFile={files.aadhaar}
            progress={progress.aadhaar}
            onRemove={() => removeFile('aadhaar')}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <UploadZone
            id="weaver-upload"
            label="Weaver ID Card *"
            description="Upload your government-issued Weaver ID"
            emoji="🧵"
            onUpload={(file) => simulateUpload('weaverId', file)}
            uploadedFile={files.weaverId}
            progress={progress.weaverId}
            onRemove={() => removeFile('weaverId')}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <UploadZone
            id="passbook-upload"
            label="Bank Passbook (Optional)"
            description="First page of bank passbook or account statement"
            emoji="📒"
            onUpload={(file) => simulateUpload('passbook', file)}
            uploadedFile={files.passbook}
            progress={progress.passbook}
            onRemove={() => removeFile('passbook')}
          />
        </motion.div>
      </motion.div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6">
        <p className="text-xs text-blue-700 font-semibold flex items-start gap-2">
          <span>🔒</span>
          <span>Your documents are encrypted end-to-end and processed only for verification. We do not store your originals.</span>
        </p>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handleContinue}
        disabled={!canContinue}
        rightIcon={<ArrowRight size={18} />}
      >
        {canContinue ? 'Start AI Verification' : 'Upload Required Documents'}
      </Button>

      {/* Demo Skip */}
      <button
        onClick={() => navigate('/verifying')}
        className="w-full text-center text-xs text-slate-400 mt-3 hover:text-slate-600 transition-colors py-2"
      >
        Skip for demo →
      </button>
    </div>
  );
}
