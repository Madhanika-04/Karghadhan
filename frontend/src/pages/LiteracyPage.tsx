import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Play, CheckCircle, Trophy, Lock } from 'lucide-react';
import { learningModules } from '../data/literacy';
import { ProgressBar, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { staggerContainer, staggerItem } from '../utils/animations';
import type { LearningModule } from '../types';

const difficultyColor: Record<string, 'emerald' | 'amber' | 'red'> = {
  Beginner: 'emerald',
  Intermediate: 'amber',
  Advanced: 'red',
};

export default function LiteracyPage() {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(learningModules.map((m) => m.category)))];
  const filtered = learningModules.filter((m) => activeFilter === 'All' || m.category === activeFilter);

  const completedCount = learningModules.filter((m) => m.isCompleted).length;
  const overallProgress = Math.round((completedCount / learningModules.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Financial Literacy</h1>
            <p className="text-sm text-slate-500">Learn, grow, and protect your finances</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-6 text-white"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
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
                transition={{ duration: 1.5, delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">{overallProgress}%</p>
                <p className="text-[10px] text-white/70">Done</p>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold mb-1">Your Learning Journey</h3>
            <p className="text-white/70 text-sm mb-3">
              {completedCount} of {learningModules.length} modules completed
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              <div className="bg-white/15 rounded-2xl px-4 py-2 text-center">
                <p className="font-bold text-lg">{completedCount}</p>
                <p className="text-[10px] text-white/70">Completed</p>
              </div>
              <div className="bg-white/15 rounded-2xl px-4 py-2 text-center">
                <p className="font-bold text-lg">{learningModules.filter((m) => m.progress > 0 && !m.isCompleted).length}</p>
                <p className="text-[10px] text-white/70">In Progress</p>
              </div>
              <div className="bg-white/15 rounded-2xl px-4 py-2 text-center">
                <p className="font-bold text-lg">{learningModules.reduce((sum, m) => sum + m.estimatedMinutes, 0)} min</p>
                <p className="text-[10px] text-white/70">Total Time</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all',
              activeFilter === cat
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300',
            ].join(' ')}
          >
            {cat}
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
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedModule(module)}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer group transition-shadow hover:shadow-lg"
          >
            {/* Card Top Gradient */}
            <div className={`bg-gradient-to-br ${module.color} p-5 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-4 -translate-y-4" />
              <div className="text-3xl mb-2">{module.icon}</div>
              {module.isCompleted && (
                <div className="absolute top-3 right-3">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                    <Trophy size={14} className="text-amber-500" />
                  </div>
                </div>
              )}
              <h3 className="text-white font-bold text-sm leading-tight">{module.title}</h3>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={difficultyColor[module.difficulty]}>{module.difficulty}</Badge>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {module.estimatedMinutes} min
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{module.description}</p>

              {/* Progress */}
              <ProgressBar
                value={module.progress}
                height="h-1.5"
                color={`bg-gradient-to-r ${module.color}`}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{module.progress}% done</span>
                {module.isCompleted ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle size={12} />
                    Done!
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-violet-600 group-hover:gap-2 transition-all">
                    <Play size={11} fill="currentColor" />
                    {module.progress > 0 ? 'Continue' : 'Start'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Module Detail Modal */}
      <Modal
        isOpen={!!selectedModule}
        onClose={() => setSelectedModule(null)}
        title={selectedModule?.title}
        size="lg"
      >
        {selectedModule && (
          <div className="space-y-5">
            <div className={`bg-gradient-to-br ${selectedModule.color} rounded-2xl p-5 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedModule.icon}</span>
                <div>
                  <p className="font-bold text-lg">{selectedModule.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} />
                    <span className="text-sm">{selectedModule.estimatedMinutes} minutes</span>
                    <span>·</span>
                    <span className="text-sm">{selectedModule.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{selectedModule.description}</p>

            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Topics Covered:</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedModule.topics.map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            {selectedModule.progress > 0 && (
              <ProgressBar
                value={selectedModule.progress}
                label="Your Progress"
                showValue
                height="h-3"
              />
            )}

            <Button
              fullWidth
              size="lg"
              variant={selectedModule.isCompleted ? 'outline' : 'primary'}
              leftIcon={selectedModule.isCompleted ? <CheckCircle size={18} /> : <Play size={18} fill="currentColor" />}
            >
              {selectedModule.isCompleted ? 'Review Module' : selectedModule.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
