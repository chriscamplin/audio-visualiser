/* eslint-disable no-plusplus */
import * as THREE from 'three'

import { perlin } from './perlin'

import { mapValue } from '@/helpers/mapValue'

const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min

export function aizawaAttractor(data) {
  const numPoints = data.length
  const dt = 0.005

  const a = 0.95
  const b = 0.7
  const c = 0.6
  const d = 3.5
  const e = 0.25
  const f = 0.1
  let x = 0.00125
  let y = 0.1
  let z = 0.01

  for (let i = 0; i < numPoints; ++i) {
    const datum = data[i]

    let dx = (z - b) * x - d * y
    let dy = d * x + (z - b) * y
    let dz = c + a * z - (z * z * z) / 3 - x * x + f * z * (x * x * x)
    dx *= dt
    dy *= dt
    dz *= dt

    x += dx
    y += dy
    z += dz

    datum.x = x * 10
    datum.y = y * 10
    datum.z = z * 10
  }
}

export function gridLayout2D(data) {
  const numPoints = data.length
  const numCols = Math.ceil(Math.sqrt(numPoints))
  const numRows = numCols
  // const numZRows = numRows
  // set the transform matrix for each instance
  for (let i = 0; i < numPoints; ++i) {
    const datum = data[i]
    const col = (i % numCols) - numCols / 4
    const row = Math.floor(i / numCols) - numRows / 4

    datum.x = col * 1.05 - numRows * 0.25
    datum.y = row * 1.05 - numCols * 0.25
    datum.z = 0
  }
}

export function gridLayout3D(data) {
  const numPoints = data.length
  const numCols = Math.ceil(Math.sqrt(numPoints))
  const numRows = Math.ceil(Math.sqrt(numCols))
  console.log(
    numRows,
    numCols,
    numRows * numRows,
    numRows * numRows * numRows,
    numPoints
  )
  // #Size of grid
  let count = 0

  console.log(Math.ceil(numPoints / numCols))
  for (let x = 0; x < numRows * 4.47; x += 2) {
    for (let y = 0; y < numRows * 4.47; y += 2) {
      for (let z = 0; z < numRows * 4.47; z += 2) {
        const datum = data[count]
        datum.x = x - numRows
        datum.y = y - numRows
        datum.z = z - numRows
        count++
      }
    }
  }
}

export function spiralLayout(data) {
  // console.log('spiralLayout')
  let theta = 0
  // set the transform matrix for each instance
  for (let i = 0; i < data.length; ++i) {
    const datum = data[i]
    const radius = Math.max(1, Math.sqrt(i + 1) * 0.8)
    theta += Math.asin(1 / radius) * 1
    datum.x = radius * Math.sin(theta)
    datum.y = radius * Math.cos(theta)
    datum.z = Math.sin(theta) + Math.cos(theta) * i * 0.025
  }
}

export function phyllotaxisLayout(data) {
  // console.log('spiralLayout')
  // set the transform matrix for each instance
  for (let i = 0; i < data.length; ++i) {
    const datum = data[i]
    // const radius = Math.max(1, Math.sqrt(i + 1) * 0.8)

    datum.x = i * 0.025 * Math.sin(i * 10)
    datum.y = i * 0.025 * Math.cos(i * 10)
    datum.z = Math.sin(i * 0.0025) * 10
  }
}

export function lorenzLayout(data) {
  const scl = 10
  let x0 = 0.1
  let y0 = 0
  let z0 = 0
  let x1
  let y1
  let z1
  const h = 0.01
  const a = getRandomArbitrary(7, 10.0)
  const b = getRandomArbitrary(26, 30)
  const c = getRandomArbitrary(6, 9) / 3.0

  for (let i = 0; i < data.length; ++i) {
    const datum = data[i]
    x1 = x0 + h * a * (y0 - x0)
    y1 = y0 + h * (x0 * (b - z0) - y0)
    z1 = z0 + h * (x0 * y0 - c * z0)
    x0 = x1
    y0 = y1
    z0 = z1

    datum.x = x0 * scl
    datum.y = y0 * scl
    datum.z = (z0 - b) * scl
  }
}

// DADRAS

export function dadrasAttractorLayout(data) {
  const dt = 0.01
  const scl = 10

  const a = getRandomArbitrary(2, 3)
  const b = getRandomArbitrary(1.9, 2.7)
  const c = getRandomArbitrary(1.3, 1.7)
  const d = getRandomArbitrary(1.2, 2)
  const e = getRandomArbitrary(7, 9)
  let x = 0.1
  let y = 0.1
  let z = 0.1
  for (let i = 0; i < data.length; ++i) {
    const datum = data[i]
    let x1 = y - a * x + b * y * z
    let y1 = c * y - x * z + z
    let z1 = d * x * y - e * z

    x1 *= dt
    y1 *= dt
    z1 *= dt

    x += x1
    y += y1
    z += z1

    datum.x = x * scl
    datum.y = y * scl
    datum.z = z * scl
    // return { dx, dy, dz }
  }
}

export function randomLayout(data) {
  for (let i = 0; i < data.length; ++i) {
    const datum = data[i]
    datum.x = Math.random() * 100 - 50
    datum.y = Math.random() * 100 - 50
    datum.z = Math.random() * 100 - 50
  }
}

export function sphereLayout(data) {
  const step = 2 //= Math.round(Math.random() * 9 + 1)
  const scl = 100
  const r = data.length * 0.001 // Math.random() * 500
  for (let i = 0; i < data.length; i += 1) {
    const lon = mapValue(i, 0, r, 0, Math.PI)
    const datum = data[i]
    const lat = mapValue(i, 0, r, 0, Math.PI * 2.0)
    // lon = (lon * Math.PI) / 180
    // lat = (lat * Math.PI) / 180
    const x = scl * step * Math.sin(lon * Math.PI) * Math.cos(lat)
    const y = scl * step * Math.sin(lon * Math.PI) * Math.sin(lat)
    const z = scl * step * Math.cos(lon * Math.PI)
    // }
    datum.x = x
    datum.y = y
    datum.z = z
  }
}

export function parametricLayout(data) {
  const numPoints = data.length
  const numCols = Math.ceil(Math.sqrt(numPoints))
  const numRows = numCols
  // set the transform matrix for each instance
  for (let i = 0; i < numPoints; ++i) {
    const datum = data[i]
    const col = (i % numCols) - numCols / 2
    const row = Math.floor(i / numCols) - numRows / 2
    datum.x = col * 1.05
    datum.y = row * 1.05
    datum.z = col * row * 0.0215
  }
}

export function offsetGrid(data) {
  const numPoints = data.length
  // Place in a grid
  for (let i = 0; i < numPoints; ++i) {
    const datum = data[i]

    let x = (i % 100) - 50
    let y = Math.floor(i / 100) - 50

    // Offset every other column (hexagonal pattern)
    y += (i % 2) * 0.5

    // Add some noise
    x += perlin.get(x, y) * 0.7
    y += perlin.get(x, y) * 0.7
    datum.x = x
    datum.y = y
    datum.z = Math.sin(x + (y / Math.PI) * 0.25)
  }
}

// https://lindenreidblog.com/2017/11/06/procedural-torus-tutorial/
export function torusLayout(data) {
  // -- input - all arbitrary
  const st = data.length // -- number of times we draw a ring
  const sl = 50 // -- number of subdivisions of the ring
  const innerR = 50 // -- inner radius
  const outerR = 10

  /// / -- ring radius (thick part of donut)
  let phi = 0.0
  const dp = (2 * Math.PI) / sl
  // -- numbertorus radius (whole donut shape)
  let theta = 0.0
  const dt = (2 * Math.PI) / st

  for (let i = 0; i < data.length; ++i) {
    theta += dt * i
    const datum = data[i]

    for (let k = 0; k < sl; ++k) {
      phi += dp * k
      const x = Math.cos(theta) * (outerR + Math.cos(phi) * innerR)
      const y = Math.sin(theta) * (outerR + Math.cos(phi) * innerR)
      const z = Math.sin(phi) * innerR
      // console.log({ x, y, z, phi, theta, dp, dt, datum })
      datum.x = x
      datum.y = y
      datum.z = z
    }
  }
}

export function dequanLayout(data) {
  const a = 40.0
  const b = 1.833
  const c = 0.16
  const d = 0.65
  const e = 55.0
  const f = 20.0
  const dt = 0.001
  let x = 0.1
  let y = 0.1
  let z = 0.1
  const scl = 0.25

  for (let i = 0; i < data.length; ++i) {
    const datum = data[i]

    let dx = a * (y - x) + c * x * z
    let dy = e * x + f * y - x * z
    let dz = b * z + x * y - d * x * x
    dx *= dt
    dy *= dt
    dz *= dt

    x += dx
    y += dy
    z += dz

    datum.x = x * scl
    datum.y = y * scl
    datum.z = z * scl
  }
}
const tmpVec31 = new THREE.Vector3()
const tmpVec32 = new THREE.Vector3()
const tmpVec33 = new THREE.Vector3()

export function modelLayout(data, modelGeometry) {
  if (!modelGeometry) return
  const uvAttribute = modelGeometry.getAttribute('uv')
  const tmpVec = new THREE.Vector2()

  const faceVertexUvs = uvAttribute.array
  // const faceVertexUvs = baseGeometry.faceVertexUvs[0]

  // This gets the array of all positions [x, y, z, x, y, z, x, y z,...]
  const positions = modelGeometry.getAttribute('position').array

  // This gets # of vertices
  const vertexCount = modelGeometry.getAttribute('position').count
  // dispose old geometry since we no longer need it
  // baseGeometry.dispose()

  // We'll store each vertex in this Vec3
  // const indices = baseGeometry.getIndex().array
  // const index = baseGeometry.getIndex()
  const posArray = new Float32Array(vertexCount)
  const angleArray = new Float32Array(vertexCount)

  const uvArray = new Float32Array(vertexCount * 2)

  for (let i = 0; i < data.length; i += 3) {
    const datum = data[i]

    const x = positions[i + 0]
    const y = positions[i + 1]
    const z = positions[i + 2]
    // For each vertex in this face...
    datum.x = x * 100
    datum.y = y * 100
    datum.z = z * 100
  }
}
