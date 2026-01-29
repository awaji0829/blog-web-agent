import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/shared/Layout';
import { WorkflowContainer } from '@/features/workflow/WorkflowContainer';
import { SavedDraftsScreen } from '@/features/drafts/SavedDraftsScreen';
import type { Draft } from '@/features/workflow/types';

function AppContent() {
  const [viewDraft, setViewDraft] = useState<Draft | null>(null);
  const navigate = useNavigate();

  const handleNewDraft = () => {
    setViewDraft(null);
    navigate('/');
  };

  const handleViewDraft = (draft: Draft) => {
    setViewDraft(draft);
    navigate('/');
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<WorkflowContainer initialDraft={viewDraft} />} />
        <Route path="/saved" element={
          <SavedDraftsScreen
            onNewDraft={handleNewDraft}
            onViewDraft={handleViewDraft}
          />
        } />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
