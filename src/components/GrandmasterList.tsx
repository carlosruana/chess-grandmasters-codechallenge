import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useGrandmasters } from '../hooks/useGrandmasters';

const GrandmasterListContent = React.lazy(
  () => import('./GrandmasterListContent')
);

const GrandmasterList: React.FC = () => {
  const { data: grandmasters, loading, error, loadMore } = useGrandmasters();
  const location = useLocation();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [ready, setReady] = useState(false);
  const [initialScroll, setInitialScroll] = useState(0);
  const [itemCount, setItemCount] = useState(10);
  const [listKey, setListKey] = useState(0);

  const isItemLoaded = useCallback(
    (index: number) => {
      return (
        Boolean(grandmasters[index]) ||
        (!hasNextPage && index >= grandmasters.length)
      );
    },
    [grandmasters, hasNextPage]
  );

  const loadMoreItems = useCallback(
    async (startIndex: number) => {
      if (loading) return;
      const count = await loadMore(Math.floor(startIndex / 10));
      setHasNextPage(count === 10);
      setItemCount((prev) => Math.max(prev, startIndex + count));
    },
    [loading, loadMore]
  );

  // Use query param for scroll restoration
  const params = new URLSearchParams(location.search);
  const fromProfile = params.get('fromProfile') === '1';

  useEffect(() => {
    let cancelled = false;
    const savedScroll = sessionStorage.getItem('grandmaster_list_scroll');
    const savedIndex = sessionStorage.getItem('grandmaster_list_index');
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
      sessionStorage.removeItem('grandmaster_list_scroll');
      sessionStorage.removeItem('grandmaster_list_index');
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
      setItemCount(Math.max(totalItems, 10));
      if (!cancelled) {
        setReady(true);
        setListKey((k) => k + 1); // force List remount after data is ready
      }
    };
    initializeList();
    return () => {
      cancelled = true;
    };
  }, [fromProfile, loadMore, location.search]);

  useEffect(() => {
    setListKey((k) => k + 1);
  }, [initialScroll]);

  if (error) {
    return (
      <div className='py-8 text-center text-red-400' role='alert'>
        Error: {error.message}
      </div>
    );
  }

  if (!loading && grandmasters.length === 0) {
    return (
      <div className='py-8 text-center text-gray-400' role='status'>
        No grandmasters found
      </div>
    );
  }

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
