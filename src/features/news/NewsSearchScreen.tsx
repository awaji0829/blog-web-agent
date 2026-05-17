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

  const handleRemoveKeyword = (keyword: string) =>
    setKeywords(keywords.filter((k) => k !== keyword));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSearch = async () => {
    if (keywords.length === 0) {
      setError("키워드를 한 개 이상 입력해 주세요");
      return;
    }
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await blogApi.searchRecentNews(keywords, recency, 20);
      setResults(response.results);
    } catch (err) {
      setError(
        err instanceof Error
          ? `문제가 생겼어요 · ${err.message}`
          : "검색에 실패했어요 · 다시 시도해 주세요",
      );
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
    <div className="flex flex-col h-full w-full">
      <header
        style={{
          padding: "22px 36px 18px",
          borderBottom: "1px solid var(--border-sage)",
          background: "var(--page)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            뉴스 검색
          </div>
          <div style={{ fontSize: 13, color: "var(--dusk)", marginTop: 4 }}>
            키워드로 최신 뉴스와 아티클을 찾아볼 수 있어요
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ padding: "24px 36px 36px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="sage-card mb-6">
            <div className="mb-6">
              <label
                className="block mb-3"
                style={{ color: "var(--ink)", fontWeight: 500 }}
              >
                검색 키워드
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="키워드를 입력하고 Enter를 눌러 주세요"
                  className="sage-input"
                />
                <button
                  onClick={handleAddKeyword}
                  className="sage-btn sage-btn--secondary"
                >
                  추가
                </button>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="sage-tag sage-tag--brand"
                      style={{ gap: 6, padding: "6px 12px", fontSize: 13 }}
                    >
                      {keyword}
                      <button onClick={() => handleRemoveKeyword(keyword)}>
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label
                className="block mb-3"
                style={{ color: "var(--ink)", fontWeight: 500 }}
              >
                검색 기간
              </label>
              <div className="flex flex-wrap gap-2">
                {recencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRecency(option.value)}
                    className={`sage-tag ${
                      recency === option.value
                        ? "sage-tag--active"
                        : "sage-tag--neutral"
                    }`}
                    style={{
                      cursor: "pointer",
                      padding: "7px 14px",
                      fontSize: 13,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || keywords.length === 0}
              className="sage-btn sage-btn--primary w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                  뉴스를 찾고 있어요
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" strokeWidth={1.5} />
                  검색하기
                </>
              )}
            </button>

            {error && (
              <div
                className="mt-4"
                style={{
                  padding: "10px 14px",
                  background: "var(--warm)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <p style={{ fontSize: 13, color: "#7a4f1e" }}>{error}</p>
              </div>
            )}
          </div>

          {hasSearched && (
            <div>
              {results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ color: "var(--ink)" }}>
                      검색 결과{" "}
                      <span style={{ color: "var(--forest)" }}>
                        {results.length}
                      </span>
                      개
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {results.map((article, index) => (
                      <article
                        key={index}
                        className="group"
                        style={{
                          background: "var(--page)",
                          border: "1px solid var(--border-sage)",
                          borderRadius: "var(--r-lg)",
                          padding: 20,
                          transition:
                            "border-color var(--dur-base) var(--ease)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--border-deep)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--border-sage)")
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3
                              style={{
                                color: "var(--ink)",
                                marginBottom: 8,
                              }}
                            >
                              {article.title}
                            </h3>
                            <p
                              style={{
                                fontSize: 14,
                                color: "var(--ink-soft)",
                                lineHeight: 1.6,
                                marginBottom: 12,
                              }}
                            >
                              {article.snippet}
                            </p>
                            <div
                              className="flex items-center gap-4"
                              style={{ fontSize: 12, color: "var(--dusk)" }}
                            >
                              {article.date && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar
                                    className="w-3.5 h-3.5"
                                    strokeWidth={1.5}
                                  />
                                  <span>{article.date}</span>
                                </div>
                              )}
                              {article.last_updated &&
                                article.last_updated !== article.date && (
                                  <div>업데이트 {article.last_updated}</div>
                                )}
                            </div>
                          </div>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 flex items-center justify-center"
                            style={{
                              padding: 10,
                              background: "var(--sage)",
                              color: "var(--on-sage)",
                              borderRadius: "var(--r-md)",
                            }}
                          >
                            <ExternalLink
                              className="w-4 h-4"
                              strokeWidth={1.5}
                            />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                !isSearching && (
                  <div
                    className="sage-card text-center"
                    style={{ padding: "48px 24px" }}
                  >
                    <div
                      className="sage-icon-tile mx-auto mb-4"
                      style={{ width: 56, height: 56 }}
                    >
                      <Search className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: "var(--ink)",
                        marginBottom: 6,
                      }}
                    >
                      검색 결과가 없어요
                    </p>
                    <p style={{ fontSize: 13, color: "var(--dusk)" }}>
                      다른 키워드로 다시 시도해 주세요
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {!hasSearched && (
            <div
              className="sage-card text-center"
              style={{ padding: "56px 24px" }}
            >
              <div
                className="sage-icon-tile mx-auto mb-4"
                style={{ width: 56, height: 56 }}
              >
                <Newspaper className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                키워드를 입력하고 검색해 보세요
              </p>
              <p style={{ fontSize: 13, color: "var(--dusk)" }}>
                AI · 블록체인 · Web3처럼 관심 있는 주제면 좋아요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
