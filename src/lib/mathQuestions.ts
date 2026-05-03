export interface MathQ {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export const MATH_QUESTIONS: Record<string, MathQ[]> = {
  // ── Natural ədədlər ────────────────────────────────────────────────────────
  'natural-1': [
    { id:'n1-1', text:'Hansı ədəd 5 rəqəmlidir?', options:['9999','10000','100000','999'], correctIndex:1 },
    { id:'n1-2', text:'35 472 ədədindəki 5 rəqəminin mövqe qiyməti nədir?', options:['5','50','500','5000'], correctIndex:3 },
    { id:'n1-3', text:'On beş min yeddi yüz iyirmi iki rəqəmlə necə yazılır?', options:['15722','15072','15720','1572'], correctIndex:0 },
    { id:'n1-4', text:'4 rəqəmli ən kiçik natural ədəd hansıdır?', options:['999','1000','1001','100'], correctIndex:1 },
    { id:'n1-5', text:'246 803 ədədindəki 8 rəqəminin mövqe qiyməti nədir?', options:['8','80','800','8000'], correctIndex:2 },
  ],
  'natural-2': [
    { id:'n2-1', text:'2345 + 6789 = ?', options:['9134','9124','9234','9144'], correctIndex:0 },
    { id:'n2-2', text:'5000 − 3764 = ?', options:['1246','1236','1226','1336'], correctIndex:1 },
    { id:'n2-3', text:'125 × 8 = ?', options:['900','1000','1100','800'], correctIndex:1 },
    { id:'n2-4', text:'1296 ÷ 6 = ?', options:['206','216','226','196'], correctIndex:1 },
    { id:'n2-5', text:'47 × 53 = ?', options:['2481','2491','2491','2391'], correctIndex:1 },
  ],
  'natural-3': [
    { id:'n3-1', text:'Hansı ədəd 9-a bölünür?', options:['1234','2345','3456','4567'], correctIndex:2 },
    { id:'n3-2', text:'Hansı ədəd 6-ya bölünür?', options:['1234','1236','1238','1237'], correctIndex:1 },
    { id:'n3-3', text:'17 ÷ 5 bölməsinin qalığı nədir?', options:['1','2','3','4'], correctIndex:1 },
    { id:'n3-4', text:'Hansı ədəd həm 2-yə, həm də 3-ə bölünür?', options:['25','32','42','47'], correctIndex:2 },
    { id:'n3-5', text:'123 ədədi 3-ə bölünürmü?', options:['Bəli','Xeyr','Bəzən','Bilinmir'], correctIndex:0 },
  ],
  'natural-4': [
    { id:'n4-1', text:'ƏBOB(12, 18) = ?', options:['3','6','9','12'], correctIndex:1 },
    { id:'n4-2', text:'ƏBOB(24, 36) = ?', options:['6','9','12','18'], correctIndex:2 },
    { id:'n4-3', text:'36 ədədini sadə vuruqlara ayırın', options:['2²×3²','2³×3','2²×3³','2×3³'], correctIndex:0 },
    { id:'n4-4', text:'ƏBOB(7, 13) = ?', options:['1','7','13','91'], correctIndex:0 },
    { id:'n4-5', text:'ƏBOB(45, 60) = ?', options:['5','10','15','20'], correctIndex:2 },
  ],
  'natural-5': [
    { id:'n5-1', text:'ƏKOB(4, 6) = ?', options:['6','12','18','24'], correctIndex:1 },
    { id:'n5-2', text:'ƏKOB(3, 5) = ?', options:['5','10','15','30'], correctIndex:2 },
    { id:'n5-3', text:'ƏKOB(12, 18) = ?', options:['6','18','36','72'], correctIndex:2 },
    { id:'n5-4', text:'İki ədədin ƏBOB-u 4, ƏKOB-u 36 olduqda bu ədədlər hansı ola bilər?', options:['4 və 9','4 və 36','12 və 12','4 və 9 deyil'], correctIndex:0 },
    { id:'n5-5', text:'ƏKOB(8, 12, 16) = ?', options:['16','24','48','96'], correctIndex:2 },
  ],

  // ── Adi və onluq kəsrlər ─────────────────────────────────────────────────
  'kesrler-1': [
    { id:'k1-1', text:'1/2 + 1/3 = ?', options:['2/5','5/6','2/6','3/5'], correctIndex:1 },
    { id:'k1-2', text:'3/4 − 1/6 = ?', options:['2/3','7/12','1/2','5/12'], correctIndex:1 },
    { id:'k1-3', text:'2/3 × 3/4 = ?', options:['1/2','5/7','6/12','1/3'], correctIndex:0 },
    { id:'k1-4', text:'5/6 ÷ 5/3 = ?', options:['1/2','25/18','2/3','5/9'], correctIndex:0 },
    { id:'k1-5', text:'0.25 + 0.5 = ?', options:['0.6','0.7','0.75','0.8'], correctIndex:2 },
  ],
  'kesrler-2': [
    { id:'k2-1', text:'Hansı kəsr düzgün kəsrdir?', options:['7/4','5/3','3/8','9/5'], correctIndex:2 },
    { id:'k2-2', text:'1/3 onluq kəsr kimi yazılır:', options:['0.3','0.33...','0.333','Sonsuz dövri 0.333...'], correctIndex:3 },
    { id:'k2-3', text:'2⅖ qarışıq ədədini düzgün olmayan kəsrə çevirin', options:['12/5','11/5','14/5','10/5'], correctIndex:0 },
    { id:'k2-4', text:'Hansı kəsr 1-dən böyükdür?', options:['1/4','3/5','5/4','2/3'], correctIndex:2 },
    { id:'k2-5', text:'0.666... = ?', options:['2/3','6/9','66/100','3/5'], correctIndex:0 },
  ],
  'kesrler-3': [
    { id:'k3-1', text:'3/4 = ?', options:['0.65','0.7','0.75','0.8'], correctIndex:2 },
    { id:'k3-2', text:'0.125 adi kəsr kimi:', options:['1/4','1/8','1/6','1/5'], correctIndex:1 },
    { id:'k3-3', text:'7/8 = ?', options:['0.785','0.875','0.857','0.78'], correctIndex:1 },
    { id:'k3-4', text:'0.4 adi kəsr kimi:', options:['4/9','2/5','4/10','2/4'], correctIndex:1 },
    { id:'k3-5', text:'5/6 ≈ ?', options:['0.83','0.833...','0.8','0.834'], correctIndex:1 },
  ],
  'kesrler-4': [
    { id:'k4-1', text:'2/3 > 3/5 doğrudurmu?', options:['Bəli','Xeyr','Bərabərdir','Müəyyən deyil'], correctIndex:0 },
    { id:'k4-2', text:'Hansı kəsr ən böyükdür? 1/2, 2/5, 3/7', options:['1/2','2/5','3/7','Hamısı bərabərdir'], correctIndex:0 },
    { id:'k4-3', text:'5/8 ? 7/12 (>, <, =)', options:['>','<','=','Müəyyən deyil'], correctIndex:0 },
    { id:'k4-4', text:'3/4 və 5/6-nı müqayisə edin', options:['3/4 > 5/6','3/4 < 5/6','3/4 = 5/6','Müəyyən deyil'], correctIndex:1 },
    { id:'k4-5', text:'Ən kiçik kəsr hansıdır? 2/3, 3/4, 4/5', options:['2/3','3/4','4/5','Hamısı bərabərdir'], correctIndex:0 },
  ],
  'kesrler-5': [
    { id:'k5-1', text:'120-nin 3/4-ü nədir?', options:['80','90','95','100'], correctIndex:1 },
    { id:'k5-2', text:'Bir ədədin 2/5-i 16-dır. Bu ədəd nədir?', options:['32','36','40','48'], correctIndex:2 },
    { id:'k5-3', text:'48-in 5/6-sı nədir?', options:['35','38','40','45'], correctIndex:2 },
    { id:'k5-4', text:'Bir ədədin 3/8-i 15-dir. Bu ədəd nədir?', options:['35','38','40','45'], correctIndex:2 },
    { id:'k5-5', text:'200-ün 7/10-u nədir?', options:['120','130','140','150'], correctIndex:2 },
  ],

  // ── Faiz. Nisbət. Tənasüb ────────────────────────────────────────────────
  'faiz-1': [
    { id:'f1-1', text:'3/6 = x/12 bərabərliyindən x = ?', options:['4','5','6','7'], correctIndex:2 },
    { id:'f1-2', text:'5:3 nisbəti 10:? şəklindədir:', options:['5','6','7','8'], correctIndex:1 },
    { id:'f1-3', text:'Düz mütənasiblikdə: x artsaq y...', options:['Azalar','Artar','Dəyişməz','İkiqat artar'], correctIndex:1 },
    { id:'f1-4', text:'4:6 = 6:x olduqda x = ?', options:['7','8','9','10'], correctIndex:2 },
    { id:'f1-5', text:'Tənasübün əsas xassəsi: a:b = c:d ⟹', options:['a+b=c+d','a×d=b×c','a−c=b−d','a/c=d/b'], correctIndex:1 },
  ],
  'faiz-2': [
    { id:'f2-1', text:'200-ün 15%-i nədir?', options:['20','25','30','35'], correctIndex:2 },
    { id:'f2-2', text:'450-nin 20%-i nədir?', options:['80','85','90','95'], correctIndex:2 },
    { id:'f2-3', text:'800-ün 12.5%-i nədir?', options:['80','90','100','110'], correctIndex:2 },
    { id:'f2-4', text:'1500-ün 8%-i nədir?', options:['100','110','120','130'], correctIndex:2 },
    { id:'f2-5', text:'60-ın 35%-i nədir?', options:['18','19','20','21'], correctIndex:3 },
  ],
  'faiz-3': [
    { id:'f3-1', text:'Bir ədədin 30%-i 90-dır. Bu ədəd nədir?', options:['270','280','290','300'], correctIndex:3 },
    { id:'f3-2', text:'30, 120-nin neçə faizidir?', options:['20%','25%','30%','35%'], correctIndex:1 },
    { id:'f3-3', text:'Bir ədədin 25%-i 50-dirsə, ədəd nədir?', options:['175','185','200','210'], correctIndex:2 },
    { id:'f3-4', text:'15, 60-ın neçə faizidir?', options:['20%','25%','30%','35%'], correctIndex:1 },
    { id:'f3-5', text:'Bir ədədin 40%-i 80-dirsə, ədədin 60%-i nədir?', options:['100','110','120','130'], correctIndex:2 },
  ],
  'faiz-4': [
    { id:'f4-1', text:'Qiymət 500-dən 600-ə çıxdı. Artım neçə faizdir?', options:['15%','20%','25%','30%'], correctIndex:1 },
    { id:'f4-2', text:'Mağaza 20% endirim edir. 150 manat məhsul neçəyə satılır?', options:['110','115','120','125'], correctIndex:2 },
    { id:'f4-3', text:'Bank 12% illik faiz verir. 1000 manata 1 ildən sonra faiz nə qədərdir?', options:['100','110','120','130'], correctIndex:2 },
    { id:'f4-4', text:'Bir malın qiyməti 30% artdı. Sonra 30% azaldı. Nəticə?', options:['Dəyişmədi','9% azaldı','9% artdı','30% azaldı'], correctIndex:1 },
    { id:'f4-5', text:'Şagirdin balı 80-dən 72-yə düşdü. Neçə faiz azaldı?', options:['8%','9%','10%','11%'], correctIndex:2 },
  ],

  // ── Həqiqi ədədlər ────────────────────────────────────────────────────────
  'heqiqi-1': [
    { id:'h1-1', text:'(-3) + (-5) = ?', options:['2','-2','8','-8'], correctIndex:3 },
    { id:'h1-2', text:'(-4) × (-7) = ?', options:['-28','28','-11','11'], correctIndex:1 },
    { id:'h1-3', text:'(-12) ÷ 4 = ?', options:['3','-3','48','-48'], correctIndex:1 },
    { id:'h1-4', text:'(-5) − (+3) = ?', options:['2','-2','-8','8'], correctIndex:2 },
    { id:'h1-5', text:'(-2)³ = ?', options:['6','-6','8','-8'], correctIndex:3 },
  ],
  'heqiqi-2': [
    { id:'h2-1', text:'√2 hansı ədəd növüdür?', options:['Tam','Rasional','İrrasional','Mürəkkəb'], correctIndex:2 },
    { id:'h2-2', text:'√49 = ?', options:['6','7','8','9'], correctIndex:1 },
    { id:'h2-3', text:'Hansı ədəd irrasionaldır?', options:['√4','√9','√16','√5'], correctIndex:3 },
    { id:'h2-4', text:'π ədədi hansı növ ədəddir?', options:['Tam','Rasional','İrrasional','Kompleks'], correctIndex:2 },
    { id:'h2-5', text:'√3 × √3 = ?', options:['√6','3','9','√9'], correctIndex:1 },
  ],
  'heqiqi-3': [
    { id:'h3-1', text:'|-7| = ?', options:['-7','7','49','-49'], correctIndex:1 },
    { id:'h3-2', text:'|3 − 8| = ?', options:['5','-5','11','-11'], correctIndex:0 },
    { id:'h3-3', text:'|-3| + |5| = ?', options:['2','-2','8','-8'], correctIndex:2 },
    { id:'h3-4', text:'|x| = 4 tənliyinin həllər çoxluğu:', options:['x=4','x=-4','x=±4','Həll yoxdur'], correctIndex:2 },
    { id:'h3-5', text:'|x−2| < 3 bərabərsizliyinin həlli:', options:['-1<x<5','x>5','x<-1','|x|<1'], correctIndex:0 },
  ],
  'heqiqi-4': [
    { id:'h4-1', text:'Ədəd oxunda -3 ilə 5 arasındakı məsafə:', options:['2','8','3','5'], correctIndex:1 },
    { id:'h4-2', text:'√2 ? 1.4 müqayisəsi:', options:['√2 > 1.4','√2 < 1.4','√2 = 1.4','Müəyyən deyil'], correctIndex:0 },
    { id:'h4-3', text:'-2.5 ? -3 müqayisəsi:', options:['-2.5 > -3','-2.5 < -3','-2.5 = -3','Müəyyən deyil'], correctIndex:0 },
    { id:'h4-4', text:'Ən kiçikdən böyüyə sıralayın: 0, -1, 2, -3', options:['-3,-1,0,2','0,-1,2,-3','2,0,-1,-3','-1,-3,0,2'], correctIndex:0 },
    { id:'h4-5', text:'π ? 3.14 müqayisəsi:', options:['π > 3.14','π < 3.14','π = 3.14','Müəyyən deyil'], correctIndex:0 },
  ],
  'heqiqi-5': [
    { id:'h5-1', text:'7.83 ədədinin tam hissəsi:', options:['7','8','0.83','78'], correctIndex:0 },
    { id:'h5-2', text:'-4.2 ədədinin tam hissəsi:', options:['-4','-5','4','0.2'], correctIndex:1 },
    { id:'h5-3', text:'3.7 × 10² standart şəkildə:', options:['370','37.0','0.037','3700'], correctIndex:0 },
    { id:'h5-4', text:'2.5 × 10⁻³ = ?', options:['0.0025','0.025','25','250'], correctIndex:0 },
    { id:'h5-5', text:'6800000 standart şəkildə:', options:['6.8×10⁵','6.8×10⁶','68×10⁵','0.68×10⁷'], correctIndex:1 },
  ],

  // ── Tam cəbri ifadələr ────────────────────────────────────────────────────
  'cebri-1': [
    { id:'c1-1', text:'3x² birhədlisinin dərəcəsi:', options:['1','2','3','6'], correctIndex:1 },
    { id:'c1-2', text:'2³ = ?', options:['6','8','16','9'], correctIndex:1 },
    { id:'c1-3', text:'a² × a³ = ?', options:['a⁵','a⁶','2a⁵','a'], correctIndex:0 },
    { id:'c1-4', text:'(a³)² = ?', options:['a⁵','a⁶','2a³','a⁹'], correctIndex:1 },
    { id:'c1-5', text:'x⁰ = ? (x≠0)', options:['0','1','x','∞'], correctIndex:1 },
  ],
  'cebri-2': [
    { id:'c2-1', text:'(3x + 2) + (5x − 4) = ?', options:['8x−2','8x+2','8x−6','2x−2'], correctIndex:0 },
    { id:'c2-2', text:'(2x² + 3x) − (x² − x) = ?', options:['x²+2x','x²+4x','3x²+2x','x²−4x'], correctIndex:1 },
    { id:'c2-3', text:'2x(3x − 5) = ?', options:['6x²−10','6x²−10x','5x²−10x','6x−10x'], correctIndex:1 },
    { id:'c2-4', text:'(x+2)(x+3) = ?', options:['x²+5x+6','x²+6x+5','x²+5x+5','x²+6x+6'], correctIndex:0 },
    { id:'c2-5', text:'Çoxhədlinin dərəcəsi: 3x⁴ + 2x² − 5', options:['2','4','5','3'], correctIndex:1 },
  ],
  'cebri-3': [
    { id:'c3-1', text:'(a+b)² = ?', options:['a²+b²','a²+2ab+b²','a²−2ab+b²','a²+ab+b²'], correctIndex:1 },
    { id:'c3-2', text:'(a−b)² = ?', options:['a²+b²','a²+2ab+b²','a²−2ab+b²','a²−b²'], correctIndex:2 },
    { id:'c3-3', text:'(a+b)(a−b) = ?', options:['a²+b²','a²−b²','a²+2ab−b²','2ab'], correctIndex:1 },
    { id:'c3-4', text:'(x+3)² = ?', options:['x²+9','x²+6x+9','x²+3x+9','x²−6x+9'], correctIndex:1 },
    { id:'c3-5', text:'(2x−1)² = ?', options:['4x²+1','4x²−4x+1','4x²+4x−1','4x²−1'], correctIndex:1 },
  ],
  'cebri-4': [
    { id:'c4-1', text:'x=2, y=3 olduqda 2x+3y=?', options:['11','12','13','14'], correctIndex:2 },
    { id:'c4-2', text:'a=−1 olduqda a³−2a=?', options:['1','−1','3','-3'], correctIndex:0 },
    { id:'c4-3', text:'x=5 olduqda x²−2x+1=?', options:['14','15','16','17'], correctIndex:2 },
    { id:'c4-4', text:'a=2,b=3 olduqda (a+b)²−(a−b)²=?', options:['10','20','24','12'], correctIndex:2 },
    { id:'c4-5', text:'x=0.5 olduqda 4x²−1=?', options:['0','-1','1','2'], correctIndex:0 },
  ],
  'cebri-5': [
    { id:'c5-1', text:'x²+4 ifadəsinin ən kiçik qiyməti:', options:['0','1','4','5'], correctIndex:2 },
    { id:'c5-2', text:'−x²+6x−5 ifadəsinin ən böyük qiyməti:', options:['4','5','6','7'], correctIndex:0 },
    { id:'c5-3', text:'(x−3)² ≥ 0. Bu ifadənin ən kiçik qiyməti:', options:['−3','0','3','9'], correctIndex:1 },
    { id:'c5-4', text:'x²−4x+4 = (x−?)²', options:['(x−4)²','(x−2)²','(x+2)²','(x+4)²'], correctIndex:1 },
    { id:'c5-5', text:'|x|+1-in ən kiçik qiyməti:', options:['0','1','−1','2'], correctIndex:1 },
  ],

  // ── Çoxhədlinin vuruqlara ayrılması ─────────────────────────────────────
  'vuruqlar-1': [
    { id:'v1-1', text:'a²−b² = ?', options:['(a−b)²','(a+b)²','(a+b)(a−b)','a²+2ab−b²'], correctIndex:2 },
    { id:'v1-2', text:'x²+2x+1 = ?', options:['(x+1)²','(x−1)²','(x+2)(x−1)','(x+1)(x−1)'], correctIndex:0 },
    { id:'v1-3', text:'9x²−4 = ?', options:['(3x+2)²','(3x−2)²','(3x+2)(3x−2)','3(x²−4)'], correctIndex:2 },
    { id:'v1-4', text:'x²−6x+9 = ?', options:['(x−3)²','(x+3)²','(x−3)(x+3)','(x−9)²'], correctIndex:0 },
    { id:'v1-5', text:'4a²−1 = ?', options:['(2a+1)²','(2a−1)²','(2a+1)(2a−1)','2(a²−1)'], correctIndex:2 },
  ],
  'vuruqlar-2': [
    { id:'v2-1', text:'x²+5x+6 = ?', options:['(x+2)(x+3)','(x+1)(x+6)','(x+5)(x+1)','(x−2)(x−3)'], correctIndex:0 },
    { id:'v2-2', text:'x²−5x+6 = ?', options:['(x−2)(x−3)','(x+2)(x+3)','(x−6)(x+1)','(x+2)(x−3)'], correctIndex:0 },
    { id:'v2-3', text:'2x²+5x+3 = ?', options:['(2x+3)(x+1)','(2x+1)(x+3)','(x+3)(2x−1)','(2x−3)(x−1)'], correctIndex:0 },
    { id:'v2-4', text:'6x² ümumi vuruğu çıxarın: 6x³−12x²', options:['6x²(x−2)','6x(x²−2x)','2x²(3x−6)','6x²(x+2)'], correctIndex:0 },
    { id:'v2-5', text:'x³−8 = ?', options:['(x−2)(x²+2x+4)','(x−2)³','(x+2)(x²−2x+4)','(x²−4)(x+2)'], correctIndex:0 },
  ],
  'vuruqlar-3': [
    { id:'v3-1', text:'9999 = 10000−1 = (100−1)(100+1). Bu hansı üsuldan istifadədir?', options:['Çıxma','Fərqin hasili','Müştərək vuruq','Qruplandırma'], correctIndex:1 },
    { id:'v3-2', text:'x²+3x+2 = 0 tənliyinin kökləri:', options:['−1 və −2','1 və 2','−1 və 2','1 və −2'], correctIndex:0 },
    { id:'v3-3', text:'25x²−1-i vuruqlara ayırın:', options:['(5x+1)(5x−1)','(25x+1)(x−1)','(5x−1)²','(5x+1)²'], correctIndex:0 },
    { id:'v3-4', text:'a(b+c)+b(a+c)=? (sadələşdirin)', options:['2ab+c(a+b)','ab+bc+ac','(a+b)(b+c)','2a+2b+c'], correctIndex:0 },
    { id:'v3-5', text:'x=101 olduqda x²−1 = ?', options:['10100','10200','10201','10001'], correctIndex:1 },
  ],

  // ── Rasional kəsrlər ─────────────────────────────────────────────────────
  'rasional-1': [
    { id:'r1-1', text:'6x²y / 3xy = ?', options:['2x','2y','2xy','2x/y'], correctIndex:0 },
    { id:'r1-2', text:'(x²−4)/(x−2) = ? (x≠2)', options:['x+2','x−2','x²+2','x+4'], correctIndex:0 },
    { id:'r1-3', text:'15a²b³ / 5ab² = ?', options:['3ab','3a²b','3b','a²b'], correctIndex:0 },
    { id:'r1-4', text:'(x²+5x+6)/(x+2) = ? (x≠−2)', options:['x+3','x−3','x+2','x+6'], correctIndex:0 },
    { id:'r1-5', text:'(a²−b²)/(a+b) = ? (a≠−b)', options:['a+b','a−b','a²−b','b−a'], correctIndex:1 },
  ],
  'rasional-2': [
    { id:'r2-1', text:'1/(x+1) + 1/(x−1) = ?', options:['2/(x²−1)','2x/(x²−1)','2/(2x)','1/x'], correctIndex:1 },
    { id:'r2-2', text:'x/(x+2) − 2/(x+2) = ?', options:['(x−2)/(x+2)','(x+2)/(x+2)','1','(x+2)/(x−2)'], correctIndex:0 },
    { id:'r2-3', text:'(2/x) × (x/4) = ? (x≠0)', options:['1/2','2/x','x/2','8/x²'], correctIndex:0 },
    { id:'r2-4', text:'(a/b) ÷ (a²/b) = ? (a,b≠0)', options:['a','1/a','b/a','a/b'], correctIndex:1 },
    { id:'r2-5', text:'1/x + 1/y = ? (ümumi məxrəcə gətirin)', options:['(x+y)/xy','2/(x+y)','(x+y)/(x²+y²)','xy/(x+y)'], correctIndex:0 },
  ],
  'rasional-3': [
    { id:'r3-1', text:'x=3 olduqda (x+2)/(x−1) = ?', options:['2','2.5','3','5/2'], correctIndex:1 },
    { id:'r3-2', text:'a=2, b=1 olduqda (a²−b²)/(a−b) = ?', options:['1','2','3','5'], correctIndex:2 },
    { id:'r3-3', text:'x=5 olduqda x/(x²−9) = ?', options:['5/16','5/25','1/4','5/14'], correctIndex:0 },
    { id:'r3-4', text:'x=2, y=1 olduqda (x+y)/(x−y) = ?', options:['1','2','3','4'], correctIndex:2 },
    { id:'r3-5', text:'x=0 olduqda (x²+1)/(x+1)-nın qiyməti:', options:['0','1','−1','2'], correctIndex:1 },
  ],

  // ── Kvadrat köklər ────────────────────────────────────────────────────────
  'kvkokler-1': [
    { id:'kv1-1', text:'√64 = ?', options:['6','7','8','9'], correctIndex:2 },
    { id:'kv1-2', text:'√(a²) = ? (a≥0)', options:['a','a²','2a','a/2'], correctIndex:0 },
    { id:'kv1-3', text:'√12 = ?', options:['2√3','3√2','2√6','4√3'], correctIndex:0 },
    { id:'kv1-4', text:'√75 = ?', options:['5√3','3√5','5√15','15√3'], correctIndex:0 },
    { id:'kv1-5', text:'(√5)² = ?', options:['5','25','√25','2√5'], correctIndex:0 },
  ],
  'kvkokler-2': [
    { id:'kv2-1', text:'∜16 = ?', options:['2','4','8','16'], correctIndex:0 },
    { id:'kv2-2', text:'8^(1/3) = ?', options:['2','4','8','3'], correctIndex:0 },
    { id:'kv2-3', text:'4^(3/2) = ?', options:['6','8','12','16'], correctIndex:1 },
    { id:'kv2-4', text:'27^(2/3) = ?', options:['3','6','9','18'], correctIndex:2 },
    { id:'kv2-5', text:'a^(-2) = ? (a≠0)', options:['1/a²','a²','−a²','−1/a²'], correctIndex:0 },
  ],
  'kvkokler-3': [
    { id:'kv3-1', text:'√(a/b) = √a/√b — Bu ifadə nə adlanır?', options:['Toplanma','Hasil xassəsi','Bölmə xassəsi','Qüvvətə yüksəltmə'], correctIndex:2 },
    { id:'kv3-2', text:'√8/√2 = ?', options:['2','4','√4','√6'], correctIndex:0 },
    { id:'kv3-3', text:'1/√2 = ? (məxrəci rasionallaşdırın)', options:['√2','√2/2','1/2','2/√2'], correctIndex:1 },
    { id:'kv3-4', text:'x=4 olduqda √(x+5)−√x=?', options:['1','√5−2','3−2','√9−2'], correctIndex:1 },
    { id:'kv3-5', text:'√12 × √3 = ?', options:['3','6','√36','√15'], correctIndex:1 },
  ],

  // ── Birməchullu tənliklər ─────────────────────────────────────────────────
  'tenlikler-1': [
    { id:'t1-1', text:'2x + 5 = 13 tənliyinin kökü:', options:['3','4','5','6'], correctIndex:1 },
    { id:'t1-2', text:'3x − 7 = 11 tənliyinin kökü:', options:['4','5','6','7'], correctIndex:2 },
    { id:'t1-3', text:'5(x−2) = 3(x+4) tənliyinin kökü:', options:['9','10','11','13'], correctIndex:3 },
    { id:'t1-4', text:'x/3 + 2 = 5 tənliyinin kökü:', options:['3','6','9','12'], correctIndex:2 },
    { id:'t1-5', text:'2(3x−1) = 4x+6 tənliyinin kökü:', options:['3','4','5','6'], correctIndex:1 },
  ],
  'tenlikler-2': [
    { id:'t2-1', text:'x²−5x+6=0 tənliyinin kökləri:', options:['2 və 3','−2 və 3','2 və −3','−2 və −3'], correctIndex:0 },
    { id:'t2-2', text:'x²−4=0 tənliyinin kökləri:', options:['±2','±4','2','4'], correctIndex:0 },
    { id:'t2-3', text:'x²+4x+4=0 tənliyinin diskriminantı:', options:['0','4','8','16'], correctIndex:0 },
    { id:'t2-4', text:'x²+1=0 tənliyinin:', options:['2 kökü var','1 kökü var','Kökü yoxdur','Sonsuz kökü var'], correctIndex:2 },
    { id:'t2-5', text:'2x²−3x−2=0 tənliyinin kökləri:', options:['2 və −0.5','−2 və 0.5','1 və 2','−1 və −2'], correctIndex:0 },
  ],
  'tenlikler-3': [
    { id:'t3-1', text:'Viyet: x²−5x+6=0 üçün köklərin cəmi:', options:['3','5','6','−5'], correctIndex:1 },
    { id:'t3-2', text:'Viyet: x²+3x−10=0 üçün köklərin hasili:', options:['3','-10','10','-3'], correctIndex:1 },
    { id:'t3-3', text:'Kökləri 2 və 3 olan kvadrat tənlik:', options:['x²−5x+6=0','x²+5x+6=0','x²−6x+5=0','x²+5x−6=0'], correctIndex:0 },
    { id:'t3-4', text:'Kökləri −1 və 4 olan kvadrat tənlik:', options:['x²+3x−4=0','x²−3x+4=0','x²−3x−4=0','x²+3x+4=0'], correctIndex:2 },
    { id:'t3-5', text:'Viyet: köklərin cəmi −4, hasili 3. Tənlik:', options:['x²+4x+3=0','x²−4x+3=0','x²+3x+4=0','x²−3x−4=0'], correctIndex:0 },
  ],
  'tenlikler-4': [
    { id:'t4-1', text:'x/(x−1) = 2 tənliyinin kökü:', options:['1','2','3','4'], correctIndex:1 },
    { id:'t4-2', text:'1/x + 1/(x+1) = 1. Rasional tənliyi həll edin:', options:['(1±√5)/2','(−1±√5)/2','(1±√3)/2','Həll yoxdur'], correctIndex:0 },
    { id:'t4-3', text:'(x+2)/(x−1) = 3 tənliyinin kökü:', options:['2.5','3.5','4','5/2'], correctIndex:3 },
    { id:'t4-4', text:'2/(x−3) = x tənliyinin kökləri:', options:['x=2 və x=−1','x=−2 və x=1','x=2 və x=1','x=−2 və x=−1'], correctIndex:0 },
    { id:'t4-5', text:'Rasional tənliyin məxrəci sıfır olan xüsusi dəyəri adlanır:', options:['Köklər','Qəbul olunmayan qiymət','Diskriminant','Həll çoxluğu'], correctIndex:1 },
  ],
  'tenlikler-5': [
    { id:'t5-1', text:'|x−3| = 5 tənliyinin kökləri:', options:['8 və −2','8 və 2','−8 və 2','−8 və −2'], correctIndex:0 },
    { id:'t5-2', text:'√(x+4) = 3 tənliyinin kökü:', options:['4','5','6','9'], correctIndex:1 },
    { id:'t5-3', text:'|2x−1| = 7. x = ?', options:['4 və −3','−4 və 3','4 və 3','−4 və −3'], correctIndex:0 },
    { id:'t5-4', text:'√(2x−1) = 3 tənliyinin kökü:', options:['4','5','6','8'], correctIndex:1 },
    { id:'t5-5', text:'|x| + |x−2| = 4. x = ?', options:['x=3 və x=−1','x=2 və x=−2','x=1 və x=3','x=0 və x=4'], correctIndex:0 },
  ],
  'tenlikler-6': [
    { id:'t6-1', text:'Bir ədəd digərindən 5 çox, onların cəmi 27-dir. Böyük ədəd:', options:['14','15','16','17'], correctIndex:2 },
    { id:'t6-2', text:'Bölünənin bölənə nisbəti 4-dür, bölüşən 6-dır. Bölünən:', options:['20','22','24','26'], correctIndex:2 },
    { id:'t6-3', text:'Düzbucaqlının eni uzunluğundan 3 m azdır, perimetri 26 m. Uzunluq:', options:['7','8','9','10'], correctIndex:1 },
    { id:'t6-4', text:'3 ili 5 ildən əvvəlki yaşın 2 mislidir. İndiki yaş:', options:['13','14','15','16'], correctIndex:0 },
    { id:'t6-5', text:'İki ədədin nisbəti 3:5, fərqi 12. Böyük ədəd:', options:['28','30','32','36'], correctIndex:1 },
  ],

  // ── Tənliklər sistemi ────────────────────────────────────────────────────
  'sistem-1': [
    { id:'s1-1', text:'x+y=5 və x−y=1 sisteminin həlli:', options:['(3,2)','(2,3)','(4,1)','(1,4)'], correctIndex:0 },
    { id:'s1-2', text:'2x+y=7 və x−y=2 sisteminin həlli:', options:['(3,1)','(2,3)','(1,5)','(4,−1)'], correctIndex:0 },
    { id:'s1-3', text:'3x−2y=1 və x+y=3 sisteminin həlli:', options:['(1,2)','(2,1)','(3,0)','(0,3)'], correctIndex:0 },
    { id:'s1-4', text:'x+2y=4 və 2x+y=5 sisteminin həlli:', options:['(2,1)','(1,2)','(3,0)','(0,3)'], correctIndex:0 },
    { id:'s1-5', text:'4x−3y=5 və x+y=5 sisteminin həlli:', options:['(4,1)','(2,3)','(3,2)','(1,4)'], correctIndex:2 },
  ],
  'sistem-2': [
    { id:'s2-1', text:'Xətti tənliklər sisteminin yeganə həlli olması üçün şərt:', options:['Determinant 0-dır','Determinant 0 deyil','Determinant müsbətdir','Sonsuz həll var'], correctIndex:1 },
    { id:'s2-2', text:'ax+by=c sisteminin sonsuz həlləri olması üçün:', options:['a₁/a₂ ≠ b₁/b₂','a₁/a₂ = b₁/b₂ = c₁/c₂','a₁b₂ ≠ a₂b₁','Heç biri'], correctIndex:1 },
    { id:'s2-3', text:'x+y=3 və 2x+2y=7 sisteminin həllərinin sayı:', options:['1','2','Sonsuz','0'], correctIndex:3 },
    { id:'s2-4', text:'x+y=3 və 2x+2y=6 sisteminin həllərinin sayı:', options:['1','2','Sonsuz','0'], correctIndex:2 },
    { id:'s2-5', text:'Kramer metodu neçə tənlikli sistemdə istifadə olunur?', options:['2','3','İkidən çox','İstənilən'], correctIndex:3 },
  ],
  'sistem-3': [
    { id:'s3-1', text:'x+y=3 və xy=2 sisteminin həlli:', options:['(1,2) və (2,1)','(1,3) və (3,1)','(2,2)','Həll yoxdur'], correctIndex:0 },
    { id:'s3-2', text:'x−y=1 və x²+y²=5 sisteminin həlli:', options:['(2,1) və (−1,−2)','(2,1) üçün','(1,2)','(3,2)'], correctIndex:0 },
    { id:'s3-3', text:'x+y=4 və x²−y=2 sisteminin x qiymətləri:', options:['x=3 və x=−1 yox...','x²−(4−x)=2⟹x²+x−6=0','x=2 və x=−3','2 ikinci variant'], correctIndex:1 },
    { id:'s3-4', text:'x²+y²=25 və x+y=7 sisteminin həllərindən biri:', options:['(3,4)','(4,4)','(5,2)','(1,6)'], correctIndex:0 },
    { id:'s3-5', text:'xy=6 və x+y=5 sisteminin həlli:', options:['(2,3) və (3,2)','(1,6) və (6,1)','(2,4)','Həll yoxdur'], correctIndex:0 },
  ],
  'sistem-4': [
    { id:'s4-1', text:'x²+y²=10 və x²−y²=2 sisteminin həlli:', options:['x²=6,y²=4','x²=4,y²=6','x=±2,y=±√6','x=±√6,y=±2'], correctIndex:3 },
    { id:'s4-2', text:'x²+y=5 və x+y²=5 sistemindən birisi x=y=?', options:['0','1','2','−1'], correctIndex:2 },
    { id:'s4-3', text:'İki ədədin kvadratlarının cəmi 25, cəmləri 7-dir. Bu ədədlər:', options:['3 və 4','4 və 4','5 və 2','3 və 5'], correctIndex:0 },
    { id:'s4-4', text:'x²y=4 və xy²=8 olduqda xy = ?', options:['2','4','6','8'], correctIndex:1 },
    { id:'s4-5', text:'Simmetrik sistem: x+y=s, xy=p. x²+y² = ?', options:['s²','p²','s²−2p','s²+2p'], correctIndex:2 },
  ],
  'sistem-5': [
    { id:'s5-1', text:'İki ədədin cəmi 20, fərqinin 3 misli 12-dir. Böyük ədəd:', options:['12','13','14','15'], correctIndex:1 },
    { id:'s5-2', text:'Iki ədədin nisbəti 2:3, cəmi 50. Böyük ədəd:', options:['20','30','25','15'], correctIndex:1 },
    { id:'s5-3', text:'Düzbucaqlının perimetri 40, sahəsi 96. Uzun tərəf:', options:['10','12','14','16'], correctIndex:1 },
    { id:'s5-4', text:'45 ədədi 2 rəqəmli, onluqlar rəqəmi birliklər rəqəmindən 3 az. Bu ədəd:', options:['14','25','36','47'], correctIndex:2 },
    { id:'s5-5', text:'Iki rəqəmli ədəd rəqəmlərinin cəmi 9, rəqəmlər yeri dəyişdikdə ədəd 27 artır. Bu ədəd:', options:['36','45','27','18'], correctIndex:0 },
  ],

  // ── Bərabərsizliklər ─────────────────────────────────────────────────────
  'berabersiz-1': [
    { id:'b1-1', text:'a < b olduqda −2a ? −2b:', options:['<','>','=','Müəyyən deyil'], correctIndex:1 },
    { id:'b1-2', text:'a > b > 0 olduqda 1/a ? 1/b:', options:['<','>','=','Müəyyən deyil'], correctIndex:0 },
    { id:'b1-3', text:'Hər iki tərəfə müsbət ədəd əlavə etsək bərabərsizlik:', options:['Dəyişir','Dəyişmir','Bərabərliyə çevrilir','Mümkün deyil'], correctIndex:1 },
    { id:'b1-4', text:'Hər iki tərəfi mənfi ədədə vursaq bərabərsizlik:', options:['Dəyişmir','Dəyişir (işarə çevrilir)','Ləğv olur','Bərabər olur'], correctIndex:1 },
    { id:'b1-5', text:'a < b və c < d ⟹ a+c ? b+d:', options:['<','>','=','Müəyyən deyil'], correctIndex:0 },
  ],
  'berabersiz-2': [
    { id:'b2-1', text:'2x − 3 > 7. x > ?', options:['2','3','4','5'], correctIndex:3 },
    { id:'b2-2', text:'−3x < 9. x > ?', options:['−3','3','−9','9'], correctIndex:0 },
    { id:'b2-3', text:'x+2 < 5 və x−1 > 1 sisteminin həlli:', options:['2<x<3','1<x<3','2<x<5','3<x<5'], correctIndex:0 },
    { id:'b2-4', text:'|x| < 4 bərabərsizliyinin həlli:', options:['x>4','x<4','−4<x<4','x<−4 və x>4'], correctIndex:2 },
    { id:'b2-5', text:'3x+1 ≤ 2x+5. x ≤ ?', options:['2','3','4','6'], correctIndex:2 },
  ],
  'berabersiz-3': [
    { id:'b3-1', text:'x² < 9. Həll:', options:['x<3','x>−3','-3<x<3','x<9'], correctIndex:2 },
    { id:'b3-2', text:'x² − 4x + 3 > 0. Həll:', options:['x<1 və x>3','1<x<3','x<1','x>3'], correctIndex:0 },
    { id:'b3-3', text:'x² − 5x + 6 ≤ 0. Həll:', options:['x≤2 və x≥3','2≤x≤3','x≤2','x≥3'], correctIndex:1 },
    { id:'b3-4', text:'x(x−2) > 0. Həll:', options:['0<x<2','x<0 və x>2','x>0','x<2'], correctIndex:1 },
    { id:'b3-5', text:'(x−1)(x+3) < 0. Həll:', options:['-3<x<1','x>1','x<−3','1<x<−3'], correctIndex:0 },
  ],
  'berabersiz-4': [
    { id:'b4-1', text:'(x−2)/(x+1) > 0. Həll:', options:['x<−1 və x>2','−1<x<2','x>2','x<−1'], correctIndex:0 },
    { id:'b4-2', text:'1/x > 2. Həll (x>0):', options:['x>2','0<x<1/2','x<1/2','x>1/2'], correctIndex:1 },
    { id:'b4-3', text:'(x+3)/(x−1) < 0. Həll:', options:['x<−3 və x>1','-3<x<1','x>1','x<−3'], correctIndex:1 },
    { id:'b4-4', text:'Rasional bərabərsizlikdə ODT-nın sıfır nöqtəsi :', options:['Həll çoxluğuna daxildir','Həll çoxluğuna daxil edilmir','İstənilən halda daxildir','ODT olmur'], correctIndex:1 },
    { id:'b4-5', text:'x²/(x−3) ≥ 0 (x≠3). Həll:', options:['x≥0 və x≠3','x≥3','x≤0 və x>3','x≥0'], correctIndex:0 },
  ],
  'berabersiz-5': [
    { id:'b5-1', text:'|x−2| ≤ 3. Həll:', options:['−1≤x≤5','x≤−1 və x≥5','-1<x<5','x<5'], correctIndex:0 },
    { id:'b5-2', text:'|2x+1| > 5. Həll:', options:['x<−3 və x>2','−3<x<2','x>2','x<−3'], correctIndex:0 },
    { id:'b5-3', text:'|x| + |x−1| ≥ 2 (həll çoxluğu):', options:['x≤−1/2 və x≥3/2','−1/2≤x≤3/2','x≤0','x≥1'], correctIndex:0 },
    { id:'b5-4', text:'|x−3| < |x+1|. Həll:', options:['x>1','x<1','x>−1','x<3'], correctIndex:0 },
    { id:'b5-5', text:'|x+1| ≤ 0. Həll:', options:['x=−1','x≥−1','Həll yoxdur','Bütün x'], correctIndex:0 },
  ],
  'berabersiz-6': [
    { id:'b6-1', text:'x²>4 və x²<9 sisteminin həlli:', options:['2<|x|<3','|x|<2','|x|>3','2<x<3'], correctIndex:0 },
    { id:'b6-2', text:'√x < 2. Həll (x≥0):', options:['0≤x<4','x<4','x>4','0<x<2'], correctIndex:0 },
    { id:'b6-3', text:'√(x−1) > 2. Həll:', options:['x>5','x>3','x>1','x≥5'], correctIndex:0 },
    { id:'b6-4', text:'√(2x+3) ≤ 3. Həll:', options:['x≤3','−3/2≤x≤3','x≤−3/2','x≥3'], correctIndex:1 },
    { id:'b6-5', text:'İrrasional bərabərsizliyi həll edərkən ilkin şərt:', options:['Kökülatı ≥ 0','Kökülatı > 0','Kökülatı ≤ 0','Şərt yoxdur'], correctIndex:0 },
  ],

  // ── Ədədi ardıcıllıqlar ──────────────────────────────────────────────────
  'ardiciллiq-1': [
    { id:'a1-1', text:'2, 5, 8, 11, ... ardıcıllığının 5-ci hədi:', options:['13','14','15','16'], correctIndex:1 },
    { id:'a1-2', text:'Fib: 1,1,2,3,5,8 ardıcıllığında növbəti həd:', options:['11','12','13','14'], correctIndex:2 },
    { id:'a1-3', text:'a₁=3, d=4 olan SA-nın a₅-i:', options:['15','17','19','21'], correctIndex:2 },
    { id:'a1-4', text:'n-ci həddi 2n+1 olan ardıcıllığın 10-cu hədi:', options:['19','20','21','22'], correctIndex:2 },
    { id:'a1-5', text:'4, 7, 10, 13, ... ardıcıllığının fərqi (d):', options:['2','3','4','7'], correctIndex:1 },
  ],
  'ardiciлliق-2': [
    { id:'a2-1', text:'SA: a₁=2, d=3, n=10. S₁₀ = ?', options:['155','160','165','170'], correctIndex:0 },
    { id:'a2-2', text:'SA: a₁=1, aₙ=19, d=2. n = ?', options:['8','9','10','11'], correctIndex:2 },
    { id:'a2-3', text:'SA cəmi düsturu: Sₙ = ?', options:['n(a₁+aₙ)/2','n×d','a₁+nd','n×a₁'], correctIndex:0 },
    { id:'a2-4', text:'SA: a₁=5, d=−2. a₄ = ?', options:['−1','0','1','-1'], correctIndex:0 },
    { id:'a2-5', text:'1+2+3+...+100 = ?', options:['4950','5000','5050','5100'], correctIndex:2 },
  ],
  'ardiciлliق-3': [
    { id:'a3-1', text:'HG: a₁=2, q=3. a₄ = ?', options:['18','36','54','162'], correctIndex:2 },
    { id:'a3-2', text:'HG: 2, 4, 8, 16 ... q = ?', options:['1','2','4','8'], correctIndex:1 },
    { id:'a3-3', text:'Sonsuz HG cəmi (|q|<1): S = a₁/(1−q). a₁=1, q=0.5 ⟹ S = ?', options:['1','2','3','4'], correctIndex:1 },
    { id:'a3-4', text:'HG: a₁=3, q=2. S₄ = ?', options:['42','45','48','51'], correctIndex:1 },
    { id:'a3-5', text:'Sonsuz HG: a₁=6, q=1/3. S∞ = ?', options:['7','8','9','10'], correctIndex:2 },
  ],
  'ardiciлliق-4': [
    { id:'a4-1', text:'SA ilk 5 cüt natural ədədin cəmi:', options:['20','25','30','35'], correctIndex:2 },
    { id:'a4-2', text:'HG: a₁=1, aₙ=81, q=3. n = ?', options:['3','4','5','6'], correctIndex:2 },
    { id:'a4-3', text:'1+3+5+7+...+(2n−1) = ?', options:['n','n²','n(n+1)','2n'], correctIndex:1 },
    { id:'a4-4', text:'SA: d=4, a₃=10. a₁ = ?', options:['1','2','3','4'], correctIndex:1 },
    { id:'a4-5', text:'HG: a₁=8, a₄=1. q = ?', options:['0.3','0.5','1/4','1/2'], correctIndex:3 },
  ],

  // ── Çoxluqlar ────────────────────────────────────────────────────────────
  'coxluqlar-1': [
    { id:'cx1-1', text:'A={1,2,3}, B={2,3,4}. A∪B = ?', options:['{2,3}','{1,2,3,4}','{1,4}','{1,2,3,4,2,3}'], correctIndex:1 },
    { id:'cx1-2', text:'A={1,2,3}, B={2,3,4}. A∩B = ?', options:['{2,3}','{1,4}','{1,2,3,4}','{1,3}'], correctIndex:0 },
    { id:'cx1-3', text:'A={1,2,3}, B={2,3,4}. A\\B = ?', options:['{1}','{4}','{2,3}','{1,4}'], correctIndex:0 },
    { id:'cx1-4', text:'Boş çoxluq işarəsi:', options:['{}','∅','0','Ø'], correctIndex:1 },
    { id:'cx1-5', text:'A⊂B — bu nə deməkdir?', options:['A, B-ni ehtiva edir','B, A-nı ehtiva edir','A, B-nin alt çoxluğudur','A=B'], correctIndex:2 },
  ],
  'coxluqlar-2': [
    { id:'cx2-1', text:'|A|=5, |B|=4, |A∩B|=2. |A∪B| = ?', options:['7','8','9','11'], correctIndex:0 },
    { id:'cx2-2', text:'30 şagirddən 18-i riyaziyyat, 15-i fizika, ikisini sevirmi? 6-sı hər ikisini. Yalnız riyaziyyat sevən:', options:['9','10','12','15'], correctIndex:2 },
    { id:'cx2-3', text:'|A|=10, |B|=8, |A∪B|=14. |A∩B| = ?', options:['2','3','4','6'], correctIndex:2 },
    { id:'cx2-4', text:'A, B ilə kəsişmirsə, |A∪B| = ?', options:['|A|+|B|−|A∩B|','|A|+|B|','|A|×|B|','|A|−|B|'], correctIndex:1 },
    { id:'cx2-5', text:'50 şagirddən 30-u kitab, 25-i jurnal oxuyur, 10-u hər ikisini. Heç birini oxumayan:', options:['5','10','15','20'], correctIndex:0 },
  ],

  // ── Həndəsənin əsas anlayışları ─────────────────────────────────────────
  'hendese-esaslar-1': [
    { id:'he1-1', text:'Bir nöqtəyə aid olan bütün şüaların sayı:', options:['2','4','Sonsuz','Məhdud'], correctIndex:2 },
    { id:'he1-2', text:'Şüanın başlanğıc nöqtəsi var, sonu:','options':['Var','Yoxdur (sonsuz uzanır)','2 cm-dir','Dəyişir'], correctIndex:1 },
    { id:'he1-3', text:'İki nöqtə arasındakı ən qısa məsafə:', options:['Parça','Şüa','Düz xətt','Qövsü'], correctIndex:0 },
    { id:'he1-4', text:'AB = 10 sm, M orta nöqtəsidirsə, AM = ?', options:['5 sm','10 sm','20 sm','2 sm'], correctIndex:0 },
    { id:'he1-5', text:'AB+BC=AC olduqda B nöqtəsi harada yerləşir?', options:['A-dan solda','AC parçasının üstündə','C-dən sağda','A ilə C-nin xaricində'], correctIndex:1 },
  ],
  'hendese-esaslar-2': [
    { id:'he2-1', text:'Düz bucaq neçə dərəcədir?', options:['45°','90°','120°','180°'], correctIndex:1 },
    { id:'he2-2', text:'Bucaqölçən ilə 60°-li bucaq ölçüldü. Bu bucaq hansı növdədir?', options:['İti','Düz','Küt','Lüng'], correctIndex:0 },
    { id:'he2-3', text:'Bucağın tən böləninin xassəsi:', options:['Tən iki parçaya bölür','Hər nöqtəsindən tərəflərə məsafə bərabərdir','Düz xətdir','Perpendikulyardır'], correctIndex:1 },
    { id:'he2-4', text:'180°-li bucaq adlanır:', options:['Düz bucaq','Lüng bucaq','Yarım dövrə','Tam dövrə'], correctIndex:1 },
    { id:'he2-5', text:'Bucaq ölçməyin vahidi:', options:['sm','kq','dərəcə','metr'], correctIndex:2 },
  ],
  'hendese-esaslar-3': [
    { id:'he3-1', text:'Qonşu bucaqların cəmi:', options:['90°','180°','360°','270°'], correctIndex:1 },
    { id:'he3-2', text:'Qarşılıqlı bucaqlar:', options:['Bərabərdir','Toplam 180°-dir','Perpendikulyardır','Müxtəlifdir'], correctIndex:0 },
    { id:'he3-3', text:'Iki düz xətt kəsişərsə, əmələ gələn qonşu bucaqların cəmi:', options:['90°','180°','270°','360°'], correctIndex:1 },
    { id:'he3-4', text:'Bir bucaq 65° olduqda qonşu bucağı:', options:['65°','105°','115°','125°'], correctIndex:2 },
    { id:'he3-5', text:'Bir bucaq 40° olduqda qarşılıqlı bucağı:', options:['40°','50°','140°','150°'], correctIndex:0 },
  ],
  'hendese-esaslar-4': [
    { id:'he4-1', text:'Paralel xəttlər üçüncü xətt ilə kəsişdikdə uzlaşan bucaqlar:', options:['Bərabərdir','Toplam 180°-dir','Toplam 90°-dir','Fərqlidir'], correctIndex:0 },
    { id:'he4-2', text:'Daxili çarpaz bucaqlar:', options:['Bərabərdir','Toplam 90°','Toplam 180°','Bütün halda fərqlidir'], correctIndex:0 },
    { id:'he4-3', text:'İki paralel xətt üçüncüsü ilə kəsişdikdə daxili biriliqli bucaqların cəmi:', options:['90°','180°','270°','360°'], correctIndex:1 },
    { id:'he4-4', text:'Uzlaşan bucaqlar 3x+10° və 5x−30°-dirsə x = ?', options:['15','20','25','30'], correctIndex:1 },
    { id:'he4-5', text:'Daxili çarpaz bucaqlar 2y+5° və 3y−20° olduqda y = ?', options:['20','25','30','35'], correctIndex:1 },
  ],
  'hendese-esaslar-5': [
    { id:'he5-1', text:'Tərəfləri paralel olan iki bucaq:', options:['Bərabər və ya toplam 180°-dir','Həmişə bərabərdir','Həmişə toplam 180°-dir','Fərqlidir'], correctIndex:0 },
    { id:'he5-2', text:'Tərəfləri perpendikulyar olan iki bucaq:', options:['Bərabərdir','Toplam 180°-dir','Bərabər və ya toplam 90°-dir','Bərabər və ya toplam 180°-dir'], correctIndex:3 },
    { id:'he5-3', text:'Bir bucaq 70° olduqda, tərəfləri paralel olan digər bucaq:', options:['70° və ya 110°','20° və ya 70°','70° həmişə','110° həmişə'], correctIndex:0 },
    { id:'he5-4', text:'Tərəfləri perpendikulyar olan 50°-li bucağa uyğun bucaq:', options:['50°','40°','130°','50° və ya 130°'], correctIndex:3 },
    { id:'he5-5', text:'İki bucağın tərəfləri paralel olduqda bu bucaqlar:', options:['Həmişə bərabərdir','Həmişə toplam 180°','Bərabər və ya toplam 180°','Fərqlidir'], correctIndex:2 },
  ],

  // ── Üçbucaqlar ───────────────────────────────────────────────────────────
  'ucbucaqlar-1': [
    { id:'uc1-1', text:'3, 4, 8 tərəfli üçbucaq mövcuddurmu?', options:['Bəli','Xeyr','Yalnız bərabəryanlı üçün','Bəzən'], correctIndex:1 },
    { id:'uc1-2', text:'Üçbucaq bərabərsizliyi: a+b > c. a=5,b=7,c=?', options:['c<12','c≤12','c=12','c>12'], correctIndex:0 },
    { id:'uc1-3', text:'Üçbucağın perimetri: a=5, b=7, c=9. P=?', options:['19','20','21','22'], correctIndex:2 },
    { id:'uc1-4', text:'Bərabərtərəfli üçbucağın tərəfi 6. Perimetri:', options:['12','15','18','21'], correctIndex:2 },
    { id:'uc1-5', text:'Hansı üçlük üçbucaq tərəfləri ola bilər?', options:['1,2,4','2,3,6','3,4,5','1,1,3'], correctIndex:2 },
  ],
  'ucbucaqlar-2': [
    { id:'uc2-1', text:'Mediana üçbucağın tərəflərini necə birləşdirir?', options:['Bucaqı tən böləni','Zirvəni qarşı tərəfin orta nöqtəsinə','Hündürlüyü yarıya','Ağırlıq mərkəzini'], correctIndex:1 },
    { id:'uc2-2', text:'Ağırlıq mərkəzi medianı hansı nisbətdə bölür?', options:['1:1','1:2','2:1','3:1'], correctIndex:2 },
    { id:'uc2-3', text:'Tən bölən — nə edir?', options:['Hündürlüyü','Qarşı tərəfin mediancısı','Bucağı iki bərabər hissəyə','Orta xətti'], correctIndex:2 },
    { id:'uc2-4', text:'Hündürlük hansı bucaq altındadır?', options:['İti','Küt','Düz (90°)','İstənilən'], correctIndex:2 },
    { id:'uc2-5', text:'Üçbucağın 3 medianasının kəsişmə nöqtəsi:', options:['Ortosentir','Ağırlıq mərkəzi','Daxil yazılmış çevrənin mərkəzi','Xaric yazılmış çevrənin mərkəzi'], correctIndex:1 },
  ],
  'ucbucaqlar-3': [
    { id:'uc3-1', text:'Üçbucağın daxili bucaqlarının cəmi:', options:['90°','180°','270°','360°'], correctIndex:1 },
    { id:'uc3-2', text:'Üçbucaqın iki bucağı 60° və 80°-dirsə üçüncü bucaq:', options:['30°','40°','50°','60°'], correctIndex:1 },
    { id:'uc3-3', text:'Üçbucağın xarici bucağı neyi bərabərdir?', options:['Qonşu bucağa','Qalan iki daxili bucağın cəminə','Bütün daxili bucaqların cəminə','180°-yə'], correctIndex:1 },
    { id:'uc3-4', text:'Düzbucaqlı üçbucaqda iki bucaq 45° olduqda üçüncü bucaq:', options:['45°','60°','90°','120°'], correctIndex:2 },
    { id:'uc3-5', text:'Bərabərtərəfli üçbucaqda hər bucaq:', options:['45°','60°','90°','120°'], correctIndex:1 },
  ],
  'ucbucaqlar-4': [
    { id:'uc4-1', text:'İki üçbucaq konqruent olur, əgər:', options:['3 tərəfi bərabərdir (T-T-T)','2 tərəfi bərabərdir','1 bucağı bərabərdir','Sahələri bərabərdir'], correctIndex:0 },
    { id:'uc4-2', text:'Fales teoremi nə haqqındadır?', options:['Pifaqor','Paralel xəttlər birinin tərəflərini bərabər hissələrə bölür','Kvadrat kök','Triqonometriya'], correctIndex:1 },
    { id:'uc4-3', text:'Üçbucağın orta xətti nə bərabərdir?', options:['Əsasın yarısına','2 əsasa','3 əsasa','Əsasa bərabərdir'], correctIndex:0 },
    { id:'uc4-4', text:'T-B-T (Tərəf-Bucaq-Tərəf) konqruentlik əlaməti nə tələb edir?', options:['2 tərəf+aralarındakı bucaq','3 bucaq','1 tərəf+1 bucaq','3 tərəf'], correctIndex:0 },
    { id:'uc4-5', text:'Orta xətt əsasına:', options:['Bərabər','Paralel','Perpendikulyar','Çarpaz'], correctIndex:1 },
  ],
  'ucbucaqlar-5': [
    { id:'uc5-1', text:'Bərabəryanlı üçbucaqda əsasa aid hündürlük:', options:['Mediana da, tən bölən də deyil','Həm mediana, həm tən böləndir','Yalnız tən böləndir','Ortosentrdir'], correctIndex:1 },
    { id:'uc5-2', text:'Bərabəryanlı üçbucaqda yan tərəflər:', options:['Bərabərdir','Fərqlidir','Əsasa bərabərdir','Cəm 180°-dir'], correctIndex:0 },
    { id:'uc5-3', text:'Bərabərtərəfli üçbucaqda hündürlük medianaya:', options:['Bərabərdir','Çox böyükdür','Kiçikdir','Perpendikulyardır'], correctIndex:0 },
    { id:'uc5-4', text:'Bərabəryanlı üçbucaqda əsas bucaqları:', options:['Bərabərdir','Fərqlidir','Birinin cəmidır','90°-dir'], correctIndex:0 },
    { id:'uc5-5', text:'Bərabərtərəfli üçbucağın hər tərəfi a-dır. Sahəsi:', options:['a²','a²√3/4','a²√3/2','3a²/4'], correctIndex:1 },
  ],
  'ucbucaqlar-6': [
    { id:'uc6-1', text:'Pifaqor teoremi: a²+b²=?', options:['c','c²','2c','c/2'], correctIndex:1 },
    { id:'uc6-2', text:'Katetlər 3 və 4-dür. Hipotenuz:', options:['5','6','7','8'], correctIndex:0 },
    { id:'uc6-3', text:'Hipotenuz 13, bir kateti 5-dir. O biri kateti:', options:['10','11','12','14'], correctIndex:2 },
    { id:'uc6-4', text:'Düzbucaqlı üçbucağın ən uzun tərəfi:', options:['Hipotenuz','Kateti','Hündürlük','Mediana'], correctIndex:0 },
    { id:'uc6-5', text:'Hansı üçlük Pifaqor üçlüyüdür?', options:['2,3,4','5,12,13','6,7,10','3,5,7'], correctIndex:1 },
  ],
  'ucbucaqlar-7': [
    { id:'uc7-1', text:'30°-60°-90° üçbucağında hipotenuz 10 olduqda kiçik kateti:', options:['4','5','6','7'], correctIndex:1 },
    { id:'uc7-2', text:'45°-45°-90° üçbucağında kateti a olduqda hipotenuz:', options:['a','a√2','a/√2','2a'], correctIndex:1 },
    { id:'uc7-3', text:'30°-lü bucağın qarşısındakı tərəf hipotenuzun:', options:['1/3-ü','1/4-ü','1/2-si','2/3-ü'], correctIndex:2 },
    { id:'uc7-4', text:'60°-lü bucağın qarşısındakı tərəf hipotenuzun:', options:['a/2','a√2/2','a√3/2','a'], correctIndex:2 },
    { id:'uc7-5', text:'İkizkenar düzbucaqlının hipotenuzu 6√2 olduqda kateti:', options:['4','5','6','7'], correctIndex:2 },
  ],
  'ucbucaqlar-8': [
    { id:'uc8-1', text:'Sinuslar teoremi: a/sinA = ?', options:['2R','R','b/sinB','c'], correctIndex:0 },
    { id:'uc8-2', text:'Kosinuslar teoremi: c² = a²+b²−?', options:['2abcosC','ab','2ab','ab×cosC'], correctIndex:0 },
    { id:'uc8-3', text:'a=5, b=7, C=60° olduqda c²=?', options:['39','49','59','29'], correctIndex:0 },
    { id:'uc8-4', text:'a=b=5, C=90° olduqda c=?', options:['5√2','5','10','5√3'], correctIndex:0 },
    { id:'uc8-5', text:'Üçbucaqda A=30°, a=3. Çevrəyazılmış çevrənin R=?', options:['2','3','4','6'], correctIndex:1 },
  ],

  // ── Çoxbucaqlılar ────────────────────────────────────────────────────────
  'coxbucaqlilar-1': [
    { id:'cp1-1', text:'n tərəfli çoxbucaqlının daxili bucaqlarının cəmi:', options:['180n','(n−2)×180°','(n+2)×180°','360°'], correctIndex:1 },
    { id:'cp1-2', text:'Beşbucaqlının daxili bucaqlarının cəmi:', options:['360°','540°','720°','900°'], correctIndex:1 },
    { id:'cp1-3', text:'Hər hansı qabarıq çoxbucaqlının xarici bucaqlarının cəmi:', options:['180°','270°','360°','540°'], correctIndex:2 },
    { id:'cp1-4', text:'Altıbucaqlının bucaqlarının cəmi:', options:['540°','640°','720°','900°'], correctIndex:2 },
    { id:'cp1-5', text:'n tərəfli çoxbucaqlıda köşəgənlərinin sayı:', options:['n(n−1)/2','n(n−3)/2','n(n+1)/2','n(n−2)/2'], correctIndex:1 },
  ],
  'coxbucaqlilar-2': [
    { id:'cp2-1', text:'Düzgün altıbucaqlının hər bucağı:', options:['108°','120°','135°','150°'], correctIndex:1 },
    { id:'cp2-2', text:'Düzgün beşbucaqlının hər bucağı:', options:['100°','108°','120°','125°'], correctIndex:1 },
    { id:'cp2-3', text:'Düzgün n-bucaqlının bir bucağı:', options:['(n−2)×180°/n','180°/n','360°/n','(n+2)×180°/n'], correctIndex:0 },
    { id:'cp2-4', text:'Düzgün çoxbucaqlının simmetriya oxlarının sayı:', options:['n/2','n','2n','n−1'], correctIndex:1 },
    { id:'cp2-5', text:'Düzgün üçbucaqlının hər bucağı:', options:['45°','60°','90°','120°'], correctIndex:1 },
  ],
  'coxbucaqlilar-3': [
    { id:'cp3-1', text:'Paralelogramın qarşılıqlı tərəfləri:', options:['Bərabər və paralel','Fərqli','Perpendikulyar','Bərabər amma paralel deyil'], correctIndex:0 },
    { id:'cp3-2', text:'Paralelogramın diaqonalları:', options:['Bərabərdir','Bir-birini tən bölür','Perpendikulyardır','Bərabər deyil'], correctIndex:1 },
    { id:'cp3-3', text:'Paralelogramın ardıcıl bucaqlarının cəmi:', options:['90°','180°','270°','360°'], correctIndex:1 },
    { id:'cp3-4', text:'Paralelogram düzbucaqlıdır əgər:', options:['Diaqonalları bərabərdir','Tərəfləri bərabərdir','Perpendikulyar tərəflər var','İstənilən halda'], correctIndex:0 },
    { id:'cp3-5', text:'Paralelogramın sahəsi: S = ?', options:['a×h','a²','(a+b)/2×h','a×b'], correctIndex:0 },
  ],
  'coxbucaqlilar-4': [
    { id:'cp4-1', text:'Düzbucaqlının bütün bucaqları:', options:['45°','60°','90°','120°'], correctIndex:2 },
    { id:'cp4-2', text:'Kvadratın diaqonalları:', options:['Bərabər və perpendikulyar','Yalnız bərabər','Yalnız perpendikulyar','Bərabər deyil'], correctIndex:0 },
    { id:'cp4-3', text:'Rombun diaqonalları:', options:['Bərabərdir','Perpendikulyardır','Paralelddir','Fərqlidir'], correctIndex:1 },
    { id:'cp4-4', text:'Kvadratın tərəfi a olduqda diaqonalı:', options:['a','a√2','2a','a/√2'], correctIndex:1 },
    { id:'cp4-5', text:'Rombun sahəsi:', options:['a×h','d₁×d₂/2','a²','(d₁+d₂)/2'], correctIndex:1 },
  ],
  'coxbucaqlilar-5': [
    { id:'cp5-1', text:'Trapesiyanın paralel tərəfləri adlanır:', options:['Yan tərəf','Əsas','Hündürlük','Diaqonal'], correctIndex:1 },
    { id:'cp5-2', text:'Trapesiyanın orta xətti iki əsasın:', options:['Fərqinə bərabər','Cəminin yarısına bərabər','Cəminə bərabər','Hasilinə bərabər'], correctIndex:1 },
    { id:'cp5-3', text:'Düzbucaqlı trapesiyanın bir bucağı:', options:['45°','60°','90°','120°'], correctIndex:2 },
    { id:'cp5-4', text:'Trapesiyanın sahəsi: S = ?', options:['(a+b)/2×h','a×h','(a−b)/2×h','a×b×h'], correctIndex:0 },
    { id:'cp5-5', text:'Əsasları 6 və 10, hündürlüyü 4 olan trapesiyanın sahəsi:', options:['28','30','32','34'], correctIndex:2 },
  ],

  // ── Çevrə və dairə ────────────────────────────────────────────────────────
  'cevre-1': [
    { id:'cv1-1', text:'Çevrənin uzunluğu: C = ?', options:['2πr²','πd','2πr','πr'], correctIndex:2 },
    { id:'cv1-2', text:'R=7 olduqda çevrənin uzunluğu (π≈22/7):', options:['22','44','66','88'], correctIndex:1 },
    { id:'cv1-3', text:'Dairənin sahəsi: S = ?', options:['πr','2πr','πr²','πd²'], correctIndex:2 },
    { id:'cv1-4', text:'R=5 olduqda dairənin sahəsi (π≈3.14):', options:['62.8','78.5','25π','50π'], correctIndex:1 },
    { id:'cv1-5', text:'Vatarın ən böyük uzunluğu:', options:['Radiusa bərabər','Diametrə bərabər','Diametrdən böyük ola bilər','Diametrin yarısıdır'], correctIndex:1 },
  ],
  'cevre-2': [
    { id:'cv2-1', text:'İki çevrə xarici toxunursa, mərkəzlər arası məsafə:', options:['R₁+R₂','|R₁−R₂|','R₁×R₂','R₁/R₂'], correctIndex:0 },
    { id:'cv2-2', text:'İki çevrə daxili toxunursa, mərkəzlər arası məsafə:', options:['R₁+R₂','|R₁−R₂|','R₁×R₂','0'], correctIndex:1 },
    { id:'cv2-3', text:'Mərkəzlər arası məsafə R₁+R₂-dən böyükdürsə çevrələr:', options:['Kəsişir','Toxunur','Kəsişmir','İçiçədir'], correctIndex:2 },
    { id:'cv2-4', text:'Eyni mərkəzli çevrələr adlanır:', options:['Konsentrik','Paralel','Eyni çevrə','Kəsişən'], correctIndex:0 },
    { id:'cv2-5', text:'İki çevrənin iki ortaq nöqtəsi varsa:', options:['Toxunur','Kəsişir','İçiçədir','Kəsişmir'], correctIndex:1 },
  ],
  'cevre-3': [
    { id:'cv3-1', text:'Mərkəzi bucaq daxilə çəkilmiş bucaqdan:', options:['Kiçikdir','Bərabərdir','2 dəfə böyükdür','Müəyyən deyil'], correctIndex:2 },
    { id:'cv3-2', text:'Diametr üzərindəki daxilə çəkilmiş bucaq:', options:['45°','60°','90°','120°'], correctIndex:2 },
    { id:'cv3-3', text:'Eyni qövs üzərindəki daxilə çəkilmiş bucaqlar:', options:['Bərabərdir','Fərqlidir','Cəmi 180°-dir','Cəmi 360°-dir'], correctIndex:0 },
    { id:'cv3-4', text:'Toxunan ilə radiusun arasındakı bucaq:', options:['45°','60°','90°','180°'], correctIndex:2 },
    { id:'cv3-5', text:'Toxunan ilə vatar arasındakı bucaq qövsün neçə faizidir?', options:['Yarısıdır','Dörddə biridir','Bərabərdir','İkiqatıdır'], correctIndex:0 },
  ],
  'cevre-4': [
    { id:'cv4-1', text:'Kəsən qaydasına görə: 2 kəsən çəkilsə, PA×PB=PC×PD. Bu nə deməkdir?', options:['Hər kəsənin hissələrinin hasili bərabərdir','Cəmləri bərabərdir','Fərqləri bərabərdir','Kvadratları bərabərdir'], correctIndex:0 },
    { id:'cv4-2', text:'Toxunanın xassəsi: PT² = ?', options:['PA×PB','PA+PB','PA−PB','R²'], correctIndex:0 },
    { id:'cv4-3', text:'Bir xarici nöqtədən çəkilən 2 toxunan:', options:['Bərabərdir','Fərqlidir','Cəmi 2R-dir','Hər biri R-dir'], correctIndex:0 },
    { id:'cv4-4', text:'Xarici nöqtə P-dən çəkilən kəsəndə PA=3, AB=5. PT = ?', options:['√20','√24','√25','√21'], correctIndex:1 },
    { id:'cv4-5', text:'Mütənasib parçalar teoremi çevrədə neyin bərabərliyinə aiddir?', options:['Bucaqların','Qövslərin','Hasilin','Cəmin'], correctIndex:2 },
  ],
  'cevre-5': [
    { id:'cv5-1', text:'Çevrənin daxilindəki nöqtədən çəkilən bucaq 2 qövsün cəminin:', options:['Yarısıdır','2 mislidir','Bərabərdir','Fərqidir'], correctIndex:0 },
    { id:'cv5-2', text:'Çevrənin xaricindəki nöqtədən çəkilən bucaq 2 qövsün fərqinin:', options:['Yarısıdır','2 mislidir','Bərabərdir','Cəmidir'], correctIndex:0 },
    { id:'cv5-3', text:'Xaricdəki nöqtə üçün: Qövslər 120° və 40°. Bucaq = ?', options:['40°','80°','120°','40°'], correctIndex:0 },
    { id:'cv5-4', text:'Daxildəki nöqtə üçün: Qövslər 100° və 60°. Bucaq = ?', options:['70°','80°','100°','110°'], correctIndex:0 },
    { id:'cv5-5', text:'Kəsişən vatar teoremi: AP×PB=CP×PD. P:', options:['Xarici nöqtədir','Daxili nöqtədir','Çevrədə nöqtədir','Mərkəzdir'], correctIndex:1 },
  ],
  'cevre-6': [
    { id:'cv6-1', text:'Çevrəyə daxil yazılmış üçbucaqda qarşılıqlı bucaqların cəmi:', options:['90°','180°','270°','360°'], correctIndex:1 },
    { id:'cv6-2', text:'Dairəyə yazılmış düzbucaqlının hipotenuz nədir?', options:['Diametr','Radius','Vatar','Toxunan'], correctIndex:0 },
    { id:'cv6-3', text:'Çevrəyə circumscribed (xaric yazılmış) dördbucaqlıda:', options:['Qarşılıqlı tərəflərin cəmi bərabərdir','Köşəgənlər bərabərdir','Bütün bucaqlar 90°','Sahə R² ilə müəyyəndir'], correctIndex:0 },
    { id:'cv6-4', text:'Daxilyazılmış dördbucaqlının qarşılıqlı bucaqlarının cəmi:', options:['90°','180°','270°','360°'], correctIndex:1 },
    { id:'cv6-5', text:'Çevrəyə daxil yazılmış düzgün n-bucaqlının mərkəzi bucaqları:', options:['180°/n','360°/n','90°/n','270°/n'], correctIndex:1 },
  ],
}
