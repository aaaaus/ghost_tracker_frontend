let nycMap
let allMarkers = []
let sightingPin
let demonRune
let redMarker

document.addEventListener('DOMContentLoaded', () => {


  //initialize map, set coordinates and zoom
  nycMap = L.map('nyc-map').setView([40.743, -74], 13);

  //add tile layer to map
  // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  //   	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  //   	maxZoom: 16
  // }).addTo(nycMap);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  	subdomains: 'abcd',
  	maxZoom: 19
  }).addTo(nycMap)

  nycMap.on('click', onMapClick);

  //custom leaflet icon

  demonRune = L.icon({
    iconUrl: 'assets/demon_rune_2.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [50, 47], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    shadowAnchor: [25, 25],  // the same for the shadow
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
  });

  redMarker = L.icon({
    iconUrl: 'assets/red_marker.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [25, 41], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
    shadowAnchor: [25, 25],  // the same for the shadow
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
  });

  //iterate through allSightings and create and render markers
  renderSightings = () => {
    allMarkers = []
    allSightings.forEach( s => {
      let newS = L.marker([parseFloat(s.lat), parseFloat(s.long)], {monsterId: s.monsterID, sightingId: s.id, icon: demonRune} ).addTo(nycMap).on('click', renderInfo);

      allMarkers.push(newS)

      newS.bindPopup(`
        <h3>${capitalizeName(s.entity)}</h3>
      `)
    })
  } //renderSightings

  const showAllButton = document.querySelector('#show-all')
  showAllButton.addEventListener('click', showAll)

  function onMarkerClick(event) {
    console.log(event.target);
  }


}) //DOMContentLoaded


function createFilterButtons() {
  const filterButtonDiv = document.querySelector('#filter-buttons')

  allMonsters.forEach((monster) => {
    const html = filterButtonRenderHTML(monster);
    filterButtonDiv.innerHTML += html
  })

  filterButtonDiv.addEventListener('click', monsterFilter)

}




//FILTER FUNCTIONS

function deleteMarkers() {
    allMarkers.forEach((marker) => {
      marker.remove();
    })
    console.log("DELETED ALL MARKERS");
}

function showAll() {
  deleteMarkers();
  allMarkers.forEach((marker) => {
    marker.addTo(nycMap);
  })
}

function monsterFilter(event) {
  deleteMarkers();
  filterSet = allMarkers.filter((marker) => {
  	return marker.options.monsterId === parseInt(event.target.id)
  })
  filterSet.forEach((marker) => {
    marker.addTo(nycMap);
  })
}

function filterButtonRenderHTML(monster) {
  return `
  <button type="button" name="button" id="${monster.id}">${monster.name}</button>`
}

// A few random functions

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeName(string) {
  return string.split(' ').map(word => capitalize(word)).join(' ')
}

function centerLocation(latlng) {
  nycMap.setView(new L.LatLng(latlng[0], latlng[1]), 18);
  // nycMap.panTo(new L.LatLng(latlng[0], latlng[1]))
}

// ON CLICK FUNCTIONS //

//listener and callback for map click; lat and long can be retreived from this function
function onMapClick(event) {
  //event.latlng.lat = latitude as integer
  //event.latlng.lng = longitude as integer
  getEditCreateCoords(event)
  clearSightingInfo()
}

function getEditCreateCoords(event) {
  if (!document.getElementById('create-form').classList.contains('no-display')) {
    document.getElementById('create-coords').innerHTML = `${event.latlng.lat}<br>${event.latlng.lng}`
    removePulseRed(document.getElementById('create-coords-p'))
    addCreateEditPin(event)
  } else if (!document.getElementById('edit-form').classList.contains('no-display')) {
    document.getElementById('edit-coords').innerHTML = `${event.latlng.lat}<br>${event.latlng.lng}`
    removePulseRed(document.getElementById('edit-coords-p'))
    addCreateEditPin(event)
  }
}

function clearSightingInfo() {
  const sightingInfo = document.getElementById('sighting-info')
  if (sightingInfo.classList.contains('drop-in-show')) {
    toggleInvisible(document.getElementById('exit-show'))
    dropOutShow(sightingInfo)
  }
}

function addCreateEditPin(event) {
  removeCreateEditPin()
  sightingPin = L.marker([parseFloat(event.latlng.lat), parseFloat(event.latlng.lng)]).addTo(nycMap);
}

function removeCreateEditPin() {
  if (sightingPin) {sightingPin.remove()}
}

// SIDE BAR DISPLAY

function renderInfo(event) {
    let selectedSighting
    selectedSighting = allSightings.find((sighting) => {
      return sighting.id === event.target.options.sightingId
    })
    renderInfoSidebar(selectedSighting)
}

function renderInfoSidebar(selectedSighting) {
  removeCreateEditPin()
  const sideBar = document.querySelector('#sighting-info')
  sideBar.innerHTML = renderSidebar(selectedSighting)
  if (sideBar.classList.contains('no-display')) {
    dropInShow(sideBar)
  }
  bindExitShow()
  bindDeleteShow()
  bindConfirmShow()
  dropOutCreate(document.getElementById('create-form'))
  dropOutCreate(document.getElementById('edit-form'))
  if (document.getElementById('open-create').classList.contains('no-display')) {
    toggleInvisible(document.getElementById('open-create'))
  }
}

function renderSidebar(sighting) {
  if (!sighting.confirmations) {sighting.confirmations = 666}
  return `<span id='exit-show' class='exit'>X</span><br>
  <h3>${capitalizeName(sighting.entity)}</h3>
  <img src=${sighting.image} width=300><br>
  <p>${sighting.description}</p>
  <p id='confirm-sighting' data-id=${sighting.id} data-confirms=${sighting.confirmations}>${sighting.confirmations} Confirmations</p>
  <p id='remove-sighting' data-id=${sighting.id}>Remove</p><br>
  <img style='height: 1.5em;' src='assets/inverted_pentagram_2.png'>
  `
}
