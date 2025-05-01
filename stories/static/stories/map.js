// --- ENSURE DOM IS READY BEFORE RUNNING ---
document.addEventListener('DOMContentLoaded', function() {
    // --- READ STORY POPUP LOGIC ---
    const readModal = document.getElementById('read-modal');
    const readOverlay = document.getElementById('read-overlay');
    const readClose = document.getElementById('read-close');

    function openReadModal(story, marker) {
        document.getElementById('read-modal-title').innerText = story.name;
        document.getElementById('read-modal-background').innerText = story.background;
        document.getElementById('read-modal-story').innerText = story.story;
        // Position the modal near the marker, but keep it inside the viewport
        let point = map.latLngToContainerPoint(marker.getLatLng());
        // Get map container offset
        const mapRect = map.getContainer().getBoundingClientRect();
        let left = point.x + 20;
        let top = point.y - 20;
        // Clamp to viewport
        const modalWidth = 350;
        const modalHeight = 250;
        if (left + modalWidth > mapRect.width) left = mapRect.width - modalWidth - 10;
        if (left < 0) left = 10;
        if (top + modalHeight > mapRect.height) top = mapRect.height - modalHeight - 10;
        if (top < 0) top = 10;
        readModal.style.left = left + 'px';
        readModal.style.top = top + 'px';
        readModal.style.position = 'absolute';
        readModal.style.display = 'block';
        readOverlay.style.display = 'block';
    }

    function closeReadModal() {
        readModal.style.display = 'none';
        readOverlay.style.display = 'none';
    }

    readClose.onclick = closeReadModal;
    readOverlay.onclick = closeReadModal;

    // --- LEAFLET MAP SETUP ---
    let map = L.map('map').setView([49.96311, -122.69533], 8);

    // Use ESRI Satellite tiles
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoIQ, and the GIS User Community'
    }).addTo(map);

    // Fetch existing stories and add markers to the map
    fetch('/api/stories/').then(response => response.json()).then(stories => {
        stories.forEach(addMarker);
    });

    // --- MODAL LOGIC FOR NEW STORY ---
    let modal = document.getElementById('story-modal');
    let overlay = document.getElementById('modal-overlay');
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    function openModal(lat, lng) {
        if (readModal.style.display === 'block') {
            closeReadModal();
        }
        document.getElementById('id_name').value = '';
        document.getElementById('id_background').value = '';
        document.getElementById('id_story').value = '';
        document.getElementById('modal-lat').value = lat;
        document.getElementById('modal-lng').value = lng;
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }

    document.getElementById('modal-close').onclick = closeModal;
    overlay.onclick = closeModal;

    document.getElementById('story-form').onsubmit = function(e) {
        e.preventDefault();

        let lat = document.getElementById('modal-lat').value;
        let lng = document.getElementById('modal-lng').value;

        fetch('/api/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                name: document.getElementById('id_name').value,
                background: document.getElementById('id_background').value,
                story: document.getElementById('id_story').value,
                latitude: lat,
                longitude: lng,
                indicator: document.getElementById('id_indicator') ? document.getElementById('id_indicator').value : ''
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            if (data.success) {
                addMarker(data.story);
                closeModal();
            } else {
                alert('Error: ' + JSON.stringify(data.errors));
            }
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('There was an error submitting your story. Please try again.');
        });
    }

    // --- ADD MARKER AND POPUP ---
    function addMarker(story) {
        let marker = L.marker([story.latitude, story.longitude]).addTo(map);
        marker.on('click', function(e) {
            openReadModal(story, marker); // Use custom modal for pin popup
        });
    }

    // --- MAP CLICK HANDLING ---
    map.on('click', function(e) {
        if (readModal.style.display === 'block') {
            closeReadModal();
        } else {
            openModal(e.latlng.lat, e.latlng.lng);
        }
    });

    // --- REMOVE ANY setBearing/ROTATION CODE ---
    // No setBearing or rotation logic present, so nothing to fix here.

    // --- ZOOM BUTTONS ---
    document.querySelectorAll('.zoom-button').forEach(button => {
        button.addEventListener('click', function() {
            const storyCard = button.closest('.story-card');
            const lat = parseFloat(storyCard.getAttribute('data-latitude'));
            const lng = parseFloat(storyCard.getAttribute('data-longitude'));
            zoomToPin(lat, lng);
        });
    });

    // --- ZOOM TO PIN ---
    function zoomToPin(lat, lng) {
        map.flyTo([lat, lng], 13, { duration: 10 });
    }
});