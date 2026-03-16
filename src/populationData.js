export const POPULATION_RECORDS = [
  { year: 2026, location: 'San Francisco',  type: 'Elite',     lat: 37.7749, lng: -122.4194, population: 800000,   notes: 'Baseline population.' },
  { year: 2026, location: 'Boston',         type: 'Civilian',  lat: 42.3601, lng: -71.0589,  population: 650000,   notes: 'Baseline population.' },
  { year: 2026, location: 'Washington D.C.',type: 'Civilian',  lat: 38.9072, lng: -77.0369,  population: 700000,   notes: 'Baseline population.' },
  { year: 2026, location: 'Ashburn',        type: 'Civilian',  lat: 39.0438, lng: -77.4874,  population: 50000,    notes: 'Baseline population.' },
  { year: 2026, location: 'Quincy WA',      type: 'Civilian',  lat: 47.2343, lng: -119.8526, population: 8000,     notes: 'Baseline population.' },
  { year: 2026, location: 'San Jose',       type: 'Civilian',  lat: 37.3382, lng: -121.8863, population: 1000000,  notes: 'Baseline population.' },
  { year: 2026, location: 'Chicago',        type: 'Civilian',  lat: 41.8781, lng: -87.6298,  population: 2700000,  notes: 'Baseline population.' },
  { year: 2026, location: 'Dallas',         type: 'Civilian',  lat: 32.7767, lng: -96.7970,  population: 1300000,  notes: 'Baseline population.' },
  { year: 2026, location: 'New York',       type: 'Civilian',  lat: 40.7128, lng: -74.0060,  population: 8300000,  notes: 'Baseline population.' },
  { year: 2036, location: 'San Francisco',  type: 'Elite',     lat: 37.7749, lng: -122.4194, population: 2000000,  notes: 'Immortals consolidate; perimeter blackened.' },
  { year: 2040, location: 'Washington D.C.',type: 'Civilian',  lat: 38.9072, lng: -77.0369,  population: 300000,   notes: 'DC civil war; city begins to drown.' },
  { year: 2042, location: 'Quincy WA',      type: 'Server',    lat: 47.2343, lng: -119.8526, population: 50000,    notes: 'Established as a server city.' },
  { year: 2044, location: 'Washington D.C.',type: 'Abandoned', lat: 38.9072, lng: -77.0369,  population: 0,        notes: 'DC completely drowned.' },
  { year: 2044, location: 'Ashburn',        type: 'Server',    lat: 39.0438, lng: -77.4874,  population: 100000,   notes: 'Established as a server city fortress.' },
  { year: 2046, location: 'Boston',         type: 'Abandoned', lat: 42.3601, lng: -71.0589,  population: 0,        notes: 'Hurricane Scylla; city completely wiped out.' },
  { year: 2048, location: 'San Jose',       type: 'Server',    lat: 37.3382, lng: -121.8863, population: 1500000,  notes: 'Established as a server city.' },
  { year: 2052, location: 'Chicago',        type: 'Server',    lat: 41.8781, lng: -87.6298,  population: 500000,   notes: 'Established as a subterranean server city.' },
  { year: 2055, location: 'Dallas',         type: 'Server',    lat: 32.7767, lng: -96.7970,  population: 800000,   notes: 'Established as a subterranean server city.' },
  { year: 2060, location: 'San Francisco',  type: 'Elite',     lat: 37.7749, lng: -122.4194, population: 10000000, notes: 'Final consolidation.' },
  { year: 2060, location: 'Quincy WA',      type: 'Server',    lat: 47.2343, lng: -119.8526, population: 2000000,  notes: 'Final consolidation.' },
  { year: 2060, location: 'Ashburn',        type: 'Server',    lat: 39.0438, lng: -77.4874,  population: 2000000,  notes: 'Final consolidation.' },
  { year: 2060, location: 'San Jose',       type: 'Server',    lat: 37.3382, lng: -121.8863, population: 2000000,  notes: 'Final consolidation.' },
  { year: 2060, location: 'Chicago',        type: 'Server',    lat: 41.8781, lng: -87.6298,  population: 2000000,  notes: 'Final consolidation.' },
  { year: 2060, location: 'Dallas',         type: 'Server',    lat: 32.7767, lng: -96.7970,  population: 2000000,  notes: 'Final consolidation.' },
  { year: 2060, location: 'New York',       type: 'Abandoned', lat: 40.7128, lng: -74.0060,  population: 0,        notes: 'Abandoned.' },
  { year: 2129, location: 'Boston',         type: 'Civilian',  lat: 42.3601, lng: -71.0589,  population: 100,      notes: 'Tao moves to Boston; settlement begins.' },
  { year: 2135, location: 'Boston',         type: 'Civilian',  lat: 42.3601, lng: -71.0589,  population: 10000,    notes: 'Soren finds Tao; rapid growth.' },
  { year: 2138, location: 'Boston',         type: 'Civilian',  lat: 42.3601, lng: -71.0589,  population: 25000,    notes: 'City splits due to rapid immigrant growth.' },
  { year: 2138, location: 'New York',       type: 'Civilian',  lat: 40.7128, lng: -74.0060,  population: 5000,     notes: 'New York community begins from Boston split.' },
  { year: 2139, location: 'Boston',         type: 'Civilian',  lat: 42.3601, lng: -71.0589,  population: 30000,    notes: 'Stella finds them.' },
  { year: 2140, location: 'Boston',         type: 'Civilian',  lat: 42.3601, lng: -71.0589,  population: 30000,    notes: 'Stella escapes; the broadcast occurs.' },
]

export const US_TOTAL_RECORDS = [
  { year: 2026, population: 335000000, notes: 'Cure for aging invented; baseline population.' },
  { year: 2036, population: 250000000, notes: 'Wet bulb temperature era causes massive interior die-offs.' },
  { year: 2052, population: 50000000,  notes: 'Agricultural collapse accelerates population drop.' },
  { year: 2060, population: 20000000,  notes: 'No significant populations outside the 6 cities.' },
  { year: 2070, population: 20000000,  notes: 'Populations stable in the 6 cities.' },
]

// Major US metro areas (2026 MSA populations) not in the tracked city list.
// Used as background nodes to represent the broader US population distribution
// on the heatmap, scaled down proportionally as the US total declines.
export const BACKGROUND_CITIES = [
  { lat: 34.0522, lng: -118.2437, pop2026: 13200000 }, // Los Angeles
  { lat: 29.7604, lng: -95.3698,  pop2026: 7300000  }, // Houston
  { lat: 25.7617, lng: -80.1918,  pop2026: 6200000  }, // Miami
  { lat: 33.7490, lng: -84.3880,  pop2026: 6200000  }, // Atlanta
  { lat: 39.9526, lng: -75.1652,  pop2026: 6300000  }, // Philadelphia
  { lat: 33.4484, lng: -112.0740, pop2026: 5000000  }, // Phoenix
  { lat: 47.6062, lng: -122.3321, pop2026: 4000000  }, // Seattle
  { lat: 42.3314, lng: -83.0458,  pop2026: 4400000  }, // Detroit
  { lat: 44.9778, lng: -93.2650,  pop2026: 3700000  }, // Minneapolis
  { lat: 27.9506, lng: -82.4572,  pop2026: 3200000  }, // Tampa
  { lat: 32.7157, lng: -117.1611, pop2026: 3300000  }, // San Diego
  { lat: 39.7392, lng: -104.9903, pop2026: 2900000  }, // Denver
  { lat: 39.2904, lng: -76.6122,  pop2026: 2900000  }, // Baltimore
  { lat: 38.6270, lng: -90.1994,  pop2026: 2800000  }, // St. Louis
  { lat: 40.4406, lng: -79.9959,  pop2026: 2400000  }, // Pittsburgh
  { lat: 45.5051, lng: -122.6750, pop2026: 2500000  }, // Portland OR
  { lat: 38.5816, lng: -121.4944, pop2026: 2400000  }, // Sacramento
  { lat: 35.2271, lng: -80.8431,  pop2026: 2700000  }, // Charlotte
  { lat: 29.4241, lng: -98.4936,  pop2026: 2700000  }, // San Antonio
  { lat: 36.1699, lng: -115.1398, pop2026: 2300000  }, // Las Vegas
  { lat: 30.2672, lng: -97.7431,  pop2026: 2300000  }, // Austin
  { lat: 39.0997, lng: -94.5786,  pop2026: 2200000  }, // Kansas City
  { lat: 39.9612, lng: -82.9988,  pop2026: 2100000  }, // Columbus OH
  { lat: 39.7684, lng: -86.1581,  pop2026: 2100000  }, // Indianapolis
  { lat: 41.4993, lng: -81.6944,  pop2026: 2000000  }, // Cleveland
  { lat: 39.1031, lng: -84.5120,  pop2026: 2300000  }, // Cincinnati
  { lat: 36.1627, lng: -86.7816,  pop2026: 2000000  }, // Nashville
  { lat: 43.0389, lng: -87.9065,  pop2026: 1600000  }, // Milwaukee
  { lat: 35.7796, lng: -78.6382,  pop2026: 1400000  }, // Raleigh
  { lat: 38.2527, lng: -85.7585,  pop2026: 1400000  }, // Louisville
  { lat: 35.4676, lng: -97.5164,  pop2026: 1400000  }, // Oklahoma City
  { lat: 29.9511, lng: -90.0715,  pop2026: 1300000  }, // New Orleans
  { lat: 35.1495, lng: -90.0490,  pop2026: 1300000  }, // Memphis
  { lat: 37.5407, lng: -77.4360,  pop2026: 1300000  }, // Richmond
  { lat: 30.3322, lng: -81.6557,  pop2026: 1500000  }, // Jacksonville
  { lat: 40.7608, lng: -111.8910, pop2026: 1200000  }, // Salt Lake City
  { lat: 41.7658, lng: -72.6851,  pop2026: 1200000  }, // Hartford
  { lat: 42.8864, lng: -78.8784,  pop2026: 1200000  }, // Buffalo
  { lat: 33.5186, lng: -86.8104,  pop2026: 1100000  }, // Birmingham
  { lat: 42.9634, lng: -85.6681,  pop2026: 1100000  }, // Grand Rapids
  { lat: 32.2226, lng: -110.9747, pop2026: 1100000  }, // Tucson
  { lat: 31.7619, lng: -106.4850, pop2026: 900000   }, // El Paso
  { lat: 41.2565, lng: -95.9345,  pop2026: 900000   }, // Omaha
  { lat: 35.0853, lng: -106.6056, pop2026: 900000   }, // Albuquerque
  { lat: 35.9606, lng: -83.9207,  pop2026: 900000   }, // Knoxville
  { lat: 43.6150, lng: -116.2023, pop2026: 800000   }, // Boise
  { lat: 41.5868, lng: -93.6250,  pop2026: 700000   }, // Des Moines
  { lat: 34.7465, lng: -92.2896,  pop2026: 700000   }, // Little Rock
  { lat: 37.6872, lng: -97.3301,  pop2026: 600000   }, // Wichita
  { lat: 47.6588, lng: -117.4260, pop2026: 600000   }, // Spokane
]

// Sum of tracked cities at 2026
const TRACKED_2026 = POPULATION_RECORDS
  .filter(r => r.year === 2026)
  .reduce((s, r) => s + r.population, 0) // 15,508,000

// Population living outside the 9 tracked cities in 2026
const INITIAL_UNTRACKED = 335000000 - TRACKED_2026 // ~319,492,000

export const MIN_YEAR = 2026
export const MAX_YEAR = 2140

export const KEYFRAME_YEARS = [...new Set(POPULATION_RECORDS.map(r => r.year))].sort((a, b) => a - b)

// Linearly interpolate the US total between keyframe years
export function getInterpolatedUSTotal(year) {
  const sorted = US_TOTAL_RECORDS.slice().sort((a, b) => a.year - b.year)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (year <= first.year) return first.population
  if (year >= last.year) return last.population
  const before = sorted.filter(r => r.year <= year).pop()
  const after = sorted.find(r => r.year > year)
  const t = (year - before.year) / (after.year - before.year)
  return Math.round(before.population + t * (after.population - before.population))
}

export function getInterpolatedCities(year) {
  const byCity = new Map()
  for (const r of POPULATION_RECORDS) {
    if (!byCity.has(r.location)) byCity.set(r.location, [])
    byCity.get(r.location).push(r)
  }

  const results = []
  for (const [location, records] of byCity) {
    const sorted = records.slice().sort((a, b) => a.year - b.year)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    if (year < first.year) continue

    let population, type
    if (year >= last.year) {
      population = last.population
      type = last.type
    } else {
      const before = sorted.filter(r => r.year <= year).pop()
      const after = sorted.find(r => r.year > year)
      const t = (year - before.year) / (after.year - before.year)
      population = Math.round(before.population + t * (after.population - before.population))
      type = population === 0 ? 'Abandoned' : before.type
    }

    results.push({ location, lat: first.lat, lng: first.lng, population, type })
  }
  return results
}

// Builds GeoJSON for the heatmap: background metros (scaled by untracked remainder)
// + tracked cities. This gives a realistic US-wide population distribution that
// drains into the 6 server cities over time.
export function buildHeatmapGeoJSON(year) {
  const trackedCities = getInterpolatedCities(year)
  const trackedTotal = trackedCities.reduce((sum, c) => sum + c.population, 0)
  const usTotal = getInterpolatedUSTotal(year)
  const untrackedPop = Math.max(0, usTotal - trackedTotal)
  const scale = INITIAL_UNTRACKED > 0 ? untrackedPop / INITIAL_UNTRACKED : 0

  const features = []

  for (const city of BACKGROUND_CITIES) {
    const pop = Math.round(city.pop2026 * scale)
    if (pop === 0) continue
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [city.lng, city.lat] },
      properties: { population: pop, popRatio: pop / 10000000 },
    })
  }

  for (const city of trackedCities) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [city.lng, city.lat] },
      properties: { population: city.population, popRatio: city.population / 10000000 },
    })
  }

  return { type: 'FeatureCollection', features }
}

export function getNotesForYear(selectedYear) {
  const cityNotes = POPULATION_RECORDS
    .filter(r => r.year === selectedYear && r.notes && r.notes !== 'Baseline population.')
    .map(r => ({ location: r.location, notes: r.notes }))
  const usRecord = US_TOTAL_RECORDS.find(r => r.year === selectedYear)
  const usnotes = usRecord && usRecord.notes !== 'Baseline population.'
    ? [{ location: 'United States', notes: usRecord.notes }]
    : []
  return [...usnotes, ...cityNotes]
}

export function buildGeoJSON(cityStates) {
  return {
    type: 'FeatureCollection',
    features: cityStates.map(city => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [city.lng, city.lat] },
      properties: {
        name: city.location,
        population: city.population,
        type: city.type,
        popRatio: city.population / 10000000,
      },
    }))
  }
}
