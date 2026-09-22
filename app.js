(function () {
  "use strict";

  var state = {
    map: null,
    markerLayer: null,
    places: [],
    filtered: [],
    selectedId: null,
    userLocation: null,
    userMarker: null,
    nearbyLoaded: false
  };

  var dom = {
    venueCount: document.getElementById("venueCount"),
    resultCount: document.getElementById("resultCount"),
    venueList: document.getElementById("venueList"),
    mapStatus: document.getElementById("mapStatus"),
    searchInput: document.getElementById("searchInput"),
    regionFilter: document.getElementById("regionFilter"),
    priceFilter: document.getElementById("priceFilter"),
    sortFilter: document.getElementById("sortFilter"),
    locateMe: document.getElementById("locateMe"),
    locateMeHero: document.getElementById("locateMeHero"),
    locationSummary: document.getElementById("locationSummary"),
    quickDate: document.getElementById("quickDate"),
    quickParty: document.getElementById("quickParty"),
    quickNearbySearch: document.getElementById("quickNearbySearch"),
    reloadPlaces: document.getElementById("reloadPlaces"),
    bookingVenue: document.getElementById("bookingVenue"),
    bookingDate: document.getElementById("bookingDate"),
    partySize: document.getElementById("partySize"),
    availabilityForm: document.getElementById("availabilityForm"),
    slotTitle: document.getElementById("slotTitle"),
    slotResults: document.getElementById("slotResults")
  };

  function safe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeUrl(value) {
    var raw = String(value || "").trim();
    if (!raw || /^(yes|no)$/i.test(raw)) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^www\./i.test(raw)) return "https://" + raw;
    return "";
  }

  function distanceKm(lat1, lon1, lat2, lon2) {
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var earth = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function updateDistances() {
    if (!state.userLocation) return;
    state.places.forEach(function (place) {
      place.distanceKm = distanceKm(
        state.userLocation.lat,
        state.userLocation.lon,
        place.lat,
        place.lon
      );
    });
  }

  function mapSearchUrl(place) {
    return "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(place.name + " " + (place.address || ""));
  }

  function bookingSearchUrl(place) {
    return "https://www.google.com/search?q=" +
      encodeURIComponent(place.name + " " + (place.address || "") + " 訂位");
  }

  function bookingHref(place) {
    return normalizeUrl(place.bookingUrl) || normalizeUrl(place.website) || bookingSearchUrl(place);
  }

  function bookingLabel(place) {
    if (normalizeUrl(place.bookingUrl)) return "直接訂位";
    if (normalizeUrl(place.website)) return "官網 / 訂位";
    return "搜尋訂位";
  }

  function initMap() {
    if (!window.L) {
      dom.mapStatus.textContent = "地圖元件載入失敗，請重新整理頁面";
      return;
    }

    state.map = L.map("map", {
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 6
    }).setView([23.72, 120.96], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(state.map);

    state.markerLayer = L.layerGroup().addTo(state.map);
  }

  function regionFromCoords(lat, lon) {
    if (lon > 121.25 && lat < 24.55) return "east";
    if (lat >= 24.25) return "north";
    if (lat >= 23.45) return "central";
    return "south";
  }

  function regionLabel(region) {
    return {
      north: "北部",
      central: "中部",
      south: "南部",
      east: "東部"
    }[region] || "台灣";
  }

  function formatAddress(tags) {
    var parts = [
      tags["addr:city"],
      tags["addr:district"],
      tags["addr:street"],
      tags["addr:housenumber"]
    ].filter(Boolean);
    return parts.length ? parts.join("") : "地址待 OpenStreetMap 補充";
  }

  function getPrice(tags) {
    var raw = tags.price_range || tags.price || tags.charge || "";
    var normalized = String(raw).trim();
    if (!normalized) return { tier: "unknown", label: "價位待確認" };
    if (/^\$\$\$/.test(normalized)) return { tier: "$$$", label: normalized };
    if (/^\$\$/.test(normalized)) return { tier: "$$", label: normalized };
    if (/^\$/.test(normalized)) return { tier: "$", label: normalized };
    return { tier: "unknown", label: normalized };
  }

  function featuresFromTags(tags) {
    var features = [];
    var cuisine = tags.cuisine || "";
    var text = cuisine.toLowerCase();

    if (/yakiniku/.test(text)) features.push("日式燒肉");
    if (/korean/.test(text)) features.push("韓式烤肉");
    if (/barbecue|bbq|grill/.test(text)) features.push("BBQ");
    if (tags.outdoor_seating === "yes") features.push("戶外座位");
    if (tags.reservation === "yes") features.push("可預約");
    if (tags.wheelchair === "yes") features.push("無障礙");
    if (tags.takeaway === "yes") features.push("可外帶");
    if (!features.length) features.push("燒肉 / 烤肉");
    return features.slice(0, 4);
  }

  function transformElement(el) {
    var tags = el.tags || {};
    var lat = el.lat || (el.center && el.center.lat);
    var lon = el.lon || (el.center && el.center.lon);
    if (!lat || !lon || !tags.name) return null;

    var price = getPrice(tags);
    return {
      id: el.type + "-" + el.id,
      name: tags.name,
      lat: Number(lat),
      lon: Number(lon),
      address: formatAddress(tags),
      region: regionFromCoords(Number(lat), Number(lon)),
      cuisine: tags.cuisine || "",
      openingHours: tags.opening_hours || "營業時間待確認",
      phone: tags.phone || tags["contact:phone"] || "",
      website: normalizeUrl(tags.website || tags["contact:website"] || ""),
      bookingUrl: normalizeUrl(
        tags["reservation:url"] ||
        tags["contact:reservation"] ||
        tags["contact:booking"] ||
        tags.booking ||
        ""
      ),
      features: featuresFromTags(tags),
      priceTier: price.tier,
      priceLabel: price.label,
      source: "OpenStreetMap"
    };
  }

  async function fetchOverpass(url, query) {
    var response = await fetch(url + "?data=" + encodeURIComponent(query), {
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.json();
  }

  async function loadPlaces() {
    dom.reloadPlaces.disabled = true;
    dom.mapStatus.textContent = "正在從 OpenStreetMap / Overpass 抓取台灣燒烤店…";
    dom.venueList.innerHTML = '<div class="empty-card">正在載入店家資料…</div>';

    var query = [
      "[out:json][timeout:25];",
      'area["ISO3166-1"="TW"][admin_level=2]->.tw;',
      "(",
      'nwr["amenity"="restaurant"]["cuisine"~"barbecue|bbq|yakiniku|grill|korean_barbecue",i](area.tw);',
      'nwr["amenity"="restaurant"]["name"~"燒肉|烤肉|炭火|BBQ|Barbecue|Yakiniku",i](area.tw);',
      ");",
      "out center tags;"
    ].join("");

    var endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];

    var data = null;
    var lastError = null;

    for (var i = 0; i < endpoints.length; i += 1) {
      try {
        data = await fetchOverpass(endpoints[i], query);
        if (data && Array.isArray(data.elements)) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!data || !Array.isArray(data.elements)) {
      dom.mapStatus.textContent = "公開地圖服務目前沒有回應，可稍後按「重新抓取地圖資料」";
      dom.venueList.innerHTML = '<div class="empty-card">暫時無法取得店家。這不影響下方 3 分鐘烤肉遊戲。</div>';
      dom.reloadPlaces.disabled = false;
      console.warn(lastError);
      return;
    }

    var unique = new Map(state.places.map(function (place) { return [place.id, place]; }));
    data.elements.forEach(function (el) {
      var place = transformElement(el);
      if (place) unique.set(place.id, place);
    });

    state.places = Array.from(unique.values())
      .sort(function (a, b) { return a.name.localeCompare(b.name, "zh-Hant"); })
      .slice(0, 500);
    updateDistances();

    dom.venueCount.textContent = state.places.length;
    dom.mapStatus.textContent = "已載入 " + state.places.length + " 間公開地圖資料；店家資料仍可能有缺漏";
    dom.reloadPlaces.disabled = false;

    populateBookingVenues();
    applyFilters();
  }

  async function loadNearbyPlaces(lat, lon) {
    dom.mapStatus.textContent = "正在搜尋你附近 12 公里的烤肉店…";

    var radius = 12000;
    var query = [
      "[out:json][timeout:20];",
      "(",
      'nwr(around:' + radius + "," + lat + "," + lon + ')["amenity"="restaurant"]["cuisine"~"barbecue|bbq|yakiniku|grill|korean_barbecue",i];',
      'nwr(around:' + radius + "," + lat + "," + lon + ')["amenity"="restaurant"]["name"~"燒肉|烤肉|炭火|BBQ|Barbecue|Yakiniku",i];',
      ");",
      "out center tags;"
    ].join("");

    var endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];
    var data = null;

    for (var i = 0; i < endpoints.length; i += 1) {
      try {
        data = await fetchOverpass(endpoints[i], query);
        if (data && Array.isArray(data.elements)) break;
      } catch (error) {
        console.warn("Nearby Overpass failed", error);
      }
    }

    if (!data || !Array.isArray(data.elements)) {
      dom.mapStatus.textContent = "已取得你的位置，但附近店家服務暫時無法連線；仍可使用全台資料";
      return;
    }

    var merged = new Map(state.places.map(function (place) { return [place.id, place]; }));
    data.elements.forEach(function (el) {
      var place = transformElement(el);
      if (place) merged.set(place.id, place);
    });

    state.places = Array.from(merged.values()).slice(0, 500);
    state.nearbyLoaded = true;
    updateDistances();
    populateBookingVenues();
    applyFilters();

    var nearbyCount = state.places.filter(function (place) {
      return Number.isFinite(place.distanceKm) && place.distanceKm <= 12;
    }).length;

    dom.mapStatus.textContent = "已找到 " + nearbyCount + " 間距離你 12 公里內的公開烤肉店資料";
  }

  function requestUserLocation(scrollToMap) {
    if (!navigator.geolocation) {
      dom.locationSummary.textContent = "此瀏覽器不支援定位";
      dom.mapStatus.textContent = "無法使用定位功能，仍可瀏覽全台店家";
      return;
    }

    dom.locationSummary.textContent = "正在取得目前位置…";
    if (dom.locateMe) dom.locateMe.disabled = true;
    if (dom.locateMeHero) dom.locateMeHero.disabled = true;

    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      state.userLocation = { lat: lat, lon: lon };
      dom.locationSummary.textContent = "已取得位置 · 優先顯示最近店家";
      dom.sortFilter.value = "nearby";
      updateDistances();

      if (state.map) {
        if (state.userMarker) state.map.removeLayer(state.userMarker);
        state.userMarker = L.circleMarker([lat, lon], {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#2f86ff",
          fillOpacity: 1
        }).addTo(state.map).bindPopup("你目前的位置");
        state.map.setView([lat, lon], 13);
      }

      applyFilters();
      loadNearbyPlaces(lat, lon);

      if (scrollToMap) {
        document.getElementById("map-section").scrollIntoView({ behavior: "smooth" });
      }

      if (dom.locateMe) dom.locateMe.disabled = false;
      if (dom.locateMeHero) dom.locateMeHero.disabled = false;
    }, function (error) {
      var message = "未開啟定位 · 可繼續瀏覽全台";
      if (error && error.code === 1) message = "定位權限未開啟 · 可手動瀏覽全台";
      dom.locationSummary.textContent = message;
      dom.mapStatus.textContent = "未取得位置，店家清單會以全台資料顯示";
      if (dom.sortFilter) dom.sortFilter.value = "name";
      if (dom.locateMe) dom.locateMe.disabled = false;
      if (dom.locateMeHero) dom.locateMeHero.disabled = false;
      applyFilters();
    }, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    });
  }

  function matchesFilters(place) {
    var keyword = dom.searchInput.value.trim().toLowerCase();
    var region = dom.regionFilter.value;
    var price = dom.priceFilter.value;

    var haystack = [
      place.name,
      place.address,
      place.cuisine,
      place.features.join(" ")
    ].join(" ").toLowerCase();

    return (!keyword || haystack.indexOf(keyword) !== -1) &&
      (region === "all" || place.region === region) &&
      (price === "all" || place.priceTier === price);
  }

  function applyFilters() {
    state.filtered = state.places.filter(matchesFilters);

    if (dom.sortFilter && dom.sortFilter.value === "nearby" && state.userLocation) {
      state.filtered.sort(function (a, b) {
        var da = Number.isFinite(a.distanceKm) ? a.distanceKm : Infinity;
        var db = Number.isFinite(b.distanceKm) ? b.distanceKm : Infinity;
        return da - db;
      });
    } else {
      state.filtered.sort(function (a, b) {
        return a.name.localeCompare(b.name, "zh-Hant");
      });
    }

    dom.resultCount.textContent = state.filtered.length + " 間";
    renderList();
    renderMarkers();
  }

  function renderList() {
    if (!state.filtered.length) {
      dom.venueList.innerHTML = '<div class="empty-card">沒有符合條件的店家，試著放寬篩選</div>';
      return;
    }

    dom.venueList.innerHTML = state.filtered.slice(0, 120).map(function (place) {
      var tags = place.features.map(function (f) {
        return '<span class="tag">' + safe(f) + "</span>";
      }).join("");

      var distance = Number.isFinite(place.distanceKm)
        ? (place.distanceKm < 1 ? Math.round(place.distanceKm * 1000) + " m" : place.distanceKm.toFixed(1) + " km")
        : "";
      var booking = bookingHref(place);
      var official = normalizeUrl(place.website);
      var phoneLine = place.phone ? " · " + safe(place.phone) : "";

      return '<article class="venue-card' + (state.selectedId === place.id ? " active" : "") + '" data-id="' + safe(place.id) + '">' +
        '<div class="venue-card-top">' +
          '<div><h3>' + safe(place.name) + '</h3>' +
          (distance ? '<span class="distance-tag">📍 ' + safe(distance) + ' 距離你</span>' : '') + '</div>' +
          '<span class="price-tag">' + safe(place.priceLabel) + "</span>" +
        "</div>" +
        '<div class="venue-meta">' + safe(regionLabel(place.region)) + " · " + safe(place.address) +
          "<br>" + safe(place.openingHours) + phoneLine + "</div>" +
        '<div class="venue-tags">' + tags + "</div>" +
        '<div class="venue-actions venue-actions-links">' +
          '<a class="venue-action primary" href="' + safe(booking) + '" target="_blank" rel="noopener noreferrer">🗓 ' + safe(bookingLabel(place)) + '</a>' +
          '<button type="button" data-action="map">地圖定位</button>' +
          '<a class="venue-action" href="' + safe(mapSearchUrl(place)) + '" target="_blank" rel="noopener noreferrer">Google 地圖</a>' +
          (official ? '<a class="venue-action" href="' + safe(official) + '" target="_blank" rel="noopener noreferrer">官網</a>' : '') +
        "</div>" +
      "</article>";
    }).join("");
  }

  function markerIcon() {
    return L.divIcon({
      className: "",
      html: '<div class="bbq-marker"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 28],
      popupAnchor: [0, -28]
    });
  }

  function renderMarkers() {
    if (!state.map || !state.markerLayer) return;
    state.markerLayer.clearLayers();

    var bounds = [];
    state.filtered.slice(0, 300).forEach(function (place) {
      var marker = L.marker([place.lat, place.lon], { icon: markerIcon() })
        .bindPopup(
          "<strong>" + safe(place.name) + "</strong><br>" +
          safe(place.address) + "<br>" +
          '<span style="color:#ffb36b">' + safe(place.priceLabel) + "</span>" +
          (Number.isFinite(place.distanceKm) ? "<br>距離你 " + safe(place.distanceKm.toFixed(1)) + " km" : "") +
          '<br><a href="' + safe(bookingHref(place)) + '" target="_blank" rel="noopener noreferrer" style="color:#ffb36b;font-weight:700">前往訂位</a>'
        )
        .on("click", function () {
          selectVenue(place.id, false);
        });
      marker.addTo(state.markerLayer);
      bounds.push([place.lat, place.lon]);
    });

    if (state.userLocation && dom.sortFilter && dom.sortFilter.value === "nearby") {
      state.map.setView([state.userLocation.lat, state.userLocation.lon], 12);
    } else if (bounds.length && state.filtered.length < 80) {
      state.map.fitBounds(bounds, { padding: [34, 34], maxZoom: 13 });
    } else {
      state.map.setView([23.72, 120.96], 7);
    }
  }

  function selectVenue(id, zoom) {
    var place = state.places.find(function (p) { return p.id === id; });
    if (!place) return;
    state.selectedId = id;
    dom.bookingVenue.value = id;
    renderList();

    if (zoom !== false && state.map) {
      state.map.setView([place.lat, place.lon], 15);
    }
  }

  function populateBookingVenues() {
    var options = ['<option value="">選擇店家</option>'];
    state.places.slice(0, 450).forEach(function (place) {
      options.push('<option value="' + safe(place.id) + '">' + safe(place.name) + "</option>");
    });
    dom.bookingVenue.innerHTML = options.join("");
  }

  function setDefaultBookingDate() {
    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dom.bookingDate.min = local.toISOString().slice(0, 10);
    dom.bookingDate.value = local.toISOString().slice(0, 10);
    if (dom.quickDate) {
      dom.quickDate.min = local.toISOString().slice(0, 10);
      dom.quickDate.value = local.toISOString().slice(0, 10);
    }
  }

  function seededNumber(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i += 1) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  function renderAvailability(event) {
    event.preventDefault();
    var id = dom.bookingVenue.value;
    var date = dom.bookingDate.value;
    var party = Number(dom.partySize.value || 2);
    var place = state.places.find(function (p) { return p.id === id; });

    if (!place || !date) {
      dom.slotTitle.textContent = "請先選擇店家與日期";
      return;
    }

    var times = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
    var seed = seededNumber(id + date + party);
    dom.slotTitle.textContent = place.name + " · " + party + " 人";

    dom.slotResults.innerHTML = times.map(function (time, index) {
      var n = (seed + index * 97 + party * 31) % 100;
      var status = n < 28 ? "full" : (n < 52 ? "limited" : "available");
      var label = status === "full" ? "額滿" : (status === "limited" ? "少量" : "可訂");
      return '<button type="button" class="slot ' + status + '" ' + (status === "full" ? "disabled" : "") + '>' +
        "<strong>" + time + "</strong><br><small>" + label + "</small></button>";
    }).join("");
  }

  dom.venueList.addEventListener("click", function (event) {
    var card = event.target.closest(".venue-card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    var action = event.target.getAttribute("data-action");

    selectVenue(id, action !== "book");
    if (action === "book") {
      document.getElementById("availability").scrollIntoView({ behavior: "smooth" });
    }
  });

  [dom.searchInput, dom.regionFilter, dom.priceFilter, dom.sortFilter].forEach(function (control) {
    if (!control) return;
    control.addEventListener(control === dom.searchInput ? "input" : "change", applyFilters);
  });

  dom.reloadPlaces.addEventListener("click", loadPlaces);
  dom.availabilityForm.addEventListener("submit", renderAvailability);

  if (dom.locateMe) {
    dom.locateMe.addEventListener("click", function () { requestUserLocation(true); });
  }
  if (dom.locateMeHero) {
    dom.locateMeHero.addEventListener("click", function () { requestUserLocation(true); });
  }
  if (dom.quickNearbySearch) {
    dom.quickNearbySearch.addEventListener("click", function () {
      if (dom.quickDate && dom.bookingDate) dom.bookingDate.value = dom.quickDate.value;
      if (dom.quickParty && dom.partySize) dom.partySize.value = dom.quickParty.value;
      if (state.userLocation) {
        dom.sortFilter.value = "nearby";
        applyFilters();
        document.getElementById("map-section").scrollIntoView({ behavior: "smooth" });
      } else {
        requestUserLocation(true);
      }
    });
  }
  if (dom.quickParty) {
    dom.quickParty.addEventListener("change", function () {
      dom.partySize.value = dom.quickParty.value;
    });
  }

  initMap();
  setDefaultBookingDate();
  loadPlaces();
  requestUserLocation(false);

  // ------------------------------------------------------------
  // Pixel BBQ Game
  // ------------------------------------------------------------

  var canvas = document.getElementById("bbqGame");
  var ctx = canvas.getContext("2d");
  var startButton = document.getElementById("startGame");
  var extinguishButton = document.getElementById("extinguish");
  var difficultySelect = document.getElementById("difficultySelect");
  var gameTimeEl = document.getElementById("gameTime");
  var scoreEl = document.getElementById("gameScore");
  var comboEl = document.getElementById("gameCombo");
  var heatEl = document.getElementById("heatLevel");
  var messageEl = document.getElementById("gameMessage");
  var guideEl = document.getElementById("ingredientGuide");

  var ingredients = [
    { name: "杏鮑菇", emoji: "🍄", target: 8.8, tolerance: 2.1, base: 80, stars: 1 },
    { name: "牛小排", emoji: "🥩", target: 6.8, tolerance: 1.45, base: 120, stars: 3 },
    { name: "豬五花", emoji: "🥓", target: 7.6, tolerance: 1.25, base: 140, stars: 3 },
    { name: "鮮蝦", emoji: "🦐", target: 5.4, tolerance: 1.05, base: 160, stars: 4 },
    { name: "麻糬", emoji: "🍡", target: 4.5, tolerance: 0.78, base: 210, stars: 5 },
    { name: "香腸", emoji: "🌭", target: 8.1, tolerance: 1.15, base: 150, stars: 4 }
  ];

  guideEl.innerHTML = ingredients.map(function (item) {
    return '<div class="ingredient-row">' +
      '<span class="ingredient-icon">' + item.emoji + "</span>" +
      "<span><strong>" + item.name + "</strong><small>建議翻面 " + item.target.toFixed(1) + " 秒</small></span>" +
      '<span class="stars">' + "★".repeat(item.stars) + "</span>" +
    "</div>";
  }).join("");

  var game = {
    running: false,
    score: 0,
    combo: 1,
    startedAt: 0,
    lastFrame: 0,
    remaining: 180,
    pieces: [],
    nextId: 1,
    spawnTimer: 0,
    nextEventAt: 0,
    eventType: null,
    eventEndsAt: 0,
    eventUsedWater: false,
    animationId: null
  };

  var difficulty = {
    easy: { tolerance: 1.32, speed: 0.92, spawn: 3.7, max: 3 },
    normal: { tolerance: 1, speed: 1, spawn: 3.15, max: 4 },
    hard: { tolerance: 0.73, speed: 1.12, spawn: 2.45, max: 5 }
  };

  var grillCells = [
    [150, 145], [300, 145], [450, 145], [590, 145],
    [150, 285], [300, 285], [450, 285], [590, 285]
  ];

  function resetGame() {
    game.running = false;
    game.score = 0;
    game.combo = 1;
    game.remaining = 180;
    game.pieces = [];
    game.nextId = 1;
    game.spawnTimer = 0;
    game.eventType = null;
    game.eventEndsAt = 0;
    game.eventUsedWater = false;
    if (game.animationId) cancelAnimationFrame(game.animationId);
    game.animationId = null;
    updateHud();
    drawScene();
  }

  function startGame() {
    resetGame();
    game.running = true;
    game.startedAt = performance.now();
    game.lastFrame = game.startedAt;
    game.nextEventAt = 16 + Math.random() * 11;
    startButton.textContent = "重新開始";
    difficultySelect.disabled = true;
    messageEl.textContent = "開烤！食材接近最佳翻面時間時會出現黃色提示";
    for (var i = 0; i < 3; i += 1) spawnPiece(i * 0.7);
    game.animationId = requestAnimationFrame(gameLoop);
  }

  function heatMultiplier() {
    if (game.eventType === "flare") return 1.72;
    if (game.eventType === "grease") return 1.48;
    if (game.eventType === "wind") return 0.67;
    return 1;
  }

  function heatPercent() {
    return Math.round(heatMultiplier() * 100);
  }

  function spawnPiece(ageOffset) {
    var cfg = difficulty[difficultySelect.value] || difficulty.normal;
    if (game.pieces.length >= cfg.max) return;

    var occupied = {};
    game.pieces.forEach(function (p) { occupied[p.cell] = true; });
    var free = grillCells.map(function (_, i) { return i; }).filter(function (i) { return !occupied[i]; });
    if (!free.length) return;

    var cell = free[Math.floor(Math.random() * free.length)];
    var ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];

    game.pieces.push({
      id: game.nextId++,
      item: ingredient,
      cell: cell,
      cook: Math.max(0, (ageOffset || 0) * 1000),
      pulse: Math.random() * Math.PI * 2
    });
  }

  function triggerEvent(elapsed) {
    var roll = Math.random();
    if (roll < 0.42) game.eventType = "flare";
    else if (roll < 0.72) game.eventType = "grease";
    else game.eventType = "wind";

    game.eventUsedWater = false;
    var duration = game.eventType === "wind" ? 7 : 6;
    game.eventEndsAt = elapsed + duration;
    game.nextEventAt = elapsed + 19 + Math.random() * 12;
    extinguishButton.disabled = game.eventType === "wind";

    if (game.eventType === "flare") messageEl.textContent = "🔥 炭火失控！熟成速度大幅上升，可以灑水降火";
    if (game.eventType === "grease") messageEl.textContent = "💥 油脂滴落！短時間火力暴增";
    if (game.eventType === "wind") messageEl.textContent = "💨 風勢突變！火力下降，翻面時間會延後";
  }

  function clearEvent(message) {
    game.eventType = null;
    game.eventEndsAt = 0;
    extinguishButton.disabled = true;
    if (message) messageEl.textContent = message;
  }

  function gameLoop(now) {
    if (!game.running) return;

    var dt = Math.min(0.06, Math.max(0, (now - game.lastFrame) / 1000));
    game.lastFrame = now;
    var elapsed = (now - game.startedAt) / 1000;
    game.remaining = Math.max(0, 180 - elapsed);

    if (!game.eventType && elapsed >= game.nextEventAt) triggerEvent(elapsed);
    if (game.eventType && elapsed >= game.eventEndsAt) clearEvent("火力恢復正常，繼續盯熟度");

    var cfg = difficulty[difficultySelect.value] || difficulty.normal;
    var rate = cfg.speed * heatMultiplier();

    game.pieces.forEach(function (piece) {
      piece.cook += dt * 1000 * rate;
      piece.pulse += dt * 5;
    });

    game.spawnTimer += dt;
    if (game.spawnTimer >= cfg.spawn) {
      game.spawnTimer = 0;
      spawnPiece(0);
    }

    updateHud();
    drawScene();

    if (game.remaining <= 0) {
      finishGame();
      return;
    }

    game.animationId = requestAnimationFrame(gameLoop);
  }

  function updateHud() {
    var mins = Math.floor(game.remaining / 60);
    var secs = Math.floor(game.remaining % 60);
    gameTimeEl.textContent = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    scoreEl.textContent = String(Math.max(0, Math.round(game.score)));
    comboEl.textContent = "x" + game.combo;
    heatEl.textContent = heatPercent() + "%";
  }

  function finishGame() {
    game.running = false;
    difficultySelect.disabled = false;
    extinguishButton.disabled = true;
    messageEl.textContent = "時間到！本局 " + Math.max(0, Math.round(game.score)) + " 分，最高連擊 " + game.combo + " 倍";
    drawScene();
  }

  function drawPixelBackground() {
    ctx.fillStyle = "#20130e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#351d13";
    for (var y = 0; y < canvas.height; y += 28) {
      for (var x = (y / 28) % 2 === 0 ? 0 : 14; x < canvas.width; x += 28) {
        ctx.fillRect(x, y, 14, 14);
      }
    }

    ctx.fillStyle = "#2b211a";
    ctx.fillRect(70, 65, 580, 305);

    ctx.fillStyle = "#101010";
    ctx.fillRect(95, 90, 530, 255);

    ctx.fillStyle = game.eventType === "flare" || game.eventType === "grease" ? "#ff5e2a" : "#b43c22";
    for (var cx = 115; cx < 610; cx += 52) {
      var ember = 8 + ((cx / 52) % 3) * 3;
      ctx.fillRect(cx, 310, 34, ember);
      ctx.fillStyle = "#6e2419";
      ctx.fillRect(cx + 6, 320, 28, 12);
      ctx.fillStyle = game.eventType === "flare" || game.eventType === "grease" ? "#ff5e2a" : "#b43c22";
    }

    ctx.strokeStyle = "#706157";
    ctx.lineWidth = 5;
    for (var gx = 110; gx <= 610; gx += 38) {
      ctx.beginPath();
      ctx.moveTo(gx, 105);
      ctx.lineTo(gx, 320);
      ctx.stroke();
    }
    for (var gy = 115; gy <= 310; gy += 42) {
      ctx.beginPath();
      ctx.moveTo(105, gy);
      ctx.lineTo(615, gy);
      ctx.stroke();
    }

    if (game.eventType === "flare") {
      ctx.font = "34px serif";
      ctx.fillText("🔥", 78, 112);
      ctx.fillText("🔥", 590, 124);
    }
    if (game.eventType === "grease") {
      ctx.font = "31px serif";
      ctx.fillText("💥", 78, 120);
    }
    if (game.eventType === "wind") {
      ctx.font = "34px serif";
      ctx.fillText("💨", 80, 118);
    }
  }

  function drawPiece(piece) {
    var cell = grillCells[piece.cell];
    var x = cell[0];
    var y = cell[1];
    var item = piece.item;
    var cfg = difficulty[difficultySelect.value] || difficulty.normal;
    var targetMs = item.target * 1000;
    var toleranceMs = item.tolerance * cfg.tolerance * 1000;
    var error = targetMs - piece.cook;
    var progress = Math.min(1.35, piece.cook / targetMs);

    ctx.save();
    ctx.translate(x, y);

    if (Math.abs(error) < toleranceMs * 1.35) {
      ctx.fillStyle = "rgba(255,209,102," + (0.25 + Math.sin(piece.pulse) * 0.08) + ")";
      ctx.fillRect(-45, -45, 90, 90);
    }

    ctx.font = "52px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.emoji, 0, -5);

    ctx.fillStyle = "#0f0d0b";
    ctx.fillRect(-40, 32, 80, 9);
    ctx.fillStyle = progress < 0.72 ? "#6fae63" : (progress < 1.13 ? "#ffd166" : "#ff5c5c");
    ctx.fillRect(-38, 34, Math.min(76, 76 * Math.min(progress, 1)), 5);

    if (progress > 1.23) {
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "bold 13px monospace";
      ctx.fillText("OVER!", 0, -43);
    } else if (Math.abs(error) < toleranceMs) {
      ctx.fillStyle = "#ffe08a";
      ctx.font = "bold 12px monospace";
      ctx.fillText("FLIP!", 0, -43);
    }

    ctx.restore();
  }

  function drawScene() {
    drawPixelBackground();
    game.pieces.forEach(drawPiece);

    if (!game.running) {
      ctx.fillStyle = "rgba(7,6,5,.62)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff4e8";
      ctx.font = "bold 28px monospace";
      ctx.fillText(game.remaining <= 0 ? "TIME UP" : "PIXEL BBQ", canvas.width / 2, 185);
      ctx.fillStyle = "#f0b276";
      ctx.font = "bold 14px monospace";
      ctx.fillText(game.remaining <= 0 ? "SCORE " + Math.round(game.score) : "CLICK START TO GRILL", canvas.width / 2, 220);
    }
  }

  function scoreFlip(piece) {
    var item = piece.item;
    var cfg = difficulty[difficultySelect.value] || difficulty.normal;
    var targetMs = item.target * 1000;
    var toleranceMs = item.tolerance * cfg.tolerance * 1000;
    var error = Math.abs(piece.cook - targetMs);
    var resultScore = 0;
    var resultText = "";

    if (error <= toleranceMs * 0.38) {
      game.combo = Math.min(8, game.combo + 1);
      resultScore = item.base * 1.5 * game.combo;
      resultText = "PERFECT +" + Math.round(resultScore);
    } else if (error <= toleranceMs) {
      game.combo = Math.min(8, game.combo + 1);
      resultScore = item.base * game.combo;
      resultText = "GOOD +" + Math.round(resultScore);
    } else if (piece.cook < targetMs) {
      game.combo = 1;
      resultScore = 15;
      resultText = "太早翻！ +15";
    } else {
      game.combo = 1;
      resultScore = -35;
      resultText = "焦掉了 -35";
    }

    game.score = Math.max(0, game.score + resultScore);
    messageEl.textContent = item.emoji + " " + item.name + "｜" + resultText;
    game.pieces = game.pieces.filter(function (p) { return p.id !== piece.id; });
    setTimeout(function () {
      if (game.running) spawnPiece(0);
    }, 300);
  }

  canvas.addEventListener("click", function (event) {
    if (!game.running) return;

    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) * canvas.width / rect.width;
    var y = (event.clientY - rect.top) * canvas.height / rect.height;

    var hit = null;
    var bestDistance = Infinity;

    game.pieces.forEach(function (piece) {
      var cell = grillCells[piece.cell];
      var dx = x - cell[0];
      var dy = y - cell[1];
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 58 && distance < bestDistance) {
        hit = piece;
        bestDistance = distance;
      }
    });

    if (hit) scoreFlip(hit);
  });

  extinguishButton.addEventListener("click", function () {
    if (!game.running || !game.eventType || game.eventType === "wind") return;
    if (game.eventUsedWater) return;
    game.eventUsedWater = true;
    game.score = Math.max(0, game.score - 20);
    clearEvent("💧 火勢壓下來了，代價 -20 分");
    updateHud();
  });

  startButton.addEventListener("click", startGame);
  difficultySelect.addEventListener("change", drawScene);

  resetGame();
})();