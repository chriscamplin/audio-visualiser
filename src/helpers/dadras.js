import * as THREE from 'three'

const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min

export default function dadrasAttractorLayout(
  a = 2.9444489320504594,
  b = 2.444966264736588,
  c = 1.5397623439638863,
  d = 1.5606585994239954,
  e = 7.0473581973595385
) {
  const dt = 0.01
  const scl = 10

  // const a = getRandomArbitrary(2, 3)
  // const b = getRandomArbitrary(1.9, 2.7)
  // const c = getRandomArbitrary(1.3, 1.7)
  // const d = getRandomArbitrary(1.2, 2)
  // const e = getRandomArbitrary(7, 9)

  console.log({ a, b, c, d, e })
  let x = 0.01
  let y = 0.01
  let z = 0.01

  const arrayCurve = []
  //   const t = 0.001

  for (let i = 0; i < 200000; i += 3) {
    let x1 = y - a * x + b * y * z
    let y1 = c * y - x * z + z
    let z1 = d * x * y - e * z

    x1 *= dt
    y1 *= dt
    z1 *= dt

    x += x1
    y += y1
    z += z1

    arrayCurve.push(new THREE.Vector3(x, y, z).multiplyScalar(scl))
  }

  return arrayCurve
}
