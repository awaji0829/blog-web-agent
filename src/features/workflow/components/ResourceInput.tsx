import { useState } from 'react';
import { Link as LinkIcon, FileText, Plus, X, UploadCloud, Tag, Users } from 'lucide-react';

interface ResourceInputData {
  urls: string[];
  files: string[];
  keywords: string;
  targetAudience: string;
}

interface ResourceInputProps {
  onStartAnalysis: (data: ResourceInputData) => void;
}

const TARGET_AUDIENCE_OPTIONS = [
  { value: '', label: '선택하세요' },
  { value: 'general', label: '일반 대중' },
  { value: 'expert', label: '업계 전문가' },
  { value: 'executive', label: '경영진 / 의사결정자' },
  { value: 'beginner', label: '학생 / 입문자' },
  { value: 'custom', label: '직접 입력' },
];

export function ResourceInput({ onStartAnalysis }: ResourceInputProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');
  const [audienceSelect, setAudienceSelect] = useState('');
  const [audienceCustom, setAudienceCustom] = useState('');

  const handleStartAnalysis = () => {
    const targetAudience = audienceSelect === 'custom'
      ? audienceCustom
      : TARGET_AUDIENCE_OPTIONS.find(o => o.value === audienceSelect)?.label || '';

    onStartAnalysis({
      urls: urls.filter(u => u.trim() !== ''),
      files: uploadedFiles,
      keywords,
      targetAudience: targetAudience === '선택하세요' ? '' : targetAudience,
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

  const hasResources = urls.some(u => u.trim() !== '') || uploadedFiles.length > 0;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col gap-8">
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

        {/* Keywords Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-500" />
            주제 · 키워드
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">선택</span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="예: SaaS 마케팅, B2B, 성장 전략"
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
          />
          <p className="text-xs text-gray-400 pl-1">여러 키워드는 쉼표로 구분해 주세요</p>
        </div>

        {/* Resources Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">참고 자료</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">필수</span>
          </div>

          {/* URL Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-500" />
              URL 링크
            </label>
            <div className="space-y-3">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="참고할 URL 링크를 입력하세요"
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
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              파일 업로드
            </label>
            <div
              onClick={handleFileUpload}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </div>
              <span className="text-gray-500 font-medium text-sm group-hover:text-blue-600">PDF, DOCX 파일을 업로드하세요</span>
              <span className="text-xs text-gray-400 mt-1">클릭 또는 드래그 앤 드롭</span>
            </div>

            {/* Uploaded Files */}
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
        </div>

        {/* Target Audience */}
        <div className="space-y-2 pt-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            타겟 독자
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">선택</span>
          </label>
          <div className="flex gap-3">
            <select
              value={audienceSelect}
              onChange={(e) => setAudienceSelect(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white text-gray-700"
            >
              {TARGET_AUDIENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {audienceSelect === 'custom' && (
              <input
                type="text"
                value={audienceCustom}
                onChange={(e) => setAudienceCustom(e.target.value)}
                placeholder="예: 스타트업 마케터, 30대 직장인"
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-4">
        <button
          onClick={handleStartAnalysis}
          disabled={!hasResources}
          className={`w-full text-lg font-bold py-4 rounded-xl shadow-lg transition-all active:translate-y-0
            ${hasResources
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
        >
          분석 시작하기
        </button>
      </div>
    </div>
  );
}
