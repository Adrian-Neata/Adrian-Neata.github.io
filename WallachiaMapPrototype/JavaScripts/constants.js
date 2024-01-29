const slider = document.getElementById("yearRange");
const yearOutput = document.getElementById("yearContainer");

const RADIUS_BY_ZOOM = { 8: 2, 9: 4, 10: 6, 11: 8, 12: 10, 13: 10, 14: 10};

const Mention = {
    Record_Id: 0,
    Place_Id: 1,
    Name: 2,
    Commune: 3,
    County: 4,
    Country: 5,
    Latitude: 6,
    Longitude: 7,
    Place_Status: 8,
    Notes: 9,
    Reasoning: 10,
    Mention_Status: 11,
    Year: 12,
    Place_Type: 13,
    No_Mentions: 14,
};

const Place = {
    Id: 0,
    Name: 1,
    Commune: 2,
    County: 3,
    Country: 4,
    Latitude: 5,
    Longitude: 6,
};

const Record = {
    Id: 0,
    Year: 1,
    Description: 2,
};

const Place_Type = {
    Settlement: 0,
    Monastery: 1,
};

const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
      arr[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        arr[i][j] =
          i === 0
            ? j
            : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
              );
      }
    }
    return arr[t.length][s.length];
};

const Rayons_To_Region_1956 = {
    "Băbeni-Bistrița": "Argeș",
    "Costești": "Argeș",
    "Curtea de Argeș": "Argeș",
    "Drăgănești-Olt": "Argeș",
    "Drăgășani": "Argeș",
    "Găești": "Argeș",
    "Horezu": "Argeș",
    "Loviștea": "Argeș",
    "Muscel": "Argeș",
    "Pitești": "Argeș",
    "Râmnicu Vâlcea": "Argeș",
    "Slatina": "Argeș",
    "Topoloveni": "Argeș",
    "Vedea": "Argeș",

    "Adjud": "Bacău",
    "Bacău": "Bacău",
    "Buhuși": "Bacău",
    "Moinești": "Bacău",
    "Piatra Neamț": "Bacău",
    "Roman": "Bacău",
    "Târgu Neamț": "Bacău",
    "Târgu Ocna": "Bacău",

    "Arad": "Banat",
    "Bozovici": "Banat",
    "Caransebeș": "Banat",
    "Deta": "Banat",
    "Făget": "Banat",
    "Lipova": "Banat",
    "Lugoj": "Banat",
    "Moldova Nouă": "Banat",
    "Oravița": "Banat",
    "Orșova": "Banat",
    "Sânnicolau Mare": "Banat",
    "Timișoara": "Banat",
    "Reșița": "Banat",

    "Agnita": "Brașov",
    "Făgăraș": "Brașov",
    "Mediaș": "Brașov",
    "Rupea": "Brașov",
    "Sfântu Gheorghe": "Brașov",
    "Sibiu": "Brașov",
    "Sighișoara": "Brașov",
    "Târgu Secuiesc": "Brașov",

    "Alexandria": "București",
    "Brănești": "București",
    "București": "București",
    "Călărași": "București",
    "Crevedia": "București",
    "Drăgănești-Vlașca": "București",
    "Fetești": "București",
    "Giurgiu": "București",
    "Lehliu": "București",
    "Mihăilești": "București",
    "Oltenița": "București",
    "Răcari": "București",
    "Roșiori de Vede": "București",
    "Slobozia": "București",
    "Snagov": "București",
    "Titu": "București",
    "Turnu Măgurele": "București",
    "Urziceni": "București",
    "Vârtoapele": "București",
    "Videle": "București",
    "Vida": "București",
    "Vidra": "București",
    "V. I. Lenin": "București",
    "Zimnicea": "București",

    "Aiud": "Cluj",
    "Bistrița": "Cluj",
    "Câmpeni": "Cluj",
    "Dej": "Cluj",
    "Gherla": "Cluj",
    "Huedin": "Cluj",
    "Năsăud": "Cluj",
    "Turda": "Cluj",
    "Zalău": "Cluj",

    "Aleșd": "Crișana",
    "Beiuș": "Crișana",
    "Criș": "Crișana",
    "Gurahonț": "Crișana",
    "Ineu": "Crișana",
    "Lunca Vașcăului": "Crișana",
    "Marghita": "Crișana",
    "Oradea": "Crișana",
    "Salonta": "Crișana",
    "Săcuieni": "Crișana",
    "Șimleu": "Crișana",

    "Adamclisi": "Dobrogea",
    "Constanța": "Dobrogea",
    "Hârșova": "Dobrogea",
    "Istria": "Dobrogea",
    "Măcin": "Dobrogea",
    "Medgidia": "Dobrogea",
    "Negru Vodă": "Dobrogea",
    "Tulcea": "Dobrogea",

    "Brăila": "Galați",
    "Bujor": "Galați",
    "Făurei": "Galați",
    "Focșani": "Galați",
    "Galați": "Galați",
    "Panciu": "Galați",
    "Tecuci": "Galați",

    "Alba Iulia": "Hunedoara",
    "Brad": "Hunedoara",
    "Deva": "Hunedoara",
    "Hațeg": "Hunedoara",
    "Hunedoara": "Hunedoara",
    "Ilia": "Hunedoara",
    "Orăștie": "Hunedoara",
    "Petroșani": "Hunedoara",
    "Sebeș": "Hunedoara",

    "Bârlad": "Iași",
    "Hârlău": "Iași",
    "Huși": "Iași",
    "Iași": "Iași",
    "Negrești": "Iași",
    "Pașcani": "Iași",
    "Vaslui": "Iași",

    "Baia Mare": "Maramureș",
    "Carei": "Maramureș",
    "Cehu Silvaniei": "Maramureș",
    "Lăpuș": "Maramureș",
    "Oaș": "Maramureș",
    "Satu Mare": "Maramureș",
    "Sighet": "Maramureș",
    "Vișeu": "Maramureș",

    "Ciuc": "Mureș",
    "Gheorgheni": "Mureș",
    "Luduș": "Mureș",
    "Odorhei": "Mureș",
    "Reghin": "Mureș",
    "Târgu Mureș": "Mureș",
    "Târnăveni": "Mureș",
    "Toplița": "Mureș",

    "Amaradia": "Oltenia",
    "Baia de Aramă": "Oltenia",
    "Balș": "Oltenia",
    "Băilești": "Oltenia",
    "Calafat": "Oltenia",
    "Caracal": "Oltenia",
    "Corabia": "Oltenia",
    "Craiova": "Oltenia",
    "Cujmir": "Oltenia",
    "Filiași": "Oltenia",
    "Gilort": "Oltenia",
    "Gura Jiului": "Oltenia",
    "Novaci": "Oltenia",
    "Oltețu": "Oltenia",
    "Plenița": "Oltenia",
    "Segarcea": "Oltenia",
    "Strehaia": "Oltenia",
    "Târgu Jiu": "Oltenia",
    "Turnu Severin": "Oltenia",
    "Vânju Mare": "Oltenia",

    "Beceni": "Ploiești",
    "Buzău": "Ploiești",
    "Câmpina": "Ploiești",
    "Cislău": "Ploiești",
    "Cricov": "Ploiești",
    "Mizil": "Ploiești",
    "Ploiești": "Ploiești",
    "Pogoanele": "Ploiești",
    "Pucioasa": "Ploiești",
    "Râmnicu Sărat": "Ploiești",
    "Târgoviște": "Ploiești",
    "Teleajen": "Ploiești",

    "Botoșani": "Suceava",
    "Câmpulung": "Suceava",
    "Dorohoi": "Suceava",
    "Fălticeni": "Suceava",
    "Gura Humorului": "Suceava",
    "Rădăuți": "Suceava",
    "Suceava": "Suceava",
    "Vatra Dornei": "Suceava",
};

const fashionableColors = [
    '#66B2FF', // Periwinkle
    '#77DD77', // Pastel Green
    '#9370DB', // Medium Purple
    '#DAA520', // Goldenrod
    '#FFD700', // Gold
    '#4682B4', // Steel Blue
    '#20B2AA', // Light Sea Green
    '#6A5ACD', // Slate Blue
    '#32CD32', // Lime Green
    '#9932CC', // Dark Orchid
    '#87CEEB', // Sky Blue
    '#FF4500', // Orange Red
    '#FF6F61', // Melon
    '#3CB371', // Medium Sea Green
    '#FFA07A', // Light Salmon
    '#C71585', // Medium Violet Red
  ];

  const fashionableColors1965 = {
    'Vrancea': '#66B2FF', // Periwinkle
    'Ilfov': '#66B2FF', // Periwinkle
    'Olt': '#66B2FF', // Periwinkle
    'Brăila': '#77DD77', // Pastel Green
    'Giurgiu': '#77DD77', // Pastel Green
    'Tulcea': '#9370DB', // Medium Purple
    'Brașov': '#9370DB', // Medium Purple
    'Gorj': '#9370DB', // Medium Purple
    'Călărași': '#FFD700', // Gold
    'Galați': '#4682B4', // Steel Blue
    'Prahova': '#20B2AA', // Light Sea Green
    'Vâlcea': '#DAA520', // Goldenrod
    'Argeș': '#32CD32', // Lime Green
    'Dâmbovița': '#9932CC', // Dark Orchid
    'Constanța': '#FF4500', // Orange Red
    'București': '#32CD32', // Orange Red
    'Teleorman': '#FF6F61', // Melon
    'Buzău': '#FFA07A', // Light Salmon
    'Dolj': '#FFA07A', // Light Salmon
    'Ialomița': '#C71585', // Medium Violet Red
    'Mehedinți': '#FFD700', // Gold
  };

  const fashionableColors1925 = {
    'Tecuci': '#9370DB', // Medium Purple
    'Putna': '#FF6F61', // Melon
    'Râmnicu Sărat': '#FFD700', // Gold
    'Brăila': '#66B2FF', // Periwinkle
    'Tulcea': '#DAA520', // Goldenrod
    'Constanța': '#C71585', // Medium Violet Red
    'Ialomița': '#FFA07A', // Light Salmon
    'Buzău': '#32CD32', // Lime Green
    'Ilfov': '#20B2AA', // Light Sea Green
    'Prahova': '#9932CC', // Dark Orchid
    'Dâmbovița': '#66B2FF', // Periwinkle
    'Vlașca': '#DAA520', // Goldenrod
    'Teleorman': '#FF6F61', // Melon
    'Romanați': '#32CD32', // Lime Green
    'Argeș': '#FFD700', // Gold
    'Muscel': '#C71585', // Medium Violet Red
    'Olt': '#9370DB', // Medium Purple
    'Dolj': '#66B2FF', // Periwinkle
    'Vâlcea': '#20B2AA', // Light Sea Green
    'București': '#9932CC', // Dark Orchid
    'Durostor': '#32CD32', // Lime Green
  }