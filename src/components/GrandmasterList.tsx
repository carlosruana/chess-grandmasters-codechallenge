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
          className='flex items-center justify-center border-b border-gray-200 bg-gray-50 py-3 text-sm text-gray-500'
        >
          <svg
            className='mr-3 -ml-1 h-5 w-5 animate-spin text-blue-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
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
          className='flex h-full items-center justify-between px-6 py-3 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm'
        >
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center justify-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                {gm.title}
              </span>
              <span className='font-semibold text-gray-900'>{gm.name}</span>
            </div>
            <span className='text-sm text-gray-500'>@{gm.username}</span>
          </div>
          <div className='flex flex-col items-end gap-1 text-right'>
            <div className='text-sm font-medium text-gray-700'>
              {gm.followers.toLocaleString()} followers
            </div>
            <div className='text-xs text-gray-500'>
              {gm.league || 'Unranked'}
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white p-5 font-sans'>
      <h1 className='mb-8 text-center text-3xl font-extrabold tracking-tight text-gray-900'>
        Chess Grandmasters
      </h1>
      <div className='mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-gray-200'>
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
                width='100%'
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
