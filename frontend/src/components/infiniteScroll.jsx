import React, { useEffect, useRef } from 'react';

const InfiniteScroll = ({ loadMore, hasMore, loader, children }) => {
  const scrollRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => {
      if (scrollRef.current) {
        observer.unobserve(scrollRef.current);
      }
    };
  }, [loadMore, hasMore]);

  return (
    <div className="overflow-y-auto h-[calc(100vh-200px)]">
      {children}
      {hasMore && <div ref={scrollRef}>{loader}</div>}
    </div>
  );
};

export default InfiniteScroll;