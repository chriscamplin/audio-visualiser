// https://lindenreidblog.com/2017/11/06/procedural-torus-tutorial/
import * as THREE from 'three'

export default function torus() {
  // -- input - all arbitrary
  const st = 100000
  const sl = 50 // -- number of subdivisions of the ring
  const innerR = 50 // -- inner radius
  const outerR = 10

  /// / -- ring radius (thick part of donut)
  let phi = 0.0
  const dp = (2 * Math.PI) / sl
  // -- numbertorus radius (whole donut shape)
  let theta = 0.0
  const dt = (2 * Math.PI) / st
  const arrayCurve = []

  for (let i = 0; i < 100000; i += sl) {
    theta += dt * i

    for (let k = 0; k < sl; ++k) {
      phi += dp * k
      const x = Math.cos(theta) * (outerR + Math.cos(phi) * innerR)
      const y = Math.sin(theta) * (outerR + Math.cos(phi) * innerR)
      const z = Math.sin(phi) * innerR
      // console.log({ x, y, z, phi, theta, dp, dt, datum })
      arrayCurve.push(new THREE.Vector3(x, y, z).multiplyScalar(1))
    }
  }

  return arrayCurve
}
