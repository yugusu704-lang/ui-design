import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Smartphone } from 'lucide-react';
import { fitPhonePreview, phoneDevices } from './preview-geometry';

export function DevicePreview({ children, theme, draft, status }: {
  children: ReactNode;
  theme: string;
  draft: boolean;
  status: string;
}) {
  const [deviceId, setDeviceId] = useState('standard');
  const [zoom, setZoom] = useState<'fit' | '50' | '75' | '100' | '125' | 'actual'>('fit');
  const [available, setAvailable] = useState({ width: 0, height: 0 });
  const spaceRef = useRef<HTMLDivElement>(null);
  const lastAvailable = useRef({ width: 0, height: 0 });
  const device = phoneDevices.find(item => item.id === deviceId) ?? phoneDevices[1];
  const geometry = fitPhonePreview(device, available, zoom);
  const cancelGesture = () => window.dispatchEvent(new Event('atelier-cancel-gesture'));

  useLayoutEffect(() => {
    const space = spaceRef.current;
    if (!space) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = { width: entry.contentRect.width, height: entry.contentRect.height };
      const previous = lastAvailable.current;
      if (previous.width && previous.height && (previous.width !== next.width || previous.height !== next.height)) cancelGesture();
      lastAvailable.current = next;
      setAvailable(next);
    });
    observer.observe(space);
    return () => observer.disconnect();
  }, []);

  return <>
    <div className="preview-controls">
      <label className="preview-device"><Smartphone size={14} aria-hidden="true" />
        <select aria-label="手机视口尺寸" value={device.id} onChange={event => { cancelGesture(); setDeviceId(event.target.value); }}>
          {phoneDevices.map(item => <option key={item.id} value={item.id}>{item.label} · {item.width} × {item.height}</option>)}
        </select>
      </label>
      <div className="preview-zoom">
        <select aria-label="预览缩放" value={zoom} onChange={event => { cancelGesture(); setZoom(event.target.value as typeof zoom); }}>
          <option value="fit">适应窗口</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option><option value="125">125%</option><option value="actual">原尺寸 1:1</option>
        </select>
        <output aria-label="显示比例">{Math.round(geometry.scale * 100)}%</output>
      </div>
    </div>
    <div className="preview-space" ref={spaceRef} role="region" aria-label="手机预览" tabIndex={zoom === 'actual' || Number(zoom) >= 100 ? 0 : undefined}>
      <div className="preview-sizer" style={{ width: geometry.displayWidth, height: geometry.displayHeight, visibility: geometry.scale > 0 ? 'visible' : 'hidden' }}>
        <div className={`phone-frame theme-${theme} ${draft ? 'draft-frame' : ''}`} style={{ width: geometry.width, height: geometry.height, transform: `scale(${geometry.scale})` }}>
          <div className="phone-screen" style={{ width: device.width, height: device.height }}>{children}</div>
          <div className="phone-island" aria-hidden="true"><span /></div>
        </div>
      </div>
    </div>
    <div className="canvas-caption"><span><span className="canvas-dot" />{status}</span><span>{device.width} × {device.height} CSS px</span></div>
  </>;
}
