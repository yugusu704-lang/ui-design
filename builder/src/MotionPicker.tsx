import React, { useState } from 'react';
import { motionPresets, motionStyle } from '../shared/motion.ts';

export interface MotionPickerProps {
  value: string;
  onApply: (id: string) => void;
}

function MotionTile({ preset, value, onApply }: { preset: (typeof motionPresets)[number]; value: string; onApply: (id: string) => void }) {
  const [touchPreview, setTouchPreview] = useState(0);
  const selected = value === preset.id;
  const previewStyle = motionStyle({ preset: preset.id, duration: 600, delay: 0, trigger: 'enter', loop: false });

  return <article
    className={`motion-picker-tile demo-node${selected ? ' is-selected' : ''}`}
    data-motion-tile={preset.id}
    data-animation={preset.id}
    data-motion-trigger="hover"
    data-motion-enabled="true"
    style={previewStyle}
  >
    <button className="motion-picker-apply" type="button" aria-pressed={selected} onClick={() => onApply(preset.id)}>
      <span className={`motion-picker-glyph motion-glyph-${preset.group}`} aria-hidden="true"><span>✦</span></span>
      <span className="motion-picker-copy"><strong>{preset.label}</strong><small>悬停或聚焦预览</small></span>
    </button>
    <button className="motion-picker-play" type="button" aria-label={preset.id === 'none' ? '预览无动效' : `预览${preset.label}动效`} onClick={() => setTouchPreview((current) => current + 1)}>
      <span aria-hidden="true">▶</span>
    </button>
    <span
      key={touchPreview}
      className="motion-picker-touch-sample demo-node"
      data-animation={preset.id}
      data-motion-trigger="enter"
      data-motion-enabled={touchPreview > 0}
      style={previewStyle}
      aria-hidden="true"
    >Aa</span>
  </article>;
}

export function MotionPicker({ value, onApply }: MotionPickerProps) {
  return <div className="demo-root motion-picker-root" role="group" aria-label="动效预览与选择">
    {motionPresets.map((preset) => <MotionTile key={preset.id} preset={preset} value={value} onApply={onApply} />)}
  </div>;
}

export default MotionPicker;
