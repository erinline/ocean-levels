import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { WaterLayer } from './WaterLayer'
import { SCENARIOS, getScenarioLabel } from './scenarios'
import './App.css'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const MAX_METERS = 30
const TICK_POSITIONS = SCENARIOS.filter(s => s.maxMeters > 0).map(s => s.maxMeters)

export default function App() {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const waterLayerRef = useRef(null)
  const [seaLevel, setSeaLevel] = useState(0)
  const tokenValid = TOKEN && TOKEN.startsWith('pk.')

  useEffect(() => {
    if (!tokenValid) return

    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-71.35, 42.35],
      zoom: 11,
      pitch: 50,
      bearing: -15,
      antialias: true,
    })

    mapRef.current = map

    map.on('style.load', () => {
      // Terrain
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      })
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

      // Atmosphere
      map.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      })

      // 3D buildings — insert before first symbol layer
      const layers = map.getStyle().layers
      const firstSymbol = layers.find(l => l.type === 'symbol')?.id

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.8,
          },
        },
        firstSymbol
      )

      // Water layer
      const waterLayer = new WaterLayer()
      waterLayerRef.current = waterLayer
      map.addLayer(waterLayer)
    })

    return () => {
      map.remove()
      mapRef.current = null
      waterLayerRef.current = null
    }
  }, [tokenValid])

  function handleSliderChange(e) {
    const value = parseFloat(e.target.value)
    setSeaLevel(value)
    waterLayerRef.current?.setSeaLevel(value)
  }

  const progressPct = (seaLevel / MAX_METERS) * 100

  if (!tokenValid) {
    return (
      <div className="token-error">
        <div className="token-error-box">
          <h1>Mapbox token required</h1>
          <p>Create a <code>.env</code> file in the project root:</p>
          <pre>VITE_MAPBOX_TOKEN=pk.your_token_here</pre>
          <p>
            Get a free token at <strong>mapbox.com</strong> → Account → Tokens,
            then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div ref={mapContainerRef} className="map-container" />

      <div className="panel">
        <div className="panel-header">
          <div className="sea-level-value">
            +{seaLevel % 1 === 0 ? seaLevel.toFixed(0) : seaLevel.toFixed(1)} m
          </div>
          <div className="scenario-label">{getScenarioLabel(seaLevel)}</div>
        </div>

        <div className="slider-wrapper">
          <input
            type="range"
            min={0}
            max={MAX_METERS}
            step={0.1}
            value={seaLevel}
            onChange={handleSliderChange}
            style={{ '--progress': `${progressPct}%` }}
            className="slider"
          />
          <div className="ticks">
            {TICK_POSITIONS.map(m => (
              <div
                key={m}
                className="tick"
                style={{ left: `${(m / MAX_METERS) * 100}%` }}
                title={`${m}m`}
              />
            ))}
          </div>
        </div>

        <div className="slider-labels">
          <span>0 m</span>
          <span>Sea Level Rise</span>
          <span>30 m</span>
        </div>
      </div>
    </div>
  )
}
