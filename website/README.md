# PlazaWorks — strona firmowa i portfolio

Nowa wersja jest w katalogu **website/**. Stary szkic w katalogu głównym pozostaje zachowany do porównania. Ta gałąź nie zmienia domeny ani działającego hostingu.

## Zakres

- Wybrany ciemny kierunek: jasny logotyp, pojedynczy opis działalności, jeden blok czterech usług bezpośrednio pod marką i jedna sekcja projektów.
- Polska strona główna: skrót oferty przed portfolio, jedna sekcja prac, współpraca, warsztat AI, autor i kontakt.
- Cztery kolumny usług na komputerze i cztery rozwijane wiersze na telefonie. Nazwy występują tylko raz. Wybrany zakres zajmuje pełną szerokość pod kolumnami lub rozwija się pod właściwym wierszem.
- Formularz z rzeczywistym zapisem zapytań i prywatna skrzynka właściciela.
- Indeks ośmiu projektów z przełączaniem podglądu oraz Działanie/Budowa.
- Osobne, statycznie generowane opisy ośmiu wybranych prac oraz PlazaWorks jako własnej strony firmowej z obsługą zapytań. Opisy wskazują problem, rozwiązanie, zakres pracy i stan rozwoju.
- Nawigacja na telefonie, obsługa klawiaturą, widoczne stany fokusu i respektowanie ograniczenia ruchu.
- Oryginalne obrazy projektów. Logo jest osobnym plikiem PNG opracowanym na podstawie wybranego szkicu; Astro tworzy mniejsze warianty WebP do wyświetlania.
- Publiczna część bez trackerów, automatycznie ładowanych gier i połączeń do usług AI z przeglądarki. Logowanie właściciela obsługuje platforma Sites.

## Technologia i uruchomienie

Astro 7.4.1 generuje publiczną część strony. TypeScript, lokalny Archivo i własny CSS; interakcje strony głównej mają mały moduł JavaScript bez frameworka klienckiego. Vinext i Cloudflare Worker obsługują formularz oraz panel właściciela. Zapytania są zapisywane w D1. Statyczne strony są serwowane jako assets; nie uruchamiają klienta React używanego przez panel.

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

`npm run build` tworzy statyczną część w `.astro-output/`, następnie Worker i komplet materiałów w `dist/server` oraz `dist/client`. `.openai/hosting.json` zachowuje tożsamość Site i deklaruje binding `DB`. Pełna wersja z formularzem działa w katalogu głównym domeny (`BASE_PATH=/`). Sam eksport `npm run build:static` można hostować statycznie, ale odbiór zapytań wymaga działającego endpointu serwerowego.

Schemat jest w `db/schema.ts`, migracja w `drizzle/`. Po zmianach schematu użyj `npm run db:generate`. Lokalna baza i baza podglądu hostowanego są osobne. Polecenia migracji lokalnych opisuje instrukcja Sites; publikacja stosuje migracje hostowane. Nie twórz tabel w obsłudze żądania.

## Treść i materiały

| Element | Plik |
|---|---|
| Dane autora, kontakt i film | src/data/config.json |
| Osiem projektów oraz przypięte wersje źródeł | src/data/projects.json |
| Usługi | src/components/Services.astro |
| Współpraca | src/components/Cooperation.astro |
| Autor i rekrutacja | src/components/About.astro |
| Warsztat AI | src/components/Workshop.astro |
| Pełne opisy prac | src/pages/projekty/[slug].astro |
| PlazaWorks jako przykład strony firmowej | src/pages/projekty/plazaworks.astro |
| Interakcje | src/scripts/site.mjs |
| Układ, kolor i responsywność | src/styles/global.css |

Opis narzędzi AI wynika z ustaleń z Marcinem. Ofertę wdrażania AI przedstawiono jako zakres usług; gier i HZ Bot nie opisano jako biznesowych wdrożeń modeli językowych.

Stany projektów i źródła odnoszą się do przypiętych wersji kodu. Blast Battalion zaktualizowano po przeglądzie i poprawkach z 21 października 2026 r. do wersji 24ba4c556f13c02c8acc1a8c06306e4139976650; pozostałe projekty zachowują wersje z audytu z 20 października. Nie ma fikcyjnych realizacji, klientów, opinii, rezultatów finansowych ani deklaracji o ukończeniu wszystkich gier.

## Kontakt

Własny adres e-mail nie jest publikowany. Formularz przyjmuje imię opcjonalne, kontakt do odpowiedzi (e-mail, telefon lub profil), temat i opis zadania. `POST /api/inquiries` sprawdza pochodzenie żądania, długości i temat, a następnie zapisuje wiadomość w D1. Potwierdzenie sukcesu wymaga odczytu zapisanego rekordu. Identyfikator zgłoszenia zapobiega podwójnemu zapisowi przy ponowieniu wysyłki.

- Błąd lub przerwa w połączeniu pozostawia treść w formularzu; można też skopiować lub pobrać kopię.
- Natywny formularz działa również bez JavaScript; po zapisie przekierowuje do potwierdzenia.
- Honeypot i limit zgłoszeń ograniczają automatyczne wysyłki. Limit używa krótkotrwałego skrótu adresu IP, bez zapisywania surowego adresu przy wiadomości.
- `/skrzynka` wymaga Sign in with ChatGPT i sprawdzenia tożsamości właściciela. Treści nie mają publicznego endpointu odczytu. Odpowiedzi panelu nie są cachowane.
- Skrzynka wyświetla 25 wiadomości na stronę; odpowiedź następuje wskazanym przez nadawcę kanałem. Nie skonfigurowano automatycznych powiadomień pocztowych.
- Prywatny podgląd ma odnośnik do skrzynki w stopce. `publicationReady=true` ukrywa ten odnośnik na stronie publicznej, zachowując chronioną trasę.

Dostęp właściciela porównuje zaufane nagłówki tożsamości platformy z konfiguracją serwerową. Repozytorium przechowuje skrót identyfikatora e-mail, a nie publiczny adres kontaktowy. Zmiana konta właściciela wymaga aktualizacji tej konfiguracji.

## Film

Blast Battalion ma własny 9-sekundowy klip w podglądzie na stronie głównej oraz w pełnym opisie pracy. `src/data/projects.json` zawiera opcjonalne pole `video`; wspólny `ProjectMedia.astro` wyświetla odtwarzacz z kadrem z tego samego nagrania. Plik `public/assets/video/blast-battalion-gameplay.mp4` ma 1280 × 720 px i około 4,2 MB. Odtwarzanie jest natywne, bez autoplay, z `playsinline` i `preload=none`. Zmiana wybranego projektu zatrzymuje ukryty film. Nagranie przedstawia rzeczywistą symulację sterowaną botem w trybie testowym, bez dźwięku.

SHOWREEL_SRC lub showreel.src powinny wskazywać gotowy MP4/WebM. Pusta wartość pokazuje oryginalny kadr Driving Game z podpisem, bez przycisku udającego nieistniejący film. Po ustawieniu filmu pojawi się natywny odtwarzacz, bez autoplay, z preload=none.

Montaż zbiorczy nie jest jeszcze wykonany. Krótki klip Fragile Express nie zastępuje nagrań pozostałych prac. WOT Rust wymaga materiału z wersji natywnej.

## Weryfikacja i publikacja

Workflow wykonuje 14 testów kontaktu, routingu i danych, w tym zapis i duplikaty na SQLite z rzeczywistą migracją, Astro check, oba etapy builda i kontrolę wygenerowanych plików. Nie publikuje strony. Artefakt builda jest przechowywany przez 7 dni.

Kontrola statyczna sprawdza m.in. strony ośmiu prac, lokalne materiały i odnośniki, kotwice, pojedynczy opis pod logo oraz budżet JavaScript 64 KiB gzip.

**To nie zastępuje sprawdzenia strony w przeglądarce.** Stan tej kontroli zapisano w design-qa.md. Strona ma domyślnie noindex i blokadę indeksowania; publicationReady pozostaje false.

Przed publikacją:

1. Ustalić docelową domenę SITE_URL i sprawdzić skrzynkę po zalogowaniu właściciela. Nie wpisywać przykładowego adresu kontaktowego.
2. Po dalszych zmianach uruchomić npm ci, testy, check, build i verify.
3. Wyniki kontroli przeglądarkowej z 21 października 2026 r. są w design-qa.md; materiały porównawcze w qa/.
4. Prywatny podgląd zachowuje noindex i publicationReady=false. Dopiero przed uruchomieniem docelowej strony ustawić publicationReady=true i wykonać npm run check:ready.

Nie dodawać gier do początkowego pobierania strony. Gotowe dema powinny uruchamiać się po świadomym wybraniu przez odwiedzającego.

## Pochodzenie materiałów

Grafiki projektów pochodzą z repozytoriów Marcina. Film Blast Battalion i jego plansza startowa: własne nagranie z działającej wersji 1.33.2, kod 24ba4c556f13c02c8acc1a8c06306e4139976650. Plansza pochodzi z tego samego pliku filmowego. Materiały Orbling, Driving Game, WOT Rust, Tanki, Fragile Express i Cloudkeep zachowano z istniejących plików repozytorium. Dla HZ Bot pokazano faktyczny fragment config.example.yaml, nie wymyślony zrzut panelu.

Archivo: SIL Open Font License 1.1, zob. public/assets/fonts/LICENSE.md.

## Układ usług — 22 października 2026

Nawigację w niebieskim pasku i wcześniejszą listę usług połączono w jeden blok. Usunięto osobne wprowadzenie „Co mogę dla Ciebie zrobić”. Niebieski pozostał przy kontakcie, fokusie i aktywnej usłudze. Dotychczasowe kotwice, np. `#aplikacje-i-systemy`, otwierają właściwy zakres. Klawiatura obsługuje natywne przyciski oraz Escape. Bez JavaScript wszystkie cztery zakresy pozostają widoczne; przyciski ujawniają się dopiero po podłączeniu obsługi. Materiały z weryfikacji: `qa/services-mobile-20261022.jpg`, `qa/services-desktop-20261022.jpg`.

## Aktualizacja treści, 22 października 2026

Usługi zaczynają się od sytuacji klienta. Współpraca opisuje wycenę, działający podgląd, dodatkowy zakres i przekazanie. Fragment o autorze łączy interfejs, dane oraz logikę przez przykłady z własnych projektów i zachowuje drogę dla rekruterów. Kontakt ma jedną zachętę i podpowiedź, jakie materiały pomogą w rozmowie. Etykieta pola Wiadomość jest oddzielona od jego opisu dla technologii asystujących.

Osiem wybranych prac zachowuje identyfikatory i przypięte wersje kodu. Pola `focus` i `challenge` opisują konkretny problem, a `mechanism` wyjaśnia zastosowane rozwiązanie. Informacje o stanie gry używają prostszego języka. AI ma wspólne wyjaśnienie warsztatu i krótką wzmiankę przy zakresie danej pracy; nie dopisano wdrożeń ani wyników klientów.

Dodatkowy opis PlazaWorks przedstawia rzeczywisty projekt własny: prezentację usług, portfolio, formularz oraz kod prywatnej skrzynki. Odnośniki do niezmienianych w tym etapie funkcji serwerowych są przypięte do `b25d65d`. Nie dodano nowego projektu gry ani demonstracyjnego klienta. Wyniki kontroli bieżącej wersji są w `design-qa.md`.
