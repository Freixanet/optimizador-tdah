import React from 'react';
import HistoryDrawer from '../components/HistoryDrawer';
import { useAppSession } from '../context/AppSessionContext';
import { ComprensionPhaseRouter } from '../navigation/PhaseRouter';

export default function ComprensionApp() {
  const session = useAppSession();

  return (
    <HistoryDrawer
      open={session.historyOpen}
      entries={session.historyStore.entries}
      activeId={session.historyStore.activeId}
      phase={session.phase}
      data={session.data}
      currentStep={session.currentStep}
      isComplete={session.isComplete}
      viewAll={session.viewAll}
      totalSteps={session.totalSteps}
      onClose={() => session.setHistoryOpen(false)}
      onOpen={() => session.setHistoryOpen(true)}
      onSelect={session.handleSelectHistory}
      onDelete={session.handleDeleteHistory}
      onRename={session.handleRenameHistory}
      onTogglePin={session.handlePinHistory}
      onGoToStep={session.goToStep}
      onToggleViewMode={session.toggleViewMode}
      onNewMap={session.handleNewMap}
    >
      <ComprensionPhaseRouter />
    </HistoryDrawer>
  );
}
