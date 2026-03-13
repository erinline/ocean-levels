export const SCENARIOS = [
  { label: 'Current sea level',        maxMeters: 0    },
  { label: 'IPCC 2100 low',            maxMeters: 0.3  },
  { label: 'IPCC 2100 high',           maxMeters: 1.0  },
  { label: 'Partial ice sheet loss',   maxMeters: 3.0  },
  { label: 'Full Greenland melt',      maxMeters: 6.0  },
  { label: 'Greenland + W. Antarctic', maxMeters: 12.0 },
  { label: "All Earth's ice melted",   maxMeters: 30.0 },
]

export function getScenarioLabel(meters) {
  let last = SCENARIOS[0]
  for (const s of SCENARIOS) {
    if (meters >= s.maxMeters) last = s
  }
  return last.label
}
