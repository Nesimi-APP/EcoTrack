export type Language = "az" | "en" | "tr";

export type Translations = {
  auth: {
    tagline: string;
    login: {
      heading: string;
      email: string;
      password: string;
      loginBtn: string;
      loggingIn: string;
      or: string;
      createAccount: string;
      errorTitle: string;
      errorFill: string;
      errorGeneral: string;
    };
    register: {
      tagline: string;
      heading: string;
      name: string;
      namePlaceholder: string;
      email: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPlaceholder: string;
      registerBtn: string;
      registering: string;
      alreadyHaveAccount: string;
      loginLink: string;
      errorFill: string;
      errorShortPass: string;
      errorPassMismatch: string;
      errorTitle: string;
      errorGeneral: string;
    };
  };
  onboarding: {
    skip: string;
    next: string;
    start: string;
    slides: { title: string; subtitle: string }[];
  };
  dashboard: {
    greeting: string;
    level: string;
    streakDays: string;
    thisMonth: string;
    target: string;
    treesSaved: string;
    tip: string;
    weeklyChart: string;
    recentEntries: string;
    seeAll: string;
    dailyEntry: string;
    noEntries: string;
    noEntriesDesc: string;
    months: string[];
  };
  calculator: {
    co2Display: string;
    total: string;
    tabs: { transport: string; energy: string; food: string };
    transport: { distance: string; vehicleType: string; vehicles: Record<string, string> };
    energy: { electricity: string; gas: string; info: string };
    food: { foodType: string; mealCount: string; foods: Record<string, string> };
    save: string;
    saved: string;
  };
  achievements: {
    currentLevel: string;
    level: string;
    streak: string;
    entriesCompleted: string;
    moreEntries: string;
    maxLevel: string;
    treesSaved: string;
    co2ThisMonth: string;
    badge: string;
    carbonRanking: string;
    rankingDesc: string;
    loading: string;
    noUsers: string;
    entries: string;
    you: string;
    badges: string;
    earned: string;
    earnedBadge: string;
  };
  profile: {
    entries: string;
    streak: string;
    badges: string;
    ecoImpact: string;
    treesSaved: string;
    co2ThisMonth: string;
    settings: string;
    darkMode: string;
    active: string;
    inactive: string;
    notifications: string;
    reminders: string;
    wiki: string;
    allEntries: string;
    about: string;
    appDesc: string;
    logout: string;
    language: string;
  };
  entries: {
    entries: string;
    total: string;
    noEntries: string;
    noEntriesDesc: string;
    deleteTitle: string;
    deleteConfirm: string;
    cancel: string;
    delete: string;
  };
  notifications: {
    clearAll: string;
    empty: string;
    emptyDesc: string;
    items: { title: string; body: string; time: string }[];
  };
  map: {
    locations: string;
    expand: string;
    about: string;
    contact: string;
    directions: string;
    mapAbout: string;
    allLocationsTitle: string;
    locationsFound: string;
    noLocations: string;
    phone: string;
    website: string;
  };
  tabs: {
    home: string;
    calculator: string;
    map: string;
    achievements: string;
    profile: string;
  };
  nav: {
    back: string;
    notifications: string;
    entries: string;
    wiki: string;
  };
  badges: Record<string, { name: string; description: string }>;
};

const az: Translations = {
  auth: {
    tagline: "Karbon İzi İzləyici",
    login: {
      heading: "Hesabınıza daxil olun",
      email: "E-poçt",
      password: "Şifrə",
      loginBtn: "Daxil ol",
      loggingIn: "Giriş edilir...",
      or: "və ya",
      createAccount: "Yeni hesab yarat",
      errorTitle: "Giriş uğursuz",
      errorFill: "E-poçt və şifrəni daxil edin",
      errorGeneral: "Xəta baş verdi",
    },
    register: {
      tagline: "Hesab yaradın",
      heading: "Yeni hesab",
      name: "Ad",
      namePlaceholder: "Adınızı daxil edin",
      email: "E-poçt",
      password: "Şifrə",
      passwordPlaceholder: "Ən az 6 simvol",
      confirmPassword: "Şifrəni Təsdiqlə",
      confirmPlaceholder: "Şifrəni yenidən daxil edin",
      registerBtn: "Qeydiyyatdan keç",
      registering: "Qeydiyyat edilir...",
      alreadyHaveAccount: "artıq hesabınız var?",
      loginLink: "Daxil ol",
      errorFill: "Bütün sahələri doldurun",
      errorShortPass: "Şifrə ən az 6 simvol olmalıdır",
      errorPassMismatch: "Şifrələr uyğun gəlmir",
      errorTitle: "Qeydiyyat uğursuz",
      errorGeneral: "Xəta baş verdi",
    },
  },
  onboarding: {
    skip: "Atla",
    next: "İrəli",
    start: "Başla",
    slides: [
      {
        title: "İzinizi Görün",
        subtitle: "Gündəlik hərəkətlərinizin karbon ekosistemine necə təsir etdiyini real vaxtda izləyin.",
      },
      {
        title: "Hərəkətə Keçin",
        subtitle: "Gündəlik vərdişlərinizi dəyişdirin. Küçük qərarlar böyük fərq yaradır.",
      },
      {
        title: "Tullantıları İdarə Edin",
        subtitle: "Yaxınlığınızdakı e-tullantı toplama məntəqələrini tapın. Geri dönüşüm planetimizi xilas edir.",
      },
    ],
  },
  dashboard: {
    greeting: "Salam",
    level: "Səviyyə",
    streakDays: "gün ard.",
    thisMonth: "Bu Ay",
    target: "Hədəf",
    treesSaved: "ağac qənaəti",
    tip: "Günün məsləhəti",
    weeklyChart: "Həftəlik Karbon İzi",
    recentEntries: "Son Girişlər",
    seeAll: "Hamısı →",
    dailyEntry: "Gündəlik giriş",
    noEntries: "Hələ giriş yoxdur",
    noEntriesDesc: "Kalkulyatordan ilk karbon girişinizi əlavə edin",
    months: ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"],
  },
  calculator: {
    co2Display: "Bu tab üzrə CO₂",
    total: "Cəmi",
    tabs: { transport: "Nəqliyyat", energy: "Enerji", food: "Qida" },
    transport: {
      distance: "Məsafə (km)",
      vehicleType: "Nəqliyyat növü",
      vehicles: { car_petrol: "Benzin", car_electric: "Elektrik", bus: "Avtobus", metro: "Metro", motorcycle: "Moto" },
    },
    energy: {
      electricity: "Elektrik (kVt·saat)",
      gas: "Qaz (m³)",
      info: "Elektrik: 0.233 kq/kVt · Qaz: 2.04 kq/m³",
    },
    food: {
      foodType: "Qida növü",
      mealCount: "Yemək sayı",
      foods: { beef: "Mal əti", lamb: "Quzu əti", pork: "Donuz əti", chicken: "Toyuq", fish: "Balıq", vegan: "Vegan" },
    },
    save: "Girişi Saxla",
    saved: "Saxlanıldı!",
  },
  achievements: {
    currentLevel: "Cari Səviyyə",
    level: "Səviyyə",
    streak: "Ardıcıl gün",
    entriesCompleted: "giriş tamamlandı",
    moreEntries: "giriş daha → Səviyyə",
    maxLevel: "Maksimum səviyyə!",
    treesSaved: "Ağac qənaəti",
    co2ThisMonth: "kq CO₂ bu ay",
    badge: "Nişan",
    carbonRanking: "Karbon Sıralaması",
    rankingDesc: "Aşağı CO₂ = daha yaxşı sıralama",
    loading: "Yüklənir...",
    noUsers: "Hələ heç bir istifadəçi yoxdur",
    entries: "giriş",
    you: "(Siz)",
    badges: "Nişanlar",
    earned: "qazanıldı",
    earnedBadge: "Qazanıldı",
  },
  profile: {
    entries: "Giriş",
    streak: "Ardıcıl gün",
    badges: "Nişan",
    ecoImpact: "Ekotəsir",
    treesSaved: "Ağac qənaəti",
    co2ThisMonth: "kq CO₂ bu ay",
    settings: "Parametrlər",
    darkMode: "Gecə rejimi",
    active: "Aktiv",
    inactive: "Deaktiv",
    notifications: "Bildirişlər",
    reminders: "Xatırlatmalar",
    wiki: "Eko-Vikipediya",
    allEntries: "Bütün Girişlər",
    about: "Haqqında",
    appDesc: "Karbon izi izləmə və e-tullantı idarəetmə sistemi. IPCC standartlarına əsaslanan hesablama metodologiyası.",
    logout: "Çıxış et",
    language: "Dil",
  },
  entries: {
    entries: "giriş",
    total: "Cəmi",
    noEntries: "Hələ giriş yoxdur",
    noEntriesDesc: "Kalkulyatordan ilk karbon girişinizi əlavə edin",
    deleteTitle: "Girişi Sil",
    deleteConfirm: "Bu girişi silmək istədiyinizə əminsiniz?",
    cancel: "Ləğv et",
    delete: "Sil",
  },
  notifications: {
    clearAll: "Hamısını sil",
    empty: "Bildiriş yoxdur",
    emptyDesc: "Yeni bildirişlər burada görünəcək",
    items: [
      { title: "Karbon girişi xatırlatması", body: "Bu gün karbon kalkulyatorunu yeniləməmisiniz!", time: "2 saat əvvəl" },
      { title: "Təbrikler!", body: "Bu həftə karbon izinizi 10% azaltdınız.", time: "1 gün əvvəl" },
      { title: "Yeni toplama məntəqəsi", body: "Yaxınlığınızda yeni bir e-tullantı toplama məntəqəsi açıldı.", time: "3 gün əvvəl" },
      { title: "Günün məsləhəti", body: "Velosiped sürərək işə getmək gündə 4.6 kq CO₂ azaldır.", time: "4 gün əvvəl" },
      { title: "Həftəlik hesabat", body: "Bu həftəki karbon iziniz: 12.4 kq CO₂. Hədəfinizin 60%-ni qənaət etdiniz.", time: "1 həftə əvvəl" },
    ],
  },
  map: {
    locations: "məntəqə",
    expand: "Daha çox görmək üçün yuxarı çəkin",
    about: "Haqqında",
    contact: "Əlaqə",
    directions: "Yol Tarifini Al",
    mapAbout: "Bu məntəqədə zərərli tullantılar, elektrik cihazları və emal üçün uyğun materiallar qəbul edilir. Zəhmət olmasa tullantıları kateqoriyalara görə ayırılmış qablara atın.",
    allLocationsTitle: "E-Tullantı Məntəqələri",
    locationsFound: "məntəqə tapıldı",
    noLocations: "Bu kateqoriyada məntəqə yoxdur",
    phone: "+994 12 000 00 00",
    website: "ecotrack.az",
  },
  tabs: {
    home: "Ana Səhifə",
    calculator: "Kalkulyator",
    map: "Xəritə",
    achievements: "Nailiyyətlər",
    profile: "Profil",
  },
  nav: {
    back: "Geri",
    notifications: "Bildirişlər",
    entries: "Bütün Girişlər",
    wiki: "Eko-Vikipediya",
  },
  badges: {
    first_entry: { name: "İlk Addım", description: "İlk karbon girişinizi etdiniz" },
    co2_saver: { name: "CO₂ Qənaətçisi", description: "50 kq CO₂ izləndi" },
    tree_planter: { name: "Ağac Əkən", description: "5 ağac ekvivalenti qənaət edildi" },
    carbon_champion: { name: "Karbon Çempionu", description: "100 kq CO₂ izləndi" },
    eco_master: { name: "Eko Usta", description: "200 kq CO₂ izləndi" },
  },
};

const en: Translations = {
  auth: {
    tagline: "Carbon Footprint Tracker",
    login: {
      heading: "Sign in to your account",
      email: "Email",
      password: "Password",
      loginBtn: "Sign In",
      loggingIn: "Signing in...",
      or: "or",
      createAccount: "Create new account",
      errorTitle: "Sign in failed",
      errorFill: "Please enter your email and password",
      errorGeneral: "An error occurred",
    },
    register: {
      tagline: "Create Account",
      heading: "New account",
      name: "Name",
      namePlaceholder: "Enter your name",
      email: "Email",
      password: "Password",
      passwordPlaceholder: "At least 6 characters",
      confirmPassword: "Confirm Password",
      confirmPlaceholder: "Re-enter your password",
      registerBtn: "Register",
      registering: "Registering...",
      alreadyHaveAccount: "already have an account?",
      loginLink: "Sign In",
      errorFill: "Please fill in all fields",
      errorShortPass: "Password must be at least 6 characters",
      errorPassMismatch: "Passwords do not match",
      errorTitle: "Registration failed",
      errorGeneral: "An error occurred",
    },
  },
  onboarding: {
    skip: "Skip",
    next: "Next",
    start: "Get Started",
    slides: [
      { title: "Track Your Impact", subtitle: "See in real time how your daily actions affect the carbon ecosystem." },
      { title: "Take Action", subtitle: "Change your daily habits. Small decisions make a big difference." },
      { title: "Manage E-Waste", subtitle: "Find nearby e-waste collection points. Recycling saves our planet." },
    ],
  },
  dashboard: {
    greeting: "Hello",
    level: "Level",
    streakDays: "day streak",
    thisMonth: "This Month",
    target: "Target",
    treesSaved: "trees saved",
    tip: "Daily Tip",
    weeklyChart: "Weekly Carbon Footprint",
    recentEntries: "Recent Entries",
    seeAll: "All →",
    dailyEntry: "Daily entry",
    noEntries: "No entries yet",
    noEntriesDesc: "Add your first carbon entry from the Calculator",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  calculator: {
    co2Display: "CO₂ for this tab",
    total: "Total",
    tabs: { transport: "Transport", energy: "Energy", food: "Food" },
    transport: {
      distance: "Distance (km)",
      vehicleType: "Vehicle type",
      vehicles: { car_petrol: "Petrol", car_electric: "Electric", bus: "Bus", metro: "Metro", motorcycle: "Moto" },
    },
    energy: {
      electricity: "Electricity (kWh)",
      gas: "Gas (m³)",
      info: "Electricity: 0.233 kg/kWh · Gas: 2.04 kg/m³",
    },
    food: {
      foodType: "Food type",
      mealCount: "Meal count",
      foods: { beef: "Beef", lamb: "Lamb", pork: "Pork", chicken: "Chicken", fish: "Fish", vegan: "Vegan" },
    },
    save: "Save Entry",
    saved: "Saved!",
  },
  achievements: {
    currentLevel: "Current Level",
    level: "Level",
    streak: "Day streak",
    entriesCompleted: "entries completed",
    moreEntries: "more entries → Level",
    maxLevel: "Maximum level!",
    treesSaved: "Trees saved",
    co2ThisMonth: "kg CO₂ this month",
    badge: "Badge",
    carbonRanking: "Carbon Ranking",
    rankingDesc: "Lower CO₂ = better ranking",
    loading: "Loading...",
    noUsers: "No users yet",
    entries: "entries",
    you: "(You)",
    badges: "Badges",
    earned: "earned",
    earnedBadge: "Earned",
  },
  profile: {
    entries: "Entries",
    streak: "Day streak",
    badges: "Badges",
    ecoImpact: "Eco Impact",
    treesSaved: "Trees saved",
    co2ThisMonth: "kg CO₂ this month",
    settings: "Settings",
    darkMode: "Dark Mode",
    active: "Active",
    inactive: "Inactive",
    notifications: "Notifications",
    reminders: "Reminders",
    wiki: "Eco-Wikipedia",
    allEntries: "All Entries",
    about: "About",
    appDesc: "Carbon footprint tracking and e-waste management system. Calculation methodology based on IPCC standards.",
    logout: "Sign Out",
    language: "Language",
  },
  entries: {
    entries: "entries",
    total: "Total",
    noEntries: "No entries yet",
    noEntriesDesc: "Add your first carbon entry from the Calculator",
    deleteTitle: "Delete Entry",
    deleteConfirm: "Are you sure you want to delete this entry?",
    cancel: "Cancel",
    delete: "Delete",
  },
  notifications: {
    clearAll: "Clear All",
    empty: "No notifications",
    emptyDesc: "New notifications will appear here",
    items: [
      { title: "Carbon entry reminder", body: "You haven't updated your carbon calculator today!", time: "2 hours ago" },
      { title: "Congratulations!", body: "You reduced your carbon footprint by 10% this week.", time: "1 day ago" },
      { title: "New collection point", body: "A new e-waste collection point has opened near you.", time: "3 days ago" },
      { title: "Daily tip", body: "Cycling to work reduces CO₂ by 4.6 kg per day.", time: "4 days ago" },
      { title: "Weekly report", body: "Your carbon footprint this week: 12.4 kg CO₂. You saved 60% of your goal.", time: "1 week ago" },
    ],
  },
  map: {
    locations: "locations",
    expand: "Pull up to see more",
    about: "About",
    contact: "Contact",
    directions: "Get Directions",
    mapAbout: "This location accepts hazardous waste, electrical appliances and materials suitable for processing. Please sort waste into designated containers.",
    allLocationsTitle: "E-Waste Locations",
    locationsFound: "locations found",
    noLocations: "No locations in this category",
    phone: "+994 12 000 00 00",
    website: "ecotrack.az",
  },
  tabs: {
    home: "Home",
    calculator: "Calculator",
    map: "Map",
    achievements: "Achievements",
    profile: "Profile",
  },
  nav: {
    back: "Back",
    notifications: "Notifications",
    entries: "All Entries",
    wiki: "Eco-Wikipedia",
  },
  badges: {
    first_entry: { name: "First Step", description: "You logged your first carbon entry" },
    co2_saver: { name: "CO₂ Saver", description: "50 kg CO₂ tracked" },
    tree_planter: { name: "Tree Planter", description: "5 tree equivalents saved" },
    carbon_champion: { name: "Carbon Champion", description: "100 kg CO₂ tracked" },
    eco_master: { name: "Eco Master", description: "200 kg CO₂ tracked" },
  },
};

const tr: Translations = {
  auth: {
    tagline: "Karbon Ayak İzi Takipçisi",
    login: {
      heading: "Hesabınıza giriş yapın",
      email: "E-posta",
      password: "Şifre",
      loginBtn: "Giriş Yap",
      loggingIn: "Giriş yapılıyor...",
      or: "veya",
      createAccount: "Yeni hesap oluştur",
      errorTitle: "Giriş başarısız",
      errorFill: "E-posta ve şifrenizi girin",
      errorGeneral: "Bir hata oluştu",
    },
    register: {
      tagline: "Hesap Oluştur",
      heading: "Yeni hesap",
      name: "Ad",
      namePlaceholder: "Adınızı girin",
      email: "E-posta",
      password: "Şifre",
      passwordPlaceholder: "En az 6 karakter",
      confirmPassword: "Şifreyi Onayla",
      confirmPlaceholder: "Şifrenizi tekrar girin",
      registerBtn: "Kayıt Ol",
      registering: "Kaydediliyor...",
      alreadyHaveAccount: "zaten hesabınız var mı?",
      loginLink: "Giriş Yap",
      errorFill: "Lütfen tüm alanları doldurun",
      errorShortPass: "Şifre en az 6 karakter olmalıdır",
      errorPassMismatch: "Şifreler eşleşmiyor",
      errorTitle: "Kayıt başarısız",
      errorGeneral: "Bir hata oluştu",
    },
  },
  onboarding: {
    skip: "Atla",
    next: "İleri",
    start: "Başla",
    slides: [
      { title: "İzinizi Görün", subtitle: "Günlük hareketlerinizin karbon ekosistemine nasıl etki ettiğini gerçek zamanlı takip edin." },
      { title: "Harekete Geçin", subtitle: "Günlük alışkanlıklarınızı değiştirin. Küçük kararlar büyük fark yaratır." },
      { title: "Atıkları Yönetin", subtitle: "Yakınınızdaki e-atık toplama noktalarını bulun. Geri dönüşüm gezegenimizi kurtarır." },
    ],
  },
  dashboard: {
    greeting: "Merhaba",
    level: "Seviye",
    streakDays: "gün serisi",
    thisMonth: "Bu Ay",
    target: "Hedef",
    treesSaved: "ağaç tasarrufu",
    tip: "Günün İpucu",
    weeklyChart: "Haftalık Karbon Ayak İzi",
    recentEntries: "Son Girişler",
    seeAll: "Hepsi →",
    dailyEntry: "Günlük giriş",
    noEntries: "Henüz giriş yok",
    noEntriesDesc: "Hesap makinasından ilk karbon girişinizi ekleyin",
    months: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
  },
  calculator: {
    co2Display: "Bu sekme için CO₂",
    total: "Toplam",
    tabs: { transport: "Ulaşım", energy: "Enerji", food: "Gıda" },
    transport: {
      distance: "Mesafe (km)",
      vehicleType: "Araç türü",
      vehicles: { car_petrol: "Benzin", car_electric: "Elektrikli", bus: "Otobüs", metro: "Metro", motorcycle: "Motorsiklet" },
    },
    energy: {
      electricity: "Elektrik (kWh)",
      gas: "Gaz (m³)",
      info: "Elektrik: 0.233 kg/kWh · Gaz: 2.04 kg/m³",
    },
    food: {
      foodType: "Gıda türü",
      mealCount: "Öğün sayısı",
      foods: { beef: "Dana eti", lamb: "Kuzu eti", pork: "Domuz eti", chicken: "Tavuk", fish: "Balık", vegan: "Vegan" },
    },
    save: "Girişi Kaydet",
    saved: "Kaydedildi!",
  },
  achievements: {
    currentLevel: "Mevcut Seviye",
    level: "Seviye",
    streak: "Gün serisi",
    entriesCompleted: "giriş tamamlandı",
    moreEntries: "giriş daha → Seviye",
    maxLevel: "Maksimum seviye!",
    treesSaved: "Ağaç tasarrufu",
    co2ThisMonth: "kg CO₂ bu ay",
    badge: "Rozet",
    carbonRanking: "Karbon Sıralaması",
    rankingDesc: "Düşük CO₂ = daha iyi sıralama",
    loading: "Yükleniyor...",
    noUsers: "Henüz kullanıcı yok",
    entries: "giriş",
    you: "(Siz)",
    badges: "Rozetler",
    earned: "kazanıldı",
    earnedBadge: "Kazanıldı",
  },
  profile: {
    entries: "Giriş",
    streak: "Gün serisi",
    badges: "Rozet",
    ecoImpact: "Eko Etki",
    treesSaved: "Ağaç tasarrufu",
    co2ThisMonth: "kg CO₂ bu ay",
    settings: "Ayarlar",
    darkMode: "Gece Modu",
    active: "Aktif",
    inactive: "Deaktif",
    notifications: "Bildirimler",
    reminders: "Hatırlatmalar",
    wiki: "Eko-Vikipedi",
    allEntries: "Tüm Girişler",
    about: "Hakkında",
    appDesc: "Karbon ayak izi takibi ve e-atık yönetim sistemi. IPCC standartlarına dayalı hesaplama metodolojisi.",
    logout: "Çıkış Yap",
    language: "Dil",
  },
  entries: {
    entries: "giriş",
    total: "Toplam",
    noEntries: "Henüz giriş yok",
    noEntriesDesc: "Hesap makinasından ilk karbon girişinizi ekleyin",
    deleteTitle: "Girişi Sil",
    deleteConfirm: "Bu girişi silmek istediğinizden emin misiniz?",
    cancel: "İptal",
    delete: "Sil",
  },
  notifications: {
    clearAll: "Tümünü Sil",
    empty: "Bildirim yok",
    emptyDesc: "Yeni bildirimler burada görünecek",
    items: [
      { title: "Karbon girişi hatırlatması", body: "Bugün karbon hesap makinanızı güncellemediz!", time: "2 saat önce" },
      { title: "Tebrikler!", body: "Bu hafta karbon ayak izinizi %10 azalttınız.", time: "1 gün önce" },
      { title: "Yeni toplama noktası", body: "Yakınınızda yeni bir e-atık toplama noktası açıldı.", time: "3 gün önce" },
      { title: "Günün ipucu", body: "Bisikletle işe gitmek günde 4.6 kg CO₂ azaltır.", time: "4 gün önce" },
      { title: "Haftalık rapor", body: "Bu haftaki karbon ayak iziniz: 12.4 kg CO₂. Hedefinizin %60'ını tasarruf ettiniz.", time: "1 hafta önce" },
    ],
  },
  map: {
    locations: "nokta",
    expand: "Daha fazla görmek için yukarı çekin",
    about: "Hakkında",
    contact: "İletişim",
    directions: "Yol Tarifi Al",
    mapAbout: "Bu noktada tehlikeli atıklar, elektrikli cihazlar ve işlemeye uygun malzemeler kabul edilmektedir. Lütfen atıkları ayrılmış kutulara koyun.",
    allLocationsTitle: "E-Atık Noktaları",
    locationsFound: "nokta bulundu",
    noLocations: "Bu kategoride nokta yok",
    phone: "+994 12 000 00 00",
    website: "ecotrack.az",
  },
  tabs: {
    home: "Ana Sayfa",
    calculator: "Hesap Makinası",
    map: "Harita",
    achievements: "Başarılar",
    profile: "Profil",
  },
  nav: {
    back: "Geri",
    notifications: "Bildirimler",
    entries: "Tüm Girişler",
    wiki: "Eko-Vikipedi",
  },
  badges: {
    first_entry: { name: "İlk Adım", description: "İlk karbon girişinizi yaptınız" },
    co2_saver: { name: "CO₂ Tasarrufçusu", description: "50 kg CO₂ takip edildi" },
    tree_planter: { name: "Ağaç Diken", description: "5 ağaç eşdeğeri tasarruf edildi" },
    carbon_champion: { name: "Karbon Şampiyonu", description: "100 kg CO₂ takip edildi" },
    eco_master: { name: "Eko Usta", description: "200 kg CO₂ takip edildi" },
  },
};

export const translations: Record<Language, Translations> = { az, en, tr };

export const LANGUAGE_NAMES: Record<Language, string> = {
  az: "Azərbaycan",
  en: "English",
  tr: "Türkçe",
};
