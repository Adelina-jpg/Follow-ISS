// Leaflet-Karte starten
const map = L.map('map').setView([0, 0], 2); // Weltkarte

let currentLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Marker für die ISS
const issIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 32],
});

const issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);
let issPath = []; // Flugroute

// ISS-Standort abrufen und aktualisieren
async function updateISS() {
  const url = 'https://api.wheretheiss.at/v1/satellites/25544';
  const response = await fetch(url);
  const data = await response.json();
  const { latitude, longitude } = data;

  // Marker-Position setzen
  issMarker.setLatLng([latitude, longitude]);

  // Karte bewegen
  map.setView([latitude, longitude], map.getZoom());

  // Flugroute erweitern
  issPath.push([latitude, longitude]);
  L.polyline(issPath, { color: 'red' }).addTo(map);

  // Zeitstempel aktualisieren 
  const timeElem = document.getElementById('timestamp');
  if (timeElem) {
    const now = new Date();
    timeElem.textContent = `Last update: ${now.toLocaleTimeString()}`;
  }
}

// Alle 5 Sekunden aktualisieren
setInterval(updateISS, 5000);

// Karten-Design ändern
function setMap(mode) {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  let url = '';
  let attribution = '';
  switch (mode) {
    case 'dark':
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CartoDB';
      break;
    case 'light':
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      break;
    case 'satellite':
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri';
      break;
    case 'flat':
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap';
      break;
  }

  currentLayer = L.tileLayer(url, { attribution });
  currentLayer.addTo(map);
}

// Standard-Stil setzen
setMap('dark');

// Aktive Klasse auf den geklickten Button setzen
const buttons = document.querySelectorAll('.map-controls button');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});