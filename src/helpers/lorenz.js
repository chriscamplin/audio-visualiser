import * as THREE from 'three'

export default function lorenz(a = 0.9, b = 3.4, f = 13.9, g = 0.5) {
  const arrayCurve = []

  let x = 0.01
  let y = 0.01
  let z = 0.01
  const t = 0.001
  for (let i = 0; i < 200000; i += 3) {
    // const x1 = x
    // const y1 = y
    // const z1 = z
    x = x - t * a * x + t * y * y - t * z * z + t * a * f
    y = y - t * y + t * x * y - t * b * x * z + t * g
    z = z - t * z + t * b * x * y + t * x * z
    arrayCurve.push(new THREE.Vector3(x, y, z).multiplyScalar(1))
    // arrayCurve[i] = x
    // arrayCurve[i + 1] = y
    // arrayCurve[i + 2] = z
  }

  return arrayCurve
}
