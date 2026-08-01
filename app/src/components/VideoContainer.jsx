/**
 * Lightweight video wrapper for animated content in work detail pages.
 * Replaces large GIFs with dual-format video (mp4 + webm) inside a
 * block container that matches the work-img-container layout width.
 *
 * Does NOT register with LightboxGallery — videos don't support
 * click-to-enlarge (the existing dots/arrow navigation for still
 * images still works for the adjacent static PNGs in the same section).
 */
function VideoContainer({ src, alt }) {
  return (
    <div className="block relative w-full">
      <video
        className="block w-full h-auto"
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt || ''}
        preload="none"
      >
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

export default VideoContainer;