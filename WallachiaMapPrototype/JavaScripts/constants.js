const YEAR_SLIDER = document.getElementById("yearRange");
const YEAR_CONTAINER = document.getElementById("yearContainer");
const HIGHLIGHTS_CHECKBOX = document.getElementById("highlightsCheckbox");
var PREV_YEAR_SLIDER_VALUE = 1718;
var YEAR_SLIDER_VALUE = 1718;
var SIDEPANEL_PLACE = null;
var MARKERS = {};
const RADIUS_BY_ZOOM = { 8: 2, 9: 4, 10: 6, 11: 8, 12: 10, 13: 10, 14: 10, 15: 10, 16: 10};

function escapeHtml(unsafeString) {
  return unsafeString
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

const Place_Type = {
  Settlement: 0,
  Monastery: 1,
};

// find all mentions of a place between min_year and max_year
const get_place_mentions = (place_id, min_year, max_year) => {
  if (min_year == null) {
    min_year = 0;
  }
  if (max_year == null) {
    max_year = 100000;
  }
  var place_mentions = [];

  for (mention_idx in MENTIONS[place_id]) {
    mention = MENTIONS[place_id][mention_idx];
    // ignore mentions outside range
    if (min_year > mention.record.year ||
      max_year < mention.record.year) {
      continue;
    }

    place_mentions.push(mention);
  }

  // Sort mentions latest to earliest
  place_mentions = place_mentions.sort(function (a, b) { 
      if (b.record.year != a.record.year) {
          return b.record.year - a.record.year; 
      }
      if (!(b instanceof MedievalMention && a instanceof MedievalMention)) {
          return 0;
      }
 
      return Number(b.record.id.substring(1)) - Number(a.record.id.substring(1));
  });

  return place_mentions;
}

// find latest mention with year >= min_year and <= max_year
const get_latest_mentions = (place_id, min_year, max_year) => {

  if (min_year == null) {
    min_year = 0;
  }
  if (max_year == null) {
    max_year = 100000;
  }

  // put all mentions into a list
  var place_mentions = get_place_mentions(place_id, min_year, max_year);

  // no mentions found
  if (place_mentions.length == 0) {
    return [];
  }

  // sort mentions latest to earliest
  place_mentions.sort(function (a, b) { return b.record.year - a.record.year; });
  var latest_mentions = [place_mentions[0]];
  var idx = 1;
  while (idx < place_mentions.length && latest_mentions[0].record.year == place_mentions[idx].record.year) {
    latest_mentions.push(place_mentions[idx]);
    idx+=1;
  }

  return latest_mentions;
}

// find earliest mention with year >= min_year and <= max_year
const get_earliest_mentions = (place_id, min_year, max_year) => {

  if (min_year == null) {
    min_year = 0;
  }
  if (max_year == null) {
    max_year = 100000;
  }

  // put all mentions into a list
  var place_mentions = get_place_mentions(place_id, min_year, max_year);

  // no mentions found
  if (place_mentions.length == 0) {
    return [];
  }

  // sort mentions latest to earliest
  place_mentions.sort(function (a, b) { return a.record.year - b.record.year; });
  var earliest_mentions = [place_mentions[0]];
  var idx = 1;
  while (idx < place_mentions.length && earliest_mentions[0].record.year == place_mentions[idx].record.year) {
    earliest_mentions.push(place_mentions[idx]);
    idx+=1;
  }

  return earliest_mentions;
}

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

// the lower the score the more similar the strings are
const compareStrings = (str1, str2) => {
  avg_length = (str1.length + str2.length) / 2;
  bonus_length = Math.abs(str1.length - str2.length) / avg_length / 2;
  disimilarity_score1 = levenshteinDistance(str1, str2) / avg_length + bonus_length;

  str1 = str1.split(" ").reverse().join(' ');

  disimilarity_score2 = levenshteinDistance(str1, str2) / avg_length + bonus_length;

  if (disimilarity_score1 > disimilarity_score2) {
      return disimilarity_score2;
  }
  return disimilarity_score1;
}

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

const FASHIONABLE_COLORS = [
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

const COUNTY_COLORS_1968_2021 = {
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
  'București': '#32CD32', // Lime Green
  'Teleorman': '#FF6F61', // Melon
  'Buzău': '#FFA07A', // Light Salmon
  'Dolj': '#FFA07A', // Light Salmon
  'Ialomița': '#C71585', // Medium Violet Red
  'Mehedinți': '#FFD700', // Gold
};

const COUNTY_COLORS_BEFORE_1950 = {
  'Tecuci': '#9370DB', // Medium Purple
  'Putna': '#FF6F61', // Melon
  'Râmnicu Sărat': '#FFD700', // Gold
  'Râmnicul Sărat': '#FFD700', // Gold
  'Slam Râmnic': '#FFD700', // Gold
  'Slam Râmnic și Brăila': '#FFD700', // Gold
  'Slam Râbnic i Braila': '#FFD700', // Gold
  'Râmnicul Sărat și Brăila': '#FFD700', // Gold
  'Râmnicu': '#FFD700', // Gold
  'Brăila': '#66B2FF', // Periwinkle
  'Tulcea': '#DAA520', // Goldenrod
  'Constanța': '#C71585', // Medium Violet Red
  'Ialomița': '#FFA07A', // Light Salmon
  'Ialomeța': '#FFA07A', // Light Salmon
  'Buzău': '#32CD32', // Lime Green
  'Ilfov': '#20B2AA', // Light Sea Green
  'Ilhov': '#20B2AA', // Light Sea Green
  'Elhov': '#20B2AA', // Light Sea Green
  'Ehov': '#20B2AA', // Light Sea Green
  'Prahova': '#9932CC', // Dark Orchid
  'Dâmbovița': '#66B2FF', // Periwinkle
  'Dâmboviță': '#66B2FF', // Periwinkle
  'Vlașca': '#DAA520', // Goldenrod
  'Teleorman': '#FF6F61', // Melon
  'Teliorman': '#FF6F61', // Melon
  'Romanați': '#32CD32', // Lime Green
  'Argeș': '#FFD700', // Gold
  'Argheș': '#FFD700', // Gold
  'Argiș': '#FFD700', // Gold
  'Arghiș': '#FFD700', // Gold
  'Muscel': '#C71585', // Medium Violet Red
  'Mușcel': '#C71585', // Medium Violet Red
  'Mușcel și Pădureț': '#C71585', // Medium Violet Red
  'Muscel și Pădureț': '#C71585', // Medium Violet Red
  'Olt': '#9370DB', // Medium Purple
  'Dolj': '#66B2FF', // Periwinkle
  'Dol Jil': '#66B2FF', // Periwinkle
  'Doljâi': '#66B2FF', // Periwinkle
  'Doljâl': '#66B2FF', // Periwinkle
  'Doljăl': '#66B2FF', // Periwinkle
  'Doljil': '#66B2FF', // Periwinkle
  'Doljie': '#66B2FF', // Periwinkle
  'Jiul de Jos': '#66B2FF', // Periwinkle
  'Jâiul de Jos': '#66B2FF', // Periwinkle
  'Vâlcea': '#20B2AA', // Light Sea Green
  'București': '#9932CC', // Dark Orchid
  'Durostor': '#32CD32', // Lime Green
  'Gorj': '#DAA520', // Goldenrod
  'Gorji': '#DAA520', // Goldenrod
  'Gorjii': '#DAA520', // Goldenrod
  'Gorjil': '#DAA520', // Goldenrod
  'Gorjăl': '#DAA520', // Goldenrod
  'Gor Jil': '#DAA520', // Goldenrod
  'Jiul de Sus': '#DAA520', // Goldenrod
  'Mehedinți': '#C71585', // Medium Violet Red
  'Mehedenți': '#C71585', // Medium Violet Red
  'Caraș-Severin': '#FFA07A', // Light Salmon
  'Severin': '#FFA07A', // Light Salmon
  'Tutova': '#20B2AA', // Light Sea Green
  'Saac': '#FF4500', // Orange Red
  'Sac': '#FF4500', // Orange Red
  'Săcuieni': '#FF4500', // Orange Red
  'Săcui': '#FF4500', // Orange Red
  'Săcuiani': '#FF4500', // Orange Red
}