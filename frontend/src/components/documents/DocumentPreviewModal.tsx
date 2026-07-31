import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Download, Trash2, RefreshCw, Eye, Calendar, ShieldCheck, Receipt } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTranslation } from 'react-i18next';
import { tData } from '../../utils/i18nData';
import type { UserDocument } from '../../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: UserDocument | null;
  onReplace?: (doc: UserDocument) => void;
  onDelete?: (doc: UserDocument) => void;
  onViewHistory?: () => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document: doc,
  onReplace,
  onDelete,
  onViewHistory,
}: DocumentPreviewModalProps) {
  const { t } = useTranslation();

  if (!doc) return null;

  const isYarnPassbook = doc.name.toLowerCase().includes('yarn') || doc.type.toLowerCase().includes('yarn');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tData(doc.name)} size="md">
      <div className="space-y-5 py-1">
        {/* Document Visual Card Mockup */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 p-6 text-white shadow-xl min-h-[220px] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-sm">
                {doc.icon}
              </div>
              <div>
                <h3 className="font-black text-lg text-white leading-tight">{tData(doc.name)}</h3>
                <p className="text-xs text-indigo-300 font-semibold">{tData(doc.type)}</p>
              </div>
            </div>
            <Badge variant={doc.status === 'Verified' ? 'success' : 'amber'} dot>
              {doc.status === 'Verified' ? t('documents.statusVerified', 'Verified') : t('documents.statusPending', 'Pending')}
            </Badge>
          </div>

          {/* Decorative Ledger lines if Yarn Passbook */}
          {isYarnPassbook ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 my-3 space-y-1.5">
              <div className="flex justify-between text-xs text-indigo-200 font-bold uppercase tracking-wider">
                <span>e-Dhaga Yarn Passbook</span>
                <span>YPB-UP-2024-8842</span>
              </div>
              <div className="text-xs text-slate-300 flex justify-between pt-1">
                <span>Monthly Purchase Avg: ₹18,000</span>
                <span>Sales Payout: Active</span>
              </div>
            </div>
          ) : (
            <div className="my-4 text-xs text-slate-300 font-mono tracking-widest bg-white/5 p-3 rounded-xl border border-white/10">
              DOC-HASH: {doc.id.toUpperCase()}-9842-VERIFIED-SECURE
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-indigo-200/80 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {t('documents.uploadedOn', 'Uploaded on')} {new Date(doc.uploadDate).toLocaleDateString('en-IN')}
            </span>
            <span className="flex items-center gap-1 text-success-400 font-semibold">
              <ShieldCheck size={14} /> 256-bit Encrypted
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        {isYarnPassbook && onViewHistory && (
          <Button
            fullWidth
            size="lg"
            variant="primary"
            leftIcon={<Receipt size={18} />}
            onClick={() => {
              onClose();
              onViewHistory();
            }}
            className="shadow-md shadow-primary-200"
          >
            {t('documents.viewExtractedHistory', 'View Extracted Transaction History')}
          </Button>
        )}

        <div className="flex gap-3 pt-2">
          {onReplace && (
            <Button
              variant="outline"
              fullWidth
              leftIcon={<RefreshCw size={16} />}
              onClick={() => {
                onClose();
                onReplace(doc);
              }}
              className="border-slate-200 text-slate-700"
            >
              {t('documents.replaceDoc', 'Replace Document')}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              fullWidth
              leftIcon={<Trash2 size={16} />}
              onClick={() => {
                onClose();
                onDelete(doc);
              }}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {t('documents.deleteDoc', 'Delete Document')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
