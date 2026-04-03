// ================================================================
// PYTANIA — Va Banque
// Runda 1: wartości 100-500
// Runda 2: wartości 200-1000 (trudniejsze)
// Gra losuje 5 kategorii z puli przy każdej grze
// Va Banque jest losowane z pytań za 400/500 już po wylosowaniu kategorii
// ================================================================

const KATEGORIE_RUNDA1 = [
  {
    nazwa: "Geografia",
    pytania: [
      { wartosc: 100, haslo: "Stolica Polski.", odpowiedz: "Warszawa" },
      { wartosc: 200, haslo: "Najdłuższa rzeka w Polsce.", odpowiedz: "Wisła" },
      { wartosc: 300, haslo: "Najwyższy szczyt w Tatrach.", odpowiedz: "Rysy" },
      { wartosc: 400, haslo: "Najwyższe pasmo górskie na świecie.", odpowiedz: "Himalaje" },
      { wartosc: 500, haslo: "Drugie największe jezioro w Polsce.", odpowiedz: "Mamry" }
    ]
  },
  {
    nazwa: "Historia Polski",
    pytania: [
      { wartosc: 100, haslo: "Pierwszy król Polski. (liczbowo)", odpowiedz: "Bolesław Chrobry" },
      { wartosc: 200, haslo: "Rok bitwy pod Grunwaldem. (liczbowo)", odpowiedz: "1410" },
      { wartosc: 300, haslo: "Rok odzyskania niepodległości przez Polskę. (liczbowo)", odpowiedz: "1918" },
      { wartosc: 400, haslo: "Rok uchwalenia Konstytucji 3 Maja. (liczbowo)", odpowiedz: "1791" },
      { wartosc: 500, haslo: "Data rozpoczęcia Potopu szwedzkiego. (liczbowo)", odpowiedz: "1655" }
    ]
  },
  {
    nazwa: "Nauka",
    pytania: [
      { wartosc: 100, haslo: "Pierwiastek chemiczny o symbolu O.", odpowiedz: "Tlen" },
      { wartosc: 200, haslo: "Planeta najbliżej Słońca.", odpowiedz: "Merkury" },
      { wartosc: 300, haslo: "Polska noblistka z fizyki i chemii.", odpowiedz: "Maria Curie-Skłodowska" },
      { wartosc: 400, haslo: "Najszybciej obracająca się planeta", odpowiedz: "Jowisz" },
      { wartosc: 500, haslo: "Która planeta ma najwięcej księżyców", odpowiedz: "Saturn" }
    ]
  },
  {
    nazwa: "Literatura",
    pytania: [
      { wartosc: 100, haslo: "Autor Pana Tadeusza. (nazwisko tylko)", odpowiedz: "Mickiewicz" },
      { wartosc: 200, haslo: "Polska laureatka Nagrody Nobla z literatury. (nazwisko tylko)", odpowiedz: "Szymborska" },
      { wartosc: 300, haslo: "Autor Lalki. (nazwisko tylko)", odpowiedz: "Prus" },
      { wartosc: 400, haslo: "Kto napisał chłopców z placu broni? (tylko imię)", odpowiedz: "Ferenc" },
      { wartosc: 500, haslo: "Autor Zbrodni i kary. (nazwisko tylko)", odpowiedz: "Dostojewski" }
    ]
  },
  {
    nazwa: "Sport",
    pytania: [
      { wartosc: 100, haslo: "Dyscyplina sportu z piłką i koszem.", odpowiedz: "Koszykówka" },
      { wartosc: 200, haslo: "Kraj organizator MŚ w piłce nożnej 2022.", odpowiedz: "Katar" },
      { wartosc: 300, haslo: "Polski skoczek narciarski, czterokrotny mistrz świata.", odpowiedz: "Adam Małysz" },
      { wartosc: 400, haslo: "Ile złotych medali zdobyła polska w zimowych igrzyskach olimpijskich 2026 (liczbowo)", odpowiedz: "0" },
      { wartosc: 500, haslo: "Rekord świata w skoku o tyczce należy do tego Szweda. (tylko nazwisko)", odpowiedz: "Duplantis" }
    ]
  },
  {
    nazwa: "Film i kino",
    pytania: [
      { wartosc: 100, haslo: "Reżyser Szeregowca Ryana.", odpowiedz: "Spielberg" },
      { wartosc: 200, haslo: "Aktor grający Jokera w filmie z 2019.", odpowiedz: "Joaquin Phoenix" },
      { wartosc: 300, haslo: "Film animowany Disneya o lwie.", odpowiedz: "Król Lew" },
      { wartosc: 400, haslo: "Pierwszy polski film nagrodzony Oscarem.", odpowiedz: "Ida" },
      { wartosc: 500, haslo: "Reżyser trylogii Władca Pierścieni.", odpowiedz: "Peter Jackson" }
    ]
  },
  {
    nazwa: "Muzyka",
    pytania: [
      { wartosc: 100, haslo: "Polski kompozytor zwany poetą fortepianu.", odpowiedz: "Chopin" },
      { wartosc: 200, haslo: "Członek zespołu The Beatles urodzony w Liverpoolu.", odpowiedz: "John Lennon" },
      { wartosc: 300, haslo: "Instrument strunowy z 47 strunami.", odpowiedz: "Harfa" },
      { wartosc: 400, haslo: "Opera Mozarta o Don Juanie.", odpowiedz: "Don Giovanni" },
      { wartosc: 500, haslo: "Gatunek muzyczny wywodzący się z Jamajki.", odpowiedz: "Reggae" }
    ]
  },
  {
    nazwa: "Zwierzęta",
    pytania: [
      { wartosc: 100, haslo: "Najszybsze zwierzę lądowe.", odpowiedz: "Gepard" },
      { wartosc: 200, haslo: "Największy ssak na lądzie.", odpowiedz: "Słoń afrykański" },
      { wartosc: 300, haslo: "Ptak który nie potrafi latać, symbol Australii.", odpowiedz: "Emu" },
      { wartosc: 400, haslo: "Jadowity ssak.", odpowiedz: "Dziobak" },
      { wartosc: 500, haslo: "Jedyny ssak potrafiący latać.", odpowiedz: "Nietoperz" }
    ]
  },
  {
    nazwa: "Kuchnia i jedzenie",
    pytania: [
      { wartosc: 100, haslo: "Tradycyjna polska zupa wigilijna.", odpowiedz: "Barszcz" },
      { wartosc: 200, haslo: "Przyprawa droższa od złota, wytwarzana z kwiatów.", odpowiedz: "Szafran" },
      { wartosc: 300, haslo: "Włoskie danie z makaronu z jajkami i boczkiem.", odpowiedz: "Carbonara" },
      { wartosc: 400, haslo: "Ser z niebieską pleśnią z Francji.", odpowiedz: "Roquefort" },
      { wartosc: 500, haslo: "Najbardziej rozpowszechniony napój na świecie po wodzie.", odpowiedz: "Herbata" }
    ]
  },
  {
    nazwa: "Technologia",
    pytania: [
      { wartosc: 100, haslo: "Założyciel Microsoftu.", odpowiedz: "Bill Gates" },
      { wartosc: 200, haslo: "Firma produkująca iPhone.", odpowiedz: "Apple" },
      { wartosc: 300, haslo: "Język programowania stworzony przez Guido van Rossuma.", odpowiedz: "Python" },
      { wartosc: 400, haslo: "Firma produkująca procesory graficzne GeForce.", odpowiedz: "Nvidia" },
      { wartosc: 500, haslo: "Rok powstania pierwszego samochodu.", odpowiedz: "1886" }
    ]
  },
  {
    nazwa: "Świat i kraje",
    pytania: [
      { wartosc: 100, haslo: "Stolica Francji.", odpowiedz: "Paryż" },
      { wartosc: 200, haslo: "Najdłuższy łańcuch górski świata.", odpowiedz: "Andy" },
      { wartosc: 300, haslo: "Kraj z największą liczbą ludności na świecie.", odpowiedz: "Indie" },
      { wartosc: 400, haslo: "Kontynent całkowicie otoczony oceanami.", odpowiedz: "Australia" },
      { wartosc: 500, haslo: "Z iloma krajami graniczą Chiny?", odpowiedz: "14" }
    ]
  },
  {
    nazwa: "Matematyka",
    pytania: [
      { wartosc: 100, haslo: "Wynik działania 7 razy 8.", odpowiedz: "56" },
      { wartosc: 200, haslo: "Liczba Pi zaokrąglona do dwóch miejsc po przecinku.", odpowiedz: "3.14" },
      { wartosc: 300, haslo: "Pierwiastek kwadratowy z 144.", odpowiedz: "12" },
      { wartosc: 400, haslo: "Twórca twierdzenia mówiące że kwadrat przeciwprostokątnej równa się sumie kwadratów przyprostokątnych.", odpowiedz: "Pitagoras" },
      { wartosc: 500, haslo: "Liczba powierzchni stożka.", odpowiedz: "2" }
    ]
  },
  {
    nazwa: "Mitologia",
    pytania: [
      { wartosc: 100, haslo: "Grecki bóg morza.", odpowiedz: "Posejdon" },
      { wartosc: 200, haslo: "Bohater grecki który zabił Minotaura.", odpowiedz: "Tezeusz" },
      { wartosc: 300, haslo: "Rzeka zapomnienia w krainie zmarłych.", odpowiedz: "Lete" },
      { wartosc: 400, haslo: "Trojański wojownik który zabił Achillesa.", odpowiedz: "Parys" },
      { wartosc: 500, haslo: "Bóg ognia w mitologii rzymskiej.", odpowiedz: "Wulkan" }
    ]
  },
  {
    nazwa: "Moda i styl",
    pytania: [
      { wartosc: 100, haslo: "Francuski dom mody znany z perfum Chanel No. 5.", odpowiedz: "Chanel" },
      { wartosc: 200, haslo: "Miasto mody we Włoszech.", odpowiedz: "Mediolan" },
      { wartosc: 300, haslo: "Materiał z włókien jedwabnika.", odpowiedz: "Jedwab" },
      { wartosc: 400, haslo: "Projektantka mody która stworzyła kultowe czarne małe sukienki.", odpowiedz: "Coco Chanel" },
      { wartosc: 500, haslo: "Targi mody odbywające się dwa razy w roku w Paryżu.", odpowiedz: "Fashion Week" }
    ]
  },
  {
    nazwa: "Polska popkultura",
    pytania: [
      { wartosc: 100, haslo: "Polski serial o pracy policji w Warszawie.", odpowiedz: "Komisarz Alex" },
      { wartosc: 200, haslo: "Polska gra wideo o Wiedźminie.", odpowiedz: "Wiedźmin" },
      { wartosc: 300, haslo: "Studio tworzące grę Cyberpunk 2077. (zaczyna się na: CD Projekt ... jedno słowo brakuje", odpowiedz: "Red" },
      { wartosc: 400, haslo: "Polska piosenkarka znana z albumu Miasto płynie.", odpowiedz: "Brodka" },
      { wartosc: 500, haslo: "Polska aktorka nagrodzona na festiwalu w Cannes za film Zimna Wojna.", odpowiedz: "Joanna Kulig" }
    ]
  }
];

const KATEGORIE_RUNDA2 = [
  {
    nazwa: "Geografia — trudna",
    pytania: [
      { wartosc: 200, haslo: "Stolica Kazachstanu.", odpowiedz: "Astana" },
      { wartosc: 400, haslo: "Najgłębsze jezioro na świecie.", odpowiedz: "Bajkał" },
      { wartosc: 600, haslo: "Kraj z największą liczbą wysp na świecie.", odpowiedz: "Szwecja" },
      { wartosc: 800, haslo: "Kontynent z największą ilością państw.", odpowiedz: "Afryka" },
      { wartosc: 1000, haslo: "Najgłębszy punkt oceanów świata.", odpowiedz: "Rów Mariański" }
    ]
  },
  {
    nazwa: "Historia świata",
    pytania: [
      { wartosc: 200, haslo: "Rok upadku muru berlińskiego.", odpowiedz: "1989" },
      { wartosc: 400, haslo: "Imperium które zbudowało Koloseum.", odpowiedz: "Rzym" },
      { wartosc: 600, haslo: "Rok rewolucji francuskiej.", odpowiedz: "1789" },
      { wartosc: 800, haslo: "Bitwa w której Napoleon poniósł ostateczną klęskę.", odpowiedz: "Waterloo" },
      { wartosc: 1000, haslo: "Traktat kończący I wojnę światową.", odpowiedz: "Traktat Wersalski" }
    ]
  },
  {
    nazwa: "Nauka — trudna",
    pytania: [
      { wartosc: 200, haslo: "Pierwiastek o symbolu Au.", odpowiedz: "Złoto" },
      { wartosc: 400, haslo: "Część ciała w której produkowana jest insulina.", odpowiedz: "Trzustka" },
      { wartosc: 600, haslo: "Prędkość światła w próżni w km/s.", odpowiedz: "300000" },
      { wartosc: 800, haslo: "ilość pierwiastków w układzie okresowym", odpowiedz: "118"},
      { wartosc: 1000, haslo: "Uczony który odkrył penicylinę.", odpowiedz: "Fleming" }
    ]
  },
  {
    nazwa: "Sztuka i malarstwo",
    pytania: [
      { wartosc: 200, haslo: "Autor obrazu Mona Lisa.", odpowiedz: "Leonardo da Vinci" },
      { wartosc: 400, haslo: "Polski malarz znany z Bitwy pod Grunwaldem.", odpowiedz: "Matejko" },
      { wartosc: 600, haslo: "Technika malowania na mokrym tynku.", odpowiedz: "Fresk" },
      { wartosc: 800, haslo: "Holenderski malarz który uciął sobie ucho.", odpowiedz: "Van Gogh" },
      { wartosc: 1000, haslo: "Muzeum w którym wisi Mona Lisa.", odpowiedz: "Luwr" }
    ]
  },
  {
    nazwa: "Sport — trudny",
    pytania: [
      { wartosc: 200, haslo: "Kraj z największą liczbą mistrzostw świata w piłce nożnej.", odpowiedz: "Brazylia" },
      { wartosc: 400, haslo: "Rekord świata w biegu na 100m należy do tego Jamajczyka.", odpowiedz: "Usain Bolt" },
      { wartosc: 600, haslo: "Polska kolarka która zdobyła złoto olimpijskie.", odpowiedz: "Maja Włoszczowska" },
      { wartosc: 800, haslo: "Tenisista z największą liczbą tytułów Wielkiego Szlema.", odpowiedz: "Novak Djoković" },
      { wartosc: 1000, haslo: "Polska lekkoatletka mistrzyni olimpijska w siedmioboju.", odpowiedz: "Anita Włodarczyk" }
    ]
  },
  {
    nazwa: "Film — trudny",
    pytania: [
      { wartosc: 200, haslo: "Reżyser Incepcji i Interstellara.", odpowiedz: "Christopher Nolan" },
      { wartosc: 400, haslo: "Aktor grający Bonda w ostatnich filmach serii.", odpowiedz: "Daniel Craig" },
      { wartosc: 600, haslo: "Film z 1994 który wyreżyserował Tarantino.", odpowiedz: "Pulp Fiction" },
      { wartosc: 800, haslo: "Aktorka z największą liczbą nominacji do Oscara.", odpowiedz: "Meryl Streep" },
      { wartosc: 1000, haslo: "Reżyser filmów Parasite i Snowpiercer.", odpowiedz: "Bong Joon-ho" }
    ]
  },
  {
    nazwa: "Muzyka — trudna",
    pytania: [
      { wartosc: 200, haslo: "Najlepiej sprzedający się album wszech czasów.", odpowiedz: "Thriller" },
      { wartosc: 400, haslo: "Polski jazzman zwany Ptaszynem.", odpowiedz: "Wróblewski" },
      { wartosc: 600, haslo: "Symfonia oznaczona numerem 9 którą Beethoven napisał będąc głuchym.", odpowiedz: "IX Symfonia" },
      { wartosc: 800, haslo: "Festiwal muzyczny odbywający się w Sopocie.", odpowiedz: "TOP Trendy" },
      { wartosc: 1000, haslo: "Kompozytor opery Traviata.", odpowiedz: "Verdi" }
    ]
  },
  {
    nazwa: "Kuchnia świata",
    pytania: [
      { wartosc: 200, haslo: "Japońska potrawa z surowej ryby.", odpowiedz: "Sushi" },
      { wartosc: 400, haslo: "Tradycyjny napój meksykański z agawy.", odpowiedz: "Tequila" },
      { wartosc: 600, haslo: "Przyprawa która nadaje curry żółty kolor.", odpowiedz: "Kurkuma" },
      { wartosc: 800, haslo: "Ser grecki z mleka koziego lub owczego.", odpowiedz: "Feta" },
      { wartosc: 1000, haslo: "Kraj z którego pochodzi kimchi.", odpowiedz: "Korea" }
    ]
  },
  {
    nazwa: "Technologia — trudna",
    pytania: [
      { wartosc: 200, haslo: "Rok premiery pierwszego iPhone.", odpowiedz: "2007" },
      { wartosc: 400, haslo: "Twórca sieci społecznościowej Facebook.", odpowiedz: "Mark Zuckerberg" },
      { wartosc: 600, haslo: "Protokół komunikacyjny będący podstawą internetu.", odpowiedz: "TCP/IP" },
      { wartosc: 800, haslo: "Polska firma tworząca gry komputerowe AAA.", odpowiedz: "CD Projekt" },
      { wartosc: 1000, haslo: "Superkomputer IBM który pokonał mistrza świata w szachach.", odpowiedz: "Deep Blue" }
    ]
  },
  {
    nazwa: "Zwierzęta — trudne",
    pytania: [
      { wartosc: 200, haslo: "Największy drapieżnik lądowy.", odpowiedz: "Niedźwiedź polarny" },
      { wartosc: 400, haslo: "Jedyny wąż jadowity w Polsce.", odpowiedz: "Żmija zygzakowata" },
      { wartosc: 600, haslo: "Zwierzę z najdłuższym okresem ciąży.", odpowiedz: "Słoń" },
      { wartosc: 800, haslo: "najdłużej żyjący ssak.", odpowiedz: "Wieloryb" },
      { wartosc: 1000, haslo: "Najbardziej jadowite zwierze na Ziemi", odpowiedz: "Tajpan" }
    ]
  },
  {
    nazwa: "Polska historia — trudna",
    pytania: [
      { wartosc: 200, haslo: "Rok chrztu Polski.", odpowiedz: "966" },
      { wartosc: 400, haslo: "Polska królowa znana jako Jadwiga.", odpowiedz: "Jadwiga Andegaweńska" },
      { wartosc: 600, haslo: "Bitwa w której Polacy pokonali Armię Czerwoną w 1920.", odpowiedz: "Bitwa Warszawska" },
      { wartosc: 800, haslo: "Twórca Legionów Polskich we Włoszech.", odpowiedz: "Dąbrowski" },
      { wartosc: 1000, haslo: "Ostatni król Polski. (tylko imię)", odpowiedz: "Stanisław" }
    ]
  },
  {
    nazwa: "Język i lingwistyka",
    pytania: [
      { wartosc: 200, haslo: "Język z największą liczbą użytkowników na świecie.", odpowiedz: "Mandaryński" },
      { wartosc: 400, haslo: "Martwy język będący podstawą wielu języków europejskich.", odpowiedz: "Łacina" },
      { wartosc: 600, haslo: "Liczba liter w alfabecie polskim.", odpowiedz: "32" },
      { wartosc: 800, haslo: "Język urzędowy Brazylii.", odpowiedz: "Portugalski" },
      { wartosc: 1000, haslo: "Najstarszy zapisany język na świecie.", odpowiedz: "Sumeryjski" }
    ]
  },
  {
    nazwa: "Astronomia",
    pytania: [
      { wartosc: 200, haslo: "Planeta z pierścieniami w Układzie Słonecznym.", odpowiedz: "Saturn" },
      { wartosc: 400, haslo: "Gwiazda będąca centrum naszego układu.", odpowiedz: "Słońce" },
      { wartosc: 600, haslo: "Galaktyka najbliżej drogi mlecznej.", odpowiedz: "Andromeda" },
      { wartosc: 800, haslo: "Rok w którym człowiek po raz pierwszy stanął na Księżycu.", odpowiedz: "1969" },
      { wartosc: 1000, haslo: "Rok kiedy człowiek pierwszy raz został wysłany w kosmos", odpowiedz: "1961" }
    ]
  },
  {
    nazwa: "Ekonomia i biznes",
    pytania: [
      { wartosc: 200, haslo: "Najczęściej używana waluta w krajach Europy.", odpowiedz: "Euro" },
      { wartosc: 400, haslo: "Giełda papierów wartościowych w Nowym Jorku.", odpowiedz: "Wall Street" },
      { wartosc: 600, haslo: "Autor Kapitału — dzieła o kapitalizmie.", odpowiedz: "Marks" },
      { wartosc: 800, haslo: "Polska giełda papierów wartościowych. (tylko skrót)", odpowiedz: "GPW" },
      { wartosc: 1000, haslo: "Pierwsze państwo które uczyniło Bitcoina legalnym środkiem płatniczym.", odpowiedz: "Salwador" }
    ]
  },
  {
    nazwa: "Architektura i budowle",
    pytania: [
      { wartosc: 200, haslo: "Wieża we Francji zbudowana na wystawę światową w 1889.", odpowiedz: "Wieża Eiffla" },
      { wartosc: 400, haslo: "Największa budowla obronna świata ciągnąca się przez Chiny.", odpowiedz: "Wielki Mur Chiński" },
      { wartosc: 600, haslo: "Starożytna budowla w Egipcie będąca grobowcem faraona.", odpowiedz: "Piramida" },
      { wartosc: 800, haslo: "Kościół w Barcelonie projektowany przez Gaudiego.", odpowiedz: "Sagrada Familia" },
      { wartosc: 1000, haslo: "Najwyższy budynek na świecie.", odpowiedz: "Burj Khalifa" }
    ]
  }
];

// Losowanie ile kategorii z puli
function losujKategorie(pula, ile) {
  const kopia = pula.map(k => ({
    ...k,
    pytania: k.pytania.map(p => ({ ...p }))
  }));
  const pomieszana = kopia.sort(() => Math.random() - 0.5);
  return pomieszana.slice(0, ile);
}

// Losuje jedno Va Banque spośród pytań za 400 lub 500 (lub 800/1000 w rundzie 2)
function dodajVabanque(kategorie, ile) {
  // Usuń wszystkie stare vabanque
  kategorie.forEach(k => k.pytania.forEach(p => { delete p.vabanque; }));

  // Zbierz kandydatów (pytania za 400 lub 500 w rundzie 1, za 800 lub 1000 w rundzie 2)
  const kandydaci = [];
  kategorie.forEach((k, ki) => {
    k.pytania.forEach((p, pi) => {
      if (p.wartosc >= 400) {
        kandydaci.push({ ki, pi });
      }
    });
  });

  // Losuj ile Va Banque
  const pomieszani = kandydaci.sort(() => Math.random() - 0.5);
  for (let i = 0; i < ile && i < pomieszani.length; i++) {
    const { ki, pi } = pomieszani[i];
    kategorie[ki].pytania[pi].vabanque = true;
  }

  return kategorie;
}

const FINAL_PYTANIA = [
  // ════ HISTORIA ════
  { haslo: "Rok pierwszego lądowania człowieka na dnie rowu mariańskiego.", odpowiedz: "1960", kategoria: "Historia" },
  { haslo: "Autor Boskiej Komedii.", odpowiedz: "Dante", kategoria: "Historia" },
  { haslo: "Przywódca rewolucji bolszewickiej w Rosji.", odpowiedz: "Lenin", kategoria: "Historia" },
  // ════ NAUKA ════
  { haslo: "Które europejskie państwo ma najkrótszą rzekę świata.", odpowiedz: "Włochy", kategoria: "Geografia" },
  { haslo: "Pierwiastek o symbolu W.", odpowiedz: "Wolfram", kategoria: "Nauka" },
  { haslo: "Prędkość światła w próżni w km/s.", odpowiedz: "300000", kategoria: "Nauka" },
  { haslo: "Uczony który opisał grawitację po obserwacji jabłka.", odpowiedz: "Newton", kategoria: "Nauka" },
  { haslo: "Liczba chromosomów w ludzkim genomie.", odpowiedz: "46", kategoria: "Nauka" },
  // ════ KULTURA ════
  { haslo: "Autor Hamleta.", odpowiedz: "Szekspir", kategoria: "Kultura" },
  { haslo: "Najdłużej emitowany serial animowany na świecie.", odpowiedz: "Simpsonowie", kategoria: "Kultura" },
  { haslo: "Kraj z którego pochodzi ABBA.", odpowiedz: "Szwecja", kategoria: "Kultura" },
  { haslo: "Reżyser Titanica.", odpowiedz: "James Cameron", kategoria: "Kultura" },
  // ════ SPORT ════
  { haslo: "Kraj który wygrał MŚ w piłce nożnej w 2022 roku.", odpowiedz: "Argentyna", kategoria: "Sport" },
  { haslo: "Pierwszy Polak który wygrał Tour de France.", odpowiedz: "Nikt", kategoria: "Sport" },
  { haslo: "Rok pierwszych nowożytnych igrzysk olimpijskich.", odpowiedz: "1896", kategoria: "Sport" },
  // ════ POLSKA ════
  { haslo: "Polska nagroda Nobla z literatury w 2018 roku.", odpowiedz: "Olga Tokarczuk", kategoria: "Polska" },
  { haslo: "Miasto będące najkrócej stolicą polski.", odpowiedz: "Poznań", kategoria: "Polska" },
  { haslo: "Twórca gry Wiedźmin.", odpowiedz: "CD Projekt Red", kategoria: "Polska" }
];

function getQuestions(orgSettings) {
  let r1Kategorie, r2Kategorie;

  if (orgSettings && orgSettings.r1Kategorie && orgSettings.r1Kategorie.length === 5) {
    // Uzyj kategorii wybranych przez organizatora
    r1Kategorie = KATEGORIE_RUNDA1.filter(k => orgSettings.r1Kategorie.includes(k.nazwa));
    r1Kategorie = r1Kategorie.map(k => ({ ...k, pytania: k.pytania.map(p => ({ ...p })) }));
  } else {
    r1Kategorie = dodajVabanque(losujKategorie(KATEGORIE_RUNDA1, 5), 1);
  }

  if (orgSettings && orgSettings.r2Kategorie && orgSettings.r2Kategorie.length === 5) {
    r2Kategorie = KATEGORIE_RUNDA2.filter(k => orgSettings.r2Kategorie.includes(k.nazwa));
    r2Kategorie = r2Kategorie.map(k => ({ ...k, pytania: k.pytania.map(p => ({ ...p })) }));
  } else {
    r2Kategorie = dodajVabanque(losujKategorie(KATEGORIE_RUNDA2, 5), 2);
  }

  return [
    { id: "runda1", kategorie: r1Kategorie },
    { id: "runda2", kategorie: r2Kategorie }
  ];
}

// Zwraca wszystkie kategorie dla frontendu
function getAllKategorie(round) {
  const pula = round === 1 ? KATEGORIE_RUNDA1 : KATEGORIE_RUNDA2;
  return pula.map(k => ({
    nazwa: k.nazwa,
    pytania: k.pytania.map((p, i) => ({
      idx: i,
      wartosc: p.wartosc,
      haslo: p.haslo,
      odpowiedz: p.odpowiedz
    }))
  }));
}

function getFinalPytania() {
  return FINAL_PYTANIA;
}

module.exports = { getQuestions, getAllKategorie, getFinalPytania };
