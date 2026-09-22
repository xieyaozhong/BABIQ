(function () {
  "use strict";

  var state = {
    places: [],
    filtered: [],
    selectedId: null,
    userLocation: null,
    nearbyLoaded: false,
    adminRequestId: 0
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
    featureFilter: document.getElementById("featureFilter"),
    priceFilter: document.getElementById("priceFilter"),
    sortFilter: document.getElementById("sortFilter"),
    locateMe: document.getElementById("locateMe"),
    locateMeHero: document.getElementById("locateMeHero"),
    locationSummary: document.getElementById("locationSummary"),
    quickDate: document.getElementById("quickDate"),
    quickParty: document.getElementById("quickParty"),
    quickNearbySearch: document.getElementById("quickNearbySearch"),
    reloadPlaces: document.getElementById("reloadPlaces"),
    brandPresetList: document.getElementById("brandPresetList"),
    brandBookingSelect: document.getElementById("brandBookingSelect"),
    brandBookingInfo: document.getElementById("brandBookingInfo"),
    brandBookingName: document.getElementById("brandBookingName"),
    brandBookingNote: document.getElementById("brandBookingNote"),
    brandBookingLink: document.getElementById("brandBookingLink"),
    branchDetailCard: document.getElementById("branchDetailCard"),
    branchDetailSource: document.getElementById("branchDetailSource"),
    branchDetailName: document.getElementById("branchDetailName"),
    branchDetailBrand: document.getElementById("branchDetailBrand"),
    branchDetailAddress: document.getElementById("branchDetailAddress"),
    branchDetailPhone: document.getElementById("branchDetailPhone"),
    branchDetailHours: document.getElementById("branchDetailHours"),
    branchMapLink: document.getElementById("branchMapLink"),
    branchPhoneLink: document.getElementById("branchPhoneLink"),
    branchOfficialLink: document.getElementById("branchOfficialLink"),
    bookingVenue: document.getElementById("bookingVenue"),
    bookingDate: document.getElementById("bookingDate"),
    partySize: document.getElementById("partySize"),
    availabilityForm: document.getElementById("availabilityForm"),
    slotTitle: document.getElementById("slotTitle"),
    slotResults: document.getElementById("slotResults"),
    locationGuide: document.getElementById("locationGuide"),
    locationGuideIntro: document.getElementById("locationGuideIntro"),
    locationGuideDenied: document.getElementById("locationGuideDenied"),
    locationGuideLoading: document.getElementById("locationGuideLoading"),
    locationGuideSuccess: document.getElementById("locationGuideSuccess"),
    locationPermissionSteps: document.getElementById("locationPermissionSteps"),
    locationPermissionButton: document.getElementById("locationPermissionButton"),
    retryLocationButton: document.getElementById("retryLocationButton"),
    viewNearbyButton: document.getElementById("viewNearbyButton")
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

  var brandProfiles = [
    {
      match: /乾杯燒肉|KANPAI/i,
      priceTier: "$$",
      priceMin: 99,
      priceLabel: "單點 NT$99–399｜午餐 NT$399 起",
      priceSource: "乾杯官方 2026",
      priceSourceUrl: "https://www.kanpaiyakiniku.com.tw/zh/news-detail/620",
      features: ["日本A5和牛", "日式燒肉", "單點", "商業午餐", "可線上訂位"]
    },
    {
      match: /肉次方/i,
      priceTier: "$$$",
      priceMin: 658,
      priceLabel: "NT$658–1,598 / 人",
      priceSource: "王品集團 2026",
      priceSourceUrl: "https://www.wowprime.com/zh-tw/news/media/260522",
      features: ["燒肉吃到飽", "5種方案", "原塊牛排", "和牛", "可預約"]
    },
    {
      match: /田季發爺/i,
      priceTier: "$$",
      priceMin: 658,
      priceLabel: "NT$658 / 838 / 988 +10%",
      priceSource: "田季發爺官方菜單",
      priceSourceUrl: "https://www.tianji.com.tw/menu/",
      features: ["120分鐘吃到飽", "日式燒肉", "海陸", "火鍋", "宵夜"]
    },
    {
      match: /燒肉眾/i,
      priceTier: "$$",
      priceMin: 599,
      priceLabel: "NT$599 / 799 / 999 +10%",
      priceSource: "燒肉眾官方菜單",
      priceSourceUrl: "https://www.yuanchuang.com.tw/zh-TW/pages/%E7%87%92%E8%82%89%E7%9C%BE%E4%B8%80%E4%BB%A3%E5%BA%97%E7%BE%8E%E5%91%B3%E8%8F%9C%E5%96%AE",
      features: ["120分鐘吃到飽", "海鮮", "和牛升級", "小菜甜點", "可預約"]
    }
  ];

  var bookingBrands = [
    {
      id: "kanpai",
      name: "乾杯燒肉",
      aliases: ["乾杯燒肉", "乾杯列車", "KANPAI"],
      officialUrl: "https://www.kanpaiyakiniku.com.tw/zh/branch",
      note: "官方門市頁提供線上訂位；乾杯集團公告官方授權平台包含 inline、OpenTable、OpenRice、FunNow"
    },
    {
      id: "powerofmeat",
      name: "肉次方",
      aliases: ["肉次方"],
      officialUrl: "https://www.powerofmeat.com.tw/shop-location",
      note: "官方門市頁可選分店並前往線上訂位"
    },
    {
      id: "tianji",
      name: "田季發爺",
      aliases: ["田季發爺"],
      officialUrl: "https://www.tianji.com.tw/store/",
      note: "官方門市頁提供各分店電話與訂位資訊"
    },
    {
      id: "yakiniku-zhong",
      name: "燒肉眾",
      aliases: ["燒肉眾"],
      officialUrl: "https://www.yuanchuang.com.tw/zh-TW/pages/%E7%87%92%E8%82%89%E7%9C%BE%E4%B8%80%E4%BB%A3%E5%BA%97-%E7%B7%9A%E4%B8%8A%E8%A8%82%E4%BD%8D",
      note: "元創國際餐飲官方線上訂位入口"
    },
    {
      id: "umai",
      name: "屋馬燒肉",
      aliases: ["屋馬燒肉", "屋馬"],
      officialUrl: "https://www.umai.tw/",
      note: "屋馬官網提供線上訂位入口"
    },
    {
      id: "yakiyan",
      name: "原燒",
      aliases: ["原燒", "Yakiyan"],
      officialUrl: "https://www.yakiyan.com/",
      note: "原燒官方門市頁提供各店線上訂位"
    }
  ];

  var brandBranches = {
    kanpai: [
      {id:"main",name:"乾杯燒肉居酒屋 本店",address:"台北市大安區敦化南路一段236巷17號",phone:"02-8773-1150",hours:"11:30–15:00／17:00–22:30",source:"乾杯官方門市"},
      {id:"zhongshan",name:"乾杯燒肉居酒屋 中山店",address:"台北市大同區南京西路25巷2-1號",phone:"02-2555-6110",hours:"平日 11:30–15:00／17:00–23:00；週末 11:30–23:00",source:"乾杯官方門市"},
      {id:"xinyi-att",name:"乾杯燒肉居酒屋 信義 ATT 店",address:"台北市信義區松壽路12號6樓",phone:"02-8786-0808",hours:"11:00–15:00／17:00–23:00",source:"乾杯官方門市"},
      {id:"nangang",name:"乾杯燒肉居酒屋 南港中信店",address:"台北市南港區經貿二路186-1號2樓",phone:"02-2786-6066",hours:"平日 11:00–15:00／17:00–21:30；週末 11:00–21:30",source:"乾杯官方門市"},
      {id:"train-taipei",name:"乾杯列車 台北總站",address:"台北市中正區北平西路3號2樓",phone:"02-2361-8000",hours:"10:00–22:00",source:"乾杯官方門市"},
      {id:"train-banqiao",name:"乾杯列車 板橋站",address:"新北市板橋區縣民大道二段7號2樓",phone:"02-8969-3333",hours:"11:00–23:00",source:"乾杯官方門市"},
      {id:"linkou",name:"乾杯燒肉居酒屋 林口店",address:"新北市林口區文化三路一段356號2樓",phone:"02-2606-8522",hours:"週一至四 11:00–21:30；週五至日 11:00–22:00",source:"乾杯官方門市"},
      {id:"xinzhuang",name:"乾杯燒肉居酒屋 新莊宏匯店",address:"新北市新莊區新北大道四段3號7樓",phone:"02-8521-6277",hours:"週日至四 11:00–21:00；週五六 11:00–22:00",source:"乾杯官方門市"},
      {id:"taoyuan-dajiang",name:"乾杯燒肉居酒屋 桃園大江店",address:"桃園市中壢區中園路二段501號B1",phone:"03-468-0189",hours:"週日至四 11:00–22:00；週五六 11:00–22:30",source:"乾杯官方門市"},
      {id:"taoyuan-gloria",name:"乾杯燒肉居酒屋 桃園華泰名品城店",address:"桃園市中壢區春德路189號3樓",phone:"03-287-6511",hours:"平日 11:00–21:00；週末 11:00–22:00",source:"乾杯官方門市"},
      {id:"zhubei-feds",name:"乾杯燒肉居酒屋 竹北遠百店",address:"新竹縣竹北市莊敬北路18號7樓",phone:"03-550-1217",hours:"平日 11:00–15:00／17:00–22:00；週末 11:00–22:00",source:"乾杯官方門市"},
      {id:"hsinchu-bigcity",name:"乾杯燒肉居酒屋 新竹巨城店",address:"新竹市中央路229號7樓",phone:"03-532-1509",hours:"營業時段依官方門市頁為準",source:"乾杯官方門市"},
      {id:"tainan-mitsui",name:"乾杯燒肉居酒屋 台南三井店",address:"台南市歸仁區歸仁大道101號1樓",phone:"06-303-2885",hours:"平日 11:00–15:30／17:00–21:30；週末 11:00–21:30",source:"乾杯官方門市"},
      {id:"tainan-ts-mall",name:"乾杯燒肉居酒屋 台南南紡店",address:"台南市東區中華東路一段358號5樓",phone:"06-209-2321",hours:"11:00–00:00",source:"乾杯官方門市"}
    ],
    powerofmeat: [
      {id:"ximen",name:"肉次方 台北峨眉店",address:"台北市萬華區峨眉街37號4樓",phone:"02-2388-9010",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"nanjing",name:"肉次方 台北南京東店",address:"台北市中山區南京東路一段92號4樓",phone:"02-2562-8820",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"xindian",name:"肉次方 新店民權店",address:"新北市新店區民權路86號2樓",phone:"02-2218-2858",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"jiangzicui",name:"肉次方 板橋江子翠店",address:"新北市板橋區文化路二段182巷3弄79號3樓",phone:"02-2252-2505",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"zhongli",name:"肉次方 中壢元化店",address:"桃園市中壢區元化路245號2樓",phone:"03-433-1767",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"taoyuan",name:"肉次方 桃園中正店",address:"桃園市桃園區中正路1003號",phone:"03-356-7886",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"taichung-wuquan",name:"肉次方 台中文心五權西店",address:"台中市南屯區五權西路二段273號2樓",phone:"04-2472-2551",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"taichung-chongde",name:"肉次方 台中文心崇德店",address:"台中市北屯區文心路四段585號",phone:"04-2242-2899",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"chiayi",name:"肉次方 嘉義中山店",address:"嘉義市西區中山路370號2樓",phone:"05-222-8818",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"tainan",name:"肉次方 台南府前店",address:"台南市安平區府前路二段500號2樓之1",phone:"06-299-2997",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"kaohsiung-yucheng",name:"肉次方 高雄裕誠店",address:"高雄市左營區裕誠路448號3樓",phone:"07-556-6911",hours:"依官方訂位系統為準",source:"肉次方官方門市"},
      {id:"kaohsiung-dreammall",name:"肉次方 高雄夢時代店",address:"高雄市前鎮區中華五路789號9樓",phone:"07-811-8998",hours:"週日至四 11:00–22:00；週五六 11:00–22:30",source:"肉次方官方門市"}
    ],
    tianji: [
      {id:"zhongli",name:"田季發爺 桃園中壢店",address:"桃園市中壢區中美路二段136–138號",phone:"03-422-5066",hours:"依官方門市頁為準",source:"田季發爺官方門市"},
      {id:"tainan",name:"田季發爺 台南中華店",address:"台南市東區中華東路二段101號",phone:"06-267-3070",hours:"依官方門市頁為準",source:"田季發爺官方門市"},
      {id:"kaohsiung",name:"田季發爺 高雄中山店",address:"高雄市新興區中山一路6-20號",phone:"07-282-0228",hours:"依官方門市頁為準",source:"田季發爺官方門市"}
    ],
    "yakiniku-zhong": [
      {id:"taipei-jilin",name:"燒肉眾 台北吉林店",address:"台北市中山區吉林路181號1樓",phone:"02-2536-8787",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taipei-daan",name:"燒肉眾 台北大安店",address:"台北市大安區大安路一段51巷7號",phone:"02-2776-6650",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taipei-ximen",name:"燒肉眾 台北西門店",address:"台北市萬華區成都路66號2–3樓",phone:"02-2375-5286",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"sanchong",name:"燒肉眾 三重自強店",address:"新北市三重區自強路一段175號",phone:"02-8985-7538",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"xindian",name:"燒肉眾 新店安康店",address:"新北市新店區安康路二段22號",phone:"02-8666-8003",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"xinzhuang",name:"燒肉眾 新莊中正店",address:"新北市新莊區中正路280號",phone:"02-8991-1210",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"shulin",name:"燒肉眾 樹林秀泰店",address:"新北市樹林區樹新路127號",phone:"02-8687-1588",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"tamsui",name:"燒肉眾 淡水老街店",address:"新北市淡水區中正路334號2樓",phone:"02-2629-6606",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"zhubei",name:"燒肉眾 竹北光明店",address:"新竹縣竹北市光明一路480號",phone:"03-553-0868",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taichung-sanmin",name:"燒肉眾 台中三民西店",address:"台中市南區三民西路321號",phone:"04-2378-5586",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taichung-wenxin",name:"燒肉眾 台中文心店",address:"台中市南屯區文心路一段546號",phone:"04-2329-0288",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taichung-zhongqing",name:"燒肉眾 台中中清店",address:"台中市大雅區中清路三段1218號",phone:"04-2566-8857",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taichung-shalu",name:"燒肉眾 台中沙鹿店",address:"台中市沙鹿區北勢東路820-1號",phone:"04-2652-2999",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taichung-jmall",name:"燒肉眾 台中 JMall 店",address:"台中市西屯區台灣大道四段1038號",phone:"04-2465-2858",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taichung-fengyuan",name:"燒肉眾 台中豐原店",address:"台中市豐原區源豐路60號",phone:"04-2525-3878",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"chiayi",name:"燒肉眾 嘉義民生店",address:"嘉義市西區民生北路139號",phone:"05-222-3110",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"},
      {id:"taitung",name:"燒肉眾 台東新生店",address:"台東縣台東市新生路191之2號",phone:"08-935-8999",hours:"以官方訂位頁為準",source:"門市彙整／官方訂位為準"}
    ],
    umai: [
      {id:"wenxin",name:"屋馬燒肉 文心店",address:"台中市南屯區文心路一段436號",phone:"04-2310-6699",hours:"依屋馬官方訂位系統為準",source:"屋馬官方門市名單／公開資料"},
      {id:"zhonggang",name:"屋馬燒肉 中港店",address:"台中市西屯區台灣大道三段300號",phone:"04-2312-1000",hours:"依屋馬官方訂位系統為準",source:"屋馬官方門市名單／公開資料"},
      {id:"guoan",name:"屋馬燒肉 國安店",address:"台中市西屯區國安一路168號B1-2",phone:"04-2465-2222",hours:"依屋馬官方訂位系統為準",source:"屋馬官方門市名單／公開資料"},
      {id:"chongde",name:"屋馬燒肉 崇德店",address:"台中市北屯區崇德路二段369號",phone:"04-2241-0000",hours:"依屋馬官方訂位系統為準",source:"屋馬官方門市名單／公開資料"},
      {id:"chungyo",name:"屋馬燒肉 中友店",address:"台中市北區育才北路69號1樓",phone:"04-2226-0888",hours:"依屋馬官方訂位系統為準",source:"屋馬官方門市名單／公開資料"},
      {id:"wenxin-showtime",name:"屋馬燒肉 文心秀泰店",address:"台中市南屯區文心南路289號5樓",phone:"04-2475-0777",hours:"依屋馬官方訂位系統為準",source:"屋馬官方門市名單／公開資料"}
    ],
    yakiyan: [
      {id:"xizhi",name:"原燒 汐止遠雄店",address:"新北市汐止區新台五路一段99號2樓",phone:"02-2697-3018",hours:"依原燒官方門市頁為準",source:"原燒官方門市"},
      {id:"ximen",name:"原燒 台北西門店",address:"台北市萬華區中華路一段90號2樓",phone:"02-2388-8523",hours:"依原燒官方門市頁為準",source:"原燒官方門市"},
      {id:"banqiao",name:"原燒 板橋文化店",address:"新北市板橋區文化路一段280號2樓",phone:"02-2259-2250",hours:"依原燒官方門市頁為準",source:"原燒官方門市"},
      {id:"sanchong",name:"原燒 三重龍門店",address:"新北市三重區龍門路6-1號4樓",phone:"02-8983-9355",hours:"依原燒官方門市頁為準",source:"原燒官方門市"},
      {id:"taoyuan-tonlin",name:"原燒 桃園統領店",address:"桃園市桃園區中正路61號8樓",phone:"03-335-7957",hours:"週日至四 11:00–21:30；週五六 11:00–22:00",source:"原燒官方門市"},
      {id:"taoyuan-taimall",name:"原燒 桃園台茂店",address:"桃園市蘆竹區南崁路一段112號6樓",phone:"03-222-1668",hours:"11:00–22:00",source:"原燒官方門市"},
      {id:"zhubei",name:"原燒 竹北光明店",address:"新竹縣竹北市光明一路112號",phone:"03-558-6030",hours:"週一至四及週日 11:00–00:00；週五六 11:00–01:00",source:"原燒官方門市"},
      {id:"toufen",name:"原燒 頭份尚順育樂世界店",address:"苗栗縣頭份市育樂街6號1樓",phone:"037-592866",hours:"週一至四及週日 11:00–00:00；週五六 11:00–01:00",source:"原燒官方門市"},
      {id:"taichung-xitun",name:"原燒 台中西屯萬家福店",address:"台中市西屯區台灣大道四段1086號1樓",phone:"04-2460-8523",hours:"11:00–22:00",source:"原燒官方門市"},
      {id:"taichung-gongyi",name:"原燒 台中公益店",address:"台中市南屯區公益路二段702號",phone:"04-2255-6885",hours:"週一至四及週日 11:00–00:00；週五六 11:00–01:00",source:"原燒官方門市"},
      {id:"chiayi",name:"原燒 嘉義耐斯店",address:"嘉義市東區忠孝路600號6樓",phone:"05-276-9158",hours:"依原燒官方門市頁為準",source:"原燒官方門市"},
      {id:"yilan",name:"原燒 宜蘭新月店",address:"宜蘭市民權路二段38巷6號4樓",phone:"03-932-9258",hours:"依原燒官方門市頁為準",source:"原燒官方門市"},
      {id:"kaohsiung",name:"原燒 鳳山青年店",address:"高雄市鳳山區青年路二段307號",phone:"07-767-9258",hours:"週一至四及週日 11:00–00:00；週五六 11:00–01:00",source:"原燒官方門市"}
    ]
  };

  var searchAliases = {
    "台北": ["臺北","台北"],
    "台中": ["臺中","台中"],
    "台南": ["臺南","台南"],
    "台東": ["臺東","台東"],
    "吃到飽": ["吃到飽","放題","buffet","all you can eat"],
    "放題": ["吃到飽","放題","buffet"],
    "和牛": ["和牛","wagyu","a5"],
    "日式": ["日式","yakiniku","japanese"],
    "韓式": ["韓式","korean"],
    "訂位": ["可預約","線上訂位","reservation","booking"],
    "預約": ["可預約","reservation","booking"],
    "戶外": ["戶外座位","outdoor"],
    "外帶": ["可外帶","takeaway"],
    "無障礙": ["無障礙","wheelchair"],
    "燒肉": ["燒肉","烤肉","yakiniku","barbecue","bbq","grill"],
    "烤肉": ["燒肉","烤肉","barbecue","bbq","grill"],
    "bbq": ["bbq","barbecue","燒肉","烤肉"]
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

  function inferCityFromAddress(address, current) {
    if (current) return current;
    var normalized = normalizeAdminText(address);
    var cities = Object.keys(adminDivisions);
    for (var i = 0; i < cities.length; i += 1) {
      if (normalized.indexOf(normalizeAdminText(cities[i])) !== -1) return cities[i];
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

  function findBrandProfile(name) {
    return brandProfiles.find(function (profile) {
      return profile.match.test(String(name || ""));
    }) || null;
  }

  function parsePriceMin(value) {
    var match = String(value || "").replace(/,/g, "").match(/(\d{2,5})/);
    return match ? Number(match[1]) : Infinity;
  }

  function getPrice(tags, name) {
    var raw = tags.price_range || tags.price || tags.charge || tags.cost || tags.fee || "";
    var normalized = String(raw).trim();

    if (normalized) {
      var tier = "unknown";
      var numericMin = parsePriceMin(normalized);
      if (/^\$\$\$/.test(normalized)) tier = "$$$";
      else if (/^\$\$/.test(normalized)) tier = "$$";
      else if (/^\$/.test(normalized)) tier = "$";
      else if (Number.isFinite(numericMin)) {
        if (numericMin < 400) tier = "$";
        else if (numericMin < 900) tier = "$$";
        else tier = "$$$";
      }

      return {
        tier: tier,
        label: normalized,
        min: parsePriceMin(normalized),
        source: "OpenStreetMap 公開欄位",
        sourceUrl: ""
      };
    }

    var profile = findBrandProfile(name);
    if (profile) {
      return {
        tier: profile.priceTier,
        label: profile.priceLabel,
        min: profile.priceMin,
        source: profile.priceSource,
        sourceUrl: profile.priceSourceUrl
      };
    }

    return {
      tier: "unknown",
      label: "價位待確認",
      min: Infinity,
      source: "",
      sourceUrl: ""
    };
  }

  function featuresFromTags(tags, name) {
    var features = [];
    var cuisine = String(tags.cuisine || "");
    var text = (cuisine + " " + String(name || "")).toLowerCase();
    var profile = findBrandProfile(name);

    if (/yakiniku|日式|焼肉/.test(text)) features.push("日式燒肉");
    if (/korean|韓式|韓國/.test(text)) features.push("韓式燒肉");
    if (/barbecue|bbq|grill/.test(text)) features.push("BBQ");
    if (/和牛|wagyu|a5/.test(text)) features.push("和牛");
    if (/吃到飽|放題|buffet|all.you.can.eat/.test(text)) features.push("吃到飽");
    if (/炭火|charcoal/.test(text)) features.push("炭火燒肉");
    if (/海鮮|seafood/.test(text)) features.push("海鮮");

    if (tags.outdoor_seating === "yes") features.push("戶外座位");
    if (tags.reservation === "yes" || tags.booking === "yes" || tags["reservation:url"]) features.push("可預約");
    if (tags.wheelchair === "yes") features.push("無障礙");
    if (tags.takeaway === "yes") features.push("可外帶");
    if (tags.delivery === "yes") features.push("可外送");
    if (tags.internet_access === "wlan" || tags.internet_access === "yes") features.push("Wi-Fi");
    if (tags.air_conditioning === "yes") features.push("冷氣");
    if (tags["diet:vegetarian"] === "yes") features.push("素食選項");
    if (tags["payment:credit_cards"] === "yes") features.push("可刷卡");

    if (profile) features = profile.features.concat(features);

    features = features.filter(function (item, index, arr) {
      return item && arr.indexOf(item) === index;
    });

    if (!features.length) features.push("燒肉 / 烤肉");
    return features.slice(0, 7);
  }

  function transformElement(el, forcedCity, forcedDistrict) {
    var tags = el.tags || {};
    var lat = el.lat || (el.center && el.center.lat);
    var lon = el.lon || (el.center && el.center.lon);
    if (!lat || !lon || !tags.name) return null;

    var price = getPrice(tags, tags.name);
    var address = formatAddress(tags);
    var city = forcedCity || inferCityFromAddress(address, cityFromTags(tags));
    var district = forcedDistrict || inferDistrictFromAddress(city, address, districtFromTags(tags, city));
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
      features: featuresFromTags(tags, tags.name),
      priceTier: price.tier,
      priceLabel: price.label,
      priceMin: price.min,
      priceSource: price.source,
      priceSourceUrl: price.sourceUrl,
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

  function escapeOverpassString(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function adminAreaQuery(city, district) {
    var safeCity = escapeOverpassString(city);
    var safeDistrict = escapeOverpassString(district);
    var lines = [
      "[out:json][timeout:25];",
      'area["name"="' + safeCity + '"]["boundary"="administrative"]->.city;'
    ];

    var areaRef = "city";
    if (district && district !== "all") {
      lines.push('rel(area.city)["name"="' + safeDistrict + '"]["boundary"="administrative"];');
      lines.push("map_to_area -> .district;");
      areaRef = "district";
    }

    lines.push("(");
    lines.push('nwr(area.' + areaRef + ')["amenity"="restaurant"]["cuisine"~"barbecue|bbq|yakiniku|grill|korean_barbecue",i];');
    lines.push('nwr(area.' + areaRef + ')["amenity"="restaurant"]["name"~"燒肉|烤肉|炭火|BBQ|Barbecue|Yakiniku",i];');
    lines.push(");");
    lines.push("out center tags;");
    return lines.join("");
  }

  async function loadAdministrativePlaces(city, district) {
    if (!city || city === "all") {
      applyFilters();
      return;
    }

    var requestId = ++state.adminRequestId;
    var label = city + (district && district !== "all" ? " " + district : "");
    dom.mapStatus.textContent = "正在搜尋 " + label + " 的烤肉店…";
    dom.venueList.innerHTML = '<div class="empty-card">正在搜尋 ' + safe(label) + ' 的店家…</div>';

    var endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];
    var data = null;
    var lastError = null;
    var query = adminAreaQuery(city, district);

    for (var i = 0; i < endpoints.length; i += 1) {
      try {
        data = await fetchOverpass(endpoints[i], query);
        if (data && Array.isArray(data.elements)) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (requestId !== state.adminRequestId) return;

    if (!data || !Array.isArray(data.elements)) {
      dom.mapStatus.textContent = label + " 的行政區搜尋暫時無法連線，先使用目前已載入資料篩選";
      console.warn("Administrative Overpass failed", lastError);
      applyFilters();
      return;
    }

    var merged = new Map(state.places.map(function (place) { return [place.id, place]; }));
    data.elements.forEach(function (el) {
      var place = transformElement(
        el,
        city,
        district && district !== "all" ? district : ""
      );
      if (place) merged.set(place.id, place);
    });

    state.places = Array.from(merged.values());
    updateDistances();
    dom.venueCount.textContent = state.places.length;

    var keepDistrict = dom.districtFilter ? dom.districtFilter.value : "all";
    populateDistrictFilter();
    if (dom.districtFilter && keepDistrict && Array.from(dom.districtFilter.options).some(function (option) {
      return option.value === keepDistrict;
    })) {
      dom.districtFilter.value = keepDistrict;
    }

    populateBookingVenues();
    applyFilters();

    var exactCount = state.places.filter(function (place) {
      var cityMatch = normalizeAdminText(place.city) === normalizeAdminText(city);
      var districtMatch = !district || district === "all" ||
        normalizeAdminText(place.district) === normalizeAdminText(district);
      return cityMatch && districtMatch;
    }).length;

    dom.mapStatus.textContent = "已載入 " + label + " 的 " + exactCount + " 間烤肉店公開資料";
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
      dom.mapStatus.textContent = "公開地圖服務目前沒有回應，可稍後按「重新抓取店家資料」";
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
    dom.mapStatus.textContent = "已載入 " + state.places.length + " 間公開店家資料；店家資料仍可能有缺漏";
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

  function locationPlatformSteps() {
    var ua = navigator.userAgent || "";
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isAndroid = /Android/i.test(ua);
    var isSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);

    if (isIOS && isSafari) {
      return [
        "確認 iPhone「設定 → 隱私權與安全性 → 定位服務」已開啟",
        "回到 Safari，點網址列左側的頁面選單（aA／頁面圖示）",
        "進入「網站設定」，把「位置」改成「允許」",
        "回到 BABIQ，按「我已開啟，重新偵測」"
      ];
    }

    if (isIOS) {
      return [
        "打開 iPhone「設定 → 隱私權與安全性 → 定位服務」",
        "找到目前使用的瀏覽器，允許它取用位置",
        "回到 BABIQ，重新整理頁面",
        "按「我已開啟，重新偵測」"
      ];
    }

    if (isAndroid) {
      return [
        "點網址列左側的網站資訊／權限圖示",
        "進入「權限」或「網站設定」",
        "將「位置」改成「允許」",
        "回到 BABIQ，按「我已開啟，重新偵測」"
      ];
    }

    return [
      "點瀏覽器網址列左側的網站資訊／權限圖示",
      "找到「位置」或 Location 權限",
      "將權限改成「允許」",
      "重新整理 BABIQ，再按「我已開啟，重新偵測」"
    ];
  }

  function setLocationGuideState(name) {
    var states = {
      intro: dom.locationGuideIntro,
      denied: dom.locationGuideDenied,
      loading: dom.locationGuideLoading,
      success: dom.locationGuideSuccess
    };

    Object.keys(states).forEach(function (key) {
      if (states[key]) states[key].hidden = key !== name;
    });
  }

  function openLocationGuide(stateName) {
    if (!dom.locationGuide) return;
    setLocationGuideState(stateName || "intro");
    dom.locationGuide.hidden = false;
    dom.locationGuide.setAttribute("aria-hidden", "false");
    document.body.classList.add("location-guide-open");

    if (stateName === "denied" && dom.locationPermissionSteps) {
      dom.locationPermissionSteps.innerHTML = locationPlatformSteps().map(function (step) {
        return "<li>" + safe(step) + "</li>";
      }).join("");
    }
  }

  function closeLocationGuide() {
    if (!dom.locationGuide) return;
    dom.locationGuide.hidden = true;
    dom.locationGuide.setAttribute("aria-hidden", "true");
    document.body.classList.remove("location-guide-open");
  }

  function showLocationEntry() {
    if (state.userLocation) {
      dom.sortFilter.value = "nearby";
      applyFilters();
      document.getElementById("discovery-section").scrollIntoView({ behavior: "smooth" });
      return;
    }
    openLocationGuide("intro");
  }

  function requestUserLocation(scrollToResults) {
    if (!navigator.geolocation) {
      dom.locationSummary.textContent = "此瀏覽器不支援定位";
      dom.mapStatus.textContent = "無法使用定位功能，仍可瀏覽全台店家";
      openLocationGuide("denied");
      return;
    }

    openLocationGuide("loading");
    dom.locationSummary.textContent = "正在取得目前位置…";
    if (dom.locateMe) dom.locateMe.disabled = true;
    if (dom.locateMeHero) dom.locateMeHero.disabled = true;

    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      state.userLocation = { lat: lat, lon: lon };
      dom.locationSummary.textContent = "定位已開啟 · 優先顯示最近店家";
      dom.sortFilter.value = "nearby";
      updateDistances();

      applyFilters();
      loadNearbyPlaces(lat, lon);
      openLocationGuide("success");

      if (scrollToResults === false) {
        closeLocationGuide();
      }

      if (dom.locateMe) {
        dom.locateMe.disabled = false;
        dom.locateMe.textContent = "✓ 定位已開啟";
      }
      if (dom.locateMeHero) dom.locateMeHero.disabled = false;
    }, function (error) {
      var permissionDenied = error && error.code === 1;
      dom.locationSummary.textContent = permissionDenied
        ? "定位權限未開啟 · 點這裡查看設定方式"
        : "暫時無法取得位置 · 可重新嘗試";

      dom.mapStatus.textContent = permissionDenied
        ? "定位權限目前被阻擋，請依照引導開啟後再重新偵測"
        : "暫時無法取得位置，請確認裝置定位服務與網路後再試";

      if (dom.sortFilter) dom.sortFilter.value = "relevance";
      if (dom.locateMe) dom.locateMe.disabled = false;
      if (dom.locateMeHero) dom.locateMeHero.disabled = false;
      applyFilters();
      openLocationGuide("denied");
    }, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    });
  }

  function populateDistrictFilter() {
    if (!dom.cityFilter || !dom.districtFilter) return;
    var previous = dom.districtFilter.value || "all";
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

    if (previous !== "all" && districts.indexOf(previous) !== -1) {
      dom.districtFilter.value = previous;
    }
  }

  function updateMapAreaLabel() {
    if (!dom.mapAreaTitle || !dom.mapAreaSubtitle) return;
    var city = dom.cityFilter ? dom.cityFilter.value : "all";
    var district = dom.districtFilter ? dom.districtFilter.value : "all";
    var title = "全台烤肉店";

    if (city !== "all") title = city + "烤肉店";
    if (city !== "all" && district !== "all") title = city + " " + district + "烤肉店";

    dom.mapAreaTitle.textContent = title;
    dom.mapAreaSubtitle.textContent = state.filtered.length + " 間符合條件｜可直接查看價位來源與特色";
  }

  function normalizeSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/台/g, "臺")
      .replace(/[，,、/|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function queryGroups(query) {
    var normalized = normalizeSearchText(query);
    if (!normalized) return [];

    return normalized.split(" ").filter(Boolean).reduce(function (groups, token) {
      var found = [];
      Object.keys(searchAliases).forEach(function (key) {
        var normalizedKey = normalizeSearchText(key);
        if (token.indexOf(normalizedKey) !== -1) {
          found.push(searchAliases[key].map(normalizeSearchText));
        }
      });

      if (found.length) return groups.concat(found);
      groups.push([token]);
      return groups;
    }, []);
  }

  function placeSearchText(place) {
    return normalizeSearchText([
      place.name,
      place.address,
      place.city,
      place.district,
      place.cuisine,
      place.features.join(" "),
      place.priceLabel
    ].join(" "));
  }

  function matchesSearch(place, query) {
    var groups = queryGroups(query);
    if (!groups.length) return true;
    var text = placeSearchText(place);

    return groups.every(function (options) {
      return options.some(function (option) {
        return text.indexOf(option) !== -1;
      });
    });
  }

  function featureMatches(place, feature) {
    if (!feature || feature === "all") return true;
    var text = normalizeSearchText([place.name, place.cuisine, place.features.join(" ")].join(" "));
    var patterns = {
      buffet: /吃到飽|放題|buffet|all you can eat/,
      japanese: /日式|yakiniku|焼肉/,
      korean: /韓式|korean/,
      wagyu: /和牛|wagyu|a5/,
      reservation: /可預約|線上訂位|reservation|booking/,
      outdoor: /戶外座位|outdoor/,
      takeaway: /可外帶|takeaway/
    };
    return patterns[feature] ? patterns[feature].test(text) : true;
  }

  function searchScore(place, query) {
    var groups = queryGroups(query);
    if (!groups.length) return 0;

    var name = normalizeSearchText(place.name);
    var location = normalizeSearchText((place.city || "") + " " + (place.district || ""));
    var features = normalizeSearchText(place.features.join(" "));
    var cuisine = normalizeSearchText(place.cuisine);
    var address = normalizeSearchText(place.address);
    var score = 0;

    groups.forEach(function (options) {
      options.forEach(function (option) {
        if (name.indexOf(option) !== -1) score = Math.max(score, score + 12);
        else if (features.indexOf(option) !== -1) score += 8;
        else if (location.indexOf(option) !== -1) score += 6;
        else if (cuisine.indexOf(option) !== -1) score += 5;
        else if (address.indexOf(option) !== -1) score += 3;
      });
    });

    if (place.priceSource) score += 1;
    if (normalizeUrl(place.bookingUrl) || normalizeUrl(place.website)) score += 1;
    return score;
  }

  function priceSearchUrl(place) {
    return "https://www.google.com/search?q=" +
      encodeURIComponent(place.name + " " + (place.address || "") + " 菜單 價格");
  }

  function matchesFilters(place) {
    var keyword = dom.searchInput.value.trim();
    var city = dom.cityFilter ? dom.cityFilter.value : "all";
    var district = dom.districtFilter ? dom.districtFilter.value : "all";
    var feature = dom.featureFilter ? dom.featureFilter.value : "all";
    var price = dom.priceFilter.value;

    var cityHaystack = normalizeAdminText((place.city || "") + " " + (place.address || ""));
    var districtHaystack = normalizeAdminText((place.district || "") + " " + (place.address || ""));

    return matchesSearch(place, keyword) &&
      featureMatches(place, feature) &&
      (city === "all" || cityHaystack.indexOf(normalizeAdminText(city)) !== -1) &&
      (district === "all" || districtHaystack.indexOf(normalizeAdminText(district)) !== -1) &&
      (price === "all" || place.priceTier === price);
  }

  function applyFilters() {
    state.filtered = state.places.filter(matchesFilters);
    var keyword = dom.searchInput.value.trim();
    var sort = dom.sortFilter ? dom.sortFilter.value : "relevance";

    if (sort === "nearby" && state.userLocation) {
      state.filtered.sort(function (a, b) {
        var da = Number.isFinite(a.distanceKm) ? a.distanceKm : Infinity;
        var db = Number.isFinite(b.distanceKm) ? b.distanceKm : Infinity;
        return da - db;
      });
    } else if (sort === "price-low") {
      state.filtered.sort(function (a, b) {
        var pa = Number.isFinite(a.priceMin) ? a.priceMin : Infinity;
        var pb = Number.isFinite(b.priceMin) ? b.priceMin : Infinity;
        if (pa !== pb) return pa - pb;
        return a.name.localeCompare(b.name, "zh-Hant");
      });
    } else if (sort === "relevance" && keyword) {
      state.filtered.sort(function (a, b) {
        return searchScore(b, keyword) - searchScore(a, keyword) ||
          a.name.localeCompare(b.name, "zh-Hant");
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
      var priceSource = place.priceSource
        ? (place.priceSourceUrl
          ? '<a class="price-source" href="' + safe(place.priceSourceUrl) + '" target="_blank" rel="noopener noreferrer">來源：' + safe(place.priceSource) + '</a>'
          : '<span class="price-source">來源：' + safe(place.priceSource) + '</span>')
        : '<a class="price-source price-source-muted" href="' + safe(priceSearchUrl(place)) + '" target="_blank" rel="noopener noreferrer">查目前菜單價位</a>';

      return '<article class="venue-card' + (state.selectedId === place.id ? " active" : "") + '" data-id="' + safe(place.id) + '">' +
        '<div class="venue-card-top">' +
          '<div><h3>' + safe(place.name) + '</h3>' +
          (distance ? '<span class="distance-tag">📍 ' + safe(distance) + ' 距離你</span>' : '') + '</div>' +
          '<div class="price-stack"><span class="price-tag">' + safe(place.priceLabel) + "</span>" + priceSource + "</div>" +
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
    if (dom.brandBookingSelect) dom.brandBookingSelect.value = "all";
    populateBookingVenues();
    dom.bookingVenue.value = id;
    showBranchDetails(id);
    renderList();
  }

  function getBookingBrand(id) {
    return bookingBrands.find(function (brand) { return brand.id === id; }) || null;
  }

  function brandMatchesPlace(brand, place) {
    if (!brand || !place) return false;
    var name = String(place.name || "").toLowerCase();
    return brand.aliases.some(function (alias) {
      return name.indexOf(String(alias).toLowerCase()) !== -1;
    });
  }

  function bookingBrandCount(brand) {
    return (brandBranches[brand.id] || []).length;
  }

  function renderBookingBrands() {
    if (dom.brandBookingSelect) {
      var current = dom.brandBookingSelect.value || "all";
      dom.brandBookingSelect.innerHTML = '<option value="all">全部品牌 / 自由選店</option>' +
        bookingBrands.map(function (brand) {
          var count = bookingBrandCount(brand);
          return '<option value="' + safe(brand.id) + '">' + safe(brand.name) +
            (count ? " (" + count + " 間)" : "") + '</option>';
        }).join("");
      dom.brandBookingSelect.value = bookingBrands.some(function (b) { return b.id === current; }) ? current : "all";
    }

    if (dom.brandPresetList) {
      var selected = dom.brandBookingSelect ? dom.brandBookingSelect.value : "all";
      dom.brandPresetList.innerHTML = bookingBrands.map(function (brand) {
        var count = bookingBrandCount(brand);
        return '<button type="button" class="brand-preset' + (selected === brand.id ? " active" : "") +
          '" data-brand="' + safe(brand.id) + '">' +
          '<span>' + safe(brand.name) + '</span>' +
          '<small>' + (count ? count + " 間已載入" : "官方訂位") + '</small>' +
        '</button>';
      }).join("");
    }
  }

  function updateBrandBookingInfo(brandId) {
    if (!dom.brandBookingInfo) return;
    var brand = getBookingBrand(brandId);
    if (!brand) {
      dom.brandBookingInfo.hidden = true;
      return;
    }

    dom.brandBookingInfo.hidden = false;
    dom.brandBookingName.textContent = brand.name + " 官方訂位";
    dom.brandBookingNote.textContent = brand.note;
    dom.brandBookingLink.href = brand.officialUrl;
  }

  function branchValue(brandId, branchId) {
    return "branch:" + brandId + ":" + branchId;
  }

  function getBranchFromValue(value) {
    var match = String(value || "").match(/^branch:([^:]+):(.+)$/);
    if (!match) return null;
    var brand = getBookingBrand(match[1]);
    var branches = brandBranches[match[1]] || [];
    var branch = branches.find(function (item) { return item.id === match[2]; });
    if (!brand || !branch) return null;
    return { brand: brand, branch: branch };
  }

  function branchGoogleMapsUrl(branch) {
    return "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(branch.name + " " + branch.address);
  }

  function showBranchDetails(value) {
    if (!dom.branchDetailCard) return;
    var selected = getBranchFromValue(value);
    if (!selected) {
      dom.branchDetailCard.hidden = true;
      return;
    }

    var brand = selected.brand;
    var branch = selected.branch;
    dom.branchDetailCard.hidden = false;
    dom.branchDetailSource.textContent = branch.source || "BRANCH INFO";
    dom.branchDetailName.textContent = branch.name;
    dom.branchDetailBrand.textContent = brand.name;
    dom.branchDetailAddress.textContent = branch.address || "地址待確認";
    dom.branchDetailPhone.textContent = branch.phone || "電話待確認";
    dom.branchDetailHours.textContent = branch.hours || "營業時間以官方訂位頁為準";
    dom.branchMapLink.href = branchGoogleMapsUrl(branch);
    dom.branchPhoneLink.href = branch.phone ? "tel:" + branch.phone.replace(/[^0-9+]/g, "") : "#";
    dom.branchPhoneLink.hidden = !branch.phone;
    dom.branchOfficialLink.href = branch.bookingUrl || brand.officialUrl;
  }

  function populateBookingVenues() {
    if (!dom.bookingVenue) return;
    var current = dom.bookingVenue.value;
    var brandId = dom.brandBookingSelect ? dom.brandBookingSelect.value : "all";
    var brand = getBookingBrand(brandId);
    var options = ['<option value="">選擇分店 / 店家</option>'];

    if (brand) {
      var branches = brandBranches[brand.id] || [];
      branches.forEach(function (branch) {
        options.push('<option value="' + safe(branchValue(brand.id, branch.id)) + '">' +
          safe(branch.name) + "｜" + safe(branch.address) + "</option>");
      });

      var extraPlaces = state.places.filter(function (place) {
        return brandMatchesPlace(brand, place) &&
          !branches.some(function (branch) {
            return normalizeAdminText(branch.name).indexOf(normalizeAdminText(place.name)) !== -1 ||
              normalizeAdminText(place.name).indexOf(normalizeAdminText(branch.name)) !== -1;
          });
      });

      if (extraPlaces.length) {
        options.push('<optgroup label="其他公開資料分店">');
        extraPlaces.forEach(function (place) {
          options.push('<option value="' + safe(place.id) + '">' + safe(place.name) + "</option>");
        });
        options.push("</optgroup>");
      }
    } else {
      state.places.slice(0, 450).forEach(function (place) {
        options.push('<option value="' + safe(place.id) + '">' + safe(place.name) + "</option>");
      });
    }

    dom.bookingVenue.innerHTML = options.join("");
    if (Array.from(dom.bookingVenue.options).some(function (option) { return option.value === current; })) {
      dom.bookingVenue.value = current;
    }
    updateBrandBookingInfo(brandId);
    renderBookingBrands();
    showBranchDetails(dom.bookingVenue.value);
  }

  function selectBookingBrand(brandId) {
    if (!dom.brandBookingSelect) return;
    dom.brandBookingSelect.value = brandId || "all";
    dom.bookingVenue.value = "";
    populateBookingVenues();

    document.querySelectorAll(".brand-preset").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-brand") === dom.brandBookingSelect.value);
    });

    var brand = getBookingBrand(dom.brandBookingSelect.value);
    if (brand) {
      dom.slotTitle.textContent = brand.name + " · 請選擇分店";
      dom.slotResults.innerHTML = '<div class="slot-placeholder">內建時段為示範資料；真實空位請使用上方品牌官方訂位入口</div>';
    } else {
      dom.slotTitle.textContent = "選一間店開始查詢";
      dom.slotResults.innerHTML = '<div class="slot-placeholder">查詢後會顯示 17:00–22:00 的示範時段</div>';
    }
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
    var builtIn = getBranchFromValue(id);
    var place = builtIn ? {
      id: id,
      name: builtIn.branch.name,
      address: builtIn.branch.address
    } : state.places.find(function (p) { return p.id === id; });

    if (!place || !date) {
      var selectedBrand = dom.brandBookingSelect ? getBookingBrand(dom.brandBookingSelect.value) : null;
      dom.slotTitle.textContent = selectedBrand
        ? selectedBrand.name + " · 請先選擇分店與日期"
        : "請先選擇店家與日期";
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

  [dom.searchInput, dom.featureFilter, dom.priceFilter, dom.sortFilter].forEach(function (control) {
    if (!control) return;
    control.addEventListener(control === dom.searchInput ? "input" : "change", applyFilters);
  });

  if (dom.cityFilter) {
    dom.cityFilter.addEventListener("change", function () {
      if (dom.districtFilter) dom.districtFilter.value = "all";
      populateDistrictFilter();

      var city = dom.cityFilter.value;
      if (city === "all") {
        state.adminRequestId += 1;
        applyFilters();
        dom.mapStatus.textContent = "已切換為全台資料，可繼續使用關鍵字與特色篩選";
      } else {
        loadAdministrativePlaces(city, "all");
      }
    });
  }
  if (dom.districtFilter) {
    dom.districtFilter.addEventListener("change", function () {
      var city = dom.cityFilter ? dom.cityFilter.value : "all";
      var district = dom.districtFilter.value;
      if (city === "all") {
        applyFilters();
        return;
      }
      loadAdministrativePlaces(city, district);
    });
  }
  if (dom.resetAreaFilters) {
    dom.resetAreaFilters.addEventListener("click", function () {
      state.adminRequestId += 1;
      dom.cityFilter.value = "all";
      populateDistrictFilter();
      applyFilters();
      dom.mapStatus.textContent = "已清除行政區條件，顯示全台店家";
    });
  }
  document.querySelectorAll(".feature-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var feature = chip.getAttribute("data-feature") || "all";
      if (dom.featureFilter) dom.featureFilter.value = feature;
      document.querySelectorAll(".feature-chip").forEach(function (item) {
        item.classList.toggle("active", item === chip);
      });
      applyFilters();
    });
  });

  if (dom.featureFilter) {
    dom.featureFilter.addEventListener("change", function () {
      document.querySelectorAll(".feature-chip").forEach(function (chip) {
        chip.classList.toggle("active", chip.getAttribute("data-feature") === dom.featureFilter.value);
      });
    });
  }

  if (dom.brandBookingSelect) {
    dom.brandBookingSelect.addEventListener("change", function () {
      selectBookingBrand(dom.brandBookingSelect.value);
    });
  }

  if (dom.bookingVenue) {
    dom.bookingVenue.addEventListener("change", function () {
      showBranchDetails(dom.bookingVenue.value);
      var builtIn = getBranchFromValue(dom.bookingVenue.value);
      if (builtIn) {
        dom.slotTitle.textContent = builtIn.branch.name + " · 選擇日期與人數";
      }
    });
  }

  if (dom.brandPresetList) {
    dom.brandPresetList.addEventListener("click", function (event) {
      var button = event.target.closest(".brand-preset");
      if (!button) return;
      selectBookingBrand(button.getAttribute("data-brand"));
      document.getElementById("availability").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  renderBookingBrands();
  populateBookingVenues();

  dom.reloadPlaces.addEventListener("click", loadPlaces);
  dom.availabilityForm.addEventListener("submit", renderAvailability);

  if (dom.locateMe) {
    dom.locateMe.addEventListener("click", showLocationEntry);
  }
  if (dom.locateMeHero) {
    dom.locateMeHero.addEventListener("click", showLocationEntry);
  }

  if (dom.locationPermissionButton) {
    dom.locationPermissionButton.addEventListener("click", function () {
      requestUserLocation(true);
    });
  }
  if (dom.retryLocationButton) {
    dom.retryLocationButton.addEventListener("click", function () {
      requestUserLocation(true);
    });
  }
  if (dom.viewNearbyButton) {
    dom.viewNearbyButton.addEventListener("click", function () {
      closeLocationGuide();
      document.getElementById("discovery-section").scrollIntoView({ behavior: "smooth" });
    });
  }
  document.querySelectorAll("[data-location-close]").forEach(function (control) {
    control.addEventListener("click", closeLocationGuide);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && dom.locationGuide && !dom.locationGuide.hidden) {
      closeLocationGuide();
    }
  });
  if (dom.quickNearbySearch) {
    dom.quickNearbySearch.addEventListener("click", function () {
      if (dom.quickDate && dom.bookingDate) dom.bookingDate.value = dom.quickDate.value;
      if (dom.quickParty && dom.partySize) dom.partySize.value = dom.quickParty.value;
      if (state.userLocation) {
        dom.sortFilter.value = "nearby";
        applyFilters();
        document.getElementById("discovery-section").scrollIntoView({ behavior: "smooth" });
      } else {
        showLocationEntry();
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

  // ------------------------------------------------------------
  // Pixel BBQ Kitchen — drag, place, cook, serve
  // ------------------------------------------------------------

  var canvas = document.getElementById("bbqGame");
  var ctx = canvas.getContext("2d");
  var startButton = document.getElementById("startGame");
  var extinguishButton = document.getElementById("extinguish");
  var difficultySelect = document.getElementById("difficultySelect");
  var gameTimeEl = document.getElementById("gameTime");
  var scoreEl = document.getElementById("gameScore");
  var servedEl = document.getElementById("gameCombo");
  var heatEl = document.getElementById("heatLevel");
  var messageEl = document.getElementById("gameMessage");
  var guideEl = document.getElementById("ingredientGuide");
  var gameResultCard = document.getElementById("gameResultCard");
  var gameResultTitle = document.getElementById("gameResultTitle");
  var gameResultSummary = document.getElementById("gameResultSummary");

  var grillRect = { x: 105, y: 72, w: 520, h: 300 };
  var hotRect = { x: 220, y: 132, w: 290, h: 185 };
  var trayRect = { x: 20, y: 402, w: 610, h: 98 };
  var serveRect = { x: 650, y: 72, w: 130, h: 300 };

  var ingredients = [
    { name:"牛小排", emoji:"🥩", target:11, tolerance:1.6, base:150, w:72, h:50, method:"快煎翻面", turns:1, preferred:"center", stars:3 },
    { name:"豬五花", emoji:"🥓", target:10, tolerance:1.45, base:145, w:78, h:42, method:"快煎翻面", turns:1, preferred:"center", stars:3 },
    { name:"雞腿肉", emoji:"🍗", target:16, tolerance:2.2, base:155, w:68, h:54, method:"兩面慢烤", turns:1, preferred:"edge", stars:3 },
    { name:"鮮蝦", emoji:"🦐", target:8, tolerance:1.15, base:170, w:60, h:42, method:"快速翻面", turns:1, preferred:"edge", stars:4 },
    { name:"魷魚", emoji:"🦑", target:9, tolerance:1.25, base:175, w:72, h:55, method:"高火快烤", turns:1, preferred:"center", stars:4 },
    { name:"干貝", emoji:"🦪", target:7, tolerance:1.05, base:185, w:48, h:48, method:"單面炙燒", turns:0, preferred:"edge", stars:4 },
    { name:"杏鮑菇", emoji:"🍄", target:14, tolerance:2.6, base:100, w:58, h:58, method:"慢烤旋轉", turns:2, preferred:"edge", stars:2 },
    { name:"玉米", emoji:"🌽", target:18, tolerance:3.1, base:115, w:88, h:40, method:"多次旋轉", turns:3, preferred:"edge", stars:2 },
    { name:"櫛瓜", emoji:"🥒", target:12, tolerance:2.2, base:105, w:76, h:38, method:"慢烤旋轉", turns:2, preferred:"edge", stars:2 },
    { name:"青椒", emoji:"🫑", target:11, tolerance:2.0, base:105, w:54, h:54, method:"均勻翻烤", turns:2, preferred:"edge", stars:2 },
    { name:"香腸", emoji:"🌭", target:15, tolerance:2.3, base:130, w:86, h:36, method:"滾動烤熟", turns:3, preferred:"edge", stars:3 },
    { name:"年糕", emoji:"🍡", target:6, tolerance:0.95, base:190, w:58, h:38, method:"極短快烤", turns:1, preferred:"edge", stars:5 },
    { name:"厚切牛舌", emoji:"🥩", target:8.5, tolerance:1.0, base:240, w:62, h:40, method:"高火快煎", turns:1, preferred:"center", stars:5 },
    { name:"鯖魚", emoji:"🐟", target:17, tolerance:2.4, base:180, w:96, h:52, method:"邊火慢烤", turns:1, preferred:"edge", stars:4 },

    { name:"A5 和牛骰子", emoji:"🥩", target:7.2, tolerance:0.75, base:360, w:50, h:50, method:"中央極高火", turns:1, preferred:"center", stars:5, hidden:true },
    { name:"伊勢龍蝦", emoji:"🦞", target:16, tolerance:1.7, base:460, w:105, h:62, method:"邊火雙面慢烤", turns:1, preferred:"edge", stars:5, hidden:true },
    { name:"帝王蟹腳", emoji:"🦀", target:13, tolerance:1.45, base:420, w:112, h:44, method:"邊火多次旋轉", turns:2, preferred:"edge", stars:5, hidden:true },
    { name:"黃金麻糬", emoji:"🍡", target:5.2, tolerance:0.55, base:390, w:52, h:40, method:"極短雙面", turns:1, preferred:"edge", stars:5, hidden:true }
  ];

  var materials = [
    { name:"木炭", emoji:"⬛", w:44, h:44, material:"charcoal", description:"放上烤網會提高整體火力" },
    { name:"冰塊", emoji:"🧊", w:44, h:44, material:"ice", description:"放上烤網短暫降溫，幾秒後融化" },
    { name:"鋁箔球", emoji:"⚪", w:42, h:42, material:"foil", description:"不會熟，只會佔據烤網空間" },
    { name:"餐巾紙", emoji:"🧻", w:48, h:48, material:"tissue", description:"丟上烤網會立刻起火" }
  ];

  var normalIngredients = ingredients.filter(function (item) { return !item.hidden; });
  var hiddenIngredients = ingredients.filter(function (item) { return item.hidden; });

  guideEl.innerHTML = normalIngredients.map(function (item) {
    var zone = item.preferred === "center" ? "🔥 中央" : "🌤 邊火";
    return '<div class="ingredient-row">' +
      '<span class="ingredient-icon">' + item.emoji + "</span>" +
      "<span><strong>" + item.name + "</strong><small>" + zone + " · " + item.method + " · 約 " + item.target.toFixed(0) + " 秒</small></span>" +
      '<span class="stars">' + "★".repeat(item.stars) + "</span>" +
    "</div>";
  }).join("") +
  '<div class="ingredient-secret"><strong>??? 隱藏食材</strong><span>共 ' + hiddenIngredients.length + ' 種，低機率出現</span></div>';

  var difficulty = {
    easy: { tolerance:1.35, speed:0.88, spawn:7.4, maxTray:6, eventGap:22 },
    normal: { tolerance:1, speed:1, spawn:6.1, maxTray:6, eventGap:17 },
    hard: { tolerance:0.78, speed:1.12, spawn:4.9, maxTray:7, eventGap:13 }
  };

  var game = {
    running:false,
    score:0,
    served:0,
    streak:0,
    bestStreak:0,
    startedAt:0,
    lastFrame:0,
    remaining:120,
    pieces:[],
    nextId:1,
    spawnTimer:0,
    nextEventAt:0,
    eventType:null,
    eventEndsAt:0,
    eventUsedWater:false,
    animationId:null,
    pointer:null,
    smoke:[],
    scorePopups:[],
    perfects:0,
    goods:0,
    burntServed:0,
    rawServed:0,
    hiddenServed:0,
    fires:0,
    elderHelps:0,
    fireDanger:0,
    elderTargetId:null,
    elderNextAction:0,
    title:""
  };

  function getCfg() {
    return difficulty[difficultySelect.value] || difficulty.normal;
  }

  function traySlots() {
    return [
      [65,451],[155,451],[245,451],[335,451],[425,451],[515,451],[595,451]
    ];
  }

  function randomItem(forceFood) {
    var roll = Math.random();
    if (!forceFood && roll < 0.035) {
      return materials[Math.floor(Math.random() * materials.length)];
    }
    if (!forceFood && roll < 0.065) {
      return hiddenIngredients[Math.floor(Math.random() * hiddenIngredients.length)];
    }
    return normalIngredients[Math.floor(Math.random() * normalIngredients.length)];
  }

  function makePiece(item) {
    return {
      id:game.nextId++,
      item:item,
      x:0,
      y:0,
      w:item.w,
      h:item.h,
      zone:"tray",
      cook:0,
      grillTime:0,
      zoneFitTime:0,
      turns:0,
      techniqueError:0,
      pulse:Math.random() * Math.PI * 2,
      burnt:false,
      materialLife:0
    };
  }

  function rectForPiece(piece, x, y) {
    var px = typeof x === "number" ? x : piece.x;
    var py = typeof y === "number" ? y : piece.y;
    return {
      x:px - piece.w / 2,
      y:py - piece.h / 2,
      w:piece.w,
      h:piece.h
    };
  }

  function rectContains(outer, inner, pad) {
    var p = pad || 0;
    return inner.x >= outer.x + p &&
      inner.y >= outer.y + p &&
      inner.x + inner.w <= outer.x + outer.w - p &&
      inner.y + inner.h <= outer.y + outer.h - p;
  }

  function overlap(a, b, pad) {
    var p = pad || 0;
    return a.x < b.x + b.w + p &&
      a.x + a.w + p > b.x &&
      a.y < b.y + b.h + p &&
      a.y + a.h + p > b.y;
  }

  function collidesOnGrill(piece, x, y) {
    var candidate = rectForPiece(piece, x, y);
    return game.pieces.some(function (other) {
      if (other.id === piece.id || other.zone !== "grill") return false;
      return overlap(candidate, rectForPiece(other), 5);
    });
  }

  function findTraySlot(piece) {
    var slots = traySlots();
    var trayPieces = game.pieces.filter(function (p) {
      return p.zone === "tray" && p.id !== piece.id;
    });

    for (var i = 0; i < slots.length; i += 1) {
      var x = slots[i][0];
      var y = slots[i][1];
      var test = rectForPiece(piece, x, y);
      var blocked = trayPieces.some(function (other) {
        return overlap(test, rectForPiece(other), 3);
      });
      if (!blocked) return { x:x, y:y };
    }
    return { x:55 + Math.random() * 535, y:450 };
  }

  function sendToTray(piece) {
    var slot = findTraySlot(piece);
    piece.x = slot.x;
    piece.y = slot.y;
    piece.zone = "tray";
  }

  function spawnPiece(forceFood) {
    var cfg = getCfg();
    var trayCount = game.pieces.filter(function (p) { return p.zone === "tray"; }).length;
    if (trayCount >= cfg.maxTray) return false;

    var piece = makePiece(randomItem(!!forceFood));
    game.pieces.push(piece);
    sendToTray(piece);

    if (piece.item.hidden) {
      messageEl.textContent = "✨ 隱藏食材出現：" + piece.item.name + "！";
    } else if (piece.item.material) {
      messageEl.textContent = "❓ 備料盤混入了「" + piece.item.name + "」：" + piece.item.description;
    }
    return true;
  }

  function seedInitialTray() {
    for (var i = 0; i < 5; i += 1) {
      spawnPiece(i < 3);
    }
  }

  function resetGame() {
    game.running = false;
    game.score = 0;
    game.served = 0;
    game.streak = 0;
    game.bestStreak = 0;
    game.remaining = 120;
    game.pieces = [];
    game.nextId = 1;
    game.spawnTimer = 0;
    game.eventType = null;
    game.eventEndsAt = 0;
    game.eventUsedWater = false;
    game.pointer = null;
    game.smoke = [];
    game.scorePopups = [];
    game.perfects = 0;
    game.goods = 0;
    game.burntServed = 0;
    game.rawServed = 0;
    game.hiddenServed = 0;
    game.fires = 0;
    game.elderHelps = 0;
    game.fireDanger = 0;
    game.elderTargetId = null;
    game.elderNextAction = 0;
    game.title = "";
    if (gameResultCard) gameResultCard.hidden = true;
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
    game.nextEventAt = 10 + Math.random() * 7;
    seedInitialTray();
    startButton.textContent = "重新開始";
    difficultySelect.disabled = true;
    messageEl.textContent = "把備料盤食材拖到烤網；點一下烤網食材可翻面／旋轉，熟了再拖去右側出餐";
    game.animationId = requestAnimationFrame(gameLoop);
  }

  function activeCharcoalCount() {
    return game.pieces.filter(function (piece) {
      return piece.zone === "grill" && piece.item.material === "charcoal";
    }).length;
  }

  function heatMultiplier() {
    var mult = 1;
    if (game.eventType === "flare") mult *= 1.72;
    if (game.eventType === "grease") mult *= 1.48;
    if (game.eventType === "wind") mult *= 0.67;
    if (game.eventType === "rain") mult *= 0.52;
    if (game.eventType === "ember") mult *= 1.28;
    if (game.eventType === "fire") mult *= 2.3;
    mult *= 1 + Math.min(0.45, activeCharcoalCount() * 0.16);
    return mult;
  }

  function heatPercent() {
    return Math.round(heatMultiplier() * 100);
  }

  function positionHeat(piece) {
    var r = rectForPiece(piece);
    var centerOverlap = overlap(r, hotRect, 0);
    return centerOverlap ? 1.22 : 0.78;
  }

  function currentHeatZone(piece) {
    return positionHeat(piece) > 1 ? "center" : "edge";
  }

  function triggerEvent(elapsed, forcedType) {
    var type = forcedType;
    if (!type) {
      var roll = Math.random();
      if (roll < 0.18) type = "flare";
      else if (roll < 0.34) type = "grease";
      else if (roll < 0.48) type = "wind";
      else if (roll < 0.60) type = "rain";
      else if (roll < 0.73) type = "rush";
      else if (roll < 0.84) type = "refill";
      else if (roll < 0.96) type = "elder";
      else type = "ember";
    }

    game.eventType = type;
    game.eventUsedWater = false;
    var duration = 6;
    if (type === "wind" || type === "rain") duration = 7;
    if (type === "rush") duration = 8;
    if (type === "elder") duration = 6.5;
    if (type === "fire") duration = 8;

    game.eventEndsAt = elapsed + duration;
    game.nextEventAt = elapsed + getCfg().eventGap + Math.random() * 7;
    extinguishButton.disabled = ["flare","grease","ember","fire"].indexOf(type) === -1;

    if (type === "flare") messageEl.textContent = "🔥 炭火失控！所有食材加速熟成";
    if (type === "grease") messageEl.textContent = "💥 油脂滴落！火力突然暴增";
    if (type === "wind") messageEl.textContent = "💨 風勢突變！火力下降";
    if (type === "rain") messageEl.textContent = "🌧 突然下雨！炭火變弱，熟成速度下降";
    if (type === "rush") messageEl.textContent = "🔔 客人催單！8 秒內成功出餐可獲得 35% 加成";
    if (type === "refill") {
      messageEl.textContent = "🍽 隔壁桌突然加菜！備料盤多了新食材";
      spawnPiece(false);
      spawnPiece(false);
    }
    if (type === "ember") messageEl.textContent = "✨ 炭火爆裂！短時間火力提升";
    if (type === "elder") {
      game.elderHelps += 1;
      game.elderNextAction = elapsed + 0.7;
      messageEl.textContent = "👋 長輩出手了：「哎呀這個要這樣烤啦！」";
    }
    if (type === "fire") {
      game.fires += 1;
      game.score = Math.max(0, game.score - 90);
      messageEl.textContent = "🚨 烤網失火！燒焦食物放太久引發火災，-90 分";
    }
  }

  function clearEvent(message) {
    game.eventType = null;
    game.eventEndsAt = 0;
    game.eventUsedWater = false;
    game.elderTargetId = null;
    extinguishButton.disabled = true;
    if (message) messageEl.textContent = message;
  }

  function updateSmoke(dt) {
    game.smoke.forEach(function (smoke) {
      smoke.y -= smoke.speed * dt;
      smoke.x += smoke.drift * dt;
      smoke.life -= dt;
      smoke.size += dt * 4;
    });
    game.smoke = game.smoke.filter(function (smoke) { return smoke.life > 0; });

    game.pieces.forEach(function (piece) {
      if (piece.zone !== "grill") return;
      var smoky = piece.burnt || piece.item.material === "tissue";
      if (smoky && Math.random() < dt * 7) {
        game.smoke.push({
          x:piece.x + (Math.random() - 0.5) * 22,
          y:piece.y - piece.h * 0.35,
          speed:18 + Math.random() * 16,
          drift:(Math.random() - 0.5) * 9,
          size:5 + Math.random() * 7,
          life:0.9 + Math.random() * 0.7
        });
      }
    });
  }

  function updateMaterials(dt, elapsed) {
    var removed = [];
    game.pieces.forEach(function (piece) {
      if (piece.zone !== "grill" || !piece.item.material) return;
      piece.materialLife += dt;

      if (piece.item.material === "ice" && piece.materialLife >= 3) {
        removed.push(piece.id);
        messageEl.textContent = "🧊 冰塊融化了，短暫降溫結束";
      }

      if (piece.item.material === "tissue" && piece.materialLife >= 2.6) {
        removed.push(piece.id);
      }
    });

    if (removed.length) {
      game.pieces = game.pieces.filter(function (piece) {
        return removed.indexOf(piece.id) === -1;
      });
    }
  }

  function materialHeatModifier() {
    var iceCount = game.pieces.filter(function (piece) {
      return piece.zone === "grill" && piece.item.material === "ice";
    }).length;
    return Math.max(0.48, 1 - iceCount * 0.22);
  }

  function addScorePopup(score, label) {
    game.scorePopups.push({
      x:serveRect.x + serveRect.w / 2,
      y:serveRect.y + serveRect.h / 2 + (Math.random() - 0.5) * 45,
      score:score,
      label:label || "",
      life:1.6,
      maxLife:1.6
    });
  }

  function updateScorePopups(dt) {
    game.scorePopups.forEach(function (popup) {
      popup.y -= 34 * dt;
      popup.life -= dt;
    });
    game.scorePopups = game.scorePopups.filter(function (popup) { return popup.life > 0; });
  }

  function updateFireRisk(dt, elapsed) {
    var burntCount = game.pieces.filter(function (piece) {
      return piece.zone === "grill" && !piece.item.material && piece.burnt;
    }).length;

    if (burntCount >= 2) {
      game.fireDanger += dt * (burntCount - 1) * 1.25;
    } else {
      game.fireDanger = Math.max(0, game.fireDanger - dt * 0.8);
    }

    if (burntCount >= 4) game.fireDanger = Math.max(game.fireDanger, 4.2);

    if (game.fireDanger >= 4 && game.eventType !== "fire") {
      game.fireDanger = 0;
      triggerEvent(elapsed, "fire");
    }
  }

  function elderCandidate() {
    var candidates = game.pieces.filter(function (piece) {
      return piece.zone === "grill" && !piece.item.material;
    });
    if (!candidates.length) return null;

    candidates.sort(function (a, b) {
      var ap = pieceProgress(a);
      var bp = pieceProgress(b);
      var aNeedTurn = a.turns < (a.item.turns || 0) ? 1 : 0;
      var bNeedTurn = b.turns < (b.item.turns || 0) ? 1 : 0;
      var aUrgency = (a.burnt ? 5 : 0) + Math.max(0, ap - 0.75) * 3 + aNeedTurn;
      var bUrgency = (b.burnt ? 5 : 0) + Math.max(0, bp - 0.75) * 3 + bNeedTurn;
      return bUrgency - aUrgency;
    });
    return candidates[0];
  }

  function updateElder(elapsed) {
    if (game.eventType !== "elder") {
      game.elderTargetId = null;
      return;
    }

    var piece = elderCandidate();
    game.elderTargetId = piece ? piece.id : null;
    if (!piece || elapsed < game.elderNextAction) return;
    game.elderNextAction = elapsed + 1.15;

    var required = piece.item.turns || 0;
    var progress = pieceProgress(piece);

    if (required > piece.turns) {
      var ideal = (piece.turns + 1) / (required + 1);
      if (Math.abs(progress - ideal) <= 0.22 || progress > ideal) {
        piece.turns += 1;
        piece.techniqueError = Math.max(0, piece.techniqueError - 0.12);
        messageEl.textContent = "👋 長輩：「現在翻！你看，這樣才會漂亮」";
        return;
      }
    }

    if (progress >= 0.92 && progress <= 1.12) {
      messageEl.textContent = "👋 長輩：「這片差不多囉，可以準備出餐」";
    } else if (currentHeatZone(piece) !== piece.item.preferred) {
      messageEl.textContent = "👋 長輩：「這個不要放那邊，" +
        (piece.item.preferred === "center" ? "移中間大火啦」" : "放旁邊慢慢烤啦」");
    } else {
      messageEl.textContent = "👋 長輩：「不要一直翻，先等一下啦」";
    }
  }

  function gameLoop(now) {
    if (!game.running) return;

    var dt = Math.min(0.06, Math.max(0, (now - game.lastFrame) / 1000));
    game.lastFrame = now;
    var elapsed = (now - game.startedAt) / 1000;
    game.remaining = Math.max(0, 120 - elapsed);

    if (!game.eventType && elapsed >= game.nextEventAt) triggerEvent(elapsed);
    if (game.eventType && elapsed >= game.eventEndsAt) clearEvent("事件結束，繼續顧火");
    updateFireRisk(dt, elapsed);
    updateElder(elapsed);

    var cfg = getCfg();
    var globalRate = cfg.speed * heatMultiplier() * materialHeatModifier();

    game.pieces.forEach(function (piece) {
      piece.pulse += dt * 5;
      if (piece.zone !== "grill" || piece.item.material) return;

      var localRate = globalRate * positionHeat(piece);
      piece.cook += dt * 1000 * localRate;
      piece.grillTime += dt * 1000;
      if (currentHeatZone(piece) === piece.item.preferred) {
        piece.zoneFitTime += dt * 1000;
      }

      var progress = piece.cook / (piece.item.target * 1000);
      if (progress > 1.28) piece.burnt = true;
    });

    updateMaterials(dt, elapsed);
    updateSmoke(dt);
    updateScorePopups(dt);

    game.spawnTimer += dt;
    if (game.spawnTimer >= cfg.spawn) {
      game.spawnTimer = 0;
      spawnPiece(false);
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
    servedEl.textContent = String(game.served);
    heatEl.textContent = heatPercent() + "%";
  }

  function performanceTitle() {
    var score = Math.max(0, Math.round(game.score));
    if (game.fires >= 2) return "稱號：烈焰失控王";
    if (game.burntServed >= 3) return "稱號：焦炭藝術家";
    if (game.elderHelps >= 3 && game.perfects <= 1) return "稱號：長輩監督學徒";
    if (game.hiddenServed >= 2 && score >= 1200) return "稱號：祕味獵人";
    if (game.perfects >= 5 && score >= 2000) return "稱號：炭火之神";
    if (score >= 1800) return "稱號：燒肉仙人";
    if (score >= 1250) return "稱號：火候職人";
    if (score >= 800) return "稱號：烤網掌門";
    if (score >= 450) return "稱號：熟度管理員";
    return "稱號：烤肉見習生";
  }

  function finishGame() {
    game.running = false;
    game.pointer = null;
    difficultySelect.disabled = false;
    extinguishButton.disabled = true;
    game.title = performanceTitle();

    var score = Math.max(0, Math.round(game.score));
    var summary = "總分 " + score +
      "｜出餐 " + game.served +
      "｜PERFECT " + game.perfects +
      "｜烤焦 " + game.burntServed +
      "｜火災 " + game.fires +
      "｜長輩出手 " + game.elderHelps + " 次";

    messageEl.textContent = "時間到！" + game.title + "｜" + summary;
    if (gameResultCard) {
      gameResultCard.hidden = false;
      if (gameResultTitle) gameResultTitle.textContent = game.title;
      if (gameResultSummary) gameResultSummary.textContent = summary;
    }
    drawScene();
  }

  function drawZone(rect, fill, stroke, label, labelColor) {
    ctx.fillStyle = fill;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = labelColor;
    ctx.font = "bold 12px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillText(label, rect.x + 10, rect.y + 18);
  }

  function drawPixelBackground() {
    ctx.fillStyle = "#1a120e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var y = 0; y < canvas.height; y += 24) {
      for (var x = (y / 24) % 2 === 0 ? 0 : 12; x < canvas.width; x += 24) {
        ctx.fillStyle = "#231710";
        ctx.fillRect(x, y, 12, 12);
      }
    }

    drawZone(trayRect, "#1e1915", "#59483b", "備料盤 · DRAG FROM HERE", "#c9b5a7");
    drawZone(serveRect, "#142019", "#3e7650", "出餐區", "#9fe2ad");

    ctx.fillStyle = "#2b211a";
    ctx.fillRect(grillRect.x - 12, grillRect.y - 12, grillRect.w + 24, grillRect.h + 24);
    ctx.fillStyle = "#0e0d0c";
    ctx.fillRect(grillRect.x, grillRect.y, grillRect.w, grillRect.h);

    ctx.fillStyle = "rgba(255,104,48,.12)";
    ctx.fillRect(hotRect.x, hotRect.y, hotRect.w, hotRect.h);
    ctx.strokeStyle = "rgba(255,122,56,.36)";
    ctx.setLineDash([5,5]);
    ctx.strokeRect(hotRect.x, hotRect.y, hotRect.w, hotRect.h);
    ctx.setLineDash([]);
    ctx.fillStyle = "#d67a45";
    ctx.font = "bold 10px ui-monospace, monospace";
    ctx.fillText("中央高火", hotRect.x + 7, hotRect.y + 14);
    ctx.fillStyle = "#8f8075";
    ctx.fillText("邊火慢烤", grillRect.x + 8, grillRect.y + 16);

    ctx.strokeStyle = "#706157";
    ctx.lineWidth = 4;
    for (var gx = grillRect.x + 14; gx < grillRect.x + grillRect.w - 8; gx += 34) {
      ctx.beginPath();
      ctx.moveTo(gx, grillRect.y + 25);
      ctx.lineTo(gx, grillRect.y + grillRect.h - 22);
      ctx.stroke();
    }
    for (var gy = grillRect.y + 34; gy < grillRect.y + grillRect.h - 14; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(grillRect.x + 8, gy);
      ctx.lineTo(grillRect.x + grillRect.w - 8, gy);
      ctx.stroke();
    }

    var fireColor = ["flare","grease","ember","fire"].indexOf(game.eventType) !== -1 ? "#ff7a28" : "#a83920";
    ctx.fillStyle = fireColor;
    for (var cx = grillRect.x + 18; cx < grillRect.x + grillRect.w - 20; cx += 48) {
      ctx.fillRect(cx, grillRect.y + grillRect.h - 20, 30, 8 + ((cx / 48) % 3) * 3);
    }

    if (game.eventType === "flare") {
      ctx.font = "30px serif";
      ctx.fillText("🔥", grillRect.x + 8, grillRect.y + 48);
      ctx.fillText("🔥", grillRect.x + grillRect.w - 42, grillRect.y + 48);
    } else if (game.eventType === "grease") {
      ctx.font = "28px serif";
      ctx.fillText("💥", grillRect.x + 10, grillRect.y + 48);
    } else if (game.eventType === "wind") {
      ctx.font = "30px serif";
      ctx.fillText("💨", grillRect.x + 10, grillRect.y + 48);
    } else if (game.eventType === "rain") {
      ctx.font = "28px serif";
      ctx.fillText("🌧", grillRect.x + 10, grillRect.y + 48);
    } else if (game.eventType === "rush") {
      ctx.font = "28px serif";
      ctx.fillText("🔔", serveRect.x + 46, serveRect.y + 55);
    } else if (game.eventType === "ember") {
      ctx.font = "28px serif";
      ctx.fillText("✨", grillRect.x + 10, grillRect.y + 48);
    } else if (game.eventType === "fire") {
      ctx.fillStyle = "rgba(255,76,20,.16)";
      ctx.fillRect(grillRect.x, grillRect.y, grillRect.w, grillRect.h);
      ctx.font = "34px serif";
      for (var fx = grillRect.x + 25; fx < grillRect.x + grillRect.w - 30; fx += 74) {
        ctx.fillText("🔥", fx, grillRect.y + grillRect.h - 42);
      }
      ctx.fillStyle = "#ffd3b0";
      ctx.font = "bold 14px ui-monospace, monospace";
      ctx.fillText("FIRE!", grillRect.x + grillRect.w - 58, grillRect.y + 24);
    }
  }

  function pieceProgress(piece) {
    if (piece.item.material) return 0;
    return piece.cook / (piece.item.target * 1000);
  }

  function drawPiece(piece) {
    var item = piece.item;
    var progress = pieceProgress(piece);
    var r = rectForPiece(piece);
    var cfg = getCfg();
    var toleranceRatio = item.material ? 0 : (item.tolerance * cfg.tolerance / item.target);
    var closeToReady = !item.material && Math.abs(1 - progress) <= toleranceRatio;
    var selected = game.pointer && game.pointer.id === piece.id;

    ctx.save();

    if (selected) {
      ctx.fillStyle = "rgba(255,190,110,.13)";
      ctx.fillRect(r.x - 5, r.y - 5, r.w + 10, r.h + 10);
    } else if (closeToReady && piece.zone === "grill") {
      ctx.fillStyle = "rgba(255,209,102," + (0.16 + Math.sin(piece.pulse) * 0.05) + ")";
      ctx.fillRect(r.x - 5, r.y - 5, r.w + 10, r.h + 10);
    }

    if (piece.zone === "grill") {
      ctx.strokeStyle = selected ? "#ffd384" : "rgba(255,255,255,.18)";
      ctx.lineWidth = selected ? 3 : 1;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }

    var fontSize = Math.max(28, Math.min(54, Math.min(piece.w, piece.h) * 0.92));
    ctx.font = fontSize + "px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = piece.burnt ? 0.58 : 1;
    ctx.fillText(item.emoji, piece.x, piece.y - 3);
    ctx.globalAlpha = 1;

    if (piece.burnt) {
      ctx.fillStyle = "rgba(20,10,4,.62)";
      ctx.fillRect(r.x + 5, r.y + 6, Math.max(8, r.w - 10), Math.max(8, r.h - 12));
      ctx.fillStyle = "#ff9a6b";
      ctx.font = "bold 11px ui-monospace, monospace";
      ctx.fillText("焦", piece.x, piece.y - 2);
    }

    ctx.fillStyle = item.hidden ? "#e9b9ff" : (item.material ? "#b9c7d6" : "#ddd0c7");
    ctx.font = "bold 9px ui-monospace, monospace";
    ctx.fillText(item.hidden ? "✨ " + item.name : item.name, piece.x, piece.y + piece.h / 2 + 10);

    if (piece.zone === "grill" && !item.material) {
      var barW = Math.min(70, piece.w + 16);
      var bx = piece.x - barW / 2;
      var by = piece.y + piece.h / 2 - 5;
      ctx.fillStyle = "#0d0c0b";
      ctx.fillRect(bx, by, barW, 6);
      ctx.fillStyle = progress < 0.76 ? "#70a96b" : (progress <= 1.16 ? "#ffd166" : "#ee5d4c");
      ctx.fillRect(bx + 1, by + 1, Math.max(0, Math.min(barW - 2, (barW - 2) * Math.min(progress, 1.2))), 4);

      var turnText = item.turns ? "↻ " + piece.turns + "/" + item.turns : "單面";
      ctx.fillStyle = "#efe4dc";
      ctx.font = "bold 8px ui-monospace, monospace";
      ctx.fillText(turnText, piece.x, r.y - 6);
    }

    ctx.restore();
  }

  function drawSmoke() {
    game.smoke.forEach(function (smoke) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(0.55, smoke.life * 0.45));
      ctx.fillStyle = "#b8ada6";
      ctx.beginPath();
      ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawDragFeedback() {
    if (!game.pointer) return;
    var piece = game.pieces.find(function (p) { return p.id === game.pointer.id; });
    if (!piece) return;

    var r = rectForPiece(piece);
    if (rectContains(grillRect, r, 4)) {
      var blocked = collidesOnGrill(piece, piece.x, piece.y);
      ctx.strokeStyle = blocked ? "#ff5c5c" : "#83d58d";
      ctx.lineWidth = 4;
      ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
      if (blocked) {
        ctx.fillStyle = "#ff8b8b";
        ctx.font = "bold 10px ui-monospace, monospace";
        ctx.fillText("空間不足", piece.x, r.y - 10);
      }
    } else if (rectContains(serveRect, r, 3)) {
      ctx.strokeStyle = "#8be9a1";
      ctx.lineWidth = 4;
      ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    }
  }

  function drawScorePopups() {
    game.scorePopups.forEach(function (popup) {
      var alpha = Math.max(0, popup.life / popup.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.font = "bold 18px ui-monospace, monospace";
      ctx.fillStyle = popup.score >= 0 ? "#9ff0aa" : "#ff8b83";
      var sign = popup.score >= 0 ? "+" : "";
      ctx.fillText(sign + popup.score, popup.x, popup.y);
      if (popup.label) {
        ctx.font = "bold 8px ui-monospace, monospace";
        ctx.fillStyle = "#f4e8df";
        ctx.fillText(popup.label, popup.x, popup.y + 14);
      }
      ctx.restore();
    });
  }

  function drawElderHand() {
    if (game.eventType !== "elder") return;
    var target = game.pieces.find(function (piece) { return piece.id === game.elderTargetId; });
    var tx = target ? target.x : grillRect.x + grillRect.w * 0.62;
    var ty = target ? target.y : grillRect.y + grillRect.h * 0.48;

    ctx.save();
    ctx.font = "58px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(Math.min(canvas.width - 48, tx + 68), Math.max(54, ty - 58));
    ctx.rotate(-0.45);
    ctx.fillText("👇", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(25,17,13,.92)";
    ctx.strokeStyle = "#b88358";
    ctx.lineWidth = 2;
    var bx = Math.min(canvas.width - 250, Math.max(18, tx - 100));
    var by = Math.max(18, ty - 105);
    ctx.fillRect(bx, by, 235, 42);
    ctx.strokeRect(bx, by, 235, 42);
    ctx.fillStyle = "#ffe0c2";
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillText("長輩：火候不是這樣顧的啦！", bx + 10, by + 17);
    ctx.fillStyle = "#cdb4a2";
    ctx.font = "9px ui-monospace, monospace";
    ctx.fillText("我示範幾秒，你看清楚", bx + 10, by + 32);
    ctx.restore();
  }

  function drawScene() {
    drawPixelBackground();
    game.pieces.filter(function (p) { return !(game.pointer && p.id === game.pointer.id); }).forEach(drawPiece);
    if (game.pointer) {
      var dragged = game.pieces.find(function (p) { return p.id === game.pointer.id; });
      if (dragged) drawPiece(dragged);
    }
    drawSmoke();
    drawScorePopups();
    drawElderHand();
    drawDragFeedback();

    if (!game.running) {
      ctx.fillStyle = "rgba(7,6,5,.64)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff4e8";
      ctx.font = "bold 30px ui-monospace, monospace";
      ctx.fillText(game.remaining <= 0 ? "TIME UP" : "DRAG & GRILL", canvas.width / 2, 228);
      ctx.fillStyle = "#f0b276";
      ctx.font = "bold 13px ui-monospace, monospace";
      ctx.fillText(
        game.remaining <= 0 ? "SCORE " + Math.round(game.score) : "START → DRAG → COOK → SERVE",
        canvas.width / 2,
        258
      );
      if (game.remaining <= 0 && game.title) {
        ctx.fillStyle = "#ffe0a8";
        ctx.font = "bold 17px ui-monospace, monospace";
        ctx.fillText(game.title.replace("稱號：",""), canvas.width / 2, 290);
      }
    }
  }

  function performTurn(piece) {
    if (!piece || piece.zone !== "grill" || piece.item.material) return;
    var required = piece.item.turns || 0;

    if (required === 0) {
      piece.techniqueError += 0.18;
      messageEl.textContent = piece.item.emoji + " " + piece.item.name + " 適合單面炙燒，不需要翻面";
      return;
    }

    if (piece.turns >= required) {
      piece.techniqueError += 0.22;
      messageEl.textContent = piece.item.emoji + " 翻太多次，表面會失去最佳焦香";
      return;
    }

    var progress = pieceProgress(piece);
    var ideal = (piece.turns + 1) / (required + 1);
    piece.techniqueError += Math.abs(progress - ideal);
    piece.turns += 1;
    messageEl.textContent = piece.item.emoji + " " + piece.item.name + "｜" + piece.item.method +
      " " + piece.turns + "/" + required;
  }

  function removePiece(id) {
    game.pieces = game.pieces.filter(function (piece) { return piece.id !== id; });
  }

  function servePiece(piece) {
    if (piece.item.material) {
      game.score = Math.max(0, game.score - 60);
      game.streak = 0;
      addScorePopup(-60, "非食材");
      messageEl.textContent = "❌ " + piece.item.name + " 不是食材，出餐扣 60 分";
      removePiece(piece.id);
      setTimeout(function () { if (game.running) spawnPiece(true); }, 260);
      return;
    }

    var cfg = getCfg();
    var progress = pieceProgress(piece);
    var toleranceRatio = piece.item.tolerance * cfg.tolerance / piece.item.target;
    var error = Math.abs(1 - progress);
    var techniqueReady = piece.turns >= (piece.item.turns || 0);
    var techniqueQuality = Math.max(0, 1 - piece.techniqueError * 1.7);
    var placementQuality = piece.grillTime > 0 ? piece.zoneFitTime / piece.grillTime : 0;
    var score = 0;
    var result = "";

    if (piece.burnt || progress > 1.3) {
      score = -Math.round(piece.item.base * 0.55);
      result = "烤焦出餐 " + score;
      game.burntServed += 1;
      game.streak = 0;
    } else if (progress < 0.74) {
      score = -30;
      result = "還沒熟 -30";
      game.rawServed += 1;
      game.streak = 0;
    } else if (!techniqueReady) {
      score = Math.round(piece.item.base * 0.25);
      result = "烤法未完成 +" + score;
      game.streak = 0;
    } else if (error <= toleranceRatio * 0.42 && techniqueQuality > 0.72 && placementQuality > 0.62) {
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      score = Math.round(piece.item.base * (1.7 + Math.min(0.8, game.streak * 0.08)));
      result = "PERFECT +" + score;
      game.perfects += 1;
    } else if (error <= toleranceRatio && techniqueQuality > 0.4) {
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      score = Math.round(piece.item.base * (1 + placementQuality * 0.3));
      result = "GOOD +" + score;
      game.goods += 1;
    } else {
      score = Math.round(piece.item.base * 0.38);
      result = "可出餐 +" + score;
      game.streak = 0;
    }

    if (piece.item.hidden && score > 0) {
      score = Math.round(score * 1.35);
      game.hiddenServed += 1;
      result += "｜隱藏加成";
    }

    if (game.eventType === "rush" && score > 0) {
      score = Math.round(score * 1.35);
      result += "｜催單 +35%";
    }

    game.score = Math.max(0, game.score + score);
    game.served += 1;
    addScorePopup(score, result.split("｜")[0]);
    messageEl.textContent = piece.item.emoji + " " + piece.item.name + "｜" + result;
    removePiece(piece.id);
    setTimeout(function () { if (game.running) spawnPiece(false); }, 260);
  }

  function handleMaterialPlaced(piece) {
    if (!piece.item.material || piece.zone !== "grill") return;
    var elapsed = (performance.now() - game.startedAt) / 1000;

    if (piece.item.material === "tissue") {
      piece.burnt = true;
      game.score = Math.max(0, game.score - 25);
      triggerEvent(elapsed, "flare");
      messageEl.textContent = "🧻 餐巾紙著火！-25 分，火勢暴增";
    } else if (piece.item.material === "ice") {
      piece.materialLife = 0;
      messageEl.textContent = "🧊 冰塊上網，整體火力暫時下降";
    } else if (piece.item.material === "charcoal") {
      messageEl.textContent = "⬛ 加入木炭：火力提升，但會佔據烤網空間";
    } else if (piece.item.material === "foil") {
      messageEl.textContent = "⚪ 鋁箔球卡在烤網上，只會佔位置";
    }
  }

  function canvasPoint(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x:(event.clientX - rect.left) * canvas.width / rect.width,
      y:(event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  function findPieceAt(x, y) {
    for (var i = game.pieces.length - 1; i >= 0; i -= 1) {
      var piece = game.pieces[i];
      var r = rectForPiece(piece);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return piece;
    }
    return null;
  }

  canvas.addEventListener("pointerdown", function (event) {
    if (!game.running) return;
    var p = canvasPoint(event);
    var piece = findPieceAt(p.x, p.y);
    if (!piece) return;

    event.preventDefault();
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(event.pointerId); } catch (ignore) {}
    }

    game.pointer = {
      pointerId:event.pointerId,
      id:piece.id,
      offsetX:p.x - piece.x,
      offsetY:p.y - piece.y,
      startX:p.x,
      startY:p.y,
      originX:piece.x,
      originY:piece.y,
      originZone:piece.zone,
      moved:false
    };
  });

  canvas.addEventListener("pointermove", function (event) {
    if (!game.running || !game.pointer || game.pointer.pointerId !== event.pointerId) return;
    event.preventDefault();
    var p = canvasPoint(event);
    var piece = game.pieces.find(function (item) { return item.id === game.pointer.id; });
    if (!piece) return;

    piece.x = Math.max(piece.w / 2, Math.min(canvas.width - piece.w / 2, p.x - game.pointer.offsetX));
    piece.y = Math.max(piece.h / 2, Math.min(canvas.height - piece.h / 2, p.y - game.pointer.offsetY));

    if (Math.hypot(p.x - game.pointer.startX, p.y - game.pointer.startY) > 7) {
      game.pointer.moved = true;
    }
    drawScene();
  });

  function finishPointer(event) {
    if (!game.pointer || game.pointer.pointerId !== event.pointerId) return;
    var pointer = game.pointer;
    var piece = game.pieces.find(function (item) { return item.id === pointer.id; });
    game.pointer = null;
    if (!piece) return;

    var pieceRect = rectForPiece(piece);
    var inGrill = rectContains(grillRect, pieceRect, 4);
    var inServe = rectContains(serveRect, pieceRect, 3);
    var inTray = rectContains(trayRect, pieceRect, 2);

    if (!pointer.moved && pointer.originZone === "grill") {
      piece.x = pointer.originX;
      piece.y = pointer.originY;
      piece.zone = pointer.originZone;
      performTurn(piece);
      drawScene();
      return;
    }

    if (inServe) {
      servePiece(piece);
      drawScene();
      return;
    }

    if (inGrill) {
      if (collidesOnGrill(piece, piece.x, piece.y)) {
        piece.x = pointer.originX;
        piece.y = pointer.originY;
        piece.zone = pointer.originZone;
        messageEl.textContent = "▦ 這個位置放不下，食材不能互相重疊";
      } else {
        piece.zone = "grill";
        if (pointer.originZone !== "grill") handleMaterialPlaced(piece);
        if (!piece.item.material) {
          var zone = currentHeatZone(piece) === "center" ? "中央高火" : "邊火";
          messageEl.textContent = piece.item.emoji + " " + piece.item.name + " 放上 " + zone + "｜建議：" + piece.item.method;
        }
      }
      drawScene();
      return;
    }

    if (inTray) {
      piece.zone = "tray";
      if (!rectContains(trayRect, pieceRect, 4)) sendToTray(piece);
      messageEl.textContent = "已把 " + piece.item.name + " 放回備料盤";
      drawScene();
      return;
    }

    piece.x = pointer.originX;
    piece.y = pointer.originY;
    piece.zone = pointer.originZone;
    messageEl.textContent = "請拖到烤網、備料盤或右側出餐區";
    drawScene();
  }

  canvas.addEventListener("pointerup", function (event) {
    event.preventDefault();
    finishPointer(event);
  });

  canvas.addEventListener("pointercancel", function (event) {
    if (!game.pointer || game.pointer.pointerId !== event.pointerId) return;
    var piece = game.pieces.find(function (item) { return item.id === game.pointer.id; });
    if (piece) {
      piece.x = game.pointer.originX;
      piece.y = game.pointer.originY;
      piece.zone = game.pointer.originZone;
    }
    game.pointer = null;
    drawScene();
  });

  extinguishButton.addEventListener("click", function () {
    if (!game.running || !game.eventType || game.eventType === "wind") return;
    if (game.eventUsedWater) return;
    game.eventUsedWater = true;
    game.score = Math.max(0, game.score - 20);
    if (game.eventType === "fire") game.fireDanger = 0;
    clearEvent("💧 火勢壓下來了，代價 -20 分");
    updateHud();
  });

  startButton.addEventListener("click", startGame);
  difficultySelect.addEventListener("change", drawScene);

  resetGame();
})();