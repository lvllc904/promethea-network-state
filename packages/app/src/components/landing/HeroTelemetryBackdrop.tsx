export function HeroTelemetryBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-guildhall-panel" aria-label="Abstract data particle field by Chandresh Uike on Pexels">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.pexels.com/videos/34645139/abstract-analysis-artificial-background-34645139.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
        aria-hidden="true"
      >
        <source src="https://videos.pexels.com/video-files/34645139/14683898_640_360_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,13,16,0.95),rgba(11,13,16,0.4),rgba(11,13,16,0.96))]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(243,244,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(243,244,246,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      <span className="sr-only">Decorative abstract data particles by Chandresh Uike on Pexels.</span>
    </div>
  );
}
