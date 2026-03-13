import mapboxgl from 'mapbox-gl'

const VERT_SRC = `
attribute vec3 a_position;
uniform mat4 u_matrix;
void main() {
  gl_Position = u_matrix * vec4(a_position, 1.0);
}
`

const FRAG_SRC = `
precision mediump float;
void main() {
  gl_FragColor = vec4(0.0975, 0.2925, 0.5525, 0.65);
}
`

function compileShader(gl, type, src) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader))
  }
  return shader
}

export class WaterLayer {
  constructor() {
    this.id = 'water-plane'
    this.type = 'custom'
    this.renderingMode = '3d'
    this._seaLevelMeters = 0
    this._dirty = true
    this._program = null
    this._buffer = null
    this._aPosition = -1
    this._uMatrix = null
    // Quad corners: [lng, lat]
    this._corners = [
      [-72.0, 41.9],
      [-70.5, 41.9],
      [-72.0, 42.8],
      [-70.5, 42.8],
    ]
    // Cached Mercator XY (z computed per sea level change)
    this._cornersXY = null
  }

  onAdd(map, gl) {
    this.map = map

    // Cache Mercator XY of corners (Z will be set per sea level)
    this._cornersXY = this._corners.map(([lng, lat]) => {
      const mc = mapboxgl.MercatorCoordinate.fromLngLat([lng, lat], 0)
      return [mc.x, mc.y]
    })

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)

    this._program = gl.createProgram()
    gl.attachShader(this._program, vert)
    gl.attachShader(this._program, frag)
    gl.linkProgram(this._program)
    if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
      throw new Error('Program link error: ' + gl.getProgramInfoLog(this._program))
    }

    this._aPosition = gl.getAttribLocation(this._program, 'a_position')
    this._uMatrix = gl.getUniformLocation(this._program, 'u_matrix')

    this._buffer = gl.createBuffer()
  }

  setSeaLevel(meters) {
    this._seaLevelMeters = meters
    this._dirty = true
    if (this.map) this.map.triggerRepaint()
  }

  _buildVertices(gl) {
    const z = mapboxgl.MercatorCoordinate.fromLngLat(
      [-71.35, 42.35],
      this._seaLevelMeters
    ).z

    // Triangle strip: TL, BL, TR, BR
    const [tl, bl, tr, br] = [
      this._cornersXY[2], // [-72.0, 42.8]
      this._cornersXY[0], // [-72.0, 41.9]
      this._cornersXY[3], // [-70.5, 42.8]
      this._cornersXY[1], // [-70.5, 41.9]
    ]

    const verts = new Float32Array([
      tl[0], tl[1], z,
      bl[0], bl[1], z,
      tr[0], tr[1], z,
      br[0], br[1], z,
    ])

    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW)
    this._dirty = false
  }

  render(gl, matrix) {
    if (!this._cornersXY) return

    if (this._dirty) {
      this._buildVertices(gl)
    }

    gl.useProgram(this._program)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    // Push water slightly away from camera in clip space (positive offset =
    // higher depth value = further from near plane). This ensures terrain at
    // or above the water elevation consistently wins the depth test, which
    // eliminates z-fighting as near/far planes shift with zoom.
    gl.enable(gl.POLYGON_OFFSET_FILL)
    gl.polygonOffset(0, 2)

    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer)
    gl.enableVertexAttribArray(this._aPosition)
    gl.vertexAttribPointer(this._aPosition, 3, gl.FLOAT, false, 0, 0)

    gl.uniformMatrix4fv(this._uMatrix, false, matrix)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    gl.disable(gl.POLYGON_OFFSET_FILL)
    gl.depthFunc(gl.LESS)
  }

  onRemove(_map, gl) {
    if (this._program) gl.deleteProgram(this._program)
    if (this._buffer) gl.deleteBuffer(this._buffer)
  }
}
