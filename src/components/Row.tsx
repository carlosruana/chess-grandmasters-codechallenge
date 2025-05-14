import React from 'react';
import { Link } from 'react-router-dom';
import type { GrandMaster } from '../types/index';

const INDEX_KEY = 'grandmaster_list_index';

interface RowProps {
  index: number;
  style: React.CSSProperties;
  grandmasters: GrandMaster[];
}

const Row: React.FC<RowProps> = ({ index, style, grandmasters }) => {
  const gm = grandmasters[index];
  if (!gm) {
    return (
      <div
        style={style}
        className='flex items-center justify-center border-b border-[#444c56] bg-[#2d333b] py-3 text-sm text-gray-300 backdrop-blur-md'
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
          sessionStorage.setItem(INDEX_KEY, String(index));
        }}
        className='flex h-full items-center justify-between rounded-2xl bg-transparent px-4 py-4 shadow transition-all duration-200 hover:bg-[#2d333b] hover:shadow-lg'
      >
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex items-center justify-center rounded-full bg-blue-700/80 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow'>
              {gm.title}
            </span>
            <span className='font-mono text-lg font-extrabold text-white drop-shadow-sm'>
              {gm.name}
            </span>
          </div>
          <span className='font-mono text-xs text-blue-300'>
            @{gm.username}
          </span>
        </div>
        <div className='flex flex-col items-end gap-1 text-right'>
          <div className='text-base font-bold text-blue-400'>
            {gm.followers.toLocaleString()}{' '}
            <span className='text-xs font-normal text-blue-700'>followers</span>
          </div>
          <div className='inline-flex items-center rounded-full bg-blue-900/60 px-2 py-0.5 text-xs font-semibold text-blue-200'>
            {gm.league || 'Unranked'}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Row;
