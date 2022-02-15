      
//
      
      
      // Initialize and add the map
      function initMap() {
        // The location of tokyo
        const tokyo = { lat: 35.693889, lng: 139.704722 };
        // The map, centered at Uluru
        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 20,
          center: tokyo,
        });
        // The marker, positioned at tokyo
        const marker = new google.maps.Marker({
          position: tokyo,
          map: map,
        });
      }