(() => {
  // DOM Elements
  const mapEl = document.getElementById("map");
  const timestampEl = document.getElementById("timestamp");
  const controlButtons = document.querySelectorAll(".js-set-map");

  // Map and Layer State
  let map;
  let currentLayer;
  let issMarker;
  let issPathPolyline;
  const issPathCoords = [];

  // Initialize Leaflet Map
  function initMap() {
    map = L.map(mapEl).setView([0, 0], 2);
    currentLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);

    // ISS Marker Icon
    const issIcon = L.icon({
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg",
      iconSize: [50, 32],
    });
    issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);

    // Polyline for tracking path
    issPathPolyline = L.polyline(issPathCoords, { color: "red" }).addTo(map);
  }

  // Fetch ISS Position
  async function fetchISSPosition() {
    try {
      const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    } catch (err) {
      console.error("Failed to fetch ISS position:", err);
      return null;
    }
  }

  // Update Marker, Path, and Timestamp
  async function refreshISS() {
    const data = await fetchISSPosition();
    if (!data) return;

    const { latitude, longitude } = data;
    const latlng = [latitude, longitude];

    // Update marker and map view
    issMarker.setLatLng(latlng);
    map.panTo(latlng, { animate: true, duration: 1.0 });

    // Extend path
    issPathCoords.push(latlng);
    issPathPolyline.addLatLng(latlng);

    // Update timestamp
    const now = new Date();
    timestampEl.textContent = `Last update: ${now.toLocaleTimeString()}`;
  }

  // Map style controls
  function bindControls() {
    controlButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        switchLayer(mode);
        controlButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  function switchLayer(mode) {
    if (currentLayer) map.removeLayer(currentLayer);
    const layerConfigs = {
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: "&copy; CartoDB",
      },
      light: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors",
      },
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "&copy; Esri",
      },
      flat: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenTopoMap",
      },
    };
    const cfg = layerConfigs[mode] || layerConfigs.light;
    currentLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution }).addTo(map);
  }

  // Initialization
  function init() {
    initMap();
    bindControls();
    // Default to dark mode
    document.querySelector(".js-set-map[data-mode='dark']").classList.add("active");
    setInterval(refreshISS, 5000);
  }

  document.addEventListener("DOMContentLoaded", init);
})(); // Is an IIFE (Immediately Invoked Function Expression), which provides a private scope to avoid global variables.
