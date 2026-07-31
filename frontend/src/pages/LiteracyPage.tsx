import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PlayCircle, CheckCircle2, Trophy, Clock, BookOpen, Play, CheckCircle, Sparkles, ChevronDown } from 'lucide-react';
import { learningModules } from '../data/literacy';
import { LiteracyHero } from '../components/hero/LiteracyHero';
import { ProgressBar, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Card, CardContent } from '../components/ui/Card';
import { staggerContainer, staggerItem } from '../utils/animations';
import type { LearningModule } from '../types';
import { tData } from '../utils/i18nData';
import { agentsApi } from '../services/api';

const difficultyColor: Record<string, 'success' | 'amber' | 'danger'> = {
  Beginner: 'success',
  Intermediate: 'amber',
  Advanced: 'danger',
};

export default function LiteracyPage() {
  const { t } = useTranslation();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [literacyData, setLiteracyData] = useState<any>(null);
  const [literacyLoading, setLiteracyLoading] = useState(false);

  // Fetch literacy agent whenever a module is selected
  useEffect(() => {
    if (!selectedModule) {
      setLiteracyData(null);
      return;
    }
    setLiteracyLoading(true);
    agentsApi.literacy({}, selectedModule.title)
      .then(r => setLiteracyData(r.data))
      .catch(console.error)
      .finally(() => setLiteracyLoading(false));
  }, [selectedModule?.id]);

  const categories = ['All', ...Array.from(new Set(learningModules.map((m) => m.category)))];
  const filtered = learningModules.filter((m) => activeFilter === 'All' || m.category === activeFilter);

  const completedCount = learningModules.filter((m) => m.isCompleted).length;
  const overallProgress = Math.round((completedCount / learningModules.length) * 100);

  return (
    <div className="space-y-6 pb-8">
      <LiteracyHero />

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-primary-200/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - overallProgress / 100) }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">{overallProgress}%</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">{t('literacy.done', 'Done')}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold mb-1">{t('literacy.learningJourney', 'Your Learning Journey')}</h3>
            <p className="text-white/80 text-sm mb-4 font-medium">
              {t('literacy.modulesCompleted', '{{completed}} of {{total}} modules completed', { completed: completedCount, total: learningModules.length })}
            </p>
            <div className="flex gap-4 justify-center sm:justify-start">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                <p className="font-bold text-xl">{completedCount}</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider mt-0.5">{t('literacy.completed', 'Completed')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                <p className="font-bold text-xl">{learningModules.filter((m) => m.progress > 0 && !m.isCompleted).length}</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider mt-0.5">{t('literacy.inProgress', 'In Progress')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                <p className="font-bold text-xl">{learningModules.reduce((sum, m) => sum + m.estimatedMinutes, 0)}{t('literacy.m', 'm')}</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider mt-0.5">{t('literacy.totalTime', 'Total Time')}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              activeFilter === cat
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:bg-primary-50',
            ].join(' ')}
          >
            {cat === 'All' ? t('literacy.filterAll', 'All') : tData(cat)}
          </button>
        ))}
      </div>

      {/* Learning Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {filtered.map((module) => (
          <motion.div
            key={module.id}
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedModule(module)}
            className="cursor-pointer group h-full"
          >
            <Card className="h-full border-2 border-slate-100 hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Card Top Gradient */}
                <div className={`bg-gradient-to-br ${module.color.replace('violet', 'primary').replace('fuchsia', 'secondary')} p-6 relative overflow-hidden rounded-t-[1.3rem]`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8" />
                  <div className="text-4xl mb-3 relative z-10">{module.icon}</div>
                  {module.isCompleted && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <Trophy size={16} className="text-amber-300" />
                      </div>
                    </div>
                  )}
                  <h3 className="text-white font-bold text-base leading-tight relative z-10 pr-4">{tData(module.title)}</h3>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={difficultyColor[module.difficulty]}>{t(`literacy.difficulty${module.difficulty}`, module.difficulty)}</Badge>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                      <Clock size={12} />
                      {module.estimatedMinutes} {t('literacy.min', 'min')}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6 flex-1">{tData(module.description)}</p>

                  {/* Progress */}
                  <div className="mt-auto space-y-3">
                    <ProgressBar
                      value={module.progress}
                      height="h-2"
                      color={`bg-gradient-to-r ${module.color.replace('violet', 'primary')}`}
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold">{module.progress}% {t('literacy.doneProgress', 'done')}</span>
                      {module.isCompleted ? (
                        <div className="flex items-center gap-1.5 text-xs text-success-600 font-bold bg-success-50 px-2.5 py-1 rounded-full">
                          <CheckCircle size={12} />
                          {t('literacy.statusDone', 'Done!')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:gap-2 transition-all">
                          <Play size={12} fill="currentColor" />
                          {module.progress > 0 ? t('literacy.continue', 'Continue') : t('literacy.start', 'Start')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Modal
        isOpen={!!selectedModule}
        onClose={() => setSelectedModule(null)}
        title={t('literacy.moduleTitle', 'Learning Module')}
        size="lg"
      >
        {selectedModule && (
          <div className="space-y-6">
            <div className={`bg-gradient-to-br ${selectedModule.color.replace('violet', 'primary')} rounded-2xl p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="text-5xl bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20">{selectedModule.icon}</div>
                <div>
                  <p className="font-bold text-xl mb-2">{tData(selectedModule.title)}</p>
                  <div className="flex flex-wrap items-center gap-3 text-white/90">
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-sm font-medium">
                      <Clock size={14} />
                      <span>{selectedModule.estimatedMinutes} {t('literacy.mins', 'mins')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-sm font-medium">
                      <span>{t(`literacy.difficulty${selectedModule.difficulty}`, selectedModule.difficulty)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{tData(selectedModule.description)}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800 mb-3">{t('literacy.topicsCovered', 'Topics Covered:')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedModule.topics.map((topic) => (
                  <div key={topic} className="flex items-start gap-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <CheckCircle size={16} className="text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{tData(topic)}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedModule.progress > 0 && (
              <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                <ProgressBar
                  value={selectedModule.progress}
                  label={t('literacy.yourProgress', 'Your Progress')}
                  showValue
                  height="h-3"
                  color="bg-primary-500"
                />
              </div>
            )}

            {/* AI Literacy Agent Section */}
            <div className="border border-indigo-100 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-primary-600 px-5 py-3 flex items-center gap-2">
                <Sparkles size={14} className="text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t('literacy.aiExplainer', 'AI Explainer')}</h3>
                {literacyLoading && <span className="ml-auto text-xs text-white/70 animate-pulse">Thinking...</span>}
              </div>
              {literacyLoading ? (
                <div className="p-5 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles size={24} className="text-indigo-400" />
                  </motion.div>
                </div>
              ) : literacyData ? (
                <div className="p-5 space-y-4">
                  {literacyData.explanation && (
                    <p className="text-sm text-slate-700 leading-relaxed">{literacyData.explanation}</p>
                  )}
                  {literacyData.key_takeaways?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">{t('literacy.keyTakeaways', 'Key Takeaways')}</p>
                      <ul className="space-y-2">
                        {literacyData.key_takeaways.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle size={12} className="text-success-500 mt-0.5 shrink-0" />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {literacyData.faqs?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">{t('literacy.faqs', 'FAQs')}</p>
                      <div className="space-y-2">
                        {literacyData.faqs.map((faq: any, i: number) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-xs font-bold text-slate-800 mb-1">Q: {faq.q}</p>
                            <p className="text-xs text-slate-600">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 text-center text-xs text-slate-400">{t('literacy.aiNoMatch', 'Ask the assistant for more on this topic.')}</div>
              )}
            </div>

            <Button
              fullWidth
              size="lg"
              variant={selectedModule.isCompleted ? 'outline' : 'primary'}
              leftIcon={selectedModule.isCompleted ? <CheckCircle size={18} /> : <Play size={18} fill="currentColor" />}
              className={!selectedModule.isCompleted ? 'shadow-md shadow-primary-200' : ''}
            >
              {selectedModule.isCompleted ? t('literacy.reviewModule', 'Review Module') : selectedModule.progress > 0 ? t('literacy.continueLearning', 'Continue Learning') : t('literacy.startLearning', 'Start Learning')}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
