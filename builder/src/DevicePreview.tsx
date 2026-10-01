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
  const [zoom, setZoom] = useState<'fit' | 'actual'>('fit');
  const [available, setAvailable] = useState({ width: 0, height: 0 });
  const spaceRef = useRef<HTMLDivElement>(null);
  const device = phoneDevices.find(item => item.id === deviceId) ?? phoneDevices[1];
  const geometry = fitPhonePreview(device, available, zoom);

  useLayoutEffect(() => {
    const space = spaceRef.current;
    if (!space) return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(space);
    return () => observer.disconnect();
  }, []);

  return <>
    <div className="preview-controls">
      <label className="preview-device"><Smartphone size={14} aria-hidden="true" />
        <select aria-label="手机视口尺寸" value={device.id} onChange={event => setDeviceId(event.target.value)}>
          {phoneDevices.map(item => <option key={item.id} value={item.id}>{item.label} · {item.width} × {item.height}</option>)}
        </select>
      </label>
      <div className="preview-zoom">
        <select aria-label="预览缩放" value={zoom} onChange={event => setZoom(event.target.value as 'fit' | 'actual')}>
          <option value="fit">适应窗口</option><option value="actual">原尺寸 1:1</option>
        </select>
        <output aria-label="显示比例">{Math.round(geometry.scale * 100)}%</output>
      </div>
    </div>
    <div className="preview-space" ref={spaceRef} role="region" aria-label="手机预览" tabIndex={zoom === 'actual' ? 0 : undefined}>
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
