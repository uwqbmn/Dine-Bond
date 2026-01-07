
import React, { useState, useEffect } from 'react';
import { Guest, IcebreakerSet, AppState, EventInfo } from './types';
import { fetchAppDataFromSheet } from './sheetService';
import { 
  Users, 
  MapPin, 
  Loader2, 
  UserCheck,
  BrainCircuit,
  MessageSquareQuote,
  Lightbulb,
  Compass,
  Dices,
  Instagram,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [icebreakerPool, setIcebreakerPool] = useState<IcebreakerSet[]>([]);
  const [tableDescriptions, setTableDescriptions] = useState<Record<string, string>>({});
  const [eventInfo, setEventInfo] = useState<EventInfo>({});
  const [inputIgId, setInputIgId] = useState('');
  const [state, setState] = useState<AppState>({
    isCheckingIn: false,
    checkedInGuest: null,
    tableMates: [],
    selectedIcebreakers: null,
    tableInsight: null,
    error: null,
  });
  const [isLoadingSheet, setIsLoadingSheet] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchAppDataFromSheet();
        setAllGuests(data.guests);
        setIcebreakerPool(data.icebreakerSets || []);
        setTableDescriptions(data.tableDescriptions || {});
        setEventInfo(data.eventInfo || {});
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSheet(false);
      }
    };
    init();
  }, []);

  const handleCheckIn = async () => {
    if (!inputIgId.trim()) return;

    setState(prev => ({ ...prev, isCheckingIn: true, error: null }));
    
    const cleanId = inputIgId.toLowerCase().trim().replace('@', '');
    const guestIndex = allGuests.findIndex(g => g.igId.toLowerCase() === cleanId);
    const guest = allGuests[guestIndex];
    
    if (!guest || guestIndex === -1) {
      setState(prev => ({ 
        ...prev, 
        isCheckingIn: false, 
        error: "找不到此帳號，請確認輸入是否正確。" 
      }));
      return;
    }

    const mates = allGuests.filter(g => g.tableCode === guest.tableCode);
    
    let selectedSet: IcebreakerSet | null = null;
    if (icebreakerPool.length > 0) {
      selectedSet = icebreakerPool[guestIndex] || icebreakerPool[guestIndex % icebreakerPool.length];
    }

    const insight = tableDescriptions[guest.tableCode] || tableDescriptions[guest.tableName] || null;

    setState({
      isCheckingIn: false,
      checkedInGuest: guest,
      tableMates: mates,
      selectedIcebreakers: selectedSet,
      tableInsight: insight,
      error: null,
    });
  };

  const handleReset = () => {
    setState({
      isCheckingIn: false,
      checkedInGuest: null,
      tableMates: [],
      selectedIcebreakers: null,
      tableInsight: null,
      error: null,
    });
    setInputIgId('');
  };

  if (isLoadingSheet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf7] px-6 text-center">
        <div className="relative mb-6">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-stone-800 font-bold font-sans text-lg mb-2">正在透過 AI 整理聚會資訊</p>
        <p className="text-stone-500 text-sm font-medium italic">Gemini 3 Flash 正在為您優化資料庫內容...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#fcfaf7] shadow-xl flex flex-col relative overflow-hidden font-sans">
      <div className="absolute top-[-5%] right-[-10%] w-72 h-72 bg-amber-100/60 rounded-full blur-3xl opacity-50 z-0"></div>
      <div className="absolute bottom-[-5%] left-[-10%] w-80 h-80 bg-stone-200/60 rounded-full blur-3xl opacity-50 z-0"></div>

      <header className="pt-20 pb-10 px-6 text-center z-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-6xl font-serif tracking-tighter text-stone-900 relative">
            <span className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 bg-clip-text text-transparent">
              Dine & Bond
            </span>
          </h1>
          <div className="flex items-center gap-3 w-full max-w-[200px]">
            <div className="h-[1px] flex-1 bg-stone-200"></div>
            <p className="text-amber-700/60 text-[10px] tracking-[0.3em] uppercase font-bold">Social Club</p>
            <div className="h-[1px] flex-1 bg-stone-200"></div>
          </div>
          <p className="mt-2 text-stone-500 text-sm tracking-[0.15em] font-medium">優雅相遇 • 深度交流</p>
        </div>
      </header>

      <main className="flex-1 px-6 pb-12 z-10">
        {!state.checkedInGuest ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 border border-stone-100 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-stone-800">歡迎蒞臨</h2>
                <div className="space-y-1">
                  <p className="text-stone-500 text-sm">請輸入您的 Instagram ID</p>
                  <p className="text-amber-600/60 text-xs italic font-medium">若沒有可輸入 line ID</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-stone-300 font-bold text-lg">@</span>
                </div>
                <input
                  type="text"
                  value={inputIgId}
                  onChange={(e) => setInputIgId(e.target.value)}
                  placeholder="ID / Username"
                  className="block w-full pl-12 pr-6 py-5 bg-stone-50/50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-stone-800 font-bold placeholder:text-stone-300 shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                />
              </div>

              {state.error && (
                <p className="text-red-500 text-sm text-center font-bold bg-red-50 py-3 rounded-xl border border-red-100">
                  {state.error}
                </p>
              )}

              <button
                onClick={handleCheckIn}
                disabled={state.isCheckingIn || !inputIgId}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-stone-900/20"
              >
                {state.isCheckingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    領取聚會資訊
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Table Info Card */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-amber-200/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <MapPin className="w-32 h-32" />
              </div>
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Sparkles className="w-4 h-4 text-amber-200" />
                   <p className="text-amber-100 text-[10px] font-bold uppercase tracking-[0.2em]">AI 智能配對資訊</p>
                </div>
                <div className="flex items-end gap-3">
                  <h2 className="text-5xl font-bold tracking-tighter">{state.checkedInGuest.tableCode}</h2>
                  <p className="text-2xl text-amber-50 font-medium mb-1 opacity-90">/ {state.checkedInGuest.tableName}</p>
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-white/20 relative z-10 flex justify-between items-center">
                <p className="text-base">歡迎您，<span className="font-bold border-b-2 border-white/40 pb-0.5">{state.checkedInGuest.name}</span></p>
                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/30">已報到</div>
              </div>
            </div>

            {/* Table Insight Section */}
            {state.tableInsight && (
              <section className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg shadow-stone-200/30 space-y-3 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 blur-2xl"></div>
                <div className="flex items-center gap-3">
                  <div className="bg-stone-50 p-2 rounded-xl">
                    <BrainCircuit className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-stone-800">桌次分配邏輯</h3>
                </div>
                <p className="text-stone-600 text-[15px] leading-relaxed italic pl-1 font-medium">
                  「{state.tableInsight}」
                </p>
              </section>
            )}

            {/* Icebreakers */}
            {state.selectedIcebreakers && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-3">
                  <MessageSquareQuote className="w-5 h-5 text-stone-400" />
                  <h3 className="font-bold text-stone-800 uppercase tracking-widest text-xs">AI 話題急救包</h3>
                </div>
                
                <div className="grid gap-3">
                  {[
                    { icon: Lightbulb, label: '分享想法', text: state.selectedIcebreakers.sharing, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100/50' },
                    { icon: Compass, label: '集思廣益', text: state.selectedIcebreakers.brainstorming, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100/50' },
                    { icon: Dices, label: '搞怪話題', text: state.selectedIcebreakers.quirky, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100/50' }
                  ].map((item, idx) => (
                    <div key={idx} className={`bg-white p-5 rounded-2xl border ${item.border} shadow-sm flex gap-5 items-start hover:shadow-md transition-all duration-300`}>
                      <div className={`${item.bg} ${item.color} p-2.5 rounded-xl shrink-0`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                           <p className={`text-[10px] font-black ${item.color} uppercase tracking-[0.2em]`}>{item.label}</p>
                           <div className={`w-1 h-1 rounded-full ${item.bg} opacity-50`}></div>
                        </div>
                        <p className="text-stone-800 text-[15px] font-semibold leading-relaxed">
                          {item.text || "正在思考有趣的話題..."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Table Guest List */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-3">
                <Users className="w-5 h-5 text-stone-400" />
                <h3 className="font-bold text-stone-800 uppercase tracking-widest text-xs">同桌成員</h3>
              </div>
              <div className="bg-white rounded-[2rem] shadow-lg shadow-stone-200/20 border border-stone-100 overflow-hidden divide-y divide-stone-50">
                {state.tableMates.map((mate) => (
                  <div 
                    key={mate.igId}
                    className="px-8 py-5 flex items-center justify-between hover:bg-stone-50 transition-colors"
                  >
                    <p className="font-bold text-stone-800 text-[15px]">
                      {mate.name} 
                    </p>
                    {mate.igId.toLowerCase() === state.checkedInGuest?.igId.toLowerCase() && (
                      <span className="px-3 py-1 bg-stone-900 text-white text-[9px] rounded-full font-black tracking-widest uppercase">ME</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <button
              onClick={handleReset}
              className="w-full py-6 text-stone-400 hover:text-amber-700 text-xs font-bold tracking-widest uppercase transition-all border-t border-stone-100 mt-4"
            >
              重新查詢報到資訊
            </button>
          </div>
        )}
      </main>

      <footer className="p-10 text-center flex flex-col items-center gap-8 z-10">
        <a 
          href="https://www.instagram.com/dinebondtaichung?igsh=MXBmcG02eXNnOTA2MQ==" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 text-stone-500 hover:text-amber-700 transition-all text-xs font-bold bg-white px-8 py-4 rounded-full border border-stone-100 shadow-xl shadow-stone-200/50 active:scale-95"
        >
          <Instagram className="w-5 h-5" />
          <span className="tracking-tight">@dinebondtaichung</span>
        </a>
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] text-stone-300 uppercase tracking-[0.4em] font-black">
            Dine & Bond Collective
          </p>
          <p className="text-[8px] text-stone-200 uppercase tracking-widest">Est. 2026 • Taichung</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
