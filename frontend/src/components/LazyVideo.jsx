import React, { useState, useRef, useEffect } from "react";

const LazyVideo = ({ src, poster, className }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  return (
    <div ref={videoRef}>
      {isVisible ? (
        <video
          src={src}
          poster={poster}
          controls
          preload="metadata"
          className={className}
        />
      ) : poster ? (
        <img
          src={poster}
          alt="Video Placeholder"
          className={className}
        />
      ) : (
        <div
          className={`${className} flex items-center justify-center bg-black/90 text-white/80`}
        >
          <span className="text-sm tracking-wide">Video preview</span>
        </div>
      )}
    </div>
  );
};

export default LazyVideo;
