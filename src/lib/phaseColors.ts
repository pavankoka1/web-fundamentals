export type Phase = 'Network' | 'Browser' | 'Render' | 'Optimize'

export type PhaseColor = {
  accent: string
  bg: string
  dim: string
  text: string
  glow: string
}

// Each phase variant is a subtle shift on the ice-cyan family.
// Same hue range, gentle saturation/luminance variation per phase.
export const PHASE_COLORS: Record<Phase, PhaseColor> = {
  Network: {
    accent: '#7DD3FC',                          // base ice cyan
    bg: 'rgba(125, 211, 252, 0.06)',
    dim: 'rgba(125, 211, 252, 0.35)',
    text: '#F4F4F8',
    glow: 'rgba(125, 211, 252, 0.18)',
  },
  Browser: {
    accent: '#A5F3FC',                          // slightly lighter
    bg: 'rgba(165, 243, 252, 0.06)',
    dim: 'rgba(165, 243, 252, 0.35)',
    text: '#F4F4F8',
    glow: 'rgba(165, 243, 252, 0.18)',
  },
  Render: {
    accent: '#67E8F9',                          // cyan
    bg: 'rgba(103, 232, 249, 0.06)',
    dim: 'rgba(103, 232, 249, 0.35)',
    text: '#F4F4F8',
    glow: 'rgba(103, 232, 249, 0.18)',
  },
  Optimize: {
    accent: '#BAE6FD',                          // softest pale cyan
    bg: 'rgba(186, 230, 253, 0.06)',
    dim: 'rgba(186, 230, 253, 0.35)',
    text: '#F4F4F8',
    glow: 'rgba(186, 230, 253, 0.18)',
  },
}

export function phaseColor(phase: Phase) {
  return PHASE_COLORS[phase]
}
