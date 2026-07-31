import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle, Clock, Upload, Eye, Camera, Receipt, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Modal, Toast } from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';
import { useAppContext } from '../context/AppContext';
import { CameraCaptureModal } from '../components/documents/CameraCaptureModal';
import { YarnPassbookProcessingModal } from '../components/documents/YarnPassbookProcessingModal';
import { YarnTransactionHistoryModal } from '../components/documents/YarnTransactionHistoryModal';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import type { UserDocument } from '../types';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { documentsList, addDocument, updateDocument, deleteDocument, updateYarnPassbook } = useAppContext();

  const [activeTab, setActiveTab] = useState<'All' | 'Verified' | 'Pending'>('All');
  const [toastMessage, setToastMessage] = useState('');
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<UserDocument | null>(null);

  const [uploadDocType, setUploadDocType] = useState('Yarn Passbook');

  const filteredDocs = documentsList.filter((doc) => {
    if (activeTab === 'All') return true;
    return doc.status === activeTab;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle uploading/capturing a document
  const handleDocumentCapturedOrUploaded = (docName: string) => {
    const isYarn = docName.toLowerCase().includes('yarn') || uploadDocType.toLowerCase().includes('yarn');

    const newDoc: UserDocument = {
      id: `doc-${Date.now()}`,
      name: isYarn ? 'Yarn Passbook' : docName,
      type: isYarn ? 'Yarn & Sales Passbook' : 'Identity Proof',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
      fileUrl: '/mock/uploaded.pdf',
      icon: isYarn ? '📔' : '📄',
    };

    addDocument(newDoc);

    if (isYarn) {
      updateYarnPassbook({ isUploaded: true, uploadDate: newDoc.uploadDate });
      // Trigger AI Multi-step processing animation modal
      setIsProcessingOpen(true);
    } else {
      showToast(t('documents.uploadSuccess', 'Document uploaded successfully!'));
    }
  };

  const handleActionClick = (doc: UserDocument, action: 'view' | 'camera' | 'upload' | 'history' | 'delete') => {
    if (action === 'view') {
      setSelectedPreviewDoc(doc);
    } else if (action === 'camera') {
      setUploadDocType(doc.name);
      setIsCameraOpen(true);
    } else if (action === 'upload') {
      setUploadDocType(doc.name);
      setIsUploadModalOpen(true);
    } else if (action === 'history') {
      setIsHistoryOpen(true);
    } else if (action === 'delete') {
      deleteDocument(doc.id);
      showToast(t('documents.deleteSuccess', 'Document deleted successfully'));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-sm">
            <FileText size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">{t('documents.title', 'Document Locker')}</h1>
            <p className="text-sm text-slate-500">{t('documents.subtitle', 'Securely store and manage your KYC documents')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            leftIcon={<Camera size={18} />}
            onClick={() => {
              setUploadDocType('Yarn Passbook');
              setIsCameraOpen(true);
            }}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {t('documents.cameraBtn', 'Camera Scan')}
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Upload size={18} />}
            onClick={() => setIsUploadModalOpen(true)}
            className="shadow-md shadow-primary-200"
          >
            {t('documents.uploadDocument', 'Upload Document')}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={staggerItem}>
          <Card className="border-2 border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{documentsList.length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('documents.totalDocuments', 'Total Documents')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="border-2 border-slate-100 shadow-sm bg-gradient-to-br from-white to-success-50/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center text-success-600 border border-success-100">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{documentsList.filter(d => d.status === 'Verified').length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('documents.verified', 'Verified')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="border-2 border-slate-100 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{documentsList.filter(d => d.status === 'Pending').length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('documents.pendingReview', 'Pending Review')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'All', label: t('documents.tabAll', 'All') },
          { key: 'Verified', label: t('documents.tabVerified', 'Verified') },
          { key: 'Pending', label: t('documents.tabPending', 'Pending') }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={[
              'flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:bg-primary-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Grid - Featuring Yarn Passbook alongside Aadhaar, Weaver ID, Bank Passbook */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {filteredDocs.map((doc) => {
          const isYarnPassbook = doc.name.toLowerCase().includes('yarn') || doc.type.toLowerCase().includes('yarn');

          return (
            <motion.div key={doc.id} variants={staggerItem}>
              <Card className={`border-2 transition-all duration-300 shadow-sm hover:shadow-md h-full relative overflow-hidden ${
                isYarnPassbook ? 'border-indigo-200 bg-gradient-to-br from-white via-indigo-50/20 to-secondary-50/20' : 'border-slate-100 hover:border-primary-200'
              }`}>
                {isYarnPassbook && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-secondary-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles size={11} /> AI Financial Profile Enabled
                  </div>
                )}

                <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
                  <div className="flex gap-4 items-start mb-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                      isYarnPassbook ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100'
                    }`}>
                      {doc.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{tData(doc.name)}</h3>
                        <Badge variant={doc.status === 'Verified' ? 'success' : 'amber'} dot>
                          {doc.status === 'Verified' ? t('documents.statusVerified', 'Verified') : t('documents.statusPending', 'Pending')}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-1.5">{tData(doc.type)}</p>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Calendar size={12} />
                        {t('documents.uploadedOn', 'Uploaded on')} {new Date(doc.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar for Document Card */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      leftIcon={<Eye size={14} />}
                      onClick={() => handleActionClick(doc, 'view')}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs py-1.5"
                    >
                      {t('common.view', 'Preview')}
                    </Button>

                    {isYarnPassbook ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        leftIcon={<Receipt size={14} />}
                        onClick={() => handleActionClick(doc, 'history')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 shadow-sm"
                      >
                        {t('documents.txHistory', 'Transaction History')}
                      </Button>
                    ) : null}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      leftIcon={<Camera size={14} />}
                      onClick={() => handleActionClick(doc, 'camera')}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs py-1.5"
                      title={t('documents.camera', 'Camera')}
                    >
                      {t('documents.camera', 'Camera')}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      leftIcon={<RefreshCw size={14} />}
                      onClick={() => handleActionClick(doc, 'upload')}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs py-1.5"
                      title={t('documents.replace', 'Replace')}
                    >
                      {t('documents.replace', 'Replace')}
                    </Button>

                    <button 
                      onClick={() => handleActionClick(doc, 'delete')}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                      title={t('common.delete', 'Delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100 border-dashed">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">{t('documents.noDocsFound', 'No documents found')}</h3>
          <p className="text-sm text-slate-500">{t('documents.noDocsMessage', "You don't have any {{tab}} documents.", { tab: activeTab === 'All' ? '' : activeTab.toLowerCase() })}</p>
        </div>
      )}

      {/* File Upload Modal (Image or PDF) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={t('documents.uploadDocument', 'Upload Document')}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-3xl p-8 text-center cursor-pointer hover:bg-primary-50 transition-colors"
               onClick={() => {
                 setIsUploadModalOpen(false);
                 handleDocumentCapturedOrUploaded(uploadDocType);
               }}>
            <Upload size={40} className="mx-auto text-primary-500 mb-3" />
            <p className="font-bold text-primary-700 mb-1">{t('documents.clickToBrowse', 'Click to browse or drag file here')}</p>
            <p className="text-xs text-primary-600/70">PDF, JPG, PNG {t('documents.upTo', 'up to 5MB')}</p>
          </div>

          <div className="space-y-3 mt-4">
            <label className="text-sm font-bold text-slate-700 block">{t('documents.documentType', 'Document Type')}</label>
            <select 
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-semibold"
            >
              <option value="Yarn Passbook">🧵 {t('documents.typeYarnPassbook', 'Yarn Passbook')}</option>
              <option value="Aadhaar Card">🪪 {t('documents.typeAadhaar', 'Aadhaar Card')}</option>
              <option value="Weaver ID Card">🧵 {t('documents.typeWeaverId', 'Weaver ID Card')}</option>
              <option value="Bank Passbook">🏦 {t('documents.typeBank', 'Bank Passbook')}</option>
              <option value="PAN Card">💳 {t('documents.typePan', 'PAN Card')}</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              fullWidth
              leftIcon={<Camera size={16} />}
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsCameraOpen(true);
              }}
            >
              {t('documents.useCamera', 'Use Camera')}
            </Button>
            <Button 
              fullWidth 
              variant="primary"
              onClick={() => {
                setIsUploadModalOpen(false);
                handleDocumentCapturedOrUploaded(uploadDocType);
              }}
            >
              {t('common.uploadNow', 'Upload Now')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        documentTitle={uploadDocType}
        onCapture={() => {
          handleDocumentCapturedOrUploaded(uploadDocType);
        }}
      />

      {/* Multi-step AI Processing Animation Modal */}
      <YarnPassbookProcessingModal
        isOpen={isProcessingOpen}
        onClose={() => setIsProcessingOpen(false)}
        onComplete={() => {
          showToast(t('documents.processingComplete', 'AI Extraction Complete! Transaction History Updated.'));
          setIsHistoryOpen(true);
        }}
      />

      {/* Transaction History Screen/Modal */}
      <YarnTransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!selectedPreviewDoc}
        onClose={() => setSelectedPreviewDoc(null)}
        document={selectedPreviewDoc}
        onReplace={(doc) => {
          setUploadDocType(doc.name);
          setIsUploadModalOpen(true);
        }}
        onDelete={(doc) => {
          deleteDocument(doc.id);
          showToast(t('documents.deleteSuccess', 'Document deleted successfully'));
        }}
        onViewHistory={() => {
          setIsHistoryOpen(true);
        }}
      />

      <Toast message={toastMessage} isVisible={!!toastMessage} type="success" />
    </div>
  );
}

function Calendar({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}
