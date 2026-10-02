export interface PhoneDevice {
  id: 'compact' | 'standard' | 'large';
  label: string;
  width: number;
  height: number;
}

export interface PreviewGeometry {
  width: number;
  height: number;
  scale: number;
  displayWidth: number;
  displayHeight: number;
}

export const phoneDevices: readonly PhoneDevice[] = [
  { id: 'compact', label: '紧凑', width: 360, height: 800 },
  { id: 'standard', label: '标准', width: 390, height: 844 },
  { id: 'large', label: '大屏', width: 430, height: 932 },
];

export function fitPhonePreview(
  device: { width: number; height: number },
  available: { width: number; height: number },
  mode: 'fit' | 'actual' | '50' | '75' | '100' | '125' = 'fit',
): PreviewGeometry {
  const width = device.width + 12;
  const height = device.height + 12;

  let scale = 1;
  if (mode === 'fit') {
    const { width: availableWidth, height: availableHeight } = available;
    scale = Number.isFinite(availableWidth) && Number.isFinite(availableHeight)
      && availableWidth > 0 && availableHeight > 0
      ? Math.min(1, availableWidth / width, availableHeight / height)
      : 0;
  } else if (mode !== 'actual') scale = Number(mode) / 100;

  return {
    width,
    height,
    scale,
    displayWidth: width * scale,
    displayHeight: height * scale,
  };
}
