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

const CAMERA_SEA_LEVEL = { center: [-71.35, 42.35], zoom: 11, pitch: 50, bearing: -15, duration: 2000, essential: true }
const CAMERA_POPULATION = { center: [-98.5795, 39.8283], zoom: 4, pitch: 0, bearing: 0, duration: 2500, essential: true }

export default function App() {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const waterLayerRef = useRef(null)
  const [seaLevel, setSeaLevel] = useState(0)
  const [activeView, setActiveView] = useState('sealevel')
  const [year, setYear] = useState(MIN_YEAR)
  const [usTotal, setUsTotal] = useState(335000000)
  const [yearNotes, setYearNotes] = useState([])
  const tokenValid = TOKEN && TOKEN.startsWith('pk.')

  useEffect(() => {
    if (!tokenValid) return

    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
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

      // Population source (tracked cities — drives circles, glow, labels)
      map.addSource('population', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      // Heatmap source (background metros + tracked cities — full US coverage)
      map.addSource('population-heatmap-data', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      map.addLayer({
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

      // Glow halos for Elite (blue) and Server (green) cities
      map.addLayer({
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

      map.addLayer({
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

      map.addLayer({
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

    return () => {
      map.remove()
      mapRef.current = null
      waterLayerRef.current = null
    }
  }, [tokenValid])

  // View switch effect
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    if (activeView === 'sealevel') {
      map.flyTo(CAMERA_SEA_LEVEL)
      map.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      })
      waterLayerRef.current?.setVisible(true)
      map.setLayoutProperty('population-heatmap', 'visibility', 'none')
      map.setLayoutProperty('population-glow', 'visibility', 'none')
      map.setLayoutProperty('population-circles', 'visibility', 'none')
      map.setLayoutProperty('population-labels', 'visibility', 'none')
    } else {
      map.flyTo(CAMERA_POPULATION)
      map.setFog(null)
      waterLayerRef.current?.setVisible(false)
      map.setLayoutProperty('population-heatmap', 'visibility', 'visible')
      map.setLayoutProperty('population-glow', 'visibility', 'visible')
      map.setLayoutProperty('population-circles', 'visibility', 'visible')
      map.setLayoutProperty('population-labels', 'visibility', 'visible')
      map.getSource('population')?.setData(buildGeoJSON(getInterpolatedCities(year)))
      map.getSource('population-heatmap-data')?.setData(buildHeatmapGeoJSON(year))
      setUsTotal(getInterpolatedUSTotal(year))
      setYearNotes(getNotesForYear(year))
    }
  }, [activeView])

  // Year effect — fires on every slider tick
  useEffect(() => {
    if (activeView !== 'population') return
    const map = mapRef.current
    if (!map || !map.getSource('population')) return
    map.getSource('population').setData(buildGeoJSON(getInterpolatedCities(year)))
    map.getSource('population-heatmap-data').setData(buildHeatmapGeoJSON(year))
    setUsTotal(getInterpolatedUSTotal(year))
    setYearNotes(getNotesForYear(year))
  }, [year, activeView])

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
