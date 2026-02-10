import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBackIosNew } from 'react-icons/md';

// ----------------------------------------------------
// 타입 정의
// ----------------------------------------------------

// 검색 결과 항목의 타입
interface SearchResult {
  id: string;
  title: string;
  channel: string;
}

// 예약된 곡 항목의 타입 (Queue에 저장될 데이터)
interface ReservedSong extends SearchResult {
  reservedAt: number; // 예약된 시간 (선입선출 관리를 위해)
}

// ----------------------------------------------------
// 더미 데이터 및 유틸리티 함수 (실제로는 Background Script와 통신)
// ----------------------------------------------------

// 검색 함수 (실제로는 크롬 메시징을 통해 Background Script의 YouTube API 호출)
const mockSearchSongs = async (query: string): Promise<SearchResult[]> => {
  console.log(`[API Call] Searching with query: "${query} MR"`);
  // **실제 구현: chrome.runtime.sendMessage(...) 호출**

  // MR이 자동으로 붙은 것으로 가정하고 더미 결과 반환
  if (query.toLowerCase().includes('아이유')) {
    return [
      { id: '1a2b', title: '좋은 날 (MR - 공식 채널)', channel: '아이유 공식' },
      { id: '3c4d', title: '밤편지 (MR)', channel: '가요 반주 채널' },
    ];
  }
  return [];
};

// ----------------------------------------------------
// 컴포넌트 정의
// ----------------------------------------------------

/**
 * 노래방 예약 기능을 위한 사이드바 컴포넌트
 */
export const ReservationSidebar: React.FC = () => {
  const { t } = useTranslation();
  // 사이드바 상태 관리: 'default' (버튼), 'search' (검색 화면), 'queue' (예약 목록)
  const [viewState, setViewState] = useState<'default' | 'search'>('default');

  // 검색 상태 및 결과
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 예약 목록 상태 (실제로는 storage/background와 동기화되어야 함)
  const [reservationQueue, setReservationQueue] = useState<ReservedSong[]>([]);

  // 검색 로직 처리 핸들러
  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchText.trim()) return;

      setIsLoading(true);
      setSearchResults([]);

      // 3. 노래 검색 시 'MR'이 자동으로 붙어 검색됨 (함수 내부에서 처리)
      const results = await mockSearchSongs(searchText);

      setSearchResults(results);
      setIsLoading(false);
    },
    [searchText],
  );

  // 예약 버튼 클릭 핸들러
  const handleReserve = useCallback((song: SearchResult) => {
    // 실제 구현: chrome.runtime.sendMessage(...)를 통해 background에 예약 요청
    console.log(`[Reserve] ${song.title} reserved.`);

    // 예약 목록에 추가 (더미 상태 업데이트)
    const newReservation: ReservedSong = { ...song, reservedAt: Date.now() };
    setReservationQueue((prev) => [...prev, newReservation]);

    // 예약 후 검색 화면 닫기 또는 유지 결정 (여기서는 닫기로 가정)
    setViewState('default');
  }, []);

  // ----------------------------------------------------
  // UI 렌더링
  // ----------------------------------------------------

  // 1. 예약하기 버튼이 있는 기본 화면
  if (viewState === 'default') {
    return (
      <div className="reservation-sidebar default-view">
        <button
          className="reserve-button"
          // 1. 예약하기 버튼 클릭 시
          onClick={() => setViewState('search')}
        >
          🎤 노래 예약하기
        </button>

        {reservationQueue.length > 0 && (
          <div className="current-queue">
            <p>✅ 예약 목록 ({reservationQueue.length} 곡)</p>
            <ul>
              {reservationQueue.map((song, index) => (
                <li key={song.id + index}>
                  {index + 1}. {song.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 2. 검색 화면 (별도의 tsx 전환을 simulate)
  return (
    <div className="reservation-sidebar search-view">
      <button className="back-button" onClick={() => setViewState('default')} aria-label={t('extBack')}>
        <MdArrowBackIosNew />
      </button>

      <h3 className="search-title">노래 검색 (MR 자동)</h3>

      {/* 2. 텍스트 검색이 가능한 검색바 */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="가수명 + 곡명 (ex. 아이유 좋은 날)"
          className="search-input"
        />
        <button type="submit" disabled={isLoading || !searchText.trim()}>
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </form>

      {/* 검색 결과 표시 */}
      <div className="search-results">
        {searchResults.length === 0 && !isLoading && searchText.trim() && (
          <p className="no-results">검색 결과가 없습니다.</p>
        )}

        {searchResults.map((song) => (
          <div key={song.id} className="result-item">
            <div className="song-info">
              <strong>{song.title}</strong>
              <small>{song.channel}</small>
            </div>
            {/* 예약 버튼이 검색 결과의 오른쪽에 따로 있음 */}
            <button className="reserve-btn-small" onClick={() => handleReserve(song)}>
              예약
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
