import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useGrandmasters } from '../hooks/useGrandmasters';

const ITEM_SIZE = 60;
const WINDOW_HEIGHT = 600;
const SCROLL_KEY = 'grandmaster_list_scroll';
const INDEX_KEY = 'grandmaster_list_index';

const GrandmasterList: React.FC = () => {
  const { data: grandmasters, loading, error, loadMore } = useGrandmasters();
  const location = useLocation();
  const navigationType = useNavigationType();
  const listRef = useRef<List>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [itemCount, setItemCount] = useState(20);
  const [initialScroll, setInitialScroll] = useState(0);
  const [listKey, setListKey] = useState(0);
  const [ready, setReady] = useState(false);

  // Use query param for scroll restoration
  const params = new URLSearchParams(location.search);
  const fromProfile = params.get('fromProfile') === '1';

  useEffect(() => {
    let cancelled = false;
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    const savedIndex = sessionStorage.getItem(INDEX_KEY);
    let targetPage = 0;
    // Only restore scroll if coming from profile via query param and scroll is set
    if (fromProfile && savedScroll && savedIndex) {
      setInitialScroll(Number(savedScroll));
      targetPage = Math.floor(Number(savedIndex) / 10);
      // Remove ?fromProfile=1 from the URL after restoring
      const url = new URL(window.location.href);
      url.searchParams.delete('fromProfile');
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search
      );
    } else {
      setInitialScroll(0);
      sessionStorage.removeItem(SCROLL_KEY);
      sessionStorage.removeItem(INDEX_KEY);
    }
    setReady(false);
    const initializeList = async () => {
      let totalItems = 0;
      for (let page = 0; page <= targetPage; page++) {
        const count = await loadMore(page);
        totalItems += count;
        if (count < 10) break;
      }
      setHasNextPage(totalItems % 10 === 0);
      setItemCount(totalItems + (totalItems % 10 === 0 ? 10 : 0));
      if (!cancelled) {
        setReady(true);
        setListKey((k) => k + 1); // force List remount after data is ready
      }
    };
    initializeList();
    return () => {
      cancelled = true;
    };
  }, [loadMore, location.search, navigationType]);

  useEffect(() => {
    setListKey((k) => k + 1);
  }, [initialScroll]);

  if (error) {
    return (
      <div className='p-5 text-center text-lg text-red-600'>
        Error: {error.message}
      </div>
    );
  }

  const isItemLoaded = (index: number) => {
    return (
      Boolean(grandmasters[index]) ||
      (!hasNextPage && index >= grandmasters.length)
    );
  };

  const loadMoreItems = async (startIndex: number) => {
    if (loading) return;
    const loadedItems = await loadMore(Math.floor(startIndex / 10));
    setHasNextPage(loadedItems === 10);
    setItemCount((prev) => Math.max(prev, startIndex + loadedItems));
  };

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const gm = grandmasters[index];
    if (!gm) {
      return (
        <div
          style={style}
          className="flex items-center justify-center border-b border-[#444c56] bg-[#2d333b] py-3 text-sm text-gray-300 backdrop-blur-md"
        >
          <svg
            className="mr-3 -ml-1 h-5 w-5 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      );
    }
    return (
      <div style={style}>
        <Link
          to={`/player/${gm.username}`}
          onClick={() => {
            const list = listRef.current;
            if (list) {
              const outer = (list as unknown as { _outerRef: HTMLDivElement })
                ._outerRef;
              sessionStorage.setItem(SCROLL_KEY, String(outer.scrollTop));
              sessionStorage.setItem(INDEX_KEY, String(index));
            }
          }}
          className="flex h-full items-center justify-between rounded-2xl bg-transparent px-4 py-4 shadow transition-all duration-200 hover:bg-[#2d333b] hover:shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-700/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                {gm.title}
              </span>
              <span className="font-extrabold text-lg text-white drop-shadow-sm font-mono">
                {gm.name}
              </span>
            </div>
            <span className="text-xs text-blue-300 font-mono">@{gm.username}</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="text-base font-bold text-blue-400">
              {gm.followers.toLocaleString()} <span className="text-xs font-normal text-blue-700">followers</span>
            </div>
            <div className="inline-flex items-center rounded-full bg-blue-900/60 px-2 py-0.5 text-xs font-semibold text-blue-200">
              {gm.league || 'Unranked'}
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22272e] via-[#2d333b] to-[#22272e] p-6 font-sans">
      <h1 className="mb-10 text-center text-4xl font-extrabold tracking-tight text-white drop-shadow-lg font-mono">
        ♛ Chess Grandmasters
      </h1>
      <div className="mx-auto max-w-3xl overflow-x-hidden">
        {ready && (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasNextPage ? itemCount + 10 : itemCount}
            loadMoreItems={loadMoreItems}
            threshold={5}
          >
            {({ onItemsRendered, ref }) => (
              <List
                key={listKey}
                ref={(list) => {
                  ref(list);
                  listRef.current = list;
                }}
                height={WINDOW_HEIGHT}
                itemCount={hasNextPage ? itemCount + 10 : itemCount}
                itemSize={ITEM_SIZE}
                initialScrollOffset={initialScroll}
                onItemsRendered={onItemsRendered}
                width="100%"
                className="overflow-x-hidden"
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </div>
    </div>
  );
};

export default GrandmasterList;
