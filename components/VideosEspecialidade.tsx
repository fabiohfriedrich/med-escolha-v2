'use client'

import { useState } from 'react'

type Video = {
  youtubeId: string
  medico: string | null
}

export default function VideosEspecialidade({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<string | null>(null)

  if (videos.length === 0) return null

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🎥</span> Ouça quem já está lá
      </p>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, marginTop: 0 }}>
        Conversas reais com especialistas sobre escolha, residência, rotina e dia a dia da área.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {videos.map(v => (
          <div key={v.youtubeId} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9', background: '#000' }}>
            {playing === v.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
                title={v.medico ?? 'Especialista'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
              />
            ) : (
              <button
                onClick={() => setPlaying(v.youtubeId)}
                style={{ position: 'relative', width: '100%', aspectRatio: '16/9', display: 'block', border: 'none', padding: 0, cursor: 'pointer', background: '#000' }}
              >
                {/* Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.medico ?? 'Especialista'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }}
                />
                {/* Play button */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(220,38,38,0.92)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}

            {v.medico && (
              <div style={{ background: '#0f2d5e', padding: '10px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'white', margin: 0 }}>{v.medico}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
