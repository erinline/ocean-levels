import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { WaterLayer } from './WaterLayer'
import { SCENARIOS, getScenarioLabel } from './scenarios'
import { KEYFRAME_YEARS, MIN_YEAR, MAX_YEAR, getInterpolatedCities, getInterpolatedUSTotal, getNotesForYear, buildGeoJSON, buildHeatmapGeoJSON } from './populationData'
import './App.css'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const MAX_METERS = 30
const TICK_POSITIONS = SCENARIOS.filter(s => s.maxMeters > 0).map(s => s.maxMeters)

const CAMERA_BOSTON   = { center: [-71.35, 42.35], zoom: 11, pitch: 50, bearing: -15, duration: 2000, essential: true }
const CAMERA_POPULATION = { center: [-98.5795, 39.8283], zoom: 4, pitch: 0, bearing: 0, duration: 2500, essential: true }

const SF_CORNERS = [
  [-123.0, 36.15],
  [-121.7, 36.15],
  [-123.0, 38.15],
  [-121.7, 38.15],
]
const SF_CENTER = [-122.35, 37.65]

const FOG_SETTINGS = {
  color: 'rgb(186, 210, 235)',
  'high-color': 'rgb(36, 92, 223)',
  'horizon-blend': 0.02,
  'space-color': 'rgb(11, 11, 25)',
  'star-intensity': 0.6,
}

function setupBaseMap(map) {
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14,
  })
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
  map.setFog(FOG_SETTINGS)

  const firstSymbol = map.getStyle().layers.find(l => l.type === 'symbol')?.id
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
}

export default function App() {
  const bostonContainerRef = useRef(null)
  const sfContainerRef     = useRef(null)
  const bostonMapRef  = useRef(null)
  const sfMapRef      = useRef(null)
  const bostonWaterRef = useRef(null)
  const sfWaterRef     = useRef(null)
  const pitchInitiatorRef = useRef(null)

  const [seaLevel, setSeaLevel] = useState(0)
  const [activeView, setActiveView] = useState('sealevel')
  const [year, setYear] = useState(MIN_YEAR)
  const [usTotal, setUsTotal] = useState(335000000)
  const [yearNotes, setYearNotes] = useState([])
  const tokenValid = TOKEN && TOKEN.startsWith('pk.')

  useEffect(() => {
    if (!tokenValid) return

    mapboxgl.accessToken = TOKEN

    // ── Boston map ──────────────────────────────────────────────────────────
    const bostonMap = new mapboxgl.Map({
      container: bostonContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-71.35, 42.35],
      zoom: 11,
      pitch: 50,
      bearing: -15,
      antialias: true,
    })
    bostonMapRef.current = bostonMap

    // ── SF Bay map ──────────────────────────────────────────────────────────
    const sfMap = new mapboxgl.Map({
      container: sfContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.37, 37.65],
      zoom: 10,
      pitch: 50,
      bearing: 15,
      antialias: true,
    })
    sfMapRef.current = sfMap

    // ── Pitch sync (tilt only, no pan / orbit) ──────────────────────────────
    bostonMap.on('pitchstart', () => {
      if (!pitchInitiatorRef.current) pitchInitiatorRef.current = 'boston'
    })
    bostonMap.on('pitch', () => {
      if (pitchInitiatorRef.current === 'boston') sfMap.setPitch(bostonMap.getPitch())
    })
    bostonMap.on('pitchend', () => {
      if (pitchInitiatorRef.current === 'boston') pitchInitiatorRef.current = null
    })

    sfMap.on('pitchstart', () => {
      if (!pitchInitiatorRef.current) pitchInitiatorRef.current = 'sf'
    })
    sfMap.on('pitch', () => {
      if (pitchInitiatorRef.current === 'sf') bostonMap.setPitch(sfMap.getPitch())
    })
    sfMap.on('pitchend', () => {
      if (pitchInitiatorRef.current === 'sf') pitchInitiatorRef.current = null
    })

    // ── Boston style.load ───────────────────────────────────────────────────
    bostonMap.on('style.load', () => {
      setupBaseMap(bostonMap)

      const waterLayer = new WaterLayer()
      bostonWaterRef.current = waterLayer
      bostonMap.addLayer(waterLayer)

      // Population sources & layers (boston map only)
      bostonMap.addSource('population', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      bostonMap.addSource('population-heatmap-data', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      bostonMap.addLayer({
        id: 'population-heatmap',
        type: 'heatmap',
        source: 'population-heatmap-data',
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': ['get', 'popRatio'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 0.35, 5, 0.6, 7, 1.0],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(0,0,0,0)',
            0.08, 'rgba(80,0,10,0.55)',
            0.25, 'rgba(180,0,0,0.82)',
            0.45, 'rgba(240,40,0,0.90)',
            0.65, 'rgba(255,120,0,0.94)',
            0.85, 'rgba(255,210,50,0.97)',
            1.0,  'rgba(255,255,200,1)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 65, 5, 50, 7, 35],
          'heatmap-opacity': 0.72,
        }
      })

      bostonMap.addLayer({
        id: 'population-glow',
        type: 'circle',
        source: 'population',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'case', ['==', ['get', 'population'], 0], 0,
            ['case', ['==', ['get', 'type'], 'Elite'],
              ['interpolate', ['linear'], ['zoom'],
                3, ['max', 10, ['*', 48, ['sqrt', ['get', 'popRatio']]]],
                6, ['max', 12, ['*', 105, ['sqrt', ['get', 'popRatio']]]],
              ],
              ['case', ['==', ['get', 'type'], 'Server'],
                ['interpolate', ['linear'], ['zoom'],
                  3, ['max', 6, ['*', 30, ['sqrt', ['get', 'popRatio']]]],
                  6, ['max', 8, ['*', 72, ['sqrt', ['get', 'popRatio']]]],
                ],
                0
              ]
            ]
          ],
          'circle-color': ['match', ['get', 'type'], 'Elite', '#4db3ff', '#22c55e'],
          'circle-opacity': 0.13,
          'circle-blur': 1.0,
          'circle-stroke-width': 0,
        }
      })

      bostonMap.addLayer({
        id: 'population-circles',
        type: 'circle',
        source: 'population',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'case', ['==', ['get', 'population'], 0], 4,
            ['interpolate', ['linear'], ['zoom'],
              3, ['max', 3, ['*', 22, ['sqrt', ['get', 'popRatio']]]],
              6, ['max', 4, ['*', 60, ['sqrt', ['get', 'popRatio']]]],
            ]
          ],
          'circle-color': [
            'match', ['get', 'type'],
            'Elite',     '#4db3ff',
            'Server',    '#22c55e',
            'Civilian',  '#e2e8f0',
            'Abandoned', '#4b5563',
            '#ffffff'
          ],
          'circle-opacity': ['case', ['==', ['get', 'type'], 'Abandoned'], 0.45, 0.88],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'match', ['get', 'type'],
            'Elite',     'rgba(77,179,255,0.7)',
            'Server',    'rgba(34,197,94,0.5)',
            'Abandoned', 'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.35)'
          ],
        }
      })

      bostonMap.addLayer({
        id: 'population-labels',
        type: 'symbol',
        source: 'population',
        layout: {
          visibility: 'none',
          'text-field': [
            'case', ['==', ['get', 'population'], 0],
            ['concat', ['get', 'name'], '\nAbandoned'],
            ['format', ['get', 'name'], { 'font-scale': 1.0 }, '\n', {},
              ['number-format', ['get', 'population'], { locale: 'en-US' }], { 'font-scale': 0.75 }]
          ],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12, 'text-anchor': 'top', 'text-offset': [0, 1.2],
          'text-allow-overlap': false,
        },
        paint: { 'text-color': '#ffffff', 'text-halo-color': 'rgba(0,0,0,0.7)', 'text-halo-width': 1.5 }
      })
    })

    // ── SF style.load ────────────────────────────────────────────────────────
    sfMap.on('style.load', () => {
      setupBaseMap(sfMap)

      const sfWater = new WaterLayer({
        id: 'water-plane-sf',
        corners: SF_CORNERS,
        center: SF_CENTER,
      })
      sfWaterRef.current = sfWater
      sfMap.addLayer(sfWater)
    })

    return () => {
      bostonMap.remove()
      sfMap.remove()
      bostonMapRef.current = null
      sfMapRef.current     = null
      bostonWaterRef.current = null
      sfWaterRef.current     = null
    }
  }, [tokenValid])

  // ── View switch ────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = bostonMapRef.current
    if (!map || !map.isStyleLoaded()) return

    if (activeView === 'sealevel') {
      map.flyTo(CAMERA_BOSTON)
      map.setFog(FOG_SETTINGS)
      bostonWaterRef.current?.setVisible(true)
      sfWaterRef.current?.setVisible(true)
      map.setLayoutProperty('population-heatmap', 'visibility', 'none')
      map.setLayoutProperty('population-glow', 'visibility', 'none')
      map.setLayoutProperty('population-circles', 'visibility', 'none')
      map.setLayoutProperty('population-labels', 'visibility', 'none')
    } else {
      map.flyTo(CAMERA_POPULATION)
      map.setFog(null)
      bostonWaterRef.current?.setVisible(false)
      sfWaterRef.current?.setVisible(false)
      map.setLayoutProperty('population-heatmap', 'visibility', 'visible')
      map.setLayoutProperty('population-glow', 'visibility', 'visible')
      map.setLayoutProperty('population-circles', 'visibility', 'visible')
      map.setLayoutProperty('population-labels', 'visibility', 'visible')
      map.getSource('population')?.setData(buildGeoJSON(getInterpolatedCities(year)))
      map.getSource('population-heatmap-data')?.setData(buildHeatmapGeoJSON(year))
      setUsTotal(getInterpolatedUSTotal(year))
      setYearNotes(getNotesForYear(year))
    }

    // Resize after layout shift (boston expands/contracts between 50% and 100%)
    requestAnimationFrame(() => {
      bostonMapRef.current?.resize()
      sfMapRef.current?.resize()
    })
  }, [activeView])

  // ── Year effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeView !== 'population') return
    const map = bostonMapRef.current
    if (!map || !map.getSource('population')) return
    map.getSource('population').setData(buildGeoJSON(getInterpolatedCities(year)))
    map.getSource('population-heatmap-data').setData(buildHeatmapGeoJSON(year))
    setUsTotal(getInterpolatedUSTotal(year))
    setYearNotes(getNotesForYear(year))
  }, [year, activeView])

  function handleSliderChange(e) {
    const value = parseFloat(e.target.value)
    setSeaLevel(value)
    bostonWaterRef.current?.setSeaLevel(value)
    sfWaterRef.current?.setSeaLevel(value)
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

  const isSplit = activeView === 'sealevel'

  return (
    <div className="app">
      <div className={`maps-split${isSplit ? '' : ' population-mode'}`}>
        <div className="map-pane">
          {isSplit && <span className="map-label">Boston</span>}
          <div ref={bostonContainerRef} className="map-container" />
        </div>
        <div className={`map-pane sf-pane${isSplit ? '' : ' hidden'}`}>
          <span className="map-label">SF Bay</span>
          <div ref={sfContainerRef} className="map-container" />
        </div>
      </div>

      {isSplit && <div className="map-divider" />}

      <div className="view-toggle">
        <button className={`toggle-btn ${activeView === 'sealevel' ? 'active' : ''}`} onClick={() => setActiveView('sealevel')}>Sea Level</button>
        <button className={`toggle-btn ${activeView === 'population' ? 'active' : ''}`} onClick={() => setActiveView('population')}>Population Shift</button>
      </div>

      {activeView === 'population' && yearNotes.length > 0 && (
        <div className="notes-card">
          <div className="notes-title">Year {year}</div>
          {yearNotes.map((n, i) => (
            <div key={i} className="notes-entry">
              <span className="notes-location">{n.location}</span>
              <span className="notes-text">{n.notes}</span>
            </div>
          ))}
        </div>
      )}

      {activeView === 'sealevel' ? (
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
      ) : (
        <div className="panel">
          <div className="panel-header">
            <div className="sea-level-value">{year}</div>
            <div className="scenario-label">
              US Population: {usTotal.toLocaleString()}
            </div>
          </div>
          <div className="pop-legend">
            <span className="legend-dot elite" /> Elite &nbsp;
            <span className="legend-dot server" /> Server &nbsp;
            <span className="legend-dot civilian" /> Civilian &nbsp;
            <span className="legend-dot abandoned" /> Abandoned
          </div>
          <div className="slider-wrapper">
            <input type="range" min={MIN_YEAR} max={MAX_YEAR} step={1} value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{ '--progress': `${((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%` }}
              className="slider"
            />
            <div className="ticks">
              {KEYFRAME_YEARS.map(y => (
                <div key={y} className="tick" style={{ left: `${((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%` }} />
              ))}
            </div>
          </div>
          <div className="slider-labels"><span>2026</span><span>Year</span><span>2140</span></div>
        </div>
      )}
    </div>
  )
}
