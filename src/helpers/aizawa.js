import * as THREE from 'three'

function aizawaAttractor(
  x,
  y,
  z,
  a = 0.95,
  b = 0.7,
  c = 0.6,
  d = 3.5,
  e = 0.25,
  f = 0.1
) {
  const dx = (z - b) * x - d * y
  const dy = d * x + (z - b) * y
  const dz =
    c +
    a * z -
    (z * z * z) / 3 -
    (x * x + y * y) * (1 + e * z) +
    f * z * x * x * x

  return [dx, dy, dz]
}
function areneodoAttractor(x, y, z) {
  const a = -5.5
  const b = 3.5
  const d = -1
  const timestep = 0.01
  const dx = y * timestep
  const dy = z * timestep
  const dz = (-a * x - b * y - z + d * x ** 3) * timestep

  return [dx, dy, dz]
}

export default function aizawa() {
  const arrayCurve = []
  let x = 0.01
  let y = 0.01
  let z = 0.01

  // console.log('spiralLayout')
  // set the transform matrix for each instance
  for (let i = 0; i < 100000; i += 0.25) {
    // const radius = Math.max(1, Math.sqrt(i + 1) * 0.8)

    const [dx, dy, dz] = areneodoAttractor(x, y, z)
    x += dx * 0.1
    y += dy * 0.1
    z += dz * 0.1
    arrayCurve.push(new THREE.Vector3(x, y, z).multiplyScalar(6))
  }

  return arrayCurve
}
