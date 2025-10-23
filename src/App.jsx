import React, { useEffect, useRef, useState, useCallback } from 'react'
import './styles.css'

export default function App() {
  const canvasRef = useRef(null)
  const imgRef = useRef(new Image())
  const fileRef = useRef(null)

  // ---- State (useState only, per your preference) ----
  const [showDrawer, setShowDrawer] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [size, setSize] = useState({ w: 0, h: 0 })

  // Filters (CSS/canvas ctx.filter values)
  const [brightness, setBrightness] = useState(0)    // -100..100
  const [contrast, setContrast] = useState(0)        // -100..100
  const [saturation, setSaturation] = useState(0)    // -100..100
  const [hue, setHue] = useState(0)                  // -180..180
  const [blur, setBlur] = useState(0)                // 0..20 px
  const [warm, setWarm] = useState(0)                // 0..100 (sepia)
  const [cool, setCool] = useState(0)                // 0..100 (invert)

  // ---- Load image from file ----
  const handleFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = imgRef.current
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      setSize({ w: img.naturalWidth, h: img.naturalHeight })
      setImageLoaded(true)
      draw()
    }
    img.src = url
  }

  // ---- Draw function using Canvas 2D ctx.filter ----
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !imageLoaded) return

    // Fit canvas to target size
    canvas.width = Math.max(1, Math.floor(size.w || img.naturalWidth))
    canvas.height = Math.max(1, Math.floor(size.h || img.naturalHeight))

    const ctx = canvas.getContext('2d')

    // Convert sliders -> filter strings
    const b = (brightness ?? 0) + 100
    const c = (contrast ?? 0) + 100
    const s = (saturation ?? 0) + 100
    const h = hue ?? 0
    const blurPx = Math.max(0, blur ?? 0)
    const sep = Math.max(0, warm ?? 0)      // warm
    const inv = Math.max(0, cool ?? 0)      // cool

    // Exposure is roughly brightness again; we can multiply brightness by 1.0 for simplicity

    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${h}deg) sepia(${sep}%) invert(${inv}%) blur(${blurPx}px)`

    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }, [imageLoaded, size.w, size.h, brightness, contrast, saturation, hue, blur, warm, cool])

  useEffect(() => { draw() }, [draw])

  // ---- Actions ----
  const resetAll = () => {
    setBrightness(0); setContrast(0); setSaturation(0); setHue(0);
    setBlur(0); setWarm(0); setCool(0);
    if (naturalSize.w && naturalSize.h) setSize({ ...naturalSize })
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'edited-image.png'
    a.click()
  }

  const onResizeApply = () => {
    // just triggers redraw via state already set
    draw()
  }

  // Keyboard: press 'e' to toggle drawer
  useEffect(() => {
    const onKey = (e) => { if (e.key.toLowerCase() === 'e') setShowDrawer(v => !v) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <header>
        <div className="title">
          <h1>AVNAC — Photo Editor</h1>
          <span>Vite + React • Canvas</span>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => fileRef.current?.click()}>Upload</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button className="btn" onClick={resetAll}>Reset</button>
          <button className="btn brand" onClick={download}>Download PNG</button>
          <button className="btn ghost" onClick={() => setShowDrawer(v => !v)}>Adjustments (E)</button>
        </div>
      </header>

      <div className="workspace">
        <div className="canvas-wrap shadow-xl">
          {imageLoaded
            ? <canvas ref={canvasRef} />
            : <div className="empty">Upload an image to get started.</div>
          }

          <aside className={"drawer shadow-xl " + (showDrawer ? "open" : "")}>
            <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px'}}>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <strong>Adjustments</strong>
                <span className="hotkey">Press E to toggle</span>
              </div>
              <button className="btn" onClick={() => setShowDrawer(false)}>Close</button>
            </header>

            <div className="content">
              <div className="group">
                <h3>Resize</h3>
                <div className="row">
                  <label>Width (px)</label>
                  <input type="number" value={size.w} min="1"
                    onChange={(e)=> setSize(s => ({...s, w: Number(e.target.value)||1}))} />
                </div>
                <div className="row">
                  <label>Height (px)</label>
                  <input type="number" value={size.h} min="1"
                    onChange={(e)=> setSize(s => ({...s, h: Number(e.target.value)||1}))} />
                </div>
                <div className="row">
                  <label></label>
                  <button className="btn" onClick={onResizeApply}>Apply</button>
                </div>
                <div className="row">
                  <label>Natural size</label>
                  <div className="hotkey">{naturalSize.w} × {naturalSize.h}</div>
                </div>
              </div>

              <div className="group">
                <h3>Tone</h3>
                <div className="row">
                  <label>Brightness ({brightness})</label>
                  <input type="range" min="-100" max="100" value={brightness} onChange={e=> setBrightness(Number(e.target.value))} />
                </div>
                <div className="row">
                  <label>Contrast ({contrast})</label>
                  <input type="range" min="-100" max="100" value={contrast} onChange={e=> setContrast(Number(e.target.value))} />
                </div>
                <div className="row">
                  <label>Saturation ({saturation})</label>
                  <input type="range" min="-100" max="100" value={saturation} onChange={e=> setSaturation(Number(e.target.value))} />
                </div>
              </div>

              <div className="group">
                <h3>Color</h3>
                <div className="row">
                  <label>Hue ({hue}°)</label>
                  <input type="range" min="-180" max="180" value={hue} onChange={e=> setHue(Number(e.target.value))} />
                </div>
                <div className="row">
                  <label>Warm (sepia) ({warm})</label>
                  <input type="range" min="0" max="100" value={warm} onChange={e=> setWarm(Number(e.target.value))} />
                </div>
                <div className="row">
                  <label>Cool (invert) ({cool})</label>
                  <input type="range" min="0" max="100" value={cool} onChange={e=> setCool(Number(e.target.value))} />
                </div>
              </div>

              <div className="group">
                <h3>Effects</h3>
                <div className="row">
                  <label>Blur ({blur}px)</label>
                  <input type="range" min="0" max="20" value={blur} onChange={e=> setBlur(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <footer>
              <button className="btn" onClick={resetAll}>Reset</button>
              <div style={{display:'flex', gap:8}}>
                <button className="btn" onClick={() => fileRef.current?.click()}>Upload</button>
                <button className="btn brand" onClick={download}>Download PNG</button>
              </div>
            </footer>
          </aside>
        </div>
      </div>
    </div>
  )
}
