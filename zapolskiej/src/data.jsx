// Dane inwestycji — placeholdery, do podmiany
const INVESTMENT = /*EDITMODE-BEGIN*/{
  "name": "Zapolskiej",
  "nameFull": "Zapolskiej Namysłów",
  "street": "ul. Gabrieli Zapolskiej",
  "city": "Namysłów",
  "region": "woj. opolskie",
  "phone": "+48 669 385 877",
  "phoneHref": "+48669385877",
  "email": "b.huck@huck.estate",
  "developer": "Zapolskiej Development Sp. z o.o.",
  "completionQuarter": "III kw. 2027",
  "priceFrom": "649 000",
  "pricePerM2": "7 900",
  "totalUnits": 16,
  "availableUnits": 11,
  "reservedUnits": 3,
  "soldUnits": 2,
  "handoverBy": "IV kw. 2027",
  "agentName": "Błażej Huck",
  "agentRole": "Właściciel · Kierownik sprzedaży",
  "officeHours": "pon–pt 9:00–17:00, sob 10:00–14:00",
  "officeAddress": "Oleśnicka 13a/10, Namysłów",
  "instagram": "@zapolskiej.namyslow",
  "facebook": "zapolskiej.namyslow",
  "forestAccent": true,
  "isoPlot": false,
  "liveTheme": "warm"
}/*EDITMODE-END*/;

// 16 segmentów — 8 budynków bliźniaczych (każdy ma 2 segmenty A/B)
const SEGMENTS = [
  { id: "1A", area: 108, land: 312, rooms: 4, price: 649000, status: "sold",      garage: 1, facing: "płd-zach" },
  { id: "1B", area: 112, land: 298, rooms: 4, price: 669000, status: "sold",      garage: 1, facing: "płn-wsch" },
  { id: "2A", area: 118, land: 345, rooms: 5, price: 729000, status: "reserved",  garage: 1, facing: "płd-zach" },
  { id: "2B", area: 118, land: 330, rooms: 5, price: 715000, status: "available", garage: 1, facing: "płn-wsch" },
  { id: "3A", area: 124, land: 372, rooms: 5, price: 769000, status: "available", garage: 2, facing: "płd" },
  { id: "3B", area: 124, land: 358, rooms: 5, price: 755000, status: "available", garage: 2, facing: "płn" },
  { id: "4A", area: 112, land: 310, rooms: 4, price: 685000, status: "available", garage: 1, facing: "płd-zach" },
  { id: "4B", area: 112, land: 305, rooms: 4, price: 675000, status: "reserved",  garage: 1, facing: "płn-wsch" },
  { id: "5A", area: 118, land: 340, rooms: 5, price: 729000, status: "available", garage: 1, facing: "płd-zach" },
  { id: "5B", area: 118, land: 338, rooms: 5, price: 725000, status: "available", garage: 1, facing: "płn-wsch" },
  { id: "6A", area: 132, land: 402, rooms: 5, price: 829000, status: "available", garage: 2, facing: "płd" },
  { id: "6B", area: 132, land: 395, rooms: 5, price: 819000, status: "reserved",  garage: 2, facing: "płn" },
  { id: "7A", area: 108, land: 302, rooms: 4, price: 655000, status: "available", garage: 1, facing: "płd-zach" },
  { id: "7B", area: 108, land: 300, rooms: 4, price: 649000, status: "available", garage: 1, facing: "płn-wsch" },
  { id: "8A", area: 118, land: 352, rooms: 5, price: 735000, status: "available", garage: 1, facing: "płd" },
  { id: "8B", area: 118, land: 348, rooms: 5, price: 725000, status: "available", garage: 1, facing: "płn" },
];

// GPS w formacie [lng, lat]. Kolejność: najpierw długość, potem szerokość (Mapbox standard).
// Dane pozyskane przez Mapbox Geocoding v6 + adresy / GPS dostarczone ręcznie.
// Czasy dojazdu to estymaty obliczone z dystansu haversine'a od INVESTMENT_LOCATION
// (pieszo 5 km/h, autem 30 km/h dla ruchu miejskiego).
const POIS = [
  { name: "Rynek Namysłowa",         cat: "shop",   time: "3 min autem",   lng: 17.717084, lat: 51.076681 },
  { name: "Lidl",                    cat: "shop",   time: "3 min autem",   lng: 17.725406, lat: 51.076094 },
  { name: "Biedronka",               cat: "shop",   time: "4 min autem",   lng: 17.722800, lat: 51.071687 },
  { name: "SMART PARK Namysłów",     cat: "shop",   time: "5 min autem",   lng: 17.694951, lat: 51.087516 },
  { name: "Dino",                    cat: "shop",   time: "2 min pieszo",  lng: 17.732580, lat: 51.086251 },
  { name: "Szpital Powiatowy",       cat: "health", time: "4 min autem",   lng: 17.708767, lat: 51.083185 },
  { name: "Stadion OSiR",            cat: "rec",    time: "8 min pieszo",  lng: 17.725603, lat: 51.085116 },
  { name: "Zespół Szkół Rolniczych", cat: "edu",    time: "12 min pieszo", lng: 17.721075, lat: 51.084512 },
  { name: "Technikum ZSM",           cat: "edu",    time: "14 min pieszo", lng: 17.718168, lat: 51.083815 },
  { name: "Szkoła Podstawowa nr 5",  cat: "edu",    time: "10 min pieszo", lng: 17.723292, lat: 51.084076 },
  { name: "Dworzec PKP",             cat: "road",   time: "4 min autem",   lng: 17.716704, lat: 51.074667 },
  { name: "Biuro sprzedaży Huck",    cat: "huck",   time: "4 min autem",   lng: 17.706739, lat: 51.083596 },
];

// Lokalizacja inwestycji - dokładne GPS działki przy ul. Zapolskiej, centrum mapy.
const INVESTMENT_LOCATION = { lng: 17.734536, lat: 51.085197, name: "Osiedle Zapolskiej" };

const POI_CATS = {
  edu:    { label: "Edukacja",    color: "#2D3B2E" },
  shop:   { label: "Zakupy",      color: "#C9B896" },
  health: { label: "Zdrowie",     color: "#8B6F47" },
  rec:    { label: "Rekreacja",   color: "#7A8F5C" },
  road:   { label: "Komunikacja", color: "#6B6358" },
  huck:   { label: "Biuro Huck",  color: "#B8C5AB" },
};

const TIMELINE = [
  { date: "IV kw. 2025", label: "Pozwolenie na budowę",      status: "done" },
  { date: "II kw. 2026", label: "Start budowy",              status: "done" },
  { date: "IV kw. 2026", label: "Stan surowy zamknięty",     status: "current" },
  { date: "II kw. 2027", label: "Instalacje i wykończenia",  status: "next" },
  { date: "III kw. 2027",label: "Oddanie do użytkowania",    status: "next" },
  { date: "IV kw. 2027", label: "Przekazanie kluczy",        status: "next" },
];

const FAQ = [
  { q: "Kiedy mogę się wprowadzić?",
    a: "Planowane oddanie do użytkowania to III kw. 2027, a przekazanie kluczy pierwszym klientom nastąpi w IV kw. 2027. Harmonogram aktualizujemy co miesiąc — dostaniesz update mailowo, jeśli zostawisz adres." },
  { q: "Co jest w standardzie deweloperskim?",
    a: "Ściany otynkowane gotowe pod malowanie, podłogi wylane i wyrównane, okna z żaluzjami zewnętrznymi, pompa ciepła powietrze-woda, rekuperacja, instalacja elektryczna z miejscem na fotowoltaikę, przyłącza gotowe. Pełna specyfikacja w karcie PDF każdego segmentu." },
  { q: "Czy mogę zmienić układ ścian?",
    a: "Tak, do momentu rozpoczęcia stanu wykończeniowego przyjmujemy zmiany lokatorskie. Drobne (przesunięcie drzwi) w cenie, większe (wyburzenie ściany działowej) wycenia architekt prowadzący." },
  { q: "Jak wygląda proces rezerwacji?",
    a: "Umawiamy spotkanie w biurze lub na placu. Po wyborze segmentu podpisujemy umowę rezerwacyjną z opłatą 5 000 zł, która zostaje zaliczona na poczet ceny. Na umowę deweloperską u notariusza umawiamy się w ciągu 30 dni." },
  { q: "Jakie są koszty notarialne?",
    a: "Taksa notarialna dla umowy deweloperskiej to około 0,6% ceny nieruchomości plus VAT oraz opłaty sądowe (ok. 400 zł). Podatek PCC przy zakupie od dewelopera nie występuje." },
  { q: "Czy jest możliwość dokupienia drugiego miejsca parkingowego?",
    a: "Segmenty 3A/B, 6A/B mają w standardzie garaż dwustanowiskowy. W pozostałych możesz dokupić miejsce naziemne na wspólnej działce za 25 000 zł." },
  { q: "Co z instalacją fotowoltaiki?",
    a: "Dach każdego segmentu jest przygotowany konstrukcyjnie pod panele, przepusty kablowe wyprowadzone do rozdzielnicy. Instalację możesz zamówić u nas (partner sprawdzony) lub u dowolnego wykonawcy po odbiorze." },
  { q: "Czy osiedle będzie ogrodzone?",
    a: "Tak. Osiedle będzie ogrodzone od strony ulicy z bramą wjazdową na pilota, od strony parku pozostaje ogrodzenie niskie, ażurowe. Każdy segment ma wydzielony ogródek z własnym ogrodzeniem." },
];

const TESTIMONIALS = [
  { quote: "Kupiliśmy mieszkanie w poprzedniej inwestycji Huck i przez trzy lata nie mieliśmy ani jednej reklamacji. Teraz bierzemy bliźniak — bo wiemy, czego się spodziewać.",
    author: "Anna i Paweł K.", role: "klienci Huck od 2021" },
  { quote: "Odebrałem klucze w terminie. W branży deweloperskiej to już komplement sam w sobie — ale do tego wszystko działa tak, jak powinno.",
    author: "Tomasz B.", role: "właściciel domu, Opole" },
  { quote: "Podoba mi się, że Huck nie sprzedaje mi snu o życiu. Pokazują, ile to kosztuje, co jest w standardzie, kiedy będzie gotowe — i się tego trzymają.",
    author: "Magdalena W.", role: "właścicielka, Kluczbork" },
];

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", label: "Elewacja płd-zach, dzień" },
  { src: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1200&q=80", label: "Wejście główne" },
  { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", label: "Ogród prywatny" },
  { src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", label: "Salon (referencja)" },
  { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", label: "Elewacja tylna, taras" },
  { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", label: "Kuchnia (referencja)" },
  { src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80", label: "Widok z drona" },
  { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80", label: "Sypialnia główna" },
  { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80", label: "Jadalnia (referencja)" },
  { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", label: "Łazienka (referencja)" },
  { src: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80", label: "Gabinet / pokój pracy" },
  { src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80", label: "Pokój dziecięcy (referencja)" },
];

Object.assign(window, { INVESTMENT, SEGMENTS, POIS, POI_CATS, INVESTMENT_LOCATION, TIMELINE, FAQ, TESTIMONIALS, GALLERY });
