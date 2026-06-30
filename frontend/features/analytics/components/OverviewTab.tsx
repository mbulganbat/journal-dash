import { EquityDrawdownChart } from './EquityDrawdownChart';
import { BlueprintCard } from './BlueprintCard';
import { ExpectancyCard } from './ExpectancyCard';
import { TopSymbolCard } from './TopSymbolCard';
import { StreakCard } from './StreakCard';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  metrics: AnalyticsData['metrics'];
  blueprint: AnalyticsData['blueprint'];
  symbolStats: AnalyticsData['symbolStats'];
  streakStats: AnalyticsData['streakStats'];
  isPrivacyEnabled: boolean;
}

export const OverviewTab = ({ metrics, blueprint, symbolStats, streakStats, isPrivacyEnabled }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

        {/* Equity & Drawdown Chart (70/30 Split) */}
        <div className="flex flex-col gap-6">
          <EquityDrawdownChart metrics={metrics} isPrivacyEnabled={isPrivacyEnabled} />
        </div>

        {/* AI Trading Coach Blueprint */}
        <div className="flex flex-col gap-6">
          <BlueprintCard blueprint={blueprint} isPrivacyEnabled={isPrivacyEnabled} />
        </div>
      </div>

      {/* NEW ROW: Expectancy, Top Symbol & Streak Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ExpectancyCard metrics={metrics} isPrivacyEnabled={isPrivacyEnabled} />
        <TopSymbolCard symbolStats={symbolStats} isPrivacyEnabled={isPrivacyEnabled} />
        <StreakCard streakStats={streakStats} isPrivacyEnabled={isPrivacyEnabled} />
      </div>
    </div>
  );
};
