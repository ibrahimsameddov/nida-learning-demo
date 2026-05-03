// Mock soru bankası — arkadaşın API'si hazır olunca burası değişecek

export const QUESTION_BANK = {
  buraxilis: {
    "Azərbaycan dili": {
      sections: [
        {
          title: "Fonetika",
          questions: [
            { id: "az-f-1", text: "Hansı sözdə ahəng qanunu pozulur?", options: ["alma", "kənd", "oxumaq", "gəlmək"], correctIndex: 1 },
            { id: "az-f-2", text: "Neçə sait səs var Azərbaycan dilində?", options: ["6", "7", "8", "9"], correctIndex: 3 },
            { id: "az-f-3", text: "Hansı samit cingiltili deyil?", options: ["b", "d", "f", "z"], correctIndex: 2 },
          ]
        },
        {
          title: "Morfologiya",
          questions: [
            { id: "az-m-1", text: "Hansı söz isimdir?", options: ["gözəl", "oxumaq", "kitab", "tez"], correctIndex: 2 },
            { id: "az-m-2", text: "Feilin hansı forması əmr bildirmir?", options: ["get", "gəl", "gedir", "dur"], correctIndex: 2 },
            { id: "az-m-3", text: "Hansı söz sifətdir?", options: ["qaçmaq", "yavaş", "ev", "o"], correctIndex: 1 },
          ]
        },
        {
          title: "Sintaksis",
          questions: [
            { id: "az-s-1", text: "Sadə cümlə hansıdır?", options: ["Günəş doğdu.", "Oxudum ki, bilim.", "Gəldim, gördüm.", "O dedi ki, gələcək."], correctIndex: 0 },
            { id: "az-s-2", text: "Mübtəda cümlənin hansı üzvüdür?", options: ["İkinci dərəcəli", "Baş üzv", "Tamamlıq", "Zərflik"], correctIndex: 1 },
          ]
        }
      ]
    },
    "Riyaziyyat": {
      sections: [
        {
          title: "Natural ədədlər",
          questions: [
            { id: "ri-n-1", text: "2⁸ = ?", options: ["128", "256", "512", "64"], correctIndex: 1 },
            { id: "ri-n-2", text: "ƏBOB(12, 18) = ?", options: ["6", "36", "12", "3"], correctIndex: 0 },
            { id: "ri-n-3", text: "ƏKOM(4, 6) = ?", options: ["24", "12", "6", "2"], correctIndex: 1 },
          ]
        },
        {
          title: "Kəsrlər",
          questions: [
            { id: "ri-k-1", text: "1/2 + 1/3 = ?", options: ["2/5", "5/6", "2/6", "3/5"], correctIndex: 1 },
            { id: "ri-k-2", text: "3/4 × 8 = ?", options: ["5", "6", "7", "8"], correctIndex: 1 },
            { id: "ri-k-3", text: "0.5 = ?", options: ["1/3", "1/4", "1/2", "2/3"], correctIndex: 2 },
          ]
        },
        {
          title: "Cəbr",
          questions: [
            { id: "ri-c-1", text: "x² - 9 = 0 olduqda x = ?", options: ["±3", "±9", "3", "9"], correctIndex: 0 },
            { id: "ri-c-2", text: "(a+b)² = ?", options: ["a²+b²", "a²+ab+b²", "a²+2ab+b²", "2a+2b"], correctIndex: 2 },
          ]
        }
      ]
    },
    "Xarici dil": {
      sections: [
        {
          title: "Grammar",
          questions: [
            { id: "xl-g-1", text: "She ___ to school every day.", options: ["go", "goes", "going", "went"], correctIndex: 1 },
            { id: "xl-g-2", text: "I ___ a doctor.", options: ["is", "are", "am", "be"], correctIndex: 2 },
            { id: "xl-g-3", text: "They ___ playing football now.", options: ["is", "are", "am", "be"], correctIndex: 1 },
          ]
        },
        {
          title: "Vocabulary",
          questions: [
            { id: "xl-v-1", text: "What is the synonym of 'happy'?", options: ["sad", "angry", "joyful", "tired"], correctIndex: 2 },
            { id: "xl-v-2", text: "What is the antonym of 'big'?", options: ["large", "huge", "small", "tall"], correctIndex: 2 },
          ]
        }
      ]
    }
  },
  qebul: {
    group1: {
      "Riyaziyyat": {
        sections: [
          {
            title: "Triqonometriya",
            questions: [
              { id: "g1-t-1", text: "sin²x + cos²x = ?", options: ["0", "1", "2", "-1"], correctIndex: 1 },
              { id: "g1-t-2", text: "sin(30°) = ?", options: ["√3/2", "1/2", "√2/2", "1"], correctIndex: 1 },
            ]
          },
          {
            title: "Loqarifm",
            questions: [
              { id: "g1-l-1", text: "log₂(8) = ?", options: ["2", "3", "4", "8"], correctIndex: 1 },
              { id: "g1-l-2", text: "log₁₀(100) = ?", options: ["1", "2", "10", "20"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Fizika": {
        sections: [
          {
            title: "Mexanika",
            questions: [
              { id: "g1-f-1", text: "F = ma düsturu hansı qanundur?", options: ["I Newton", "II Newton", "III Newton", "Arximed"], correctIndex: 1 },
              { id: "g1-f-2", text: "İşin vahidi nədir?", options: ["Vatt", "Cuul", "Nyuton", "Paskal"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Kimya": {
        sections: [
          {
            title: "Atomun quruluşu",
            questions: [
              { id: "g1-k-1", text: "Suyun kimyəvi formulu nədir?", options: ["H₂O₂", "HO", "H₂O", "H₃O"], correctIndex: 2 },
              { id: "g1-k-2", text: "Neçə element var dövri cədvəldə?", options: ["108", "116", "118", "120"], correctIndex: 2 },
            ]
          }
        ]
      }
    },
    group2: {
      "Riyaziyyat": {
        sections: [
          {
            title: "Statistika",
            questions: [
              { id: "g2-r-1", text: "5 ədədin ortası 10-dur. Onların cəmi nədir?", options: ["15", "50", "2", "10"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Coğrafiya": {
        sections: [
          {
            title: "Fiziki coğrafiya",
            questions: [
              { id: "g2-c-1", text: "Ən böyük okean hansıdır?", options: ["Atlantik", "Hind", "Sakit", "Şimal Buzlu"], correctIndex: 2 },
              { id: "g2-c-2", text: "Azərbaycanın paytaxtı?", options: ["Gəncə", "Bakı", "Sumqayıt", "Lənkəran"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Tarix": {
        sections: [
          {
            title: "Azərbaycan tarixi",
            questions: [
              { id: "g2-t-1", text: "AXC neçənci ildə yaranıb?", options: ["1916", "1917", "1918", "1920"], correctIndex: 2 },
              { id: "g2-t-2", text: "Azərbaycan müstəqilliyini neçənci ildə bərpa etdi?", options: ["1989", "1990", "1991", "1992"], correctIndex: 2 },
            ]
          }
        ]
      }
    },
    group3: {
      "Azərbaycan dili": {
        sections: [
          {
            title: "Ədəbiyyat nəzəriyyəsi",
            questions: [
              { id: "g3-a-1", text: "Epik növün janrı hansıdır?", options: ["Şeir", "Roman", "Dram", "Lirika"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Tarix": {
        sections: [
          {
            title: "Dünya tarixi",
            questions: [
              { id: "g3-t-1", text: "I Dünya müharibəsi neçənci ildə başladı?", options: ["1912", "1913", "1914", "1915"], correctIndex: 2 },
            ]
          }
        ]
      },
      "Ədəbiyyat": {
        sections: [
          {
            title: "Klassik ədəbiyyat",
            questions: [
              { id: "g3-e-1", text: "Nizami Gəncəvi hansı əsrin şairidir?", options: ["X", "XI", "XII", "XIII"], correctIndex: 2 },
              { id: "g3-e-2", text: "\"Leyli və Məcnun\" əsərinin müəllifi kimdir?", options: ["Füzuli", "Nizami", "Vaqif", "Sabir"], correctIndex: 0 },
            ]
          }
        ]
      }
    },
    group4: {
      "Biologiya": {
        sections: [
          {
            title: "Hüceyrə",
            questions: [
              { id: "g4-b-1", text: "Fotosintez harada baş verir?", options: ["Mitoxondri", "Xloroplast", "Nüvə", "Ribosoma"], correctIndex: 1 },
              { id: "g4-b-2", text: "DNT-nin monomeri nədir?", options: ["Amin turşusu", "Nukleotid", "Yağ turşusu", "Qlükoza"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Kimya": {
        sections: [
          {
            title: "Üzvi kimya",
            questions: [
              { id: "g4-k-1", text: "Metanın formulu nədir?", options: ["C₂H₆", "CH₄", "C₃H₈", "C₂H₄"], correctIndex: 1 },
            ]
          }
        ]
      },
      "Fizika": {
        sections: [
          {
            title: "Optika",
            questions: [
              { id: "g4-f-1", text: "İşığın sürəti vakuumda?", options: ["3×10⁶", "3×10⁸", "3×10¹⁰", "3×10⁴"], correctIndex: 1 },
            ]
          }
        ]
      }
    }
  }
};

export const GROUP_NAMES = {
  group1: "I Qrup",
  group2: "II Qrup", 
  group3: "III Qrup",
  group4: "IV Qrup",
};

export const GROUP_SUBJECTS = {
  group1: ["Riyaziyyat", "Fizika", "Kimya"],
  group2: ["Riyaziyyat", "Coğrafiya", "Tarix"],
  group3: ["Azərbaycan dili", "Tarix", "Ədəbiyyat"],
  group4: ["Biologiya", "Kimya", "Fizika"],
};
// ─── Genel Değerlendirme Testi ────────────────────────────────
export const DIAGNOSTIC_QUESTIONS = {
  "9": [
    // Azərbaycan dili
    { id: "d9-az-1", subject: "Azərbaycan dili", text: "Hansı sözdə ahəng qanunu pozulur?", options: ["alma", "kənd", "oxumaq", "gəlmək"], correctIndex: 1 },
    { id: "d9-az-2", subject: "Azərbaycan dili", text: "Neçə sait səs var Azərbaycan dilində?", options: ["6", "7", "8", "9"], correctIndex: 3 },
    { id: "d9-az-3", subject: "Azərbaycan dili", text: "Hansı samit cingiltili deyil?", options: ["b", "d", "f", "z"], correctIndex: 2 },
    { id: "d9-az-4", subject: "Azərbaycan dili", text: "Hansı söz isimdir?", options: ["gözəl", "oxumaq", "kitab", "tez"], correctIndex: 2 },
    { id: "d9-az-5", subject: "Azərbaycan dili", text: "Feilin hansı forması əmr bildirmir?", options: ["get", "gəl", "gedir", "dur"], correctIndex: 2 },
    { id: "d9-az-6", subject: "Azərbaycan dili", text: "Sadə cümlə hansıdır?", options: ["Günəş doğdu.", "Oxudum ki, bilim.", "Gəldim, gördüm.", "O dedi ki, gələcək."], correctIndex: 0 },
    { id: "d9-az-7", subject: "Azərbaycan dili", text: "Mübtəda cümlənin hansı üzvüdür?", options: ["İkinci dərəcəli", "Baş üzv", "Tamamlıq", "Zərflik"], correctIndex: 1 },
    { id: "d9-az-8", subject: "Azərbaycan dili", text: "Hansı söz sifətdir?", options: ["qaçmaq", "yavaş", "ev", "o"], correctIndex: 1 },
    { id: "d9-az-9", subject: "Azərbaycan dili", text: "Azərbaycan əlifbasında neçə hərf var?", options: ["30", "31", "32", "33"], correctIndex: 2 },
    { id: "d9-az-10", subject: "Azərbaycan dili", text: "Hansı söz zərfdir?", options: ["kitab", "gözəl", "tez", "oxumaq"], correctIndex: 2 },

    // Riyaziyyat
    { id: "d9-ri-1", subject: "Riyaziyyat", text: "2⁸ = ?", options: ["128", "256", "512", "64"], correctIndex: 1 },
    { id: "d9-ri-2", subject: "Riyaziyyat", text: "ƏBOB(12, 18) = ?", options: ["6", "36", "12", "3"], correctIndex: 0 },
    { id: "d9-ri-3", subject: "Riyaziyyat", text: "ƏKOM(4, 6) = ?", options: ["24", "12", "6", "2"], correctIndex: 1 },
    { id: "d9-ri-4", subject: "Riyaziyyat", text: "1/2 + 1/3 = ?", options: ["2/5", "5/6", "2/6", "3/5"], correctIndex: 1 },
    { id: "d9-ri-5", subject: "Riyaziyyat", text: "x² - 9 = 0 olduqda x = ?", options: ["±3", "±9", "3", "9"], correctIndex: 0 },
    { id: "d9-ri-6", subject: "Riyaziyyat", text: "(a+b)² = ?", options: ["a²+b²", "a²+ab+b²", "a²+2ab+b²", "2a+2b"], correctIndex: 2 },
    { id: "d9-ri-7", subject: "Riyaziyyat", text: "3/4 × 8 = ?", options: ["5", "6", "7", "8"], correctIndex: 1 },
    { id: "d9-ri-8", subject: "Riyaziyyat", text: "0.5 = ?", options: ["1/3", "1/4", "1/2", "2/3"], correctIndex: 2 },
    { id: "d9-ri-9", subject: "Riyaziyyat", text: "Pifaqor teoreminə görə: a=3, b=4 olduqda c=?", options: ["5", "6", "7", "8"], correctIndex: 0 },
    { id: "d9-ri-10", subject: "Riyaziyyat", text: "|-5| = ?", options: ["-5", "5", "0", "25"], correctIndex: 1 },

    // Xarici dil
    { id: "d9-xl-1", subject: "Xarici dil", text: "She ___ to school every day.", options: ["go", "goes", "going", "went"], correctIndex: 1 },
    { id: "d9-xl-2", subject: "Xarici dil", text: "I ___ a doctor.", options: ["is", "are", "am", "be"], correctIndex: 2 },
    { id: "d9-xl-3", subject: "Xarici dil", text: "They ___ playing football now.", options: ["is", "are", "am", "be"], correctIndex: 1 },
    { id: "d9-xl-4", subject: "Xarici dil", text: "What is the synonym of 'happy'?", options: ["sad", "angry", "joyful", "tired"], correctIndex: 2 },
    { id: "d9-xl-5", subject: "Xarici dil", text: "What is the antonym of 'big'?", options: ["large", "huge", "small", "tall"], correctIndex: 2 },
    { id: "d9-xl-6", subject: "Xarici dil", text: "___ you speak English?", options: ["Do", "Can", "Are", "Is"], correctIndex: 1 },
    { id: "d9-xl-7", subject: "Xarici dil", text: "The book is ___ the table.", options: ["in", "on", "at", "by"], correctIndex: 1 },
    { id: "d9-xl-8", subject: "Xarici dil", text: "I ___ my homework yesterday.", options: ["do", "does", "did", "done"], correctIndex: 2 },
    { id: "d9-xl-9", subject: "Xarici dil", text: "She has ___ to Paris.", options: ["go", "went", "gone", "going"], correctIndex: 2 },
    { id: "d9-xl-10", subject: "Xarici dil", text: "What is the plural of 'child'?", options: ["childs", "childes", "children", "childrens"], correctIndex: 2 },
  ],
  "10": [
    // Azərbaycan dili
    { id: "d10-az-1", subject: "Azərbaycan dili", text: "Hansı cümlədə xəbər ismi ilə ifadə olunub?", options: ["O gəldi.", "Hava soyuqdur.", "Uşaqlar oynadı.", "Kitabı oxudum."], correctIndex: 1 },
    { id: "d10-az-2", subject: "Azərbaycan dili", text: "Mürəkkəb cümlə hansıdır?", options: ["Günəş doğdu.", "Oxudum ki, bildim.", "Kitab maraqlıdır.", "O gəldi."], correctIndex: 1 },
    { id: "d10-az-3", subject: "Azərbaycan dili", text: "Hansı söz alınmadır?", options: ["su", "od", "telefon", "ev"], correctIndex: 2 },
    { id: "d10-az-4", subject: "Azərbaycan dili", text: "Frazeoloji birləşmə hansıdır?", options: ["ağ ev", "ağ gün", "ağ paltar", "ağ kağız"], correctIndex: 1 },
    { id: "d10-az-5", subject: "Azərbaycan dili", text: "Hansı sözdə leksik məna yoxdur?", options: ["ev", "kitab", "və", "su"], correctIndex: 2 },
    { id: "d10-az-6", subject: "Azərbaycan dili", text: "Sinonim cütü hansıdır?", options: ["gec-tez", "böyük-kiçik", "igid-cəsur", "gəlmək-getmək"], correctIndex: 2 },
    { id: "d10-az-7", subject: "Azərbaycan dili", text: "Antonim cütü hansıdır?", options: ["igid-cəsur", "böyük-kiçik", "gəlmək-getmək", "ev-bina"], correctIndex: 1 },
    { id: "d10-az-8", subject: "Azərbaycan dili", text: "Hansı söz çoxmənalıdır?", options: ["kompüter", "baş", "şkaf", "avtobus"], correctIndex: 1 },
    { id: "d10-az-9", subject: "Azərbaycan dili", text: "Bədii üslub harada işlənir?", options: ["Elmi məqalə", "Rəsmi sənəd", "Bədii əsər", "Məişət danışığı"], correctIndex: 2 },
    { id: "d10-az-10", subject: "Azərbaycan dili", text: "Hansı söz düzəltmə isimdir?", options: ["ev", "su", "oxucu", "dağ"], correctIndex: 2 },

    // Riyaziyyat
    { id: "d10-ri-1", subject: "Riyaziyyat", text: "log₂(8) = ?", options: ["2", "3", "4", "8"], correctIndex: 1 },
    { id: "d10-ri-2", subject: "Riyaziyyat", text: "sin(30°) = ?", options: ["√3/2", "1/2", "√2/2", "1"], correctIndex: 1 },
    { id: "d10-ri-3", subject: "Riyaziyyat", text: "cos(60°) = ?", options: ["√3/2", "1/2", "√2/2", "1"], correctIndex: 1 },
    { id: "d10-ri-4", subject: "Riyaziyyat", text: "sin²x + cos²x = ?", options: ["0", "1", "2", "-1"], correctIndex: 1 },
    { id: "d10-ri-5", subject: "Riyaziyyat", text: "Ədədi ardıcıllıq: 2, 4, 8, 16, ... növbəti həd?", options: ["18", "24", "32", "20"], correctIndex: 2 },
    { id: "d10-ri-6", subject: "Riyaziyyat", text: "f(x) = x² funksiyasının x=3-də qiyməti?", options: ["6", "9", "12", "3"], correctIndex: 1 },
    { id: "d10-ri-7", subject: "Riyaziyyat", text: "Vektoru: |a| = 3, |b| = 4, aralarındakı bucaq 90°. |a+b| = ?", options: ["5", "7", "1", "12"], correctIndex: 0 },
    { id: "d10-ri-8", subject: "Riyaziyyat", text: "log₁₀(100) = ?", options: ["1", "2", "10", "20"], correctIndex: 1 },
    { id: "d10-ri-9", subject: "Riyaziyyat", text: "tg(45°) = ?", options: ["0", "1", "√3", "1/√3"], correctIndex: 1 },
    { id: "d10-ri-10", subject: "Riyaziyyat", text: "2^10 = ?", options: ["512", "1024", "2048", "256"], correctIndex: 1 },

    // Xarici dil
    { id: "d10-xl-1", subject: "Xarici dil", text: "If I ___ rich, I would travel.", options: ["am", "was", "were", "be"], correctIndex: 2 },
    { id: "d10-xl-2", subject: "Xarici dil", text: "She said she ___ tired.", options: ["is", "was", "were", "be"], correctIndex: 1 },
    { id: "d10-xl-3", subject: "Xarici dil", text: "The report ___ written by him.", options: ["is", "was", "were", "has"], correctIndex: 1 },
    { id: "d10-xl-4", subject: "Xarici dil", text: "I wish I ___ fly.", options: ["can", "could", "will", "would"], correctIndex: 1 },
    { id: "d10-xl-5", subject: "Xarici dil", text: "By the time he arrived, she ___.", options: ["left", "leaves", "had left", "has left"], correctIndex: 2 },
    { id: "d10-xl-6", subject: "Xarici dil", text: "What does 'eloquent' mean?", options: ["silent", "well-spoken", "angry", "confused"], correctIndex: 1 },
    { id: "d10-xl-7", subject: "Xarici dil", text: "Neither he nor she ___ coming.", options: ["are", "is", "were", "be"], correctIndex: 1 },
    { id: "d10-xl-8", subject: "Xarici dil", text: "I ___ here for 3 years.", options: ["live", "lived", "have lived", "am living"], correctIndex: 2 },
    { id: "d10-xl-9", subject: "Xarici dil", text: "The synonym of 'enormous' is:", options: ["tiny", "huge", "fast", "slow"], correctIndex: 1 },
    { id: "d10-xl-10", subject: "Xarici dil", text: "She ___ the book before the movie.", options: ["reads", "read", "had read", "has read"], correctIndex: 2 },
  ],
  "11": [
    // Azərbaycan dili
    { id: "d11-az-1", subject: "Azərbaycan dili", text: "Hansı cümlədə işarə əvəzliyi var?", options: ["Mən getdim.", "Bu kitabdır.", "Hamı gəldi.", "Heç kim yoxdur."], correctIndex: 1 },
    { id: "d11-az-2", subject: "Azərbaycan dili", text: "Publisistik üslubun əsas xüsusiyyəti?", options: ["Emosionallıq", "Kütləyə təsir", "Elmi dəqiqlik", "Bədii obrazlılıq"], correctIndex: 1 },
    { id: "d11-az-3", subject: "Azərbaycan dili", text: "Hansı söz söz birləşməsinin baş tərəfidir: 'gözəl ev'?", options: ["gözəl", "ev", "hər ikisi", "heç biri"], correctIndex: 1 },
    { id: "d11-az-4", subject: "Azərbaycan dili", text: "Mətn hansı vahidlərdən ibarətdir?", options: ["Sözlər", "Cümlələr", "Abzaslar", "Hərflər"], correctIndex: 1 },
    { id: "d11-az-5", subject: "Azərbaycan dili", text: "Hansı cümlə nidası var?", options: ["Get!", "Vay, nə gözəl!", "Hava soyuqdur.", "O gəldi."], correctIndex: 1 },
    { id: "d11-az-6", subject: "Azərbaycan dili", text: "Təkrar olunan söz hansı məqsədlə işlənir?", options: ["Gücləndirmək üçün", "Zəiflətmək üçün", "Sual bildirmək üçün", "İnkar bildirmək üçün"], correctIndex: 0 },
    { id: "d11-az-7", subject: "Azərbaycan dili", text: "Hansı cümlədə xitab var?", options: ["Əli, gəl bura.", "Əli gəldi.", "O Əlidir.", "Əli getdi."], correctIndex: 0 },
    { id: "d11-az-8", subject: "Azərbaycan dili", text: "Şifahi nitqin əsas forması?", options: ["Yazı", "Dialoq", "Monoloq", "Mətn"], correctIndex: 1 },
    { id: "d11-az-9", subject: "Azərbaycan dili", text: "Hansı cümlə sual cümləsidir?", options: ["Get!", "Gəl.", "Nə vaxt gəldin?", "Hava gözəldir."], correctIndex: 2 },
    { id: "d11-az-10", subject: "Azərbaycan dili", text: "Bədii əsərdə obrazlılıq hansı vasitə ilə yaradılır?", options: ["Terminlər", "Bədii ifadə vasitələri", "Rəsmi söz birləşmələri", "Elmi anlayışlar"], correctIndex: 1 },

    // Riyaziyyat
    { id: "d11-ri-1", subject: "Riyaziyyat", text: "∫x²dx = ?", options: ["x³ + C", "x³/3 + C", "2x + C", "x²/2 + C"], correctIndex: 1 },
    { id: "d11-ri-2", subject: "Riyaziyyat", text: "lim(x→0) sin(x)/x = ?", options: ["0", "∞", "1", "sin(1)"], correctIndex: 2 },
    { id: "d11-ri-3", subject: "Riyaziyyat", text: "f(x) = x³ üçün f'(x) = ?", options: ["x²", "2x", "3x²", "3x"], correctIndex: 2 },
    { id: "d11-ri-4", subject: "Riyaziyyat", text: "e^0 = ?", options: ["0", "1", "e", "∞"], correctIndex: 1 },
    { id: "d11-ri-5", subject: "Riyaziyyat", text: "Ədədi ardıcıllıq: 1, 1, 2, 3, 5, 8, ... növbəti həd?", options: ["11", "12", "13", "10"], correctIndex: 2 },
    { id: "d11-ri-6", subject: "Riyaziyyat", text: "∫₀¹ x dx = ?", options: ["0", "1", "1/2", "2"], correctIndex: 2 },
    { id: "d11-ri-7", subject: "Riyaziyyat", text: "Kompleks ədəd: i² = ?", options: ["1", "-1", "i", "0"], correctIndex: 1 },
    { id: "d11-ri-8", subject: "Riyaziyyat", text: "n! / (n-1)! = ?", options: ["n-1", "n", "n+1", "1"], correctIndex: 1 },
    { id: "d11-ri-9", subject: "Riyaziyyat", text: "log_a(a) = ?", options: ["0", "1", "a", "-1"], correctIndex: 1 },
    { id: "d11-ri-10", subject: "Riyaziyyat", text: "Binom əmsalı: C(5,2) = ?", options: ["5", "10", "15", "20"], correctIndex: 1 },

    // Xarici dil
    { id: "d11-xl-1", subject: "Xarici dil", text: "Had I known, I ___ helped.", options: ["will have", "would have", "should", "could"], correctIndex: 1 },
    { id: "d11-xl-2", subject: "Xarici dil", text: "The results were ___ expected.", options: ["better as", "better than", "more better than", "as better as"], correctIndex: 1 },
    { id: "d11-xl-3", subject: "Xarici dil", text: "What does 'ubiquitous' mean?", options: ["rare", "everywhere", "ancient", "modern"], correctIndex: 1 },
    { id: "d11-xl-4", subject: "Xarici dil", text: "He denied ___ the money.", options: ["to take", "taking", "take", "took"], correctIndex: 1 },
    { id: "d11-xl-5", subject: "Xarici dil", text: "The passive of 'They built this in 1990':", options: ["This was built in 1990.", "This is built in 1990.", "This has been built in 1990.", "This had built in 1990."], correctIndex: 0 },
    { id: "d11-xl-6", subject: "Xarici dil", text: "Despite ___ tired, she continued.", options: ["be", "being", "to be", "been"], correctIndex: 1 },
    { id: "d11-xl-7", subject: "Xarici dil", text: "The word 'meticulous' means:", options: ["careless", "very careful", "fast", "slow"], correctIndex: 1 },
    { id: "d11-xl-8", subject: "Xarici dil", text: "No sooner ___ than it started raining.", options: ["I arrived", "had I arrived", "I had arrived", "did I arrive"], correctIndex: 1 },
    { id: "d11-xl-9", subject: "Xarici dil", text: "She ___ for 2 hours when he called.", options: ["studied", "was studying", "had been studying", "has studied"], correctIndex: 2 },
    { id: "d11-xl-10", subject: "Xarici dil", text: "The antonym of 'transparent' is:", options: ["clear", "opaque", "bright", "shiny"], correctIndex: 1 },
  ]
};
