# PlazaWorks — pierwsza wersja strony firmowej

Nowa wersja jest w katalogu **website/**. Stary szkic w katalogu głównym pozostaje zachowany do porównania. Ta gałąź nie zmienia domeny ani działającego hostingu.

## Zakres

- Wybrany ciemny kierunek: jasny logotyp, opis tylko pod logotypem/obok niego, niebieski pasek czterech usług i jedna sekcja projektów.
- Polska strona główna: oferta, portfolio, warsztat AI, autor, współpraca, rekrutacja i kontakt.
- Indeks ośmiu projektów z przełączaniem podglądu oraz Działanie/Budowa.
- Osobne, statycznie generowane opisy ośmiu prac; rozbudowany opis Blast Battalion z mechanizmem terenu i odnośnikami do kodu.
- Nawigacja na telefonie, obsługa klawiaturą, widoczne stany fokusu i respektowanie ograniczenia ruchu.
- Oryginalne obrazy projektów. Logo jest osobnym plikiem PNG opracowanym na podstawie wybranego szkicu; Astro tworzy mniejsze warianty WebP do wyświetlania.
- Brak trackerów, ciasteczek, automatycznie ładowanych gier oraz połączeń do usług AI z przeglądarki.

## Technologia i uruchomienie

Astro 7.4.1, TypeScript, lokalny Archivo i własny CSS. Interakcje wykorzystują mały moduł JavaScript bez frameworka klienckiego.

Wymagane Node.js >= 22.22.0; workflow używa Node 24.

~~~sh
cd website
npm ci
npm test
npm run check
npm run build
npm run verify
npm run dev -- --host 0.0.0.0 --port 4173
~~~

package-lock.json jest dołączony do repozytorium. Instalacja lokalna i CI używają npm ci.

Build powstaje w website/dist/. Dla GitHub Pages z prefiksem repozytorium należy budować z BASE_PATH=/plazaworks/. Własna domena zazwyczaj wymaga BASE_PATH=/.

## Treść i materiały

| Element | Plik |
|---|---|
| Dane autora, kontakt i film | src/data/config.json |
| Osiem projektów oraz przypięte wersje źródeł | src/data/projects.json |
| Usługi | src/components/Services.astro |
| Autor i współpraca | src/components/About.astro |
| Warsztat AI | src/components/Workshop.astro |
| Pełne opisy prac | src/pages/projekty/[slug].astro |
| Interakcje | src/scripts/site.mjs |
| Układ, kolor i responsywność | src/styles/global.css |

Opis narzędzi AI wynika z ustaleń z Marcinem. Ofertę wdrażania AI przedstawiono jako zakres usług; gier i HZ Bot nie opisano jako biznesowych wdrożeń modeli językowych.

Stany projektów i źródła odnoszą się do wersji sprawdzonych w audycie z 20 października 2026 r. Nie ma fikcyjnych realizacji, klientów, opinii, rezultatów finansowych ani deklaracji o ukończeniu wszystkich gier.

## Kontakt

Adres kontaktowy pozostaje pusty na życzenie Marcina. Prywatny podgląd działa bez niego. Można go wpisać w config.json jako contactEmail lub przekazać do builda przez CONTACT_EMAIL. Adres będzie publiczny.

- Z adresem przycisk przygotowuje wiadomość w aplikacji pocztowej użytkownika. Nie udaje dostarczenia wiadomości przez serwer.
- Bez adresu formularz tworzy opis do skopiowania lub pobrania. UI wyraźnie informuje, że nic nie wysłano. Dostępny pozostaje prawdziwy profil GitHub.
- Dane formularza nie są wysyłane do endpointu ani zapisywane w localStorage.

Wysyłka z serwera może być dodana po wyborze skrzynki/usługi. W obecnej wersji nie ma pozornej wysyłki, sukcesu bez dostarczenia ani fikcyjnego adresu e-mail.

## Film

SHOWREEL_SRC lub showreel.src powinny wskazywać gotowy MP4/WebM. Pusta wartość pokazuje oryginalny kadr Driving Game z podpisem, bez przycisku udającego nieistniejący film. Po ustawieniu filmu pojawi się natywny odtwarzacz, bez autoplay, z preload=none.

Montaż zbiorczy nie jest jeszcze wykonany. Krótki klip Fragile Express nie zastępuje nagrań pozostałych prac. WOT Rust wymaga materiału z wersji natywnej.

## Weryfikacja i publikacja

Workflow wykonuje testy funkcji kontaktu/routingu/danych, Astro check, build i kontrolę wygenerowanych plików. Nie publikuje strony. Artefakt builda jest przechowywany przez 7 dni.

Kontrola statyczna sprawdza m.in. strony ośmiu prac, lokalne materiały i odnośniki, kotwice, pojedynczy opis pod logo oraz budżet JavaScript 64 KiB gzip.

**To nie zastępuje sprawdzenia strony w przeglądarce.** Stan tej kontroli zapisano w design-qa.md. Strona ma domyślnie noindex i blokadę indeksowania; publicationReady pozostaje false.

Przed publikacją:

1. Ustalić docelowy kanał kontaktu i domenę SITE_URL; nie wpisywać przykładowego adresu.
2. Po dalszych zmianach uruchomić npm ci, testy, check, build i verify.
3. Wyniki kontroli przeglądarkowej z 21 października 2026 r. są w design-qa.md; materiały porównawcze w qa/.
4. Prywatny podgląd zachowuje noindex i publicationReady=false. Dopiero przed uruchomieniem docelowej strony ustawić publicationReady=true i wykonać npm run check:ready.

Nie dodawać gier do początkowego pobierania strony. Gotowe dema powinny uruchamiać się po świadomym wybraniu przez odwiedzającego.

## Pochodzenie materiałów

Grafiki projektów pochodzą z repozytoriów Marcina. Kadr Blast Battalion: marketing/screenshots/jungle.png z wersji f260b357052854554c3d8080fd9385d10c8816ed. Materiały Orbling, Driving Game, WOT Rust, Tanki, Fragile Express i Cloudkeep zachowano z istniejących plików repozytorium. Dla HZ Bot pokazano faktyczny fragment config.example.yaml, nie wymyślony zrzut panelu.

Archivo: SIL Open Font License 1.1, zob. public/assets/fonts/LICENSE.md.
