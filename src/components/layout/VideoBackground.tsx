interface VideoBackgroundProps {
  videoSrc?: string;
  blurAmount?: number;
}

export function VideoBackground({ 
  videoSrc = 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  blurAmount = 40 
}: VideoBackgroundProps): JSX.Element {
  return (
    <div className="video-bg-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div 
        className="video-blur-overlay"
        style={{ backdropFilter: `blur(${blurAmount}px)` }}
      />
    </div>
  );
}
