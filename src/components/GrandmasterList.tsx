import React, { useState, useEffect, startTransition, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useGrandmasters } from '../hooks/useGrandmasters';
const GrandmasterListContent = React.lazy(
  () => import('./GrandmasterListContent')
);

const ITEM_SIZE = 60;
const WINDOW_HEIGHT = 600;
const SCROLL_KEY = 'grandmaster_list_scroll';
const INDEX_KEY = 'grandmaster_list_index';

const GrandmasterList: React.FC = () => {
  const { data: grandmasters, loading, error, loadMore } = useGrandmasters();
  const location = useLocation();
  const [hasNextPage, setHasNextPage] = useState(true);
  const initialItemCount = Math.ceil(WINDOW_HEIGHT / ITEM_SIZE) + 10;
  const [itemCount, setItemCount] = useState(initialItemCount);
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
      setItemCount(Math.max(totalItems, initialItemCount));
      if (!cancelled) {
        setReady(true);
        setListKey((k) => k + 1); // force List remount after data is ready
      }
    };
    initializeList();
    return () => {
      cancelled = true;
    };
  }, [fromProfile, initialItemCount, loadMore, location.search]);

  useEffect(() => {
    setListKey((k) => k + 1);
  }, [initialScroll]);

  const isItemLoaded = (index: number) => {
    return (
      Boolean(grandmasters[index]) ||
      (!hasNextPage && index >= grandmasters.length)
    );
  };

  const loadMoreItems = async (startIndex: number) => {
    if (loading) return;
    startTransition(async () => {
      const loadedItems = await loadMore(Math.floor(startIndex / 10));
      setHasNextPage(loadedItems === 10);
      setItemCount((prev) => Math.max(prev, startIndex + loadedItems));
    });
  };

  return (
    <div className='min-h-screen font-sans'>
      {/* h1 removed for optimal LCP, should be rendered in parent */}
      <Suspense
        fallback={<div className='text-center text-white'>Loading list...</div>}
      >
        <GrandmasterListContent
          grandmasters={grandmasters}
          loading={loading}
          error={error}
          loadMore={loadMore}
          hasNextPage={hasNextPage}
          itemCount={itemCount}
          initialScroll={initialScroll}
          listKey={listKey}
          isItemLoaded={isItemLoaded}
          loadMoreItems={loadMoreItems}
          ready={ready}
        />
      </Suspense>
    </div>
  );
};

export default GrandmasterList;
