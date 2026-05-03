export interface MathTopic {
  id:    string
  title: string
}

export interface MathChapter {
  id:     string
  title:  string
  topics: MathTopic[]
}

export const MATH_CHAPTERS: MathChapter[] = [
  {
    id: 'natural',
    title: 'Natural ədədlər',
    topics: [
      { id: 'natural-1', title: 'Natural ədədlərin onluq say sistemində yazılışı' },
      { id: 'natural-2', title: 'Natural ədədlərin toplanması, çıxılması, vurulması və bölünməsi' },
      { id: 'natural-3', title: 'Natural ədədlərin bölünmə əlamətləri. Qalıqlı bölmə' },
      { id: 'natural-4', title: 'Natural ədədlərin sadə vuruqlara ayrılışı. Ən böyük ortaq bölən (ƏBOB)' },
      { id: 'natural-5', title: 'Ən kiçik ortaq bölünən (ƏKOB)' },
    ],
  },
  {
    id: 'kesrler',
    title: 'Adi və onluq kəsrlər',
    topics: [
      { id: 'kesrler-1', title: 'Adi və onluq kəsrlər. Toplanması, çıxılması, vurulması və bölünməsi' },
      { id: 'kesrler-2', title: 'Düzgün və düzgün olmayan kəsrlər. Sonsuz dövri onluq kəsrlər' },
      { id: 'kesrler-3', title: 'Adi kəsrin onluq kəsrə çevrilməsi. Onluq kəsrin adi kəsrə çevrilməsi' },
      { id: 'kesrler-4', title: 'Kəsrlərin müqayisəsi' },
      { id: 'kesrler-5', title: 'Ədədin hissəsinin və hissəsinə görə ədədin tapılması' },
    ],
  },
  {
    id: 'faiz',
    title: 'Faiz. Nisbət. Tənasüb',
    topics: [
      { id: 'faiz-1', title: 'Nisbət. Tənasüb. Tənasübün xassələri. Düz və tərs mütənasiblik' },
      { id: 'faiz-2', title: 'Faiz. Ədədin faizinin tapılması' },
      { id: 'faiz-3', title: 'Faizinə görə ədədin tapılması. İki ədədin faiz nisbəti' },
      { id: 'faiz-4', title: 'Faizə aid məsələlər' },
    ],
  },
  {
    id: 'heqiqi',
    title: 'Həqiqi ədədlər',
    topics: [
      { id: 'heqiqi-1', title: 'Rasional ədədlər. Rasional ədədlər üzərində əməliyyatlar' },
      { id: 'heqiqi-2', title: 'İrrasional ədədlər' },
      { id: 'heqiqi-3', title: 'Ədədin modulu. Modul daxil olan ifadələrin çevrilməsi' },
      { id: 'heqiqi-4', title: 'Ədəd oxu. Həqiqi ədədlərin müqayisəsi' },
      { id: 'heqiqi-5', title: 'Ədədin tam və kəsr hissəsi. Ədədin standart şəkli' },
    ],
  },
  {
    id: 'cebri',
    title: 'Tam cəbri ifadələr',
    topics: [
      { id: 'cebri-1', title: 'Birhədli və onun standart şəkli. Natural üstlü qüvvət' },
      { id: 'cebri-2', title: 'Çoxhədlilər və onlar üzərində əməliyyatlar' },
      { id: 'cebri-3', title: 'Müxtəsər vurma düsturları' },
      { id: 'cebri-4', title: 'İfadələrin ədədi qiymətlərinin hesablanması' },
      { id: 'cebri-5', title: 'İfadələrin ən kiçik və ən böyük qiymətlərinin tapılması' },
    ],
  },
  {
    id: 'vuruqlar',
    title: 'Çoxhədlinin vuruqlara ayrılması',
    topics: [
      { id: 'vuruqlar-1', title: 'Müxtəsər vurma düsturlarının köməyi ilə vuruqlara ayırma' },
      { id: 'vuruqlar-2', title: 'Müxtəlif üsulların köməyi ilə vuruqlara ayırma' },
      { id: 'vuruqlar-3', title: 'Vuruqlara ayırma üsulu ilə ifadələrin ədədi qiymətinin hesablanması' },
    ],
  },
  {
    id: 'rasional',
    title: 'Rasional kəsrlər',
    topics: [
      { id: 'rasional-1', title: 'Kəsrlərin ixtisarı. DMQ çoxluğu' },
      { id: 'rasional-2', title: 'İfadələrin sadələşdirilməsi' },
      { id: 'rasional-3', title: 'İfadələrin ədədi qiymətlərinin tapılması' },
    ],
  },
  {
    id: 'kvkokler',
    title: 'Kvadrat köklər. Həqiqi üstlü qüvvət',
    topics: [
      { id: 'kvkokler-1', title: 'Hesabi kvadrat kök və onun xassələri' },
      { id: 'kvkokler-2', title: 'n-ci dərəcədən kök. Həqiqi üstlü qüvvət və onun xassələri. Ədədlərin müqayisəsi' },
      { id: 'kvkokler-3', title: 'Kəsrlərin ixtisarı. İfadələrin sadələşdirilməsi və ədədi qiymətinin tapılması' },
    ],
  },
  {
    id: 'tenlikler',
    title: 'Birməchullu tənliklər və məsələlər',
    topics: [
      { id: 'tenlikler-1', title: 'Xətti tənliklər' },
      { id: 'tenlikler-2', title: 'Kvadrat tənliklər və onların araşdırılması' },
      { id: 'tenlikler-3', title: 'Viyet teoremi və onun tərsi olan teorem' },
      { id: 'tenlikler-4', title: 'Rasional tənliklər' },
      { id: 'tenlikler-5', title: 'Modul işarəsi daxilində dəyişəni olan tənliklər. İrrasional tənliklər' },
      { id: 'tenlikler-6', title: 'Tənlik qurmaqla məsələlər həlli' },
    ],
  },
  {
    id: 'sistem',
    title: 'Tənliklər sistemi',
    topics: [
      { id: 'sistem-1', title: 'Xətti tənliklər sistemi' },
      { id: 'sistem-2', title: 'Xətti tənliklər sisteminin həllinin araşdırılması' },
      { id: 'sistem-3', title: 'Biri birdərəcəli, digəri ikidərəcəli olan tənliklər sistemi' },
      { id: 'sistem-4', title: 'Hər iki tənliyi ikidərəcəli olan tənliklər sistemi' },
      { id: 'sistem-5', title: 'Tənliklər sistemi qurmaqla məsələlər həlli' },
    ],
  },
  {
    id: 'berabersiz',
    title: 'Bərabərsizliklər və bərabərsizliklər sistemi',
    topics: [
      { id: 'berabersiz-1', title: 'Ədədi bərabərsizliklər və onların əsas xassələri' },
      { id: 'berabersiz-2', title: 'Birdəyişənli xətti bərabərsizliklər. Bərabərsizliklər sistemi' },
      { id: 'berabersiz-3', title: 'İkidərəcəli və yüksək dərəcəli bərabərsizliklər' },
      { id: 'berabersiz-4', title: 'Rasional bərabərsizliklər' },
      { id: 'berabersiz-5', title: 'Modul işarəsi daxilində dəyişəni olan bərabərsizliklər' },
      { id: 'berabersiz-6', title: 'Kvadrat bərabərsizliklər sistemi. İrrasional bərabərsizliklər' },
    ],
  },
  {
    id: 'ardiciллiq',
    title: 'Ədədi ardıcıllıqlar. Silisilələr',
    topics: [
      { id: 'ardiciлliق-1', title: 'Ədədi ardıcıllıqlar' },
      { id: 'ardiciлliق-2', title: 'Ədədi silsilələr' },
      { id: 'ardiciлliق-3', title: 'Həndəsi silsilələr. Sonsuz həndəsi silsilənin cəmi (|q| < 1)' },
      { id: 'ardiciлliق-4', title: 'Ədədi və həndəsi silsilələrə aid məsələlər' },
    ],
  },
  {
    id: 'coxluqlar',
    title: 'Çoxluqlar',
    topics: [
      { id: 'coxluqlar-1', title: 'Çoxluqlar. Çoxluqların birləşməsi, kəsişməsi, fərqi' },
      { id: 'coxluqlar-2', title: 'Çoxluqların birləşməsi, kəsişməsi və fərqinin elementlərinin sayı' },
    ],
  },
  {
    id: 'hendese-esaslar',
    title: 'Həndəsənin əsas anlayışları',
    topics: [
      { id: 'hendese-esaslar-1', title: 'Düz xətt, şüa, parça. Parçaların ölçülməsi' },
      { id: 'hendese-esaslar-2', title: 'Bucaq. Bucaqların ölçülməsi. Bucağın tən bölənləri' },
      { id: 'hendese-esaslar-3', title: 'Qonşu və qarşılıqlı bucaqlar' },
      { id: 'hendese-esaslar-4', title: 'İki paralel düz xəttin üçüncü ilə kəsişməsindən alınan bucaqlar' },
      { id: 'hendese-esaslar-5', title: 'Uyğun tərəfləri paralel və perpendikulyar olan bucaqlar' },
    ],
  },
  {
    id: 'ucbucaqlar',
    title: 'Üçbucaqlar',
    topics: [
      { id: 'ucbucaqlar-1', title: 'Üçbucaq. Üçbucaq bərabərsizliyi. Üçbucağın perimetri' },
      { id: 'ucbucaqlar-2', title: 'Üçbucağın medianı, tən böləni, hündürlüyü' },
      { id: 'ucbucaqlar-3', title: 'Üçbucağın daxili bucaqlarının cəmi. Xarici bucağın xassəsi' },
      { id: 'ucbucaqlar-4', title: 'Üçbucaqların kongruentlik əlaməti. Fales teoremi. Orta xətt' },
      { id: 'ucbucaqlar-5', title: 'Bərabəryanlı üçbucaq. Bərabərtərəfli üçbucaqlar' },
      { id: 'ucbucaqlar-6', title: 'Düzbucaqlı üçbucaq. Pifaqor teoremi' },
      { id: 'ucbucaqlar-7', title: 'Düzbucaqlı üçbucağın tərəfləri və bucaqları arasındakı münasibətlər' },
      { id: 'ucbucaqlar-8', title: 'Sinuslar teoremi. Kosinuslar teoremi' },
    ],
  },
  {
    id: 'coxbucaqlilar',
    title: 'Çoxbucaqlılar. Dördbucaqlılar',
    topics: [
      { id: 'coxbucaqlilar-1', title: 'Qabarıq çoxbucaqlı. Daxili və xarici bucaqlarının cəmi' },
      { id: 'coxbucaqlilar-2', title: 'Düzgün çoxbucaqlı' },
      { id: 'coxbucaqlilar-3', title: 'Paralelogram, onun xassələri və əlamətləri' },
      { id: 'coxbucaqlilar-4', title: 'Düzbucaqlı, kvadrat, romb və onların xassələri' },
      { id: 'coxbucaqlilar-5', title: 'Trapesiya və onun orta xətti' },
    ],
  },
  {
    id: 'cevre',
    title: 'Çevrə və dairə',
    topics: [
      { id: 'cevre-1', title: 'Çevrə. Dairə. Radius, diametr, vatar. Çevrənin uzunluğu' },
      { id: 'cevre-2', title: 'Çevrələrin qarşılıqlı vəziyyəti' },
      { id: 'cevre-3', title: 'Mərkəzi bucaq. Daxilə çəkilmiş bucaq. Toxunanla vatar arasındakı bucaq' },
      { id: 'cevre-4', title: 'Çevrədə mütənasib parçalar. Toxunan və kəsənin xassələri' },
      { id: 'cevre-5', title: 'Çevrənin daxilinə və xaricinə çəkilmiş bucaqlar' },
      { id: 'cevre-6', title: 'Çevrənin daxilinə və xaricinə çəkilmiş çoxbucaqlılar' },
    ],
  },
]
