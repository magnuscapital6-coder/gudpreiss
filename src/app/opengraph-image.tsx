import { ImageResponse } from 'next/og';

export const alt = 'GudPreiss — E-Bikes & PlayStation 5 Store Deutschland';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #064e3b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '40px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '20%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Brand Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '10px 24px',
            borderRadius: '9999px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '2px',
              color: '#34d399',
              textTransform: 'uppercase',
            }}
          >
            OFFIZIELLER STORE DEUTSCHLAND
          </span>
        </div>

        {/* Logo / Main Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          <span style={{ fontSize: '72px', fontWeight: 900, color: '#34d399', letterSpacing: '-2px' }}>
            Gud
          </span>
          <span style={{ fontSize: '72px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px' }}>
            Preiss
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#94a3b8',
            margin: '0 0 36px 0',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
          }}
        >
          E-Bikes (CUBE, SCOTT, Haibike) &amp; Sony PlayStation 5 Konsolen
        </p>

        {/* Highlights Pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            ✓ Kostenloser Versand ab 50 €
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            ✓ 30 Tage Rückgaberecht
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            ✓ Auf Lager &amp; Sofort Lieferbar
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
