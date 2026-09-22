(function () {
  "use strict";

  var state = {
    places: [],
    filtered: [],
    selectedId: null,
    userLocation: null,
    nearbyLoaded: false
  };

  var dom = {
    venueCount: document.getElementById("venueCount"),
    resultCount: document.getElementById("resultCount"),
    venueList: document.getElementById("venueList"),
    mapStatus: document.getElementById("mapStatus"),
    searchInput: document.getElementById("searchInput"),
    cityFilter: document.getElementById("cityFilter"),
    districtFilter: document.getElementById("districtFilter"),
    resetAreaFilters: document.getElementById("resetAreaFilters"),
    mapAreaTitle: document.getElementById("mapAreaTitle"),
    mapAreaSubtitle: document.getElementById("mapAreaSubtitle"),
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


  var adminDivisions = {
    "臺北市": ["中正區","大同區","中山區","松山區","大安區","萬華區","信義區","士林區","北投區","內湖區","南港區","文山區"],
    "新北市": ["萬里區","金山區","板橋區","汐止區","深坑區","石碇區","瑞芳區","平溪區","雙溪區","貢寮區","新店區","坪林區","烏來區","永和區","中和區","土城區","三峽區","樹林區","鶯歌區","三重區","新莊區","泰山區","林口區","蘆洲區","五股區","八里區","淡水區","三芝區","石門區"],
    "桃園市": ["桃園區","中壢區","平鎮區","八德區","楊梅區","蘆竹區","大溪區","龍潭區","龜山區","大園區","觀音區","新屋區","復興區"],
    "臺中市": ["中區","東區","南區","西區","北區","西屯區","南屯區","北屯區","豐原區","東勢區","大甲區","清水區","沙鹿區","梧棲區","后里區","神岡區","潭子區","大雅區","新社區","石岡區","外埔區","大安區","烏日區","大肚區","龍井區","霧峰區","太平區","大里區","和平區"],
    "臺南市": ["新營區","鹽水區","白河區","柳營區","後壁區","東山區","麻豆區","下營區","六甲區","官田區","大內區","佳里區","學甲區","西港區","七股區","將軍區","北門區","新化區","善化區","新市區","安定區","山上區","玉井區","楠西區","南化區","左鎮區","仁德區","歸仁區","關廟區","龍崎區","永康區","東區","南區","北區","安南區","安平區","中西區"],
    "高雄市": ["鹽埕區","鼓山區","左營區","楠梓區","三民區","新興區","前金區","苓雅區","前鎮區","旗津區","小港區","鳳山區","林園區","大寮區","大樹區","大社區","仁武區","鳥松區","岡山區","橋頭區","燕巢區","田寮區","阿蓮區","路竹區","湖內區","茄萣區","永安區","彌陀區","梓官區","旗山區","美濃區","六龜區","甲仙區","杉林區","內門區","茂林區","桃源區","那瑪夏區"],
    "基隆市": ["仁愛區","信義區","中正區","中山區","安樂區","暖暖區","七堵區"],
    "新竹市": ["東區","北區","香山區"],
    "新竹縣": ["竹北市","關西鎮","新埔鎮","竹東鎮","湖口鄉","橫山鄉","新豐鄉","芎林鄉","寶山鄉","北埔鄉","峨眉鄉","尖石鄉","五峰鄉"],
    "苗栗縣": ["苗栗市","苑裡鎮","通霄鎮","竹南鎮","頭份市","後龍鎮","卓蘭鎮","大湖鄉","公館鄉","銅鑼鄉","南庄鄉","頭屋鄉","三義鄉","西湖鄉","造橋鄉","三灣鄉","獅潭鄉","泰安鄉"],
    "彰化縣": ["彰化市","鹿港鎮","和美鎮","線西鄉","伸港鄉","福興鄉","秀水鄉","花壇鄉","芬園鄉","員林市","溪湖鎮","田中鎮","大村鄉","埔鹽鄉","埔心鄉","永靖鄉","社頭鄉","二水鄉","北斗鎮","二林鎮","田尾鄉","埤頭鄉","芳苑鄉","大城鄉","竹塘鄉","溪州鄉"],
    "南投縣": ["南投市","埔里鎮","草屯鎮","竹山鎮","集集鎮","名間鄉","鹿谷鄉","中寮鄉","魚池鄉","國姓鄉","水里鄉","信義鄉","仁愛鄉"],
    "雲林縣": ["斗六市","斗南鎮","虎尾鎮","西螺鎮","土庫鎮","北港鎮","古坑鄉","大埤鄉","莿桐鄉","林內鄉","二崙鄉","崙背鄉","麥寮鄉","東勢鄉","褒忠鄉","臺西鄉","元長鄉","四湖鄉","口湖鄉","水林鄉"],
    "嘉義市": ["東區","西區"],
    "嘉義縣": ["太保市","朴子市","布袋鎮","大林鎮","民雄鄉","溪口鄉","新港鄉","六腳鄉","東石鄉","義竹鄉","鹿草鄉","水上鄉","中埔鄉","竹崎鄉","梅山鄉","番路鄉","大埔鄉","阿里山鄉"],
    "屏東縣": ["屏東市","潮州鎮","東港鎮","恆春鎮","萬丹鄉","長治鄉","麟洛鄉","九如鄉","里港鄉","鹽埔鄉","高樹鄉","萬巒鄉","內埔鄉","竹田鄉","新埤鄉","枋寮鄉","新園鄉","崁頂鄉","林邊鄉","南州鄉","佳冬鄉","琉球鄉","車城鄉","滿州鄉","枋山鄉","三地門鄉","霧臺鄉","瑪家鄉","泰武鄉","來義鄉","春日鄉","獅子鄉","牡丹鄉"],
    "宜蘭縣": ["宜蘭市","羅東鎮","蘇澳鎮","頭城鎮","礁溪鄉","壯圍鄉","員山鄉","冬山鄉","五結鄉","三星鄉","大同鄉","南澳鄉"],
    "花蓮縣": ["花蓮市","鳳林鎮","玉里鎮","新城鄉","吉安鄉","壽豐鄉","光復鄉","豐濱鄉","瑞穗鄉","富里鄉","秀林鄉","萬榮鄉","卓溪鄉"],
    "臺東縣": ["臺東市","成功鎮","關山鎮","卑南鄉","鹿野鄉","池上鄉","東河鄉","長濱鄉","太麻里鄉","大武鄉","綠島鄉","海端鄉","延平鄉","金峰鄉","達仁鄉","蘭嶼鄉"],
    "澎湖縣": ["馬公市","湖西鄉","白沙鄉","西嶼鄉","望安鄉","七美鄉"],
    "金門縣": ["金城鎮","金湖鎮","金沙鎮","金寧鄉","烈嶼鄉","烏坵鄉"],
    "連江縣": ["南竿鄉","北竿鄉","莒光鄉","東引鄉"]
  };

  var cityAliases = {
    "Taipei City":"臺北市","New Taipei City":"新北市","Taoyuan City":"桃園市","Taichung City":"臺中市",
    "Tainan City":"臺南市","Kaohsiung City":"高雄市","Keelung City":"基隆市","Hsinchu City":"新竹市",
    "Hsinchu County":"新竹縣","Miaoli County":"苗栗縣","Changhua County":"彰化縣","Nantou County":"南投縣",
    "Yunlin County":"雲林縣","Chiayi City":"嘉義市","Chiayi County":"嘉義縣","Pingtung County":"屏東縣",
    "Yilan County":"宜蘭縣","Hualien County":"花蓮縣","Taitung County":"臺東縣","Penghu County":"澎湖縣",
    "Kinmen County":"金門縣","Lienchiang County":"連江縣"
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

  function normalizeAdminText(value) {
    return String(value || "").trim().replace(/台/g, "臺").replace(/\s+/g, "");
  }

  function cityFromTags(tags) {
    var candidates = [
      tags["addr:city"], tags["addr:county"], tags["is_in:city"], tags["is_in:county"], tags["is_in"]
    ].filter(Boolean);

    for (var i = 0; i < candidates.length; i += 1) {
      var raw = String(candidates[i]).trim();
      if (cityAliases[raw]) return cityAliases[raw];
      var normalized = normalizeAdminText(raw);
      var cities = Object.keys(adminDivisions);
      for (var j = 0; j < cities.length; j += 1) {
        if (normalized.indexOf(normalizeAdminText(cities[j])) !== -1) return cities[j];
      }
    }
    return "";
  }

  function districtFromTags(tags, city) {
    var candidates = [
      tags["addr:district"], tags["is_in:district"], tags["addr:borough"], tags["addr:subdistrict"]
    ].filter(Boolean);
    var districts = adminDivisions[city] || [];

    for (var i = 0; i < candidates.length; i += 1) {
      var normalized = normalizeAdminText(candidates[i]);
      for (var j = 0; j < districts.length; j += 1) {
        if (normalized.indexOf(normalizeAdminText(districts[j])) !== -1) return districts[j];
      }
      if (candidates[i]) return String(candidates[i]).trim();
    }
    return "";
  }

  function inferDistrictFromAddress(city, address, current) {
    if (current) return current;
    var normalized = normalizeAdminText(address);
    var districts = adminDivisions[city] || [];
    for (var i = 0; i < districts.length; i += 1) {
      if (normalized.indexOf(normalizeAdminText(districts[i])) !== -1) return districts[i];
    }
    return "";
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
    var address = formatAddress(tags);
    var city = cityFromTags(tags);
    var district = inferDistrictFromAddress(city, address, districtFromTags(tags, city));
    return {
      id: el.type + "-" + el.id,
      name: tags.name,
      lat: Number(lat),
      lon: Number(lon),
      address: address,
      city: city,
      district: district,
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
    populateDistrictFilter();
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
    populateDistrictFilter();
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

      applyFilters();
      loadNearbyPlaces(lat, lon);

      if (scrollToMap) {
        document.getElementById("discovery-section").scrollIntoView({ behavior: "smooth" });
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

  function populateDistrictFilter() {
    if (!dom.cityFilter || !dom.districtFilter) return;
    var city = dom.cityFilter.value;
    if (city === "all") {
      dom.districtFilter.innerHTML = '<option value="all">請先選縣市</option>';
      dom.districtFilter.disabled = true;
      return;
    }

    var districts = adminDivisions[city] || [];
    var counts = {};
    state.places.forEach(function (place) {
      if (normalizeAdminText(place.city) !== normalizeAdminText(city)) return;
      if (place.district) counts[place.district] = (counts[place.district] || 0) + 1;
    });

    dom.districtFilter.disabled = false;
    dom.districtFilter.innerHTML = '<option value="all">全 ' + safe(city) + '</option>' +
      districts.map(function (district) {
        var count = counts[district] || 0;
        return '<option value="' + safe(district) + '">' + safe(district) + (count ? " (" + count + ")" : "") + '</option>';
      }).join("");
  }

  function updateMapAreaLabel() {
    if (!dom.mapAreaTitle || !dom.mapAreaSubtitle) return;
    var city = dom.cityFilter ? dom.cityFilter.value : "all";
    var district = dom.districtFilter ? dom.districtFilter.value : "all";
    var title = "全台烤肉地圖";

    if (city !== "all") title = city + "烤肉地圖";
    if (city !== "all" && district !== "all") title = city + " " + district + "烤肉地圖";

    dom.mapAreaTitle.textContent = title;
    dom.mapAreaSubtitle.textContent = state.filtered.length + " 間符合條件的店家";
  }

  function matchesFilters(place) {
    var keyword = dom.searchInput.value.trim().toLowerCase();
    var city = dom.cityFilter ? dom.cityFilter.value : "all";
    var district = dom.districtFilter ? dom.districtFilter.value : "all";
    var price = dom.priceFilter.value;

    var haystack = [
      place.name,
      place.address,
      place.cuisine,
      place.features.join(" ")
    ].join(" ").toLowerCase();

    var cityHaystack = normalizeAdminText((place.city || "") + " " + (place.address || ""));
    var districtHaystack = normalizeAdminText((place.district || "") + " " + (place.address || ""));

    return (!keyword || haystack.indexOf(keyword) !== -1) &&
      (city === "all" || cityHaystack.indexOf(normalizeAdminText(city)) !== -1) &&
      (district === "all" || districtHaystack.indexOf(normalizeAdminText(district)) !== -1) &&
      (price === "all" || place.priceTier === price);
  }

  function applyFilters(fitMap) {
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
    updateMapAreaLabel();
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
          '<a class="venue-action" href="' + safe(mapSearchUrl(place)) + '" target="_blank" rel="noopener noreferrer">Google 地圖</a>' +
          (official ? '<a class="venue-action" href="' + safe(official) + '" target="_blank" rel="noopener noreferrer">官網</a>' : '') +
        "</div>" +
      "</article>";
    }).join("");
  }

  function selectVenue(id) {
    var place = state.places.find(function (p) { return p.id === id; });
    if (!place) return;
    state.selectedId = id;
    dom.bookingVenue.value = id;
    renderList();
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
    if (event.target.closest("a")) return;
    selectVenue(id);
  });

  [dom.searchInput, dom.priceFilter, dom.sortFilter].forEach(function (control) {
    if (!control) return;
    control.addEventListener(control === dom.searchInput ? "input" : "change", applyFilters);
  });

  if (dom.cityFilter) {
    dom.cityFilter.addEventListener("change", function () {
      populateDistrictFilter();
      applyFilters();
    });
  }
  if (dom.districtFilter) {
    dom.districtFilter.addEventListener("change", function () {
      applyFilters();
    });
  }
  if (dom.resetAreaFilters) {
    dom.resetAreaFilters.addEventListener("click", function () {
      dom.cityFilter.value = "all";
      populateDistrictFilter();
      applyFilters();
    });
  }
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
        document.getElementById("discovery-section").scrollIntoView({ behavior: "smooth" });
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