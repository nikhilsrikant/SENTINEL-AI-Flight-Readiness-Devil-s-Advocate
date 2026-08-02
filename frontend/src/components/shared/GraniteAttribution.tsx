'use client';

export function GraniteAttribution() {
  return (
    <div className="flex items-center gap-2 text-xs text-granite mt-2">
      <div className="w-2 h-2 rounded-full bg-granite animate-pulse" />
      <span>Powered by IBM Granite</span>
    </div>
  );
}
