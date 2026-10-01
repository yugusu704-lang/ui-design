---
title: "Tailwind Config Snippets"
tags:
  - "tailwind"
  - "tokens"
  - "config"
---

# ⚙️ 30 款风格 Tailwind CSS 全局配置合集 (tailwind.config.js Master)

将以下扩展项复制到您项目的 `tailwind.config.js` 的 `theme.extend` 中，即可全量解锁 30 套风格的色彩与阴影类：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // #01 Neo-Brutalism
        'neo-brutalism-acid-yellow': '#FFE600',
        'neo-brutalism-electric-cyan': '#4DEEEA',
        'neo-brutalism-pitch-black': '#000000',
        'neo-brutalism-pure-white': '#FFFFFF',
        'neo-brutalism-neon-coral': '#FF5E7E',
        // #02 Minimalist Scandinavian
        'minimal-nordic-snow-white': '#FFFFFF',
        'minimal-nordic-soft-neutral': '#F8F9FA',
        'minimal-nordic-charcoal-slate': '#1E293B',
        'minimal-nordic-whisper-gray': '#E2E8F0',
        'minimal-nordic-muted-blue': '#3B82F6',
        // #03 Linear / Raycast Dark
        'linear-dark-obsidian': '#0B0D0E',
        'linear-dark-surface-dark': '#16191E',
        'linear-dark-laser-violet': '#8B5CF6',
        'linear-dark-border-glow': '#2A2E39',
        'linear-dark-high-white': '#F8FAFC',
        // #04 Swiss International Typo
        'swiss-grid-pitch-black': '#000000',
        'swiss-grid-stark-white': '#FFFFFF',
        'swiss-grid-swiss-vermillion': '#FF3B30',
        'swiss-grid-neutral-concrete': '#E5E5E5',
        // #05 Monochrome High-Fashion
        'monochrome-luxury-velvet-black': '#111111',
        'monochrome-luxury-silk-ecru': '#FAF9F6',
        'monochrome-luxury-champagne-gold': '#D4AF37',
        'monochrome-luxury-pure-white': '#FFFFFF',
        // #06 Liquid Glassmorphism
        'liquid-glassmorphism-glass-base': 'rgba(255,255,255,0.18)',
        'liquid-glassmorphism-ambient-cyan': '#06B6D4',
        'liquid-glassmorphism-ambient-violet': '#8B5CF6',
        'liquid-glassmorphism-deep-background': '#0F172A',
        // #07 Soft Neumorphism 2.0
        'soft-neumorphism-clay-canvas': '#E8ECEF',
        'soft-neumorphism-light-specular': '#FFFFFF',
        'soft-neumorphism-soft-shadow': '#CBD5E1',
        'soft-neumorphism-teal-accent': '#14B8A6',
        // #08 Spatial / VisionOS UI
        'spatial-vision-smoked-glass': 'rgba(30,30,35,0.75)',
        'spatial-vision-gaze-cyan': '#38BDF8',
        'spatial-vision-space-black': '#0A0A0C',
        // #09 Modern Skeuomorphism Craft
        'modern-skeuomorphism-brushed-titanium': '#232830',
        'modern-skeuomorphism-knurled-steel': '#4A5568',
        'modern-skeuomorphism-amber-led': '#F59E0B',
        // #10 Claymorphism 3D
        'claymorphism-3d-lavender-clay': '#C084FC',
        'claymorphism-3d-bubblegum-pink': '#F472B6',
        'claymorphism-3d-mint-sherbet': '#34D399',
        // #11 Cyberpunk Neon
        'cyberpunk-neon-cyber-cyan': '#00F0FF',
        'cyberpunk-neon-hot-magenta': '#FF007F',
        'cyberpunk-neon-obsidian-core': '#090A0F',
        // #12 Bioluminescent Dark
        'bioluminescent-dark-bio-teal': '#00F5D4',
        'bioluminescent-dark-abyssal-navy': '#030712',
        'bioluminescent-dark-bio-violet': '#9D4EDD',
        // #13 Y2K Futuristic Digital
        'y2k-cyber-y2k-pink': '#FF70A6',
        'y2k-cyber-ice-blue': '#70D6FF',
        'y2k-cyber-chrome-metallic': '#E0E5EC',
        // #14 Solarpunk / Eco-Futurism
        'solarpunk-eco-forest-canopy': '#1B4332',
        'solarpunk-eco-solar-amber': '#FFB703',
        'solarpunk-eco-sage-leaf': '#74C69D',
        // #15 Holo-HUD Military Matrix
        'tactical-hud-phosphor-green': '#39FF14',
        'tactical-hud-tactical-amber': '#FFB000',
        'tactical-hud-bunker-black': '#0C100D',
        // #16 Memphis Pop Vibrant
        'memphis-pop-coral-punch': '#FF5E7E',
        'memphis-pop-sunbeam-yellow': '#FFD166',
        'memphis-pop-electric-blue': '#3B82F6',
        // #17 Dopamine Pastel Candy
        'dopamine-candy-strawberry-milk': '#FF8FAB',
        'dopamine-candy-soft-lilac': '#E0AAFF',
        'dopamine-candy-butter-cream': '#FFE382',
        // #18 Acid Graphic / Anti-Design
        'acid-graphic-toxic-lime': '#BFFF00',
        'acid-graphic-acid-violet': '#240046',
        'acid-graphic-liquid-chrome': '#D8D8D8',
        // #19 Comic / Ben-Day Dots
        'manga-comic-comic-black': '#111111',
        'manga-comic-action-red': '#E63946',
        'manga-comic-halftone-yellow': '#FFBE0B',
        // #20 Retro 8-Bit Pixel Art
        'retro-pixel-8bit-gameboy-green': '#8BAC0F',
        'retro-pixel-8bit-pixel-dark': '#0F380F',
        'retro-pixel-8bit-coin-gold': '#F59E0B',
        // #21 Editorial Magazine / New Yorker
        'editorial-magazine-parchment-cream': '#FAF7F2',
        'editorial-magazine-printer-ink': '#1C1917',
        'editorial-magazine-vintage-amber': '#B45309',
        // #22 Warm Earthy Botanical
        'warm-earthy-warm-terracotta': '#C86D51',
        'warm-earthy-eucalyptus-sage': '#8A9A86',
        'warm-earthy-raw-oatmeal': '#F5EFEB',
        // #23 Neo-Chinese Ink & Zen
        'neo-chinese-zen-cinnabar-seal': '#C23531',
        'neo-chinese-zen-celadon-jade': '#7BA29A',
        'neo-chinese-zen-rice-paper': '#F7F4EC',
        // #24 Japanese Wabi-Sabi
        'japanese-wabi-sabi-tatami-straw': '#EDE8DF',
        'japanese-wabi-sabi-ash-timber': '#8C7E72',
        'japanese-wabi-sabi-quiet-charcoal': '#3A3532',
        // #25 Retro Bauhaus Geometry
        'bauhaus-geometry-bauhaus-red': '#D02027',
        'bauhaus-geometry-cobalt-blue': '#19478A',
        'bauhaus-geometry-cadmium-yellow': '#F5B82E',
        // #26 Bento Grid Modular
        'bento-grid-bento-dark': '#18181B',
        'bento-grid-bento-card': '#27272A',
        'bento-grid-apple-blue': '#0A84FF',
        // #27 Bloomberg Terminal Finance
        'bloomberg-terminal-ticker-green': '#00E676',
        'bloomberg-terminal-panic-red': '#FF3B30',
        'bloomberg-terminal-terminal-black': '#000000',
        // #28 Aurora Fluid Mesh Gradient
        'aurora-fluid-aurora-violet': '#8B5CF6',
        'aurora-fluid-aurora-pink': '#EC4899',
        'aurora-fluid-aurora-sky': '#38BDF8',
        // #29 Dark Fantasy RPG HUD
        'dark-fantasy-rpg-burnished-gold': '#D4AF37',
        'dark-fantasy-rpg-blood-ruby': '#8B0000',
        'dark-fantasy-rpg-mana-sapphire': '#1D4ED8',
        // #30 Medical Biotech Clean
        'medical-biotech-clinical-cyan': '#0284C7',
        'medical-biotech-sterile-white': '#FFFFFF',
        'medical-biotech-vital-alert': '#F59E0B',
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'linear': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glass': '0 16px 36px rgba(0, 0, 0, 0.2)',
        'neu-flat': '7px 7px 16px #CBD5E1, -7px -7px 16px #FFFFFF',
        'spatial': '0 20px 50px rgba(0, 0, 0, 0.6)',
        'clay': '0 18px 30px -6px rgba(192, 132, 252, 0.28), inset 0 6px 10px rgba(255, 255, 255, 0.9)',
        'cyber-glow': '0 0 15px rgba(255, 0, 127, 0.5), 0 0 30px rgba(0, 240, 255, 0.3)',
      },
      borderRadius: {
        'squircle-lg': '28px',
        'squircle-md': '20px',
      }
    },
  },
  plugins: [],
};
```
