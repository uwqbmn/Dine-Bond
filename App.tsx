
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
  Sparkles,
  ChevronRight
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
    
    // 報到成功後將捲軸移至頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoadingSheet) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#fcfaf7] px-8 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-amber-200 blur-2xl opacity-20 animate-pulse rounded-full"></div>
          <Loader2 className="w-14 h-14 text-amber-600 animate-spin relative z-10" />
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-3 -right-3 animate-bounce" />
        </div>
        <h3 className="text-stone-800 font-black text-xl mb-3 tracking-tight">Dine & Bond</h3>
        <p className="text-stone-500 text-sm font-medium leading-relaxed max-w-[200px]">
          正在與 AI 廚師確認今晚的靈感菜單...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-[#fcfaf7] flex flex-col relative font-sans selection:bg-amber-100">
      {/* 裝飾性背景元素 */}
      <div className="fixed top-[-5%] right-[-15%] w-80 h-80 bg-amber-100/40 rounded-full blur-[80px] z-0 pointer-events-none"></div>
      <div className="fixed bottom-[10%] left-[-20%] w-96 h-96 bg-stone-200/40 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      <header className="pt-16 pb-8 px-6 text-center z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="relative inline-block">
             <h1 className="text-6xl font-serif tracking-tighter text-stone-900 relative z-10">
              <span className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 bg-clip-text text-transparent">
                Dine & Bond
              </span>
            </h1>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-600/20 rounded-full"></div>
          </div>
          <div className="flex items-center gap-3 mt-4 opacity-60">
            <div className="h-[0.5px] w-8 bg-stone-400"></div>
            <p className="text-stone-500 text-[10px] tracking-[0.4em] uppercase font-black">Social Collective</p>
            <div className="h-[0.5px] w-8 bg-stone-400"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pb-20 z-10 space-y-8">
        {!state.checkedInGuest ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-black text-stone-800 tracking-tight italic font-serif">Greetings,</h2>
                <div className="space-y-1">
                  <p className="text-stone-500 text-sm font-medium">請輸入您的 Instagram ID</p>
                  <p className="text-amber-600/70 text-xs font-bold tracking-tight">若沒有可輸入 Line ID</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <span className="text-amber-600 font-black text-xl opacity-40">@</span>
                </div>
                <input
                  type="text"
                  value={inputIgId}
                  onChange={(e) => setInputIgId(e.target.value)}
                  placeholder="ID / Username"
                  className="block w-full pl-12 pr-6 py-5 bg-stone-50/50 border border-stone-100 rounded-[1.5rem] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 focus:bg-white transition-all text-stone-800 font-bold placeholder:text-stone-300 shadow-inner appearance-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                />
              </div>

              {state.error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50/80 p-4 rounded-2xl border border-red-100 animate-in shake duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                  {state.error}
                </div>
              )}

              <button
                onClick={handleCheckIn}
                disabled={state.isCheckingIn || !inputIgId}
                className="w-full py-5 bg-stone-900 text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-stone-900/30"
              >
                {state.isCheckingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    領取資訊
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-12 text-center opacity-30 select-none">
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              <p className="text-[10px] font-black tracking-[0.2em] uppercase">Private Event Only</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-12 duration-700 ease-out-expo">
            {/* Table Info Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <MapPin className="w-48 h-48" />
              </div>
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-6 h-[1px] bg-amber-400"></div>
                   <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.3em]">Table Allocation</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-6xl font-serif font-black tracking-tighter text-amber-50 leading-none">
                    {state.checkedInGuest.tableCode}
                  </h2>
                  <p className="text-xl text-stone-400 font-serif italic ml-1">
                    {state.checkedInGuest.tableName}
                  </p>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-white/10 relative z-10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Guest</span>
                  <p className="text-lg font-black tracking-tight">{state.checkedInGuest.name}</p>
                </div>
                <div className="px-5 py-2 bg-amber-600/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest border border-amber-500 shadow-lg">CHECKED-IN</div>
              </div>
            </div>

            {/* Table Insight Section */}
            {state.tableInsight && (
              <section className="bg-white/90 backdrop-blur-lg p-7 rounded-[2.2rem] border border-stone-100 shadow-xl shadow-stone-200/20 space-y-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/30 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-600 text-white p-2 rounded-xl shadow-lg shadow-amber-600/20">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-stone-800 text-sm uppercase tracking-wider">配對契機</h3>
                </div>
                <p className="text-stone-700 text-[15px] leading-relaxed italic font-medium border-l-2 border-stone-100 pl-4 py-1">
                  「{state.tableInsight}」
                </p>
              </section>
            )}

            {/* Icebreakers */}
            {state.selectedIcebreakers && (
              <section className="space-y-4 py-2">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-stone-400" />
                    <h3 className="font-black text-stone-500 uppercase tracking-[0.2em] text-[10px]">Icebreaker Kit</h3>
                  </div>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                
                <div className="grid gap-3">
                  {[
                    { icon: Lightbulb, label: '分享想法', text: state.selectedIcebreakers.sharing, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100/40' },
                    { icon: Compass, label: '集思廣益', text: state.selectedIcebreakers.brainstorming, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100/40' },
                    { icon: Dices, label: '搞怪話題', text: state.selectedIcebreakers.quirky, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100/40' }
                  ].map((item, idx) => (
                    <div key={idx} className={`bg-white/80 p-5 rounded-[1.8rem] border ${item.border} shadow-sm flex gap-5 items-start active:bg-stone-50 transition-all duration-300 active:scale-[0.98]`}>
                      <div className={`${item.bg} ${item.color} p-3 rounded-2xl shrink-0 shadow-sm`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1.5 pr-2">
                        <p className={`text-[10px] font-black ${item.color} uppercase tracking-[0.2em]`}>{item.label}</p>
                        <p className="text-stone-800 text-[15px] font-bold leading-relaxed tracking-tight">
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
              <div className="flex items-center gap-2 px-3">
                <Users className="w-4 h-4 text-stone-400" />
                <h3 className="font-black text-stone-500 uppercase tracking-[0.2em] text-[10px]">同桌旅伴</h3>
              </div>
              <div className="bg-white rounded-[2.2rem] shadow-xl shadow-stone-200/20 border border-stone-100 overflow-hidden divide-y divide-stone-50">
                {state.tableMates.map((mate) => (
                  <div 
                    key={mate.igId}
                    className="px-8 py-5 flex items-center justify-between active:bg-stone-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-400">
                        {mate.name.charAt(0)}
                      </div>
                      <p className="font-black text-stone-800 text-[15px] tracking-tight">
                        {mate.name} 
                      </p>
                    </div>
                    {mate.igId.toLowerCase() === state.checkedInGuest?.igId.toLowerCase() ? (
                      <span className="px-3 py-1 bg-stone-900 text-white text-[9px] rounded-full font-black tracking-widest uppercase">YOU</span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-stone-200" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <button
              onClick={handleReset}
              className="w-full py-10 text-stone-400 hover:text-amber-700 text-[10px] font-black tracking-[0.4em] uppercase transition-all flex flex-col items-center gap-2 active:opacity-50"
            >
              <div className="w-8 h-[1px] bg-stone-200 mb-2"></div>
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
          className="group inline-flex items-center gap-3 text-stone-500 hover:text-stone-800 transition-all text-xs font-black bg-white/80 backdrop-blur-md px-10 py-5 rounded-full border border-stone-100 shadow-2xl shadow-stone-300/30 active:scale-90"
        >
          <Instagram className="w-5 h-5 text-amber-600" />
          <span className="tracking-tight italic font-serif">@dinebondtaichung</span>
        </a>
        
        <div className="flex flex-col items-center gap-2 opacity-30">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-4 h-[1px] bg-stone-900"></div>
             <p className="text-[9px] text-stone-900 uppercase tracking-[0.5em] font-black">
                D&B Collective
             </p>
             <div className="w-4 h-[1px] bg-stone-900"></div>
          </div>
          <p className="text-[8px] text-stone-900 uppercase tracking-widest font-bold">Est. 2026 • Taichung City</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
