import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/shared/Layout';
import { AuthGate } from '@/components/shared/AuthGate';
import { WorkflowContainer } from '@/features/workflow/WorkflowContainer';
import { SavedDraftsScreen } from '@/features/drafts/SavedDraftsScreen';
import { DraftViewScreen } from '@/features/drafts/DraftViewScreen';
import { PromptManagerScreen } from '@/features/prompts/PromptManagerScreen';
import { NewsSearchScreen } from '@/features/news/NewsSearchScreen';

function AppContent() {
  const navigate = useNavigate();

  const handleNewDraft = () => {
    navigate('/');
  };

  return (
    <AuthGate>
      <Layout>
        <Routes>
          <Route path="/" element={<WorkflowContainer />} />
          <Route path="/saved" element={
            <SavedDraftsScreen onNewDraft={handleNewDraft} />
          } />
          <Route path="/drafts/:id" element={<DraftViewScreen />} />
          <Route path="/prompts" element={<PromptManagerScreen />} />
          <Route path="/news" element={<NewsSearchScreen />} />
        </Routes>
      </Layout>
    </AuthGate>
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
