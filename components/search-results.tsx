'use client';

import { FileSearchIcon } from '@/components/icons';
import Loader from '@/components/loader';
import ClientNewsArticle from '@/components/client-news-article';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { getNewsResults } from '@/lib/news';
import LoadingSkeleton from './loading-skeleton';

export default function SearchResults({ query }: { query: string }) {
  const { status, data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['news', 'search', query],
    queryFn: ({ pageParam = 0 }) => getNewsResults(query, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // For each subsequent page, increment offset by 20
      const nextPageIndex = allPages.length * 20;

      // We want to get the next page as long as there's data in the last page
      return lastPage.value.length >= 24 ? nextPageIndex : undefined;
    },
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : status === 'error' ? (
        <h1 className='text-red-500 font-medium text-xl text-center'>Error</h1>
      ) : (
        <div className='space-y-5'>
          <div className='flex items-center gap-x-2'>
            <FileSearchIcon className='w-[26px] h-[26px]' />
            <h4 className='text-neutral-500 w-[280px] truncate sm:w-auto'>
              {new Intl.NumberFormat().format(
                data.pages[0].totalEstimatedMatches
              )}{' '}
              results
            </h4>
          </div>

          {data.pages[0].totalEstimatedMatches ? (
            <>
              <div className='space-y-3'>
                {data.pages.map((news, i) => (
                  <div
                    key={i}
                    className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'
                  >
                    {news.value.map((article: News) => (
                      <ClientNewsArticle
                        key={article.url}
                        {...article}
                        className='article-by-query'
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div ref={ref}></div>

              {isFetchingNextPage && (
                <div className='flex justify-center'>
                  <Loader />
                </div>
              )}
            </>
          ) : (
            <div className='text-lg space-y-3'>
              <p>Your search did not match any documents.</p>

              <h3>Suggestions:</h3>

              <ul>
                <li>• Make sure all words are spelled correctly.</li>
                <li>• Try different keywords.</li>
                <li>• Try more general keywords</li>
                <li>• Try fewer keywords.</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}