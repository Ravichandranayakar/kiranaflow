import { useState } from 'react';
import { BottomNav, type ActiveTab } from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExampleStrip } from './components/ExampleStrip';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { HistoryView } from './components/HistoryView';
import { MicDial } from './components/MicDial';
import { PendingReceiptCard } from './components/PendingReceiptCard';
import { SettingsModal } from './components/SettingsModal';
import { StockView } from './components/StockView';
import { useDeliveryFlow } from './hooks/useDeliveryFlow';

function KiranaFlowShell() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('intake');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const {
    lang,
    setLang,
    flowState,
    draft,
    parseResult,
    transcript,
    interimTranscript,
    health,
    stockItems,
    lowStockCount,
    movements,
    toast,
    isMuted,
    setIsMuted,
    micSupported,
    micError,
    isConfirming,
    lastCommitted,
    toggleListening,
    submitTranscript,
    confirmCurrentDraft,
    cancelCurrentDraft,
    resetToIdle,
    adjustDraftQuantities,
    adjustStockItem,
  } = useDeliveryFlow();

  return (
    <div className="min-h-screen bg-[#eae8e2] flex justify-center">
      {/* Mobile-first single-column app shell centered cleanly on desktop */}
      <main className="w-full max-w-[440px] min-h-screen bg-[#fbf9f3] shadow-xl flex flex-col justify-between relative">
        <div className="flex-1 flex flex-col">
          <Header
            lang={lang}
            onChangeLang={setLang}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {/* Toast Feedback Banner */}
          {toast && (
            <div
              role="status"
              className={`mx-5 mt-3 px-3.5 py-2.5 rounded-lg text-xs font-medium border ${
                toast.type === 'success'
                  ? 'bg-[#39734c]/12 border-[#39734c]/35 text-[#244e32]'
                  : toast.type === 'warning'
                    ? 'bg-[#a56a2a]/12 border-[#a56a2a]/35 text-[#7c4d19]'
                    : 'bg-[#b54a42]/12 border-[#b54a42]/35 text-[#8a2e27]'
              }`}
            >
              {toast.message}
            </div>
          )}

          {activeTab === 'intake' && (
            <div className="flex flex-col">
              <HeroBanner flowState={flowState} lang={lang} />
              <PendingReceiptCard
                flowState={flowState}
                lang={lang}
                transcript={transcript}
                interimTranscript={interimTranscript}
                draft={draft}
                parseResult={parseResult}
                stockItems={stockItems}
                onClarifyPick={(val) => void submitTranscript(val, 'text')}
                onConfirm={() => void confirmCurrentDraft()}
                onCancel={cancelCurrentDraft}
                onEditQuantities={adjustDraftQuantities}
                isConfirming={isConfirming}
                lastCommitted={lastCommitted}
                onNextEntry={resetToIdle}
                onOpenStock={() => {
                  resetToIdle();
                  setActiveTab('stock');
                }}
              />
              {flowState !== 'COMMITTED' && (
                <>
                  <MicDial
                    flowState={flowState}
                    lang={lang}
                    micSupported={micSupported}
                    micError={micError}
                    onToggleMic={() => void toggleListening()}
                    onSubmitText={(text) => void submitTranscript(text, 'text')}
                  />
                  <ExampleStrip
                    lang={lang}
                    disabled={flowState === 'PROCESSING'}
                    onSelectExample={(sample) => void submitTranscript(sample, 'demo')}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'stock' && (
            <StockView
              items={stockItems}
              lowStockCount={lowStockCount}
              lang={lang}
              onAdjustStock={adjustStockItem}
            />
          )}

          {activeTab === 'history' && <HistoryView movements={movements} lang={lang} />}
        </div>

        <BottomNav activeTab={activeTab} lang={lang} onSelectTab={setActiveTab} />

        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          health={health}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((m) => !m)}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <KiranaFlowShell />
    </ErrorBoundary>
  );
}
