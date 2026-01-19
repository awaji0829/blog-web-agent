import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link as LinkIcon, FileText, Plus, ChevronDown, X, UploadCloud } from 'lucide-react';

interface ResourceInputData {
  urls: string[];
  files: string[];
  customPrompt: string;
}

interface ResourceInputProps {
  onStartAnalysis: (data: ResourceInputData) => void;
}

export function ResourceInput({ onStartAnalysis }: ResourceInputProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleStartAnalysis = () => {
    onStartAnalysis({
      urls: urls.filter(u => u.trim() !== ''),
      files: uploadedFiles,
      customPrompt,
    });
  };

  const addUrlInput = () => {
    setUrls([...urls, '']);
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const handleFileUpload = () => {
    // Mock file upload
    const mockFiles = ["company_report_2024.pdf", "market_analysis.docx"];
    setUploadedFiles(prev => [...prev, ...mockFiles]);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col gap-10">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          새로운 콘텐츠를 시작해 보세요
        </h1>
        <p className="text-lg text-gray-500">
          참고할 링크나 파일을 넣으면 AI가 인사이트를 추출합니다.
        </p>
      </div>

      {/* Inputs Section */}
      <div className="space-y-6 bg-white rounded-2xl p-1">
        
        {/* URL Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-500" />
            참고할 URL 링크
          </label>
          <div className="space-y-3">
            {urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder="🔗 참고할 URL 링크를 입력하세요 (여러 개 입력 가능)"
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
                {urls.length > 1 && (
                  <button onClick={() => removeUrl(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addUrlInput}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 pl-1"
            >
              <Plus className="w-3 h-3" /> 링크 추가하기
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            자료 업로드
          </label>
          <div 
            onClick={handleFileUpload}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
            </div>
            <span className="text-gray-500 font-medium group-hover:text-blue-600">📁 리포트나 내부 자료(PDF, DOCX) 업로드</span>
            <span className="text-xs text-gray-400 mt-1">클릭하여 파일 선택 또는 드래그 앤 드롭</span>
          </div>
          
          {/* Mock Uploaded Files */}
          {uploadedFiles.length > 0 && (
             <div className="flex flex-wrap gap-2 mt-2">
               {uploadedFiles.map((file, i) => (
                 <div key={i} className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-2">
                   <FileText className="w-3 h-3" />
                   {file}
                   <button onClick={(e) => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="hover:text-red-500">
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Accordion Option */}
        <div className="pt-2">
          <button 
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900 transition-colors w-full text-left py-2"
          >
            <Plus className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? 'rotate-45' : ''}`} />
            <span>직접 인사이트/아이디어 추가하기 (선택 사항)</span>
          </button>
          
          <AnimatePresence>
            {isAccordionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-2">
                   <textarea
                     value={customPrompt}
                     onChange={(e) => setCustomPrompt(e.target.value)}
                     placeholder="예: 이번 글은 MZ세대를 타겟으로 친근한 말투로 써줘."
                     className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm leading-relaxed"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-4">
        <button
          onClick={handleStartAnalysis}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          분석 시작하기
        </button>
      </div>
    </div>
  );
}
