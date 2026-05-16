export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-network)', borderTopColor: 'transparent' }} />
        <p className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--color-text-muted)' }}>Loading</p>
      </div>
    </div>
  )
}
