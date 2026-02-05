import { useState } from "react";
import { blogApi, NewsSearchResult } from "@/lib/api";
import {
  Search,
  X,
  ExternalLink,
  Calendar,
  Loader2,
  Newspaper,
} from "lucide-react";

export function NewsSearchScreen() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recency, setRecency] = useState<
    "hour" | "day" | "week" | "month" | "year"
  >("month");
  const [results, setResults] = useState<NewsSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAddKeyword = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setInputValue("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSearch = async () => {
    if (keywords.length === 0) {
      setError("최소 1개 이상의 키워드를 입력하세요");
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      // 🎭 MOCK DATA - 실제 API 연결 전 UI 확인용
      // await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

      // const mockResults: NewsSearchResult[] = [
      //   {
      //     title: "AI 에이전트, 2026년 기업 필수 기술로 부상",
      //     url: "https://example.com/ai-agent-trends-2026",
      //     snippet: "2026년 기업들이 AI 에이전트를 도입하며 생산성이 30% 증가했다는 보고서가 발표됐다. 특히 고객 서비스, 데이터 분석, 콘텐츠 생성 분야에서 AI 에이전트의 활용도가 급증하고 있다.",
      //     date: "2026-01-28",
      //     last_updated: "2026-01-30"
      //   },
      //   {
      //     title: "OpenAI, 새로운 멀티모달 AI 모델 'GPT-5' 공개",
      //     url: "https://example.com/openai-gpt5-announcement",
      //     snippet: "OpenAI가 이미지, 비디오, 오디오를 동시에 처리할 수 있는 차세대 AI 모델 GPT-5를 공개했다. 이전 모델 대비 3배 향상된 성능을 자랑하며, 실시간 비디오 분석 기능이 추가됐다.",
      //     date: "2026-01-25",
      //     last_updated: null
      //   },
      //   {
      //     title: "블록체인 기술, 공공 부문 디지털 전환 가속화",
      //     url: "https://example.com/blockchain-public-sector",
      //     snippet: "정부와 공공기관들이 블록체인 기술을 활용한 투명한 행정 시스템 구축에 나섰다. 서울시는 블록체인 기반 전자투표 시스템을 시범 운영하며 긍정적인 결과를 얻었다.",
      //     date: "2026-01-27",
      //     last_updated: "2026-01-29"
      //   },
      //   {
      //     title: "Web3 생태계, 메타버스와 결합하며 새로운 국면 맞이",
      //     url: "https://example.com/web3-metaverse-integration",
      //     snippet: "Web3 기술이 메타버스 플랫폼과 결합하면서 디지털 자산 거래 시장이 활성화되고 있다. NFT 기반 가상 부동산 거래량이 전년 대비 150% 증가했다.",
      //     date: "2026-01-26",
      //     last_updated: null
      //   },
      //   {
      //     title: "AI 기반 콘텐츠 생성 도구, 마케팅 업계 판도 변화",
      //     url: "https://example.com/ai-content-marketing-revolution",
      //     snippet: "AI를 활용한 자동 콘텐츠 생성 도구가 마케팅 업계에 혁신을 가져오고 있다. 기업들은 AI 도구를 통해 콘텐츠 제작 시간을 70% 단축하고 개인화된 마케팅을 실현하고 있다.",
      //     date: "2026-01-24",
      //     last_updated: "2026-01-28"
      //   },
      //   {
      //     title: "양자 컴퓨팅, 암호화 기술의 새로운 패러다임 제시",
      //     url: "https://example.com/quantum-computing-encryption",
      //     snippet: "양자 컴퓨터의 발전으로 기존 암호화 방식의 보안 위협이 커지면서, 양자 내성 암호(PQC) 기술 개발이 가속화되고 있다. 주요 IT 기업들이 양자 암호 기술 표준화에 동참했다.",
      //     date: "2026-01-23",
      //     last_updated: null
      //   }
      // ];

      // setResults(mockResults);

      // 실제 API 사용 시 아래 코드 활성화
      const response = await blogApi.searchRecentNews(keywords, recency, 20);
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색에 실패했습니다");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const recencyOptions = [
    { value: "hour", label: "1시간" },
    { value: "day", label: "24시간" },
    { value: "week", label: "1주일" },
    { value: "month", label: "1개월" },
    { value: "year", label: "1년" },
  ] as const;

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">뉴스 검색</h1>
          <p className="text-gray-600">
            키워드로 최신 뉴스와 아티클을 검색하세요
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            {/* Keywords Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                검색 키워드
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="키워드를 입력하고 Enter를 누르세요"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  onClick={handleAddKeyword}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  추가
                </button>
              </div>

              {/* Keywords Tags */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recency Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                검색 기간
              </label>
              <div className="flex flex-wrap gap-2">
                {recencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRecency(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      recency === option.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearching || keywords.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  검색하기
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {hasSearched && (
            <div>
              {results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      검색 결과{" "}
                      <span className="text-blue-600">{results.length}</span>개
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {results.map((article, index) => (
                      <article
                        key={index}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-200 hover:border-blue-200 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                              {article.snippet}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {article.date && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{article.date}</span>
                                </div>
                              )}
                              {article.last_updated &&
                                article.last_updated !== article.date && (
                                  <div>업데이트: {article.last_updated}</div>
                                )}
                            </div>
                          </div>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                !isSearching && (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      검색 결과가 없습니다
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      다른 키워드로 다시 시도해보세요
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Empty State */}
          {!hasSearched && (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">
                키워드를 입력하고 검색해보세요
              </p>
              <p className="text-gray-400 text-sm">
                AI, 블록체인, Web3 등 관심 있는 주제를 검색해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
