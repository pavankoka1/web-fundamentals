export type Phase = 'Network' | 'Browser' | 'Render' | 'Execute' | 'Optimize'

export const PHASE_COLORS: Record<Phase, {
  accent: string
  bg: string
  dim: string
  text: string
  glow: string
}> = {
  Network: {
    accent: '#00D4FF',
    bg: '#001A20',
    dim: '#004455',
    text: 'text-network',
    glow: '0 0 20px rgba(0,212,255,0.4)',
  },
  Browser: {
    accent: '#4D9FFF',
    bg: '#001020',
    dim: '#003366',
    text: 'text-browser',
    glow: '0 0 20px rgba(77,159,255,0.4)',
  },
  Render: {
    accent: '#FFB340',
    bg: '#1F1200',
    dim: '#553500',
    text: 'text-render',
    glow: '0 0 20px rgba(255,179,64,0.4)',
  },
  Execute: {
    accent: '#FF4D6D',
    bg: '#1F000A',
    dim: '#550020',
    text: 'text-execute',
    glow: '0 0 20px rgba(255,77,109,0.4)',
  },
  Optimize: {
    accent: '#00E5A0',
    bg: '#001F12',
    dim: '#004433',
    text: 'text-optimize',
    glow: '0 0 20px rgba(0,229,160,0.4)',
  },
}

export function phaseColor(phase: Phase) {
  return PHASE_COLORS[phase]
}
