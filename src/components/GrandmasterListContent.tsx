import React from 'react';
import { FixedSizeList as List } from 'react-window';
import type { GrandMaster } from '../types/index';
import InfiniteLoader from 'react-window-infinite-loader';
import Row from './Row';

interface GrandmasterListContentProps {
  grandmasters: GrandMaster[];
  loading: boolean;
  error: Error | null;
  loadMore: (page: number) => Promise<number>;
  hasNextPage: boolean;
  itemCount: number;
  initialScroll: number;
  listKey: number;
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: (startIndex: number) => void;
  ready: boolean;
}

const ITEM_SIZE = 60;
const WINDOW_HEIGHT = 600;

const GrandmasterListContent: React.FC<GrandmasterListContentProps> = ({
  grandmasters,
  hasNextPage,
  itemCount,
  initialScroll,
  listKey,
  isItemLoaded,
  loadMoreItems,
  ready,
}) => {
  // Ref to access the list's scroll position
  const listRef = React.useRef<List>(null);

  // Callback to save scroll position
  // Note: _outerRef is a private property of react-window's FixedSizeList
  const saveScrollPosition = (index: number) => {
    // @ts-expect-error: _outerRef is private but stable in react-window
    const outer = listRef.current?._outerRef as HTMLDivElement | undefined;
    if (outer) {
      sessionStorage.setItem(
        'grandmaster_list_scroll',
        String(outer.scrollTop)
      );
      sessionStorage.setItem('grandmaster_list_index', String(index));
    }
  };

  return (
    <div className='mx-auto max-w-3xl overflow-x-hidden'>
      {ready && (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={hasNextPage ? itemCount + 10 : itemCount}
          loadMoreItems={loadMoreItems}
          threshold={5}
        >
          {({ onItemsRendered }) => (
            <List
              key={listKey}
              ref={listRef}
              height={WINDOW_HEIGHT}
              itemCount={hasNextPage ? itemCount + 10 : itemCount}
              itemSize={ITEM_SIZE}
              initialScrollOffset={initialScroll}
              onItemsRendered={onItemsRendered}
              width='100%'
              className='overflow-x-hidden'
            >
              {({ index, style }) => (
                <Row
                  index={index}
                  style={style}
                  grandmasters={grandmasters}
                  saveScrollPosition={saveScrollPosition}
                />
              )}
            </List>
          )}
        </InfiniteLoader>
      )}
    </div>
  );
};

export default GrandmasterListContent;
