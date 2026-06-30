import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAppContext } from '../../context/AppContext';
import { stagger } from '../../lib/animations';
import { useTradeDetail } from './hooks/useTradeDetail';
import { ScreenshotCarousel } from './components/ScreenshotCarousel';
import { MetadataGrid } from './components/MetadataGrid';
import { NotesEditor } from './components/NotesEditor';
import { MistakesLessons } from './components/MistakesLessons';
import { ExecutionCard } from './components/ExecutionCard';
import { ExitOutcomeCard } from './components/ExitOutcomeCard';
import { PsychologyCard } from './components/PsychologyCard';
import { AiInsightsCard } from './components/AiInsightsCard';

export const TradeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trades } = useAppContext();

  const trade = trades.find(t => t.id === id);

  const {
    localNotes, setLocalNotes,
    localMistakes, setLocalMistakes,
    localLessons, setLocalLessons,
    handleSaveNotes, handleUpdateList, handleOutcomeChange, handleEmotionChange
  } = useTradeDetail(trade);

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-text-2 mb-4">Trade not found</p>
        <button onClick={() => navigate('/journal')} className="text-em hover:underline">Back to Journal</button>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="p-9 pb-20 max-w-[1600px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-3 hover:text-text-1 transition-colors mb-6 text-sm font-medium">
        <IconArrowLeft size={16} /> Back to Journal
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">

        {/* Left Column */}
        <div className="flex flex-col gap-5">
          <ScreenshotCarousel trade={trade} />
          <MetadataGrid trade={trade} />
          <NotesEditor localNotes={localNotes} setLocalNotes={setLocalNotes} onSave={handleSaveNotes} />
          <MistakesLessons
            localMistakes={localMistakes}
            setLocalMistakes={setLocalMistakes}
            localLessons={localLessons}
            setLocalLessons={setLocalLessons}
            onUpdate={handleUpdateList}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <ExecutionCard trade={trade} />
          <ExitOutcomeCard trade={trade} onOutcomeChange={handleOutcomeChange} />
          <PsychologyCard trade={trade} onEmotionChange={handleEmotionChange} />
          <AiInsightsCard trade={trade} />
        </div>
      </div>
    </motion.div>
  );
};
