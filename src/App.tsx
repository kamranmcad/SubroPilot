import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ChatCopilot from './components/ChatCopilot';
import { CLAIMS_KNOWLEDGE_BASE } from './data/claimsKnowledgeBase';
import { loadExcelKnowledgeBase, KBData } from './services/dataLoader';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'data'>('chat');
  const [kb, setKb] = useState<KBData>(CLAIMS_KNOWLEDGE_BASE);
  const [isExcelLoaded, setIsExcelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);

  const resetChat = () => {
    setChatKey(prev => prev + 1);
  };

  useEffect(() => {
    async function initData() {
      try {
        const dynamicKb = await loadExcelKnowledgeBase('/claims_kb.csv');
        setKb(dynamicKb);
        setIsExcelLoaded(true);
        setLoadError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Excel Load Failed:", msg);
        setLoadError(msg);
      }
    }
    initData();
  }, []);

  return (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center font-sans">
      {/* Outer Shell - Modal-like container */}
      <div className="h-full w-full bg-white border-x border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Workspace */}
          <div className="flex-1 overflow-hidden bg-white">
            <div className="w-full h-full flex flex-col min-h-0">
              
              {/* Primary Action Area */}
              <div className="flex-1 h-full flex flex-col min-h-0">
                {activeTab === 'chat' ? (
                  <div className="h-full flex flex-col min-h-0">
                    <ChatCopilot key={chatKey} kb={kb} />
                  </div>
                ) : (
                  <div className="h-full bg-white p-8 overflow-y-auto border-t border-slate-100">
                    <div className="max-w-6xl mx-auto">
                      <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="text-blue-600 w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Source Knowledge Base</h2>
                          <p className="text-xs text-slate-400 mt-1">
                            {isExcelLoaded ? 'Direct parsing of uploaded spreadsheet' : 'Mock data for evaluation'}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-12">
                        <section>
                          <h3 className="text-[11px] font-bold text-blue-600 uppercase mb-4 tracking-widest border-l-2 border-blue-600 pl-3">Data Definitions (Row 1)</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {Object.entries(kb.definitions).map(([key, def]) => (
                              <div key={key} className="p-4 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-white hover:border-slate-200 hover:shadow-md transition-all">
                                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-tight">{key}</span>
                                <p className="text-sm text-slate-700 leading-snug">{def}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section>
                          <h3 className="text-[11px] font-bold text-blue-600 uppercase mb-4 tracking-widest border-l-2 border-blue-600 pl-3">Indexed Records (Row {isExcelLoaded ? '3+' : 'Demo'})</h3>
                          <div className="overflow-x-auto border border-slate-100">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <tr className="border-b border-slate-200">
                                  <th className="p-4">Claim Type</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4">Insurers (NAF / AF)</th>
                                  <th className="p-4">Amount</th>
                                  <th className="p-4">Last Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {kb.data.map((record, i) => (
                                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4">
                                      <div className="text-slate-900 font-bold">{record['Claim Type'] || 'Unknown'}</div>
                                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{record['city'] || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                        String(record['Status']).includes('Closed') || String(record['current_status']).includes('completed') ? 'bg-slate-100 text-slate-500' :
                                        String(record['Status']).includes('In Progress') ? 'bg-green-50 text-green-700' :
                                        'bg-blue-50 text-blue-700'
                                      }`}>
                                        {record['Status'] || record['current_status'] || '-'}
                                      </span>
                                      <div className="text-[10px] text-slate-400 mt-0.5">{record['current_stage'] || ''}</div>
                                    </td>
                                    <td className="p-4">
                                       <div className="text-xs font-semibold text-slate-700"><span className="text-[9px] uppercase text-slate-400 mr-1">NAF:</span>{record['naf_insurer'] || '-'}</div>
                                       <div className="text-xs font-semibold text-slate-700 text-opacity-70"><span className="text-[9px] uppercase text-slate-400 mr-1">AF:</span>{record['af_insurer'] || '-'}</div>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-slate-900">
                                      {record['claim_amount'] ? `$${Number(record['claim_amount']).toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-4 text-[11px] text-slate-500 tabular-nums">
                                      {record['last_action_at'] ? new Date(String(record['last_action_at'])).toLocaleDateString() : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
