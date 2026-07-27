import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle, Clock, Upload, Eye } from 'lucide-react';
import { documents } from '../data/documents';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Modal, Toast } from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'All' | 'Verified' | 'Pending'>('All');
  const [toastMessage, setToastMessage] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'All') return true;
    return doc.status === activeTab;
  });

  const handleAction = (actionKey: string) => {
    setToastMessage(t(`documents.${actionKey}Success`, `Document ${actionKey} successfully!`));
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
        
        <Button 
          variant="primary" 
          leftIcon={<Upload size={18} />}
          onClick={() => setIsUploadModalOpen(true)}
          className="shadow-md shadow-primary-200"
        >
          {t('documents.uploadDocument', 'Upload Document')}
        </Button>
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
                <p className="text-2xl font-bold text-slate-800">{documents.length}</p>
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
                <p className="text-2xl font-bold text-slate-800">{documents.filter(d => d.status === 'Verified').length}</p>
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
                <p className="text-2xl font-bold text-slate-800">{documents.filter(d => d.status === 'Pending').length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('documents.pendingReview', 'Pending Review')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

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

      {/* Document Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {filteredDocs.map((doc) => (
          <motion.div key={doc.id} variants={staggerItem}>
            <Card className="border-2 border-slate-100 hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-md h-full">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
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
                  <p className="text-sm font-medium text-slate-500 mb-2">{tData(doc.type)}</p>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar size={12} />
                    {t('documents.uploadedOn', 'Uploaded on')} {new Date(doc.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth 
                    leftIcon={<Eye size={16} />}
                    onClick={() => handleAction('viewed')}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 sm:flex-none"
                  >
                    {t('common.view', 'View')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth 
                    leftIcon={<Download size={16} />}
                    onClick={() => handleAction('downloaded')}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 sm:flex-none"
                  >
                    {t('common.save', 'Save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100 border-dashed">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">{t('documents.noDocsFound', 'No documents found')}</h3>
          <p className="text-sm text-slate-500">{t('documents.noDocsMessage', "You don't have any {{tab}} documents.", { tab: activeTab === 'All' ? '' : activeTab.toLowerCase() })}</p>
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={t('documents.uploadDocument', 'Upload Document')}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-3xl p-8 text-center cursor-pointer hover:bg-primary-50 transition-colors">
            <Upload size={40} className="mx-auto text-primary-500 mb-3" />
            <p className="font-bold text-primary-700 mb-1">{t('documents.clickToBrowse', 'Click to browse or drag file here')}</p>
            <p className="text-xs text-primary-600/70">PDF, JPG, PNG {t('documents.upTo', 'up to 5MB')}</p>
          </div>
          
          <div className="space-y-3 mt-6">
            <label className="text-sm font-bold text-slate-700 block">{t('documents.documentType', 'Document Type')}</label>
            <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium">
              <option>{t('documents.typeAadhaar', 'Aadhaar Card')}</option>
              <option>{t('documents.typePan', 'PAN Card')}</option>
              <option>{t('documents.typeWeaverId', 'Weaver ID Card')}</option>
              <option>{t('documents.typeBank', 'Bank Passbook')}</option>
              <option>{t('documents.typeIncome', 'Income Certificate')}</option>
            </select>
          </div>
          
          <Button 
            fullWidth 
            className="mt-6"
            onClick={() => {
              setIsUploadModalOpen(false);
              handleAction('uploaded');
            }}
          >
            {t('common.uploadNow', 'Upload Now')}
          </Button>
        </div>
      </Modal>

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
