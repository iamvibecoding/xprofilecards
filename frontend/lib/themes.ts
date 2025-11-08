// lib/themes.ts - Corrected for Export Compatibility

export interface Theme {
  id: string;
  name: string;
  image: string;
  textColor: string;
  handleColor: string;
  statColor: string;
  cardClassName: string;
}

export const themes: Theme[] = [
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    image: '/themes/color.png',
    textColor: 'text-white',
    handleColor: 'text-gray-200',
    statColor: 'text-gray-100',
    cardClassName: `
      bg-white/22
      border border-white/20
      rounded-2xl shadow-lg
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
   {
    id: 'cloud-textured',
    name: 'Cloud ',
    image: '/themes/clouds.png',
    textColor: 'text-slate-700',
    handleColor: 'text-slate-600',
    statColor: 'text-slate-600',
    cardClassName: `
      bg-gradient-to-br from-slate-100 via-white to-slate-50 rounded-2xl
      border border-slate-200
      shadow-[0_15px_40px_rgba(148,163,184,0.2),inset_0_1px_0_rgba(255,255,255,1)]
      [background-image:radial-gradient(ellipse_at_30%_40%,rgba(241,245,249,0.9),transparent_60%),radial-gradient(ellipse_at_70%_60%,rgba(248,250,252,0.8),transparent_50%),radial-gradient(ellipse_at_50%_80%,rgba(241,245,249,0.7),transparent_65%)]
      before:content-[''] before:absolute before:inset-0 before:opacity-30 before:rounded-2xl
      before:[background:repeating-radial-gradient(circle_at_50%_50%,transparent_0,transparent_8px,rgba(148,163,184,0.03)_8px,rgba(148,163,184,0.03)_16px)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    image: '/themes/terminal.png',
    textColor: 'text-emerald-300',
    handleColor: 'text-emerald-400',
    statColor: 'text-emerald-200',
    cardClassName: `
      bg-black rounded-md border border-emerald-500/40 font-mono
      shadow-[0_0_30px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(16,185,129,0.3)]
      [text-shadow:0_0_8px_rgba(16,185,129,0.5)]
      before:content-[''] before:absolute before:inset-0 before:opacity-10
      before:[background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(16,185,129,0.03)_2px,rgba(16,185,129,0.03)_4px)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'nothing-dotmatrix',
    name: 'Nothing Dotmatrix',
    image: '/themes/city.png',
    textColor: 'text-zinc-100',
    handleColor: 'text-zinc-300',
    statColor: 'text-zinc-200',
    cardClassName: `
      bg-[#0b0b0b] rounded-2xl border border-white/20 font-mono
      ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)]
      [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)]
      [background-size:10px_10px]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'one-ui',
    name: 'Cleam Rounded',
    image: '/themes/city.png',
    textColor: 'text-slate-900',
    handleColor: 'text-slate-600',
    statColor: 'text-slate-700',
    cardClassName: `
      bg-white rounded-2xl border border-slate-200
      shadow-[0_12px_28px_rgba(2,6,23,0.08)] ring-1 ring-black/5
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    image: '/themes/cartoon.png',
    textColor: 'text-white',
    handleColor: 'text-white/90',
    statColor: 'text-white/95',
    cardClassName: `
      bg-[#00A36D] rounded-md
      border-2 border-black
      shadow-[8px_8px_0_#000]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'paint-studio',
    name: 'Paint Studio',
    image: '/themes/city.png',
    textColor: 'text-slate-900',
    handleColor: 'text-slate-700',
    statColor: 'text-slate-800',
    cardClassName: `
      overflow-hidden
      bg-white rounded-md border border-slate-300
      shadow-[0_12px_24px_rgba(2,6,23,0.08)]
      before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-8
      before:bg-[linear-gradient(90deg,#1d4ed8_0_20%,#ef4444_20%_40%,#10b981_40%_60%,#f59e0b_60%_80%,#9333ea_80%_100%)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'aurora-gradient',
    name: 'Aurora Gradient',
    image: '/themes/city.png',
    textColor: 'text-white',
    handleColor: 'text-white/80',
    statColor: 'text-white/90',
    cardClassName: `
      bg-gradient-to-br from-[#0ea5e9]/70 via-[#a855f7]/60 to-[#22d3ee]/70
      rounded-2xl border border-white/20 shadow-xl
      ring-1 ring-white/20
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    image: '/themes/cyber.png',
    textColor: 'text-fuchsia-50',
    handleColor: 'text-fuchsia-200',
    statColor: 'text-cyan-200',
    cardClassName: `
      bg-[#0b0b14] rounded-2xl border border-fuchsia-500/30
      shadow-[0_0_40px_-10px_rgba(217,70,239,0.6),inset_0_0_30px_rgba(34,211,238,0.15)]
      ring-1 ring-cyan-400/30
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'bento',
    name: 'Bento Card',
    image: '/themes/color.png',
    textColor: 'text-slate-900',
    handleColor: 'text-slate-600',
    statColor: 'text-slate-700',
    cardClassName: `
      bg-white rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.08)]
      border border-slate-200
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
    {
    id: 'frosted-heavy',
    name: 'Frosted Glass',
    image: '/themes/glass.png',
    textColor: 'text-white',
    handleColor: 'text-white/85',
    statColor: 'text-white/90',
    cardClassName: `
      bg-white/20
      rounded-2xl
      border border-white/30 ring-1 ring-white/20 shadow-2xl
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'new-brutalism',
    name: 'New Brutalism',
    image: '/themes/city.png',
    textColor: 'text-black',
    handleColor: 'text-black/70',
    statColor: 'text-black/80',
    cardClassName: `
      bg-yellow-300 rounded-md border-[3px] border-black
      shadow-[6px_6px_0_#000] p-4
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'mesh-gradient',
    name: 'Mesh Gradient',
    image: '/themes/city.png',
    textColor: 'text-white',
    handleColor: 'text-white/85',
    statColor: 'text-white/90',
    cardClassName: `
      bg-[radial-gradient(60%_80%_at_20%_20%,#22d3ee_0%,transparent_60%),radial-gradient(70%_90%_at_80%_30%,#a855f7_0%,transparent_60%),radial-gradient(60%_60%_at_50%_80%,#ef4444_0%,transparent_60%)]
      rounded-2xl border border-white/20 shadow-xl
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'duotone',
    name: 'Duotone',
    image: '/themes/clay.png',
    textColor: 'text-indigo-50',
    handleColor: 'text-indigo-200',
    statColor: 'text-indigo-100',
    cardClassName: `
      bg-gradient-to-br from-indigo-700 to-rose-600
      rounded-2xl border border-white/10 shadow-lg
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'monochrome-dark',
    name: 'Monochrome Dark',
    image: '/themes/city.png',
    textColor: 'text-zinc-100',
    handleColor: 'text-zinc-300',
    statColor: 'text-zinc-200',
    cardClassName: `
      bg-zinc-900 rounded-2xl border border-zinc-700
      shadow-[0_10px_25px_rgba(0,0,0,0.5)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'matte-glass',
    name: 'Clear Glass',
    image: '/themes/metal.png',
    textColor: 'text-white',
    handleColor: 'text-white/80',
    statColor: 'text-white/85',
    cardClassName: `
      bg-white/10
      border border-white/15 ring-1 ring-white/10 shadow-xl
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'pastel-soft',
    name: 'Pastel Soft',
    image: '/themes/frost.png',
    textColor: 'text-slate-800',
    handleColor: 'text-slate-600',
    statColor: 'text-slate-700',
    cardClassName: `
      bg-gradient-to-br from-rose-100 via-sky-100 to-emerald-100
      rounded-2xl border border-white shadow-lg
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'fade',
    name: 'Fade',
    image: '/themes/city.png',
    textColor: 'text-slate-100',
    handleColor: 'text-slate-200',
    statColor: 'text-slate-200',
    cardClassName: `
      rounded-2xl p-[1px]
      before:content-[''] before:absolute before:inset-0 before:rounded-2xl
      before:bg-gradient-to-r before:from-fuchsia-500
      after:content-[''] after:absolute after:inset-[1px] after:rounded-[14px] 
      shadow-xl
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'glow-border',
    name: 'Glow Border',
    image: '/themes/ice-frost.png',
    textColor: 'text-white',
    handleColor: 'text-white/85',
    statColor: 'text-white/85',
    cardClassName: `
      bg-slate-950 rounded-2xl border border-sky-400/40
      shadow-[0_0_30px_rgba(56,189,248,0.4)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'rainbow-outline',
    name: 'Rainbow Outline',
    image: '/themes/clouds.png',
    textColor: 'text-white',
    handleColor: 'text-slate-200',
    statColor: 'text-slate-100',
    cardClassName: `
      rounded-2xl bg-slate-900 ring-2 ring-transparent
      [background:linear-gradient(#0f172a,#0f172a)_padding-box,conic-gradient(from_180deg,theme(colors.sky.400),theme(colors.fuchsia.500),theme(colors.emerald.400),theme(colors.sky.400))_border-box]
      border  border-transparent shadow-xl
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    image: '/themes/city.png',
    textColor: 'text-slate-900',
    handleColor: 'text-slate-700',
    statColor: 'text-slate-800',
    cardClassName: `
      bg-white rounded-2xl border-2 border-slate-900
      outline outline-[6px] outline-white shadow-[8px_8px_0_#0f172a]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
    {
    id: 'cardboard',
    name: 'Cardboard',
    image: '/themes/cardboard.png',
    textColor: 'text-amber-900',
    handleColor: 'text-amber-800',
    statColor: 'text-amber-800',
    cardClassName: `
      bg-[#d4a574] rounded-lg border-2 border-[#8b6f47]
      shadow-[inset_0_0_20px_rgba(101,67,33,0.3),4px_4px_0_rgba(101,67,33,0.4)]
      [background-image:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(139,111,71,0.1)_3px,rgba(139,111,71,0.1)_4px),repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(139,111,71,0.08)_4px,rgba(139,111,71,0.08)_6px)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'furry-felt',
    name: 'Furry Felt',
    image: '/themes/fur.png',
    textColor: 'text-rose-950',
    handleColor: 'text-rose-800',
    statColor: 'text-rose-900',
    cardClassName: `
      bg-[#fdf2f8] rounded-[26px] border border-rose-200
      shadow-[inset_0_0_30px_rgba(236,72,153,0.20),0_20px_40px_rgba(2,6,23,0.12)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'jelly-gloss',
    name: 'Jelly Gloss',
    image: '/themes/white.png',
    textColor: 'text-white',
    handleColor: 'text-white/85',
    statColor: 'text-white/90',
    cardClassName: `
      bg-fuchsia-500/35
      rounded-[24px]
      border border-fuchsia-300/40 ring-1 ring-fuchsia-200/30
      shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_20px_60px_rgba(217,70,239,0.45)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'radium-glow',
    name: 'Radium Glow',
    image: '/themes/black.png',
    textColor: 'text-emerald-100',
    handleColor: 'text-emerald-300',
    statColor: 'text-emerald-200',
    cardClassName: `
      bg-[#0a0f0a] rounded-2xl border border-emerald-400/30
      ring-1 ring-emerald-400/30
      shadow-[0_0_40px_rgba(16,185,129,0.35),inset_0_0_24px_rgba(16,185,129,0.1)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'halloween-spooky',
    name: 'Halloween Spooky',
    image: '/themes/halloween.png',
    textColor: 'text-orange-100',
    handleColor: 'text-orange-200',
    statColor: 'text-purple-200',
    cardClassName: `
      bg-[#0b0b0f] rounded-2xl border border-orange-500/40
      ring-1 ring-purple-500/30
      shadow-[0_0_34px_rgba(234,88,12,0.35)]
      [background-image:radial-gradient(800px_400px_at_120%_-20%,rgba(147,51,234,0.15),transparent)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'denim-weave',
    name: 'Denim Weave',
    image: '/themes/denim.png',
    textColor: 'text-indigo-50',
    handleColor: 'text-indigo-200',
    statColor: 'text-indigo-100',
    cardClassName: `
      bg-[#1f2a44] rounded-2xl border border-indigo-300/30
      shadow-[0_16px_40px_rgba(2,6,23,0.18)]
      [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0_2px,transparent_2px_6px)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
   
  {
    id: 'grid-matrix',
    name: 'Grid Matrix',
    image: '/themes/city.png',
    textColor: 'text-lime-300',
    handleColor: 'text-lime-400',
    statColor: 'text-lime-200',
    cardClassName: `
      bg-[#0d0208] rounded-xl border border-lime-500/30 font-mono
      shadow-[0_0_40px_rgba(132,204,22,0.3),inset_0_0_30px_rgba(132,204,22,0.1)]
      [background-image:linear-gradient(rgba(132,204,22,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(132,204,22,0.1)_1px,transparent_1px)]
      [background-size:20px_20px]
      [text-shadow:0_0_10px_rgba(132,204,22,0.6)]
      before:content-[''] before:absolute before:inset-0 before:opacity-20
      before:[background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(132,204,22,0.05)_2px,rgba(132,204,22,0.05)_4px)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    image: '/themes/white.png',
    textColor: 'text-slate-800',
    handleColor: 'text-slate-600',
    statColor: 'text-slate-700',
    cardClassName: `
      bg-[#f2f4f7] rounded-[28px]
      shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.1)]
      border border-white/80
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'metallic',
    name: 'Metallic',
    image: '/themes/metal.png',
    textColor: 'text-slate-700',
    handleColor: 'text-slate-600',
    statColor: 'text-slate-600',
    cardClassName: `
      rounded-2xl border border-slate-400
      shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.3)]
      [background:linear-gradient(135deg,#d4d4d8_0%,#e4e4e7_20%,#f4f4f5_40%,#e4e4e7_60%,#d4d4d8_80%,#a1a1aa_100%)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'flame-fire',
    name: 'Flame',
    image: '/themes/flame.png',
    textColor: 'text-orange-100',
    handleColor: 'text-orange-200',
    statColor: 'text-yellow-200',
    cardClassName: `
      bg-[#1a0a00] rounded-2xl border border-orange-600/40
      shadow-[0_0_40px_rgba(234,88,12,0.5),0_0_80px_rgba(239,68,68,0.3),inset_0_0_60px_rgba(234,88,12,0.2)]
      [background-image:radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.4),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.3),transparent_60%),radial-gradient(circle_at_50%_50%,rgba(234,88,12,0.2),transparent_70%)]
      [text-shadow:0_0_10px_rgba(251,146,60,0.8)]
      before:content-[''] before:absolute before:inset-0 before:opacity-30 before:rounded-2xl
      before:[background:radial-gradient(ellipse_at_bottom,rgba(251,146,60,0.3),transparent_70%)]
      before:animate-pulse
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
  {
    id: 'ice-frost',
    name: 'Ice Frost',
    image: '/themes/frost.png',
    textColor: 'text-cyan-900',
    handleColor: 'text-cyan-700',
    statColor: 'text-cyan-800',
    cardClassName: `
      bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 rounded-2xl
      border-2 border-cyan-200
      shadow-[0_20px_50px_rgba(6,182,212,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_0_30px_rgba(6,182,212,0.1)]
      [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.8)_0%,transparent_3%),radial-gradient(circle_at_60%_70%,rgba(255,255,255,0.6)_0%,transparent_4%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.7)_0%,transparent_2%)]
      before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:opacity-40
      before:[background:repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(6,182,212,0.03)_10px,rgba(6,182,212,0.03)_20px)]
      [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
    `,
  },
{
  id: 'pixel-weave',
  name: 'Pixel Weave',
  image: '/themes/pixel.png',
  textColor: 'text-indigo-100',
  handleColor: 'text-sky-200',
  statColor: 'text-cyan-200',
  cardClassName: `
    bg-slate-950 border border-indigo-400/25
    shadow-[0_14px_40px_rgba(99,102,241,0.28)]
    [background-image:linear-gradient(rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px)]
    [background-size:14px_14px]
    before:content-[''] before:absolute before:inset-0 before:[background-image:radial-gradient(rgba(34,211,238,0.2)_1px,transparent_1px)] before:[background-size:40px_40px] before:opacity-30 rounded-2xl
    [transform:rotate(-2deg)] hover:[transform:rotate(0deg)]
  `,
}


];