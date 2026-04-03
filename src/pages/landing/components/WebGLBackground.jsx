import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LAND_COUNT = 10000
const OCEAN_COUNT = 4000
const SCATTER_COUNT = 1200
const TOTAL = LAND_COUNT + OCEAN_COUNT + SCATTER_COUNT

const PALETTE_LAND = [
  [0.961, 0.620, 0.043], // amber (dominant like Dala)
  [0.961, 0.620, 0.043],
  [0.486, 0.227, 0.929], // purple
  [0.024, 0.714, 0.831], // cyan
  [0.133, 0.773, 0.369], // green
  [0.925, 0.282, 0.600], // pink
  [0.9, 0.9, 0.9],       // white
]
const PALETTE_OCEAN = [
  [0.024, 0.714, 0.831],
  [0.486, 0.227, 0.929],
  [0.3, 0.3, 0.35],
  [0.2, 0.2, 0.25],
]

/* ── World map sampler ── */
function buildWorldMap() {
  const W = 360, H = 180
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H)
  c.fillStyle = '#fff'
  const X = lo => ((lo + 180) / 360) * W
  const Y = la => ((90 - la) / 180) * H
  const poly = pts => { c.beginPath(); pts.forEach(([lo,la],i) => i ? c.lineTo(X(lo),Y(la)) : c.moveTo(X(lo),Y(la))); c.closePath(); c.fill() }
  // North America
  poly([[-52,47],[-60,46],[-64,50],[-64,62],[-60,63],[-60,68],[-65,72],[-65,76],[-80,80],[-120,80],[-140,70],[-168,71],[-168,65],[-165,61],[-155,59],[-140,60],[-130,54],[-125,50],[-124,48],[-122,38],[-117,34],[-117,32],[-110,23],[-104,19],[-99,16],[-95,16],[-92,14],[-90,20],[-88,20],[-80,25],[-75,35],[-76,38],[-75,44],[-67,44]])
  // Greenland
  poly([[-54,72],[-44,60],[-18,60],[-12,70],[-18,84],[-44,84]])
  // South America
  poly([[-35,5],[-38,-8],[-55,-38],[-65,-55],[-70,-55],[-75,-20],[-80,-10],[-80,0],[-70,12],[-60,10],[-50,8]])
  // Europe
  poly([[-10,36],[-5,45],[-5,48],[-2,50],[0,62],[-5,57],[5,57],[10,63],[15,68],[20,68],[25,65],[30,60],[37,48],[35,42],[40,42],[35,37],[25,36],[20,36],[15,38],[10,37],[3,37],[0,36],[-5,36],[-10,36]])
  // Scandinavia
  poly([[5,57],[15,57],[18,60],[22,65],[26,70],[20,70],[15,68],[10,63]])
  // Britain
  poly([[-6,50],[-1,50],[-1,59],[-6,59]])
  // Africa
  poly([[-18,16],[-18,-5],[-18,-35],[0,-30],[15,-35],[18,-35],[35,-30],[43,-12],[51,12],[42,12],[35,25],[25,37],[10,37],[0,37],[-10,35]])
  // Asia
  poly([[25,36],[25,70],[40,70],[60,72],[75,75],[100,70],[120,70],[140,70],[168,68],[170,60],[155,55],[145,45],[135,40],[130,35],[120,20],[105,12],[100,5],[97,8],[97,20],[90,25],[80,25],[75,20],[65,22],[60,20],[55,12],[42,12],[40,38],[40,42],[35,37]])
  // Arabia
  poly([[36,30],[57,22],[60,22],[55,12],[42,12],[36,22]])
  // Japan
  poly([[130,31],[138,33],[140,38],[140,42],[134,44]])
  // Australia
  poly([[113,-12],[132,-12],[142,-15],[150,-23],[148,-30],[138,-35],[131,-34],[115,-34],[113,-25],[115,-20]])
  // New Zealand
  poly([[165,-34],[175,-34],[178,-42],[173,-46],[167,-46]])
  const data = c.getImageData(0, 0, W, H).data
  return { W, H, data }
}

function isLand(wm, lon, lat) {
  const px = Math.floor(((lon + 180) / 360) * wm.W)
  const py = Math.floor(((90 - lat) / 180) * wm.H)
  const idx = (py * wm.W + px) * 4
  return wm.data[idx] > 128
}

/* ── Generate sphere points with world map ── */
function sampleSpherePoints(count, radius, wm, landOnly) {
  const points = []
  let attempts = 0
  while (points.length < count && attempts < count * 20) {
    attempts++
    // Random point on sphere
    const u = Math.random() * 2 - 1
    const theta = Math.random() * Math.PI * 2
    const sinT = Math.sqrt(1 - u * u)
    const x = sinT * Math.cos(theta)
    const y = sinT * Math.sin(theta)
    const z = u

    // Convert to lat/lon
    const lat = Math.asin(z) * (180 / Math.PI)
    const lon = Math.atan2(y, x) * (180 / Math.PI)

    const onLand = isLand(wm, lon, lat)
    if (landOnly && !onLand) continue
    if (!landOnly && onLand) continue

    const r = radius + (Math.random() - .5) * .04  // tight = crisp sphere
    points.push({ x: x * r, y: y * r, z: z * r, lat, lon, land: onLand })
  }
  return points
}

/* ── Build InstancedMesh of triangles ── */
function buildScene(scene) {
  const wm = buildWorldMap()

  // Small triangle geometry (real 3D, not point sprite)
  const triGeo = new THREE.BufferGeometry()
  const s = 0.012 // 1/4 size — dense "stellar dust"
  const verts = new Float32Array([
    0, s * 1.15, 0,
    -s, -s * 0.6, 0,
    s, -s * 0.6, 0,
  ])
  triGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  triGeo.computeVertexNormals()

  // Material — simple, shows each triangle distinctly
  const mat = new THREE.MeshBasicMaterial({
    vertexColors: false,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.InstancedMesh(triGeo, mat, TOTAL)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  // Per-instance color
  const colors = new Float32Array(TOTAL * 3)

  // Land particles
  const landPts = sampleSpherePoints(LAND_COUNT, 2.5, wm, true)
  // Ocean particles (sparser, darker)
  const oceanPts = sampleSpherePoints(OCEAN_COUNT, 2.5, wm, false)
  // Scatter particles
  const scatterPts = []
  for (let i = 0; i < SCATTER_COUNT; i++) {
    scatterPts.push({
      x: (Math.random() - .5) * 16,
      y: (Math.random() - .5) * 12,
      z: (Math.random() - .5) * 10,
      land: false,
    })
  }

  const allPts = [...landPts, ...oceanPts, ...scatterPts]
  const dummy = new THREE.Object3D()
  const basePositions = new Float32Array(TOTAL * 3)
  const particleData = new Float32Array(TOTAL * 4) // random, isLand, isScatter, size

  allPts.forEach((p, i) => {
    const isScatter = i >= LAND_COUNT + OCEAN_COUNT
    const isLandP = i < LAND_COUNT

    basePositions[i * 3] = p.x
    basePositions[i * 3 + 1] = p.y
    basePositions[i * 3 + 2] = p.z

    // Color
    let col
    if (isLandP) {
      col = PALETTE_LAND[Math.floor(Math.random() * PALETTE_LAND.length)]
    } else if (!isScatter) {
      col = PALETTE_OCEAN[Math.floor(Math.random() * PALETTE_OCEAN.length)]
    } else {
      col = PALETTE_LAND[Math.floor(Math.random() * PALETTE_LAND.length)]
    }
    colors[i * 3] = col[0]
    colors[i * 3 + 1] = col[1]
    colors[i * 3 + 2] = col[2]

    // Size: uniform for orb (crisp), varied for scatter
    let scale
    if (isScatter) {
      scale = Math.random() * 1.2 + .3
    } else {
      scale = 1.0  // uniform size = no serration
    }

    particleData[i * 4] = Math.random()       // random seed
    particleData[i * 4 + 1] = isLandP ? 1 : 0 // isLand
    particleData[i * 4 + 2] = isScatter ? 1 : 0 // isScatter
    particleData[i * 4 + 3] = scale

    // Initial transform
    dummy.position.set(p.x, p.y, p.z)
    // Random rotation for each triangle
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    dummy.scale.setScalar(scale)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  })

  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
  mesh.instanceMatrix.needsUpdate = true

  scene.add(mesh)
  return { mesh, basePositions, particleData, dummy }
}

/* ── Simplex 3D noise (JS version for CPU animation) ── */
function noise3D(x, y, z) {
  // Simple pseudo-noise for CPU-side animation
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.543) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

export function WebGLBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const W = el.clientWidth, H = el.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, W / H, .1, 100)
    cam.position.set(0, 0, 7)
    cam.lookAt(0, 0, 0)

    const { mesh, basePositions, particleData, dummy } = buildScene(scene)

    // Animation state
    const state = {
      orbX: 3, orbY: 0, orbZ: 0,
      distortion: .2,
      transitionProgress: 0,  // 0=globe, 1=fully dispersed
      cascadeDelay: .3,
      dispersionRadius: 8,
      noiseIntensity: .5,
      globalOpacity: 1,
      rotY: 0,
      mouseX: 0, mouseY: 0,
      mouseTargetX: 0, mouseTargetY: 0,
      scrollY: 0,
    }

    // ScrollTrigger
    const triggers = []
    const t = (props, triggerOpts) => {
      triggers.push(gsap.to(state, { ...props, scrollTrigger: { scrub: 2.5, ...triggerOpts } }))
    }

    // Fold 1: orb RIGHT (default state)

    // Fold 2: drift LEFT
    t({ orbX: -3.5, orbY: .3, distortion: .6 },
      { trigger: '.section--tall', start: 'top bottom', end: 'bottom top' })

    // Fold 3: CENTER then CASCADE DISPERSION
    t({ orbX: 0, orbY: 0, orbZ: 1, distortion: .8 },
      { trigger: '#manifesto', start: 'top bottom', end: 'top center' })
    t({ transitionProgress: 1, cascadeDelay: .5, dispersionRadius: 10, noiseIntensity: .8, globalOpacity: .35 },
      { trigger: '#manifesto', start: 'top center', end: 'bottom center' })

    // Fold 4: reconverge
    t({ transitionProgress: 0, globalOpacity: 1, orbX: 2.5, orbY: -.5, orbZ: 0, distortion: .2 },
      { trigger: '#resultados', start: 'top bottom', end: 'bottom center' })

    // Fold 5: gentle pulse
    t({ distortion: .5 },
      { trigger: '#contato', start: 'top bottom', end: 'center center' })

    // Mouse
    const onMM = (e) => {
      state.mouseTargetX = (e.clientX / innerWidth - .5) * 6
      state.mouseTargetY = -(e.clientY / innerHeight - .5) * 6
    }
    addEventListener('mousemove', onMM, { passive: true })

    const onS = () => {
      const m = document.documentElement.scrollHeight - innerHeight
      state.scrollY = m > 0 ? scrollY / m : 0
    }
    addEventListener('scroll', onS, { passive: true })

    const onR = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
    }
    addEventListener('resize', onR)

    let raf
    const t0 = performance.now()

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const time = (performance.now() - t0) * .001

      // Lerp mouse
      state.mouseX += (state.mouseTargetX - state.mouseX) * .03
      state.mouseY += (state.mouseTargetY - state.mouseY) * .03

      // Rotation
      state.rotY = time * .08

      const cosR = Math.cos(state.rotY)
      const sinR = Math.sin(state.rotY)

      // Update each instance
      for (let i = 0; i < TOTAL; i++) {
        const bx = basePositions[i * 3]
        const by = basePositions[i * 3 + 1]
        const bz = basePositions[i * 3 + 2]
        const rnd = particleData[i * 4]
        const isLand = particleData[i * 4 + 1] > .5
        const isScatter = particleData[i * 4 + 2] > .5
        const scale = particleData[i * 4 + 3]

        let px, py, pz

        if (!isScatter) {
          // Orb particle
          px = bx + state.orbX
          py = by + state.orbY
          pz = bz + state.orbZ

          // Noise deformation (gentle, no jitter)
          const n = noise3D(bx * .2, by * .2, bz * .2)
          px += n * state.distortion * .08
          py += noise3D(by * .2, bz * .2, bx * .2) * state.distortion * .06
          pz += noise3D(bz * .2, bx * .2, by * .2) * state.distortion * .07

          // CASCADE DISPERSION (from BrainDispersionTransition)
          if (state.transitionProgress > 0) {
            // Cascade delay: top particles disperse FIRST (normalized Y 0-1)
            const normalizedY = (by + 2.5) / 5  // map sphere Y to 0-1
            const delay = (1 - normalizedY) * state.cascadeDelay
            const adjusted = Math.max(0, state.transitionProgress - delay)
            const tP = Math.min(adjusted / (1 - delay + .001), 1)

            // Parabolic dispersion path (not straight lines)
            const len = Math.sqrt(bx * bx + by * by + bz * bz) + .001
            const dirX = bx / len
            const dirY = by / len
            const dirZ = bz / len

            // Noise offset for curved paths
            const noX = noise3D(bx + time * .3, by, bz) * state.noiseIntensity
            const noY = noise3D(by, bz + time * .25, bx) * state.noiseIntensity
            const noZ = noise3D(bz, bx, by + time * .2) * state.noiseIntensity

            const finalDirX = dirX + noX
            const finalDirY = dirY + noY
            const finalDirZ = dirZ + noZ

            // Quadratic distance (parabolic curve, not linear)
            const dist = tP * tP * state.dispersionRadius

            px += finalDirX * dist
            py += finalDirY * dist
            pz += finalDirZ * dist
          }

          // Rotate around Y axis
          const rx = (px - state.orbX) * cosR - (pz - state.orbZ) * sinR + state.orbX
          const rz = (px - state.orbX) * sinR + (pz - state.orbZ) * cosR + state.orbZ
          px = rx
          pz = rz

        } else {
          // Scatter: drift toward camera
          px = bx + Math.sin(time * .1 + rnd * 20) * .3
          py = by + Math.cos(time * .08 + rnd * 15) * .2
          pz = ((bz + time * .2 * (.5 + rnd)) % 12) - 6
        }

        // Mouse influence
        const mdx = state.mouseX - px
        const mdy = state.mouseY - py
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy) + .001
        const mInfluence = Math.max(0, 1 - mdist / 4) * .2
        px += (mdx / mdist) * mInfluence
        py += (mdy / mdist) * mInfluence

        // Alpha with Fresnel effect for orb
        const depth01 = (pz + 5) / 10
        let alpha
        if (isScatter) {
          alpha = .03 + depth01 * .06
        } else {
          // Fresnel: edge particles glow brighter (3D silhouette)
          const olx = px - state.orbX
          const oly = py - state.orbY
          const olz = pz - state.orbZ
          const ol = Math.sqrt(olx*olx + oly*oly + olz*olz) + .001
          const viewDot = Math.abs(olz / ol)
          const fresnel = Math.pow(1 - viewDot, 1.6)
          // Inner rim glow: particles near the edge from inside also glow
          const innerRim = Math.pow(1 - viewDot, 3.0) * .4
          if (isLand) {
            // Continents: vibrant + strong inner edge definition
            alpha = (.3 + fresnel * .6 + innerRim) * (.7 + depth01 * .3)
          } else {
            // Ocean: hint of sphere shape at edges only
            alpha = (.01 + fresnel * .06 + innerRim * .15) * (.4 + depth01 * .6)
          }
        }

        // Apply global opacity
        alpha *= state.globalOpacity

        dummy.position.set(px, py, pz)
        // Fixed rotation per particle (no time = no vibration)
        dummy.rotation.x = rnd * Math.PI * 2
        dummy.rotation.y = (rnd * 7.13) % (Math.PI * 2)
        dummy.rotation.z = (rnd * 3.57) % (Math.PI * 2)
        dummy.scale.setScalar(scale * (.7 + alpha * .6))
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        // Update instance color alpha by modulating brightness
        mesh.instanceColor.array[i * 3] = mesh.instanceColor.array[i * 3] // keep base color
      }

      mesh.instanceMatrix.needsUpdate = true
      mesh.material.opacity = 1

      // Camera drift
      cam.position.y = -state.scrollY * 1.2
      cam.position.x = Math.sin(state.scrollY * Math.PI * 2) * .5

      renderer.render(scene, cam)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onS)
      removeEventListener('resize', onR)
      removeEventListener('mousemove', onMM)
      triggers.forEach(tr => tr.scrollTrigger?.kill())
      renderer.dispose()
      mesh.geometry.dispose()
      mesh.material.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={ref} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', width:'100vw', height:'100vh' }} />
}
