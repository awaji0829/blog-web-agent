import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/shared/Layout';
import { WorkflowContainer } from '@/features/workflow/WorkflowContainer';
import { SavedDraftsScreen } from '@/features/drafts/SavedDraftsScreen';
import { DraftViewScreen } from '@/features/drafts/DraftViewScreen';
import { PromptManagerScreen } from '@/features/prompts/PromptManagerScreen';

function AppContent() {
  const navigate = useNavigate();

  const handleNewDraft = () => {
    navigate('/');
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<WorkflowContainer />} />
        <Route path="/saved" element={
          <SavedDraftsScreen onNewDraft={handleNewDraft} />
        } />
        <Route path="/drafts/:id" element={<DraftViewScreen />} />
        <Route path="/prompts" element={<PromptManagerScreen />} />
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
