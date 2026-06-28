import React from 'react';
import HistoryDrawer from '../../components/HistoryDrawer';
import { useAppSession } from '../../context/AppSessionContext';
import { ClassicPhaseRouter } from '../../navigation/PhaseRouter';

export default function ClassicShell() {
  const session = useAppSession();

  return (
    <HistoryDrawer
      open={session.historyOpen}
      entries={session.historyStore.entries}
      activeId={session.phase === 'result' && session.data ? session.historyStore.activeId : null}
      phase={session.phase}
      data={session.data}
      currentStep={session.currentStep}
      isComplete={session.isComplete}
      onClose={() => session.closeHistoryDrawer()}
      onOpen={() => session.openHistoryDrawer()}
      onSelect={session.handleSelectHistory}
      onDelete={session.handleDeleteHistory}
      onRename={session.handleRenameHistory}
      onUpdateCategory={session.handleUpdateEntryCategory}
      onTogglePin={session.handlePinHistory}
      onGoToStep={session.goToStep}
      onNewMap={session.handleNewMap}
    >
      <ClassicPhaseRouter />
    </HistoryDrawer>
  );
}
