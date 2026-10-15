// The Safari, in three.js. Loaded lazily by the Car tab so the 720 KB of
// three.js never costs anything until someone opens that tab.
//
// createCar(canvas, { paint }) -> { setPaint, start, stop, dispose }

import * as THREE from "./three.module.min.js";

const PAINTS = {
  black:  { body: 0x0a0b0d, metal: 0.92, rough: 0.20 },
  white:  { body: 0xe9edf1, metal: 0.35, rough: 0.28 },
  grey:   { body: 0x4e5a66, metal: 0.75, rough: 0.26 },
  blue:   { body: 0x1f4e86, metal: 0.80, rough: 0.24 },
  mist:   { body: 0x7fb8b0, metal: 0.60, rough: 0.30 },
};

/* a studio gradient, drawn on a canvas, used as the reflection environment */
function studioEnv(renderer) {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 256;
  const g = cv.getContext("2d");
  const sky = g.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, "#eef4f7");
  sky.addColorStop(0.44, "#c3d6e2");
  sky.addColorStop(0.56, "#8095a3");
  sky.addColorStop(0.74, "#46545e");
  sky.addColorStop(1, "#1e2429");
  g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.beginPath(); g.ellipse(140, 54, 62, 22, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(368, 46, 40, 18, 0, 0, 7); g.fill();
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.fillRect(0, 168, 512, 6);
  const tex = new THREE.CanvasTexture(cv);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose(); tex.dispose();
  return env;
}

export function createCar(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.environment = studioEnv(renderer);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5a55, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd6e6, 1.2); rim.position.set(-6, 4, -6); scene.add(rim);

  const M = {
    paint:  new THREE.MeshPhysicalMaterial({ color: 0x0a0b0d, metalness: 0.92, roughness: 0.20,
              clearcoat: 1, clearcoatRoughness: 0.05 }),
    glass:  new THREE.MeshPhysicalMaterial({ color: 0x93aebc, metalness: 0.0, roughness: 0.14,
              clearcoat: 1, clearcoatRoughness: 0.04, side: THREE.DoubleSide }),
    trim:   new THREE.MeshStandardMaterial({ color: 0x2b3136, metalness: 0.3, roughness: 0.58 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8dde2, metalness: 1, roughness: 0.18 }),
    tyre:   new THREE.MeshStandardMaterial({ color: 0x1b1d1f, metalness: 0.06, roughness: 0.88 }),
    alloy:  new THREE.MeshStandardMaterial({ color: 0x555f68, metalness: 0.92, roughness: 0.26 }),
    red:    new THREE.MeshStandardMaterial({ color: 0xc0182b, metalness: 0.3, roughness: 0.35 }),
    lamp:   new THREE.MeshStandardMaterial({ color: 0xf3f7ff, emissive: 0xbcd4ff, emissiveIntensity: 0.9, roughness: 0.25 }),
    tail:   new THREE.MeshStandardMaterial({ color: 0xd41f2c, emissive: 0x8c0d16, emissiveIntensity: 0.9, roughness: 0.3 }),
  };

  const car = new THREE.Group();
  scene.add(car);

  const box = (w, h, d, mat, x = 0, y = 0, z = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.z = rz;
    car.add(m); return m;
  };
  const extrude = (pts, totalDepth, mat, bevel = 0.045) => {
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
    shape.closePath();
    // bevelThickness is added at BOTH ends, so shrink the core or the part
    // finishes 2*bevel wider than asked for and buries surface detail.
    const core = Math.max(0.02, totalDepth - 2 * bevel);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: core, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel,
      bevelSegments: 3, curveSegments: 6,
    });
    geo.translate(0, 0, -core / 2);
    const m = new THREE.Mesh(geo, mat);
    car.add(m); return m;
  };

  const W = 1.89, WB = 2.74, axleF = WB / 2, axleR = -WB / 2;

  // lower body
  extrude([
    [-2.30, 0.30], [-2.33, 0.62], [-2.33, 1.14], [-2.10, 1.20],
    [1.28, 1.20], [2.06, 1.11], [2.30, 1.00], [2.33, 0.60], [2.30, 0.30],
  ], W, M.paint, 0.05);
  // greenhouse
  extrude([
    [-2.28, 1.20], [-2.28, 1.62], [-2.10, 1.79], [0.56, 1.80], [0.66, 1.77], [1.30, 1.21],
  ], W - 0.05, M.paint, 0.045);
  box(2.62, 0.07, W - 0.10, M.paint, -0.98, 1.815, 0);
  box(2.00, 0.055, 0.075, M.trim, -1.08, 1.885,  0.70);
  box(2.00, 0.055, 0.075, M.trim, -1.08, 1.885, -0.70);

  // side glass
  const glassShape = [[-2.20, 1.28], [-2.20, 1.60], [-2.06, 1.71], [0.34, 1.72],
                      [0.48, 1.68], [0.66, 1.30]];
  {
    const s = new THREE.Shape();
    s.moveTo(glassShape[0][0], glassShape[0][1]);
    for (let i = 1; i < glassShape.length; i++) s.lineTo(glassShape[i][0], glassShape[i][1]);
    s.closePath();
    const geo = new THREE.ShapeGeometry(s);
    for (const z of [W / 2 + 0.004, -(W / 2 + 0.004)]) {
      const m = new THREE.Mesh(geo, M.glass); m.position.z = z; car.add(m);
    }
  }
  for (const z of [W / 2 + 0.012, -(W / 2 + 0.012)]) box(3.05, 0.028, 0.03, M.chrome, -0.78, 1.245, z);
  for (const z of [W / 2 + 0.014, -(W / 2 + 0.014)]) box(0.10, 0.46, 0.03, M.paint, -0.62, 1.49, z);
  {
    const dx = 0.56 - 1.30, dy = 1.79 - 1.21;
    box(Math.hypot(dx, dy), 0.03, W - 0.20, M.glass, (1.30 + 0.56) / 2, (1.21 + 1.79) / 2, 0, Math.atan2(dy, dx));
  }
  box(0.03, 0.44, W - 0.34, M.glass, -2.29, 1.46, 0);

  // cladding
  box(3.30, 0.15, 0.05, M.trim, -0.05, 0.375,  W / 2);
  box(3.30, 0.15, 0.05, M.trim, -0.05, 0.375, -W / 2);

  // bumpers, grille, lamps
  box(0.30, 0.44, W - 0.06, M.trim,  2.30, 0.52, 0);
  box(0.26, 0.40, W - 0.06, M.trim, -2.32, 0.50, 0);
  box(0.10, 0.30, 1.28, M.trim,   2.33, 1.00, 0);
  box(0.05, 0.055, 1.22, M.chrome, 2.36, 1.10, 0);
  box(0.06, 0.10, 0.52, M.lamp,   2.35, 0.99,  0.60);
  box(0.06, 0.10, 0.52, M.lamp,   2.35, 0.99, -0.60);
  box(0.05, 0.055, 0.46, M.lamp,  2.35, 1.16,  0.60);
  box(0.05, 0.055, 0.46, M.lamp,  2.35, 1.16, -0.60);
  box(0.05, 0.11, W - 0.22, M.tail, -2.36, 1.02, 0);

  // mirrors
  for (const z of [W / 2 + 0.14, -(W / 2 + 0.14)]) {
    box(0.10, 0.045, 0.16, M.trim, 0.74, 1.38, z);
    box(0.135, 0.115, 0.075, M.trim, 0.78, 1.42, z);
  }
  // red SAFARI badge
  for (const z of [W / 2 + 0.01, -(W / 2 + 0.01)]) box(0.34, 0.055, 0.02, M.red, 0.30, 1.02, z);

  // arches + wheels
  const wheelGeo = new THREE.CylinderGeometry(0.405, 0.405, 0.28, 28);
  const alloyGeo = new THREE.CylinderGeometry(0.275, 0.275, 0.325, 22);
  const spokeGeo = new THREE.BoxGeometry(0.32, 0.062, 0.345);
  const archGeo  = new THREE.TorusGeometry(0.505, 0.052, 6, 22, Math.PI);
  for (const x of [axleF, axleR]) {
    for (const [z, side] of [[W / 2 + 0.006, 1], [-W / 2 - 0.006, -1]]) {
      const a = new THREE.Mesh(archGeo, M.trim);
      a.position.set(x, 0.405, z); car.add(a);
      const g = new THREE.Group();
      const t = new THREE.Mesh(wheelGeo, M.tyre); t.rotation.x = Math.PI / 2; g.add(t);
      const r = new THREE.Mesh(alloyGeo, M.alloy); r.rotation.x = Math.PI / 2; g.add(r);
      for (let i = 0; i < 5; i++) {
        const sp = new THREE.Mesh(spokeGeo, M.alloy);
        sp.rotation.z = (i / 5) * Math.PI; g.add(sp);
      }
      const cal = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.20, 0.12), M.red);
      cal.position.set(0, 0.14, side * 0.035); g.add(cal);
      g.position.set(x, 0.405, z);
      car.add(g);
    }
  }

  // contact shadow
  {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const g2 = cv.getContext("2d");
    const rad = g2.createRadialGradient(128, 128, 10, 128, 128, 126);
    rad.addColorStop(0, "rgba(30,44,50,0.5)");
    rad.addColorStop(0.6, "rgba(30,44,50,0.2)");
    rad.addColorStop(1, "rgba(30,44,50,0)");
    g2.fillStyle = rad; g2.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; car.add(sh);
  }

  const target = new THREE.Vector3(-0.02, 0.92, 0);
  let yaw = -0.78, pitch = 0.20;
  const place = () => {
    car.rotation.y = yaw;
    const d = 10.6;
    camera.position.set(
      Math.sin(yaw) * d * Math.cos(pitch) + target.x,
      Math.sin(pitch) * d + target.y,
      Math.cos(yaw) * d * Math.cos(pitch) + target.z
    );
    camera.lookAt(target);
  };

  const resize = () => {
    const w = canvas.clientWidth || 320, h = canvas.clientHeight || 220;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    place();
    if (!running) renderer.render(scene, camera);
  };
  const ro = new ResizeObserver(resize);

  /* drag to spin */
  let dragging = false, lastX = 0, lastY = 0, auto = true;
  const down = (x, y) => { dragging = true; auto = false; lastX = x; lastY = y; canvas.style.cursor = "grabbing"; };
  const move = (x, y) => {
    if (!dragging) return;
    yaw -= (x - lastX) * 0.008;
    pitch = Math.max(-0.12, Math.min(0.62, pitch + (y - lastY) * 0.004));
    lastX = x; lastY = y; place();
    if (!running) renderer.render(scene, camera);
  };
  const up = () => { dragging = false; canvas.style.cursor = "grab"; };
  canvas.addEventListener("mousedown", (e) => down(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", up);
  canvas.addEventListener("touchstart", (e) => down(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener("touchmove", (e) => {
    move(e.touches[0].clientX, e.touches[0].clientY);
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  canvas.addEventListener("touchend", up);

  /* only animate while the tab is on screen */
  let running = false, raf = 0, last = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (auto && !dragging) { yaw -= dt * 0.3; place(); }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  const api = {
    setPaint(name) {
      const p = PAINTS[name] || PAINTS.black;
      M.paint.color.setHex(p.body);
      M.paint.metalness = p.metal;
      M.paint.roughness = p.rough;
      M.paint.needsUpdate = true;
      if (!running) renderer.render(scene, camera);
    },
    start() {
      if (running) return;
      running = true;
      ro.observe(canvas);
      resize();
      if (!reduced) { last = performance.now(); raf = requestAnimationFrame(loop); }
      else renderer.render(scene, camera);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf); raf = 0;
      ro.disconnect();
    },
    dispose() {
      api.stop();
      renderer.dispose();
    },
  };

  api.setPaint(opts.paint || "black");
  place();
  resize();
  return api;
}
