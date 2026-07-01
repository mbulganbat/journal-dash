import { useAppContext } from '../../../context/AppContext';
import { Toggle } from '../../../components/ui/Shared';

const NOTIFICATION_ITEMS = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and alerts' },
  { key: 'push', label: 'Push Notifications', desc: 'Real-time alerts in browser' },
  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Detailed performance breakdown every Sunday' }
] as const;

export const NotificationsSection = () => {
  const { settings, updateSettings } = useAppContext();

  return (
    <div className="flex flex-col gap-6 max-w-md">
      {NOTIFICATION_ITEMS.map(item => (
        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-bg-3 border border-white/[0.04]">
          <div>
            <p className="text-sm font-semibold text-text-1">{item.label}</p>
            <p className="text-xs text-text-3 mt-1">{item.desc}</p>
          </div>
          <Toggle
            checked={settings.notifications[item.key]}
            onChange={() => updateSettings({ notifications: { ...settings.notifications, [item.key]: !settings.notifications[item.key] } })}
          />
        </div>
      ))}
    </div>
  );
};
