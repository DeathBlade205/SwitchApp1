// Isometric mechanical switch — proper 3/4 upper-left view
// Stroke-only, matches technical line-art reference

const STROKE_COLOR = {
  linear:  { dark: '#c9b88a', light: '#c94040' },
  tactile: { dark: '#c9b88a', light: '#4a7ab8' },
  clicky:  { dark: '#c9b88a', light: '#4a9e6a' },
  hero:    { dark: '#c9b88a', light: '#b8985a' },
}

// True isometric projection
// x = right, y = depth (into screen), z = up
// canvas origin at (140, 200)
function makeIso(ox, oy) {
  return function iso(x, y, z) {
    return {
      x: ox + (x - y) * 0.816,
      y: oy + (x + y) * 0.408 - z * 0.816,
    }
  }
}

function pts(iso, coords) {
  return coords.map(([x,y,z]) => { const p = iso(x,y,z); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')
}

function Face({ iso, coords, stroke, sw, opacity = 1, dashed = false }) {
  return (
    <polygon
      points={pts(iso, coords)}
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeDasharray={dashed ? '3,3' : undefined}
      opacity={opacity}
    />
  )
}

function Edge({ iso, a, b, stroke, sw, opacity = 1 }) {
  const p1 = iso(...a), p2 = iso(...b)
  return (
    <line
      x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)}
      x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)}
      stroke={stroke} strokeWidth={sw} opacity={opacity}
      strokeLinecap="round"
    />
  )
}

export default function SwitchIllustration({ variant = 'linear', darkBg = false }) {
  const stroke = darkBg
    ? STROKE_COLOR[variant]?.dark ?? '#c9b88a'
    : STROKE_COLOR[variant]?.light ?? '#1c1917'

  const iso = makeIso(140, 195)

  const T = 2.4   // thick — outer silhouette
  const M = 1.6   // medium — secondary edges
  const S = 1.0   // thin — inner detail
  const XS = 0.7  // very thin — construction lines

  // Switch dimensions (world units)
  // Housing body
  const W = 52, D = 52, H = 36

  // Upper case (sits on top of housing, same footprint)
  const UH = 20   // upper case height
  const uz0 = H, uz1 = H + UH

  // Stem channel inset
  const SI = 14

  // Stem
  const stx0 = W/2 - 8, stx1 = W/2 + 8
  const sty0 = D/2 - 8, sty1 = D/2 + 8
  const sz0 = uz1, sz1 = uz1 + 22

  // Cross mount
  const crx0 = stx0 - 7, crx1 = stx1 + 7
  const cry0 = sty0 - 7, cry1 = sty1 + 7
  const cz0 = sz1, cz1 = sz1 + 8

  return (
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg"
      style={{ display:'block', width:'100%', height:'100%' }}>

      {/* ═══ BOTTOM HOUSING ═══ */}

      {/* Left face (front-left) */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[0,D,0],[0,D,H],[W,D,H],[W,D,0]]} />

      {/* Right face */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[W,D,0],[W,D,H],[W,0,H],[W,0,0]]} />

      {/* Top face */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[0,0,H],[W,0,H],[W,D,H],[0,D,H]]} />

      {/* Top face inner recess */}
      <Face iso={iso} stroke={stroke} sw={S} opacity={0.55}
        coords={[[6,6,H],[W-6,6,H],[W-6,D-6,H],[6,D-6,H]]} />

      {/* Housing front face vertical panel lines */}
      <Edge iso={iso} a={[10,D,0]} b={[10,D,H]} stroke={stroke} sw={XS} opacity={0.4}/>
      <Edge iso={iso} a={[W-10,D,0]} b={[W-10,D,H]} stroke={stroke} sw={XS} opacity={0.4}/>
      {/* Housing front face horizontal line */}
      <Edge iso={iso} a={[0,D,10]} b={[W,D,10]} stroke={stroke} sw={XS} opacity={0.35}/>

      {/* ── Left side clip tab ── */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[-8,D,12],[-8,D,24],[0,D,24],[0,D,12]]} />
      <Edge iso={iso} a={[-8,D,12]} b={[-8,D-8,12]} stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[-8,D,24]} b={[-8,D-8,24]} stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[-8,D-8,12]} b={[-8,D-8,24]} stroke={stroke} sw={S} opacity={0.5}/>

      {/* ── Right side clip tab ── */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[W,0,12],[W+8,0,12],[W+8,0,24],[W,0,24]]} />
      <Edge iso={iso} a={[W+8,0,12]} b={[W+8,8,12]} stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[W+8,0,24]} b={[W+8,8,24]} stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[W+8,8,12]} b={[W+8,8,24]} stroke={stroke} sw={S} opacity={0.5}/>

      {/* ── PCB pins ── */}
      <Edge iso={iso} a={[16,D,0]} b={[16,D,-20]} stroke={stroke} sw={T}/>
      <Edge iso={iso} a={[21,D,0]} b={[21,D,-20]} stroke={stroke} sw={T}/>
      <Edge iso={iso} a={[W-5,0,0]}  b={[W-5,0,-20]}  stroke={stroke} sw={T}/>
      <Edge iso={iso} a={[W,0,0]}    b={[W,0,-20]}    stroke={stroke} sw={T}/>
      {/* Pin feet */}
      <Edge iso={iso} a={[16,D,-20]} b={[21,D,-20]} stroke={stroke} sw={M}/>
      <Edge iso={iso} a={[W-5,0,-20]}  b={[W,0,-20]}   stroke={stroke} sw={M}/>

      {/* ═══ UPPER CASE ═══ */}

      {/* Left face */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[0,D,uz0],[0,D,uz1],[W,D,uz1],[W,D,uz0]]} />

      {/* Right face */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[W,D,uz0],[W,D,uz1],[W,0,uz1],[W,0,uz0]]} />

      {/* Top face */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[0,0,uz1],[W,0,uz1],[W,D,uz1],[0,D,uz1]]} />

      {/* Stem channel hole in top */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[SI,SI,uz1],[W-SI,SI,uz1],[W-SI,D-SI,uz1],[SI,D-SI,uz1]]} />

      {/* Upper case slope marks — chamfer on front corners */}
      <Edge iso={iso} a={[0,D,uz0]}   b={[4,D,uz1]}   stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[W,D,uz0]}   b={[W-4,D,uz1]} stroke={stroke} sw={S} opacity={0.5}/>

      {/* Upper case clip notch (left face) */}
      <Edge iso={iso} a={[0,D,uz0+5]}  b={[-5,D,uz0+5]}  stroke={stroke} sw={M}/>
      <Edge iso={iso} a={[0,D,uz0+14]} b={[-5,D,uz0+14]} stroke={stroke} sw={M}/>
      <Edge iso={iso} a={[-5,D,uz0+5]} b={[-5,D,uz0+14]} stroke={stroke} sw={M}/>

      {/* Upper case inner detail lines */}
      <Edge iso={iso} a={[8,D,uz0]} b={[8,D,uz1]} stroke={stroke} sw={XS} opacity={0.35}/>
      <Edge iso={iso} a={[W-8,D,uz0]} b={[W-8,D,uz1]} stroke={stroke} sw={XS} opacity={0.35}/>

      {/* ═══ STEM ═══ */}

      {/* Left face */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[stx0,sty1,sz0],[stx0,sty1,sz1],[stx1,sty1,sz1],[stx1,sty1,sz0]]} />

      {/* Right face */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[stx1,sty1,sz0],[stx1,sty1,sz1],[stx1,sty0,sz1],[stx1,sty0,sz0]]} />

      {/* Top face */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[stx0,sty0,sz1],[stx1,sty0,sz1],[stx1,sty1,sz1],[stx0,sty1,sz1]]} />

      {/* Stem guide line */}
      <Edge iso={iso} a={[stx0,sty1,sz0+6]} b={[stx1,sty1,sz0+6]} stroke={stroke} sw={XS} opacity={0.4}/>

      {/* ── Cross mount (keycap stem) ── */}

      {/* Horizontal arm left face */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[crx0,sty1,cz0],[crx0,sty1,cz1],[crx1,sty1,cz1],[crx1,sty1,cz0]]} />
      {/* Horizontal arm right face */}
      <Face iso={iso} stroke={stroke} sw={S} opacity={0.7}
        coords={[[crx1,sty1,cz0],[crx1,sty1,cz1],[crx1,sty0,cz1],[crx1,sty0,cz0]]} />
      {/* Horizontal arm top */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[crx0,sty0,cz1],[crx1,sty0,cz1],[crx1,sty1,cz1],[crx0,sty1,cz1]]} />

      {/* Vertical arm — front */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[stx0,sty1,cz1],[stx0,sty1,cz1+14],[stx1,sty1,cz1+14],[stx1,sty1,cz1]]} />
      {/* Vertical arm — right */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[stx1,sty1,cz1],[stx1,sty1,cz1+14],[stx1,sty0,cz1+14],[stx1,sty0,cz1]]} />
      {/* Vertical arm — top */}
      <Face iso={iso} stroke={stroke} sw={T}
        coords={[[stx0,sty0,cz1+14],[stx1,sty0,cz1+14],[stx1,sty1,cz1+14],[stx0,sty1,cz1+14]]} />

      {/* ── Stem side wings ── */}
      <Face iso={iso} stroke={stroke} sw={M}
        coords={[[stx0-10,sty1,sz0+2],[stx0-10,sty1,sz0+14],[stx0,sty1,sz0+14],[stx0,sty1,sz0+2]]} />
      <Edge iso={iso} a={[stx0-10,sty1,sz0+2]}  b={[stx0-10,sty1-6,sz0+2]}  stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[stx0-10,sty1,sz0+14]} b={[stx0-10,sty1-6,sz0+14]} stroke={stroke} sw={S} opacity={0.5}/>
      <Edge iso={iso} a={[stx0-10,sty1-6,sz0+2]} b={[stx0-10,sty1-6,sz0+14]} stroke={stroke} sw={S} opacity={0.5}/>

      {/* ═══ SPRING COILS ═══ */}
      {[0,1,2,3,4].map(i => {
        const sz = H + 3 + i * 4.5
        const cx2 = iso(W/2, D/2, sz)
        const rx = 9 * 0.816
        const ry = 9 * 0.408
        return (
          <ellipse key={i}
            cx={cx2.x.toFixed(1)} cy={cx2.y.toFixed(1)}
            rx={rx.toFixed(1)} ry={ry.toFixed(1)}
            fill="none" stroke={stroke} strokeWidth={XS+0.2} opacity={0.6}
          />
        )
      })}

    </svg>
  )
}