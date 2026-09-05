(function () {
  const canvas = document.getElementById('bg3d');
  if (!canvas || typeof THREE === 'undefined') return;

  let renderer, scene, camera, group, gems = [];
  const clock = new THREE.Clock();

  const COL_WINE = 0xd43d5c;
  const COL_WINE_DEEP = 0x8a1435;
  const COL_GOLD = 0xd4a84b;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  group = new THREE.Group();
  scene.add(group);

  // Neural constellation
  const COUNT = window.innerWidth < 640 ? 60 : 130;
  const positions = new Float32Array(COUNT * 3);
  const nodePts = [];
  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random() - 0.5) * 26;
    const y = (Math.random() - 0.5) * 16;
    const z = (Math.random() - 0.5) * 18 - 4;
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    nodePts.push(new THREE.Vector3(x, y, z));
  }
  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const ptsMat = new THREE.PointsMaterial({ color: COL_GOLD, size: 0.09, transparent: true, opacity: 0.85, sizeAttenuation: true });
  group.add(new THREE.Points(ptsGeo, ptsMat));

  const linkPositions = [];
  const MAXD = 4.6;
  for (let i = 0; i < nodePts.length; i++) {
    let linksForNode = 0;
    for (let j = i + 1; j < nodePts.length; j++) {
      if (linksForNode >= 3) break;
      if (nodePts[i].distanceTo(nodePts[j]) < MAXD) {
        linkPositions.push(nodePts[i].x, nodePts[i].y, nodePts[i].z, nodePts[j].x, nodePts[j].y, nodePts[j].z);
        linksForNode++;
      }
    }
  }
  const linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPositions), 3));
  const linkMat = new THREE.LineBasicMaterial({ color: COL_WINE, transparent: true, opacity: 0.16 });
  group.add(new THREE.LineSegments(linkGeo, linkMat));

  // Floating gem cluster
  const gemGeos = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.TetrahedronGeometry(1.1, 0),
    new THREE.TorusKnotGeometry(0.7, 0.22, 90, 12)
  ];
  const gemSpecs = [
    { pos: [-6, 2.2, -6], scale: 1.4, color: COL_WINE, wire: false },
    { pos: [6.5, -1.5, -9], scale: 1.1, color: COL_GOLD, wire: false },
    { pos: [-4.5, -3, -14], scale: 1.8, color: COL_WINE_DEEP, wire: true },
    { pos: [5, 3.2, -18], scale: 1.6, color: COL_GOLD, wire: true },
  ];
  gemSpecs.forEach((spec, i) => {
    const geo = gemGeos[i % gemGeos.length];
    const mat = spec.wire
      ? new THREE.MeshBasicMaterial({ color: spec.color, wireframe: true, transparent: true, opacity: 0.5 })
      : new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.35, metalness: 0.6, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...spec.pos);
    mesh.scale.setScalar(spec.scale);
    mesh.userData.spin = { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15 };
    group.add(mesh);
    gems.push(mesh);
  });

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const point1 = new THREE.PointLight(COL_WINE, 2.2, 40);
  point1.position.set(-8, 4, 4);
  const point2 = new THREE.PointLight(COL_GOLD, 2, 40);
  point2.position.set(8, -3, 2);
  scene.add(ambient, point1, point2);

  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    group.rotation.y = mouseX * 0.12;
    group.rotation.x = mouseY * 0.08;

    gems.forEach(g => {
      g.rotation.x += g.userData.spin.x * dt;
      g.rotation.y += g.userData.spin.y * dt;
    });

    renderer.render(scene, camera);
  }
  animate();
})();