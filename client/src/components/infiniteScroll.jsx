// infiniteScroll.jsx
import React, { useEffect, useRef } from 'react';

const InfiniteScroll = ({ next, hasMore, loader, children }) => {
  const scrollRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          next();
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
  }, [next, hasMore]);

  return (
    <div className="h-full overflow-y-auto">
      {children}
      {hasMore && <div ref={scrollRef}>{loader}</div>}
    </div>
  );
};

export default InfiniteScroll;