const campuses = {
  kampus1: {
    id: 'kampus1',
    name: 'UPN Veteran Yogyakarta Kampus I',
    shortName: 'Kampus I',
    area: 'Condongcatur',
    address: 'Jl. Padjajaran (Ring Road Utara) No.104, Ngropoh, Condongcatur, Depok, Sleman',
    lat: -7.762407706022189,
    lng: 110.41001963034431
  },
  kampus2: {
    id: 'kampus2',
    name: 'UPN Veteran Yogyakarta Kampus II',
    shortName: 'Kampus II',
    area: 'Babarsari',
    address: 'Jl. Babarsari Jl. Tambak Bayan No.2, Janti, Caturtunggal, Depok, Sleman',
    lat: -7.781994941847985,
    lng: 110.41466821126451
  }
};

const typeStyles = {
  putra: { color: '#2563eb', label: 'Kos Putra' },
  putri: { color: '#db2777', label: 'Kos Putri' },
  campur: { color: '#16a34a', label: 'Kos Campur' }
};

const state = {
  features: [],
  activeMarkers: [],
  selectedFacilities: new Set(),
  activeCampusKey: 'kampus1',
  pickMode: false,
  pickMarker: null
};

const savedInputKey = 'webgis-kos-upnvy-input';

const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([campuses.kampus1.lat, campuses.kampus1.lng], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const campusLayer = L.layerGroup().addTo(map);

const radiusLayers = [
  { radius: 1000, label: '1 km', color: '#176b55' },
  { radius: 2000, label: '2 km', color: '#eab308' },
  { radius: 3000, label: '3 km', color: '#ef4444' }
].map((item) => L.circle([campuses.kampus1.lat, campuses.kampus1.lng], {
  radius: item.radius,
  color: item.color,
  fillColor: item.color,
  fillOpacity: 0.035,
  weight: 2,
  dashArray: '6, 7'
}).addTo(map));

const markerLayer = L.layerGroup().addTo(map);

const elements = {
  landingPage: document.querySelector('#landingPage'),
  appShell: document.querySelector('#appShell'),
  openMapButtons: document.querySelectorAll('[data-open-map]'),
  homeButton: document.querySelector('#homeButton'),
  searchTabButton: document.querySelector('#searchTabButton'),
  inputTabButton: document.querySelector('#inputTabButton'),
  searchPage: document.querySelector('#searchPage'),
  inputPage: document.querySelector('#inputPage'),
  toggleSidebarButton: document.querySelector('#toggleSidebarButton'),
  pickLocationButton: document.querySelector('#pickLocationButton'),
  campusFocusButton: document.querySelector('#campusFocusButton'),
  themeButton: document.querySelector('#themeButton'),
  pickHint: document.querySelector('#pickHint'),
  searchInput: document.querySelector('#searchInput'),
  campusFilter: document.querySelector('#campusFilter'),
  typeFilter: document.querySelector('#typeFilter'),
  minPrice: document.querySelector('#minPrice'),
  maxPrice: document.querySelector('#maxPrice'),
  radiusFilter: document.querySelector('#radiusFilter'),
  resetButton: document.querySelector('#resetButton'),
  facilityFilters: document.querySelectorAll('.facilityFilter'),
  kosList: document.querySelector('#kosList'),
  resultCount: document.querySelector('#resultCount'),
  averagePrice: document.querySelector('#averagePrice'),
  activeFilterText: document.querySelector('#activeFilterText'),
  kosForm: document.querySelector('#kosForm'),
  clearSavedButton: document.querySelector('#clearSavedButton'),
  formMessage: document.querySelector('#formMessage'),
  newName: document.querySelector('#newName'),
  newAddress: document.querySelector('#newAddress'),
  newPrice: document.querySelector('#newPrice'),
  newType: document.querySelector('#newType'),
  newLat: document.querySelector('#newLat'),
  newLng: document.querySelector('#newLng'),
  newContact: document.querySelector('#newContact'),
  newFacilities: document.querySelectorAll('.newFacility')
};

function getActiveCampus() {
  return campuses[state.activeCampusKey] || campuses.kampus1;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function distanceInKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function getFeatureDistance(feature) {
  const [lng, lat] = feature.geometry.coordinates;
  const activeCampus = getActiveCampus();
  return distanceInKm(activeCampus.lat, activeCampus.lng, lat, lng);
}

function createGoogleMapsSearchUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function createGoogleMapsDirectionsUrl(lat, lng) {
  const activeCampus = getActiveCampus();
  return `https://www.google.com/maps/dir/?api=1&origin=${activeCampus.lat},${activeCampus.lng}&destination=${lat},${lng}&travelmode=walking`;
}

function createPopup(feature) {
  const props = feature.properties;
  const distance = getFeatureDistance(feature);
  const [lng, lat] = feature.geometry.coordinates;
  return `
    <div class="popup-body">
      <h3 class="popup-title">${props.nama}</h3>
      <p><strong>Alamat:</strong> ${props.alamat}</p>
      <p><strong>Harga:</strong> ${formatCurrency(props.harga)} / bulan</p>
      <p><strong>Jenis:</strong> ${toTitleCase(props.jenis)}</p>
      <p><strong>Fasilitas:</strong> ${props.fasilitas.join(', ')}</p>
      <p><strong>Kontak:</strong> ${props.kontak}</p>
      <p><strong>Jarak:</strong> ${distance.toFixed(2)} km dari ${getActiveCampus().shortName}</p>
      <div class="popup-actions">
        <a href="${createGoogleMapsSearchUrl(lat, lng)}" target="_blank" rel="noopener">Lihat Google Maps</a>
        <a href="${createGoogleMapsDirectionsUrl(lat, lng)}" target="_blank" rel="noopener">Rute dari Kampus</a>
      </div>
    </div>
  `;
}

function createCampusIcon(campus, isActive) {
  const background = isActive ? '#111827' : '#7c4a10';
  const ring = isActive ? '#d69e2e' : '#ffffff';

  return L.divIcon({
    className: 'campus-marker',
    html: `
      <div style="display:grid;width:36px;height:36px;place-items:center;color:#fff;font-size:12px;font-weight:900;border-radius:50%;background:${background};border:4px solid #fff;box-shadow:0 0 0 3px ${ring};">
        ${campus.shortName.replace('Kampus ', 'K')}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function renderCampusMarkers() {
  campusLayer.clearLayers();
  Object.values(campuses).forEach((campus) => {
    const isActive = campus.id === state.activeCampusKey;
    L.marker([campus.lat, campus.lng], {
      icon: createCampusIcon(campus, isActive)
    })
      .addTo(campusLayer)
      .bindPopup(`
        <strong>${campus.name}</strong><br>
        ${campus.address}<br>
        <div class="popup-actions">
          <button type="button" onclick="window.selectCampusFromPopup('${campus.id}')">Jadikan kampus acuan</button>
          <a href="${createGoogleMapsSearchUrl(campus.lat, campus.lng)}" target="_blank" rel="noopener">Google Maps</a>
        </div>
      `);
  });
}

function updateRadiusLayers() {
  const activeCampus = getActiveCampus();
  radiusLayers.forEach((layer) => {
    layer.setLatLng([activeCampus.lat, activeCampus.lng]);
  });
}

function setActiveCampus(campusKey, shouldFocus = true) {
  state.activeCampusKey = campusKey;
  elements.campusFilter.value = campusKey;
  renderCampusMarkers();
  updateRadiusLayers();
  applyFilters();

  if (shouldFocus) {
    focusCampus();
  }
}

function createMarker(feature) {
  const [lng, lat] = feature.geometry.coordinates;
  const style = typeStyles[feature.properties.jenis] || typeStyles.campur;

  return L.circleMarker([lat, lng], {
    radius: 9,
    color: '#ffffff',
    fillColor: style.color,
    fillOpacity: 0.95,
    weight: 2
  }).bindPopup(createPopup(feature));
}

function featureMatchesFilters(feature) {
  const props = feature.properties;
  const keyword = elements.searchInput.value.trim().toLowerCase();
  const selectedType = elements.typeFilter.value;
  const minPrice = Number(elements.minPrice.value) || 0;
  const maxPrice = Number(elements.maxPrice.value) || Infinity;
  const selectedRadius = elements.radiusFilter.value;
  const distance = getFeatureDistance(feature);

  const nameMatches = props.nama.toLowerCase().includes(keyword);
  const typeMatches = selectedType === 'semua' || props.jenis === selectedType;
  const priceMatches = props.harga >= minPrice && props.harga <= maxPrice;
  const radiusMatches = selectedRadius === 'semua' || distance <= Number(selectedRadius);
  const facilitiesMatch = [...state.selectedFacilities].every((facility) =>
    props.fasilitas.includes(facility)
  );

  return nameMatches && typeMatches && priceMatches && radiusMatches && facilitiesMatch;
}

function renderMarkers(features) {
  markerLayer.clearLayers();
  state.activeMarkers = features.map((feature) => {
    const marker = createMarker(feature);
    marker.addTo(markerLayer);
    return { feature, marker };
  });
}

function renderList(features) {
  elements.kosList.innerHTML = '';

  if (features.length === 0) {
    elements.kosList.innerHTML = '<p class="empty-state">Tidak ada kos yang sesuai filter.</p>';
    return;
  }

  features
    .sort((a, b) => getFeatureDistance(a) - getFeatureDistance(b))
    .forEach((feature) => {
      const props = feature.properties;
      const distance = getFeatureDistance(feature);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `kos-card type-${props.jenis}`;
      card.innerHTML = `
        <h3>${props.nama}</h3>
        <p>${props.alamat}</p>
        <p><strong>${formatCurrency(props.harga)}</strong> / bulan</p>
        <div class="card-meta">
          <span class="chip">${toTitleCase(props.jenis)}</span>
          <span class="chip">${distance.toFixed(2)} km</span>
          <span class="chip">${props.fasilitas.slice(0, 2).join(', ')}</span>
        </div>
      `;
      card.addEventListener('click', () => focusFeature(feature));
      elements.kosList.appendChild(card);
    });
}

function readSavedInputFeatures() {
  try {
    const raw = localStorage.getItem(savedInputKey);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Data input tersimpan tidak bisa dibaca.', error);
    return [];
  }
}

function saveInputFeatures(features) {
  localStorage.setItem(savedInputKey, JSON.stringify(features));
}

function createFeatureFromForm() {
  const facilities = [...elements.newFacilities]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  const lat = Number(elements.newLat.value);
  const lng = Number(elements.newLng.value);
  const price = Number(elements.newPrice.value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Latitude dan longitude harus berupa angka.');
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Koordinat latitude/longitude tidak valid.');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Harga harus berupa angka positif.');
  }

  return {
    type: 'Feature',
    properties: {
      id: `input-${Date.now()}`,
      nama: elements.newName.value.trim(),
      alamat: elements.newAddress.value.trim(),
      harga: price,
      jenis: elements.newType.value,
      fasilitas: facilities.length ? facilities : ['Belum diisi'],
      kontak: elements.newContact.value.trim() || 'Belum diisi'
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
}

function handleFormSubmit(event) {
  event.preventDefault();

  try {
    const newFeature = createFeatureFromForm();
    const savedFeatures = readSavedInputFeatures();
    savedFeatures.push(newFeature);
    saveInputFeatures(savedFeatures);

    state.features.push(newFeature);
    elements.kosForm.reset();
    elements.formMessage.textContent = 'Kos baru berhasil ditambahkan ke peta.';
    applyFilters();
    focusFeature(newFeature);
  } catch (error) {
    elements.formMessage.textContent = error.message;
  }
}

function clearSavedInput() {
  const hasSavedData = readSavedInputFeatures().length > 0;
  localStorage.removeItem(savedInputKey);
  state.features = state.features.filter((feature) => !feature.properties.id.startsWith('input-'));
  elements.formMessage.textContent = hasSavedData
    ? 'Data input dari browser sudah dihapus.'
    : 'Belum ada data input browser yang tersimpan.';
  applyFilters();
}

function focusFeature(feature) {
  const target = state.activeMarkers.find((item) => item.feature.properties.id === feature.properties.id);
  if (!target) return;

  const [lng, lat] = feature.geometry.coordinates;
  map.setView([lat, lng], 17, { animate: true });
  target.marker.openPopup();
}

function fillCoordinateInputs(latlng) {
  elements.newLat.value = latlng.lat.toFixed(6);
  elements.newLng.value = latlng.lng.toFixed(6);

  if (state.pickMarker) {
    state.pickMarker.setLatLng(latlng);
  } else {
    state.pickMarker = L.circleMarker(latlng, {
      radius: 11,
      color: '#ffffff',
      fillColor: '#f97316',
      fillOpacity: 0.95,
      weight: 3
    }).addTo(map);
  }

  state.pickMarker.bindPopup('Titik input kos baru').openPopup();
}

function setPickMode(isActive) {
  state.pickMode = isActive;
  elements.pickLocationButton.classList.toggle('is-active', isActive);
  elements.pickHint.classList.toggle('is-hidden', !isActive);
  map.getContainer().style.cursor = isActive ? 'crosshair' : '';
}

function handleMapClick(event) {
  if (!state.pickMode) return;

  fillCoordinateInputs(event.latlng);
  setPickMode(false);
  elements.formMessage.textContent = 'Koordinat dari peta sudah masuk ke form.';
  elements.newName.focus();
}

function updateSummary(features) {
  elements.resultCount.textContent = features.length;
  const average = features.length
    ? features.reduce((total, feature) => total + feature.properties.harga, 0) / features.length
    : 0;
  elements.averagePrice.textContent = formatCurrency(average);

  const radiusText = elements.radiusFilter.value === 'semua'
    ? `${getActiveCampus().shortName}`
    : `${getActiveCampus().shortName}, radius ${elements.radiusFilter.value} km`;
  elements.activeFilterText.textContent = radiusText;
}

function applyFilters() {
  const filtered = state.features.filter(featureMatchesFilters);
  renderMarkers(filtered);
  renderList(filtered);
  updateSummary(filtered);

  if (filtered.length > 0) {
    const group = L.featureGroup(state.activeMarkers.map((item) => item.marker));
    map.fitBounds(group.getBounds().pad(0.24), { maxZoom: 16 });
  }
}

function resetFilters() {
  elements.searchInput.value = '';
  elements.typeFilter.value = 'semua';
  elements.minPrice.value = '';
  elements.maxPrice.value = '';
  elements.radiusFilter.value = 'semua';
  state.selectedFacilities.clear();
  elements.facilityFilters.forEach((checkbox) => {
    checkbox.checked = false;
  });
  applyFilters();
}

function focusCampus() {
  const activeCampus = getActiveCampus();
  map.setView([activeCampus.lat, activeCampus.lng], 16, { animate: true });
}

function addLegend() {
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <h4>Legenda</h4>
      ${Object.entries(typeStyles)
        .map(([type, style]) => `
          <div class="legend-row">
            <span class="legend-dot" style="background:${style.color}"></span>
            <span>${style.label}</span>
          </div>
        `)
        .join('')}
      <div class="legend-row">
        <span class="legend-dot" style="background:#111827"></span>
        <span>Kampus UPNVY</span>
      </div>
    `;
    return div;
  };
  legend.addTo(map);
}

function showWebgis(pageName = 'search') {
  elements.landingPage.classList.add('is-hidden');
  elements.appShell.classList.remove('is-hidden');
  window.location.hash = 'webgis';
  showSidebarPage(pageName);
  setTimeout(() => {
    map.invalidateSize();
    applyFilters();
  }, 80);
}

function showLanding() {
  elements.appShell.classList.add('is-hidden');
  elements.landingPage.classList.remove('is-hidden');
  if (window.location.hash === '#webgis') {
    history.replaceState(null, '', window.location.pathname);
  }
}

function showSidebarPage(pageName) {
  const isInput = pageName === 'input';
  elements.searchPage.classList.toggle('is-hidden', isInput);
  elements.inputPage.classList.toggle('is-hidden', !isInput);
  elements.searchTabButton.classList.toggle('is-active', !isInput);
  elements.inputTabButton.classList.toggle('is-active', isInput);

  if (!isInput) {
    applyFilters();
  }

  setTimeout(() => map.invalidateSize(), 80);
}

function bindEvents() {
  [
    elements.searchInput,
    elements.typeFilter,
    elements.minPrice,
    elements.maxPrice,
    elements.radiusFilter
  ].forEach((element) => {
    element.addEventListener('input', applyFilters);
    element.addEventListener('change', applyFilters);
  });

  elements.campusFilter.addEventListener('change', () => {
    setActiveCampus(elements.campusFilter.value);
  });

  elements.facilityFilters.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.selectedFacilities.add(checkbox.value);
      } else {
        state.selectedFacilities.delete(checkbox.value);
      }
      applyFilters();
    });
  });

  elements.resetButton.addEventListener('click', resetFilters);
  elements.kosForm.addEventListener('submit', handleFormSubmit);
  elements.clearSavedButton.addEventListener('click', clearSavedInput);
  elements.searchTabButton.addEventListener('click', () => showSidebarPage('search'));
  elements.inputTabButton.addEventListener('click', () => showSidebarPage('input'));
  elements.toggleSidebarButton.addEventListener('click', () => {
    elements.appShell.classList.toggle('sidebar-collapsed');
    setTimeout(() => map.invalidateSize(), 260);
  });
  elements.pickLocationButton.addEventListener('click', () => {
    setPickMode(!state.pickMode);
  });
  elements.campusFocusButton.addEventListener('click', focusCampus);
  elements.themeButton.addEventListener('click', () => {
    document.body.classList.toggle('contrast-mode');
    elements.themeButton.classList.toggle('is-active');
  });
  map.on('click', handleMapClick);
  elements.openMapButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showWebgis(button.dataset.targetPage || 'search');
    });
  });
  elements.homeButton.addEventListener('click', showLanding);
}

async function loadKosData() {
  try {
    const response = await fetch('data/kos.geojson');
    if (!response.ok) {
      throw new Error('Data GeoJSON tidak ditemukan.');
    }
    const geojson = await response.json();
    state.features = [...geojson.features, ...readSavedInputFeatures()];
    applyFilters();
  } catch (error) {
    elements.kosList.innerHTML = `
      <p class="empty-state">
        Gagal memuat data kos. Jalankan proyek dengan Live Server atau server lokal.
      </p>
    `;
    console.error(error);
  }
}

addLegend();
bindEvents();
loadKosData();
renderCampusMarkers();
updateRadiusLayers();

window.selectCampusFromPopup = function (campusKey) {
  setActiveCampus(campusKey);
};

if (window.location.hash === '#webgis') {
  showWebgis('search');
}
