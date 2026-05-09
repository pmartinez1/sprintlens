import AppLayout from '@/components/layout/AppLayout';
import { Settings as SettingsIcon, Key, Info } from 'lucide-react';

export default function Settings() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">App configuration and integration settings</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* API Token info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Key className="w-4 h-4 text-indigo-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Monday.com API Token</h3>
              <p className="text-xs text-slate-500">
                Your API token is securely stored as an environment secret. To update it, go to the Base44 dashboard → Settings → Secrets and update the <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">MONDAY_API_TOKEN</code> value.
              </p>
              <p className="text-xs text-slate-600 mt-2">
                To find your token: Monday.com → Profile (top right) → Developers → My Access Tokens
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">About SprintLens</h3>
              <p className="text-xs text-slate-500">
                SprintLens is a decision-support dashboard for engineering managers. It connects live to your Monday.com boards and surfaces sprint health, blockers, velocity, and planned vs. unplanned work metrics.
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-600">• Live Monday.com API sync</p>
                <p className="text-xs text-slate-600">• Sprint velocity & progress tracking</p>
                <p className="text-xs text-slate-600">• Blocker detection & alerting</p>
                <p className="text-xs text-slate-600">• Planned vs. unplanned capacity analysis</p>
                <p className="text-xs text-slate-600">• AI agent support (coming soon)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}