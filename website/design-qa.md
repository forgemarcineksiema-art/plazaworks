# PlazaWorks — kontrola wyglądu i działania, 2026-10-21

final result: passed

## Referencja, render i normalizacja

Wybrany szkic: qa/reference-approved.png (1402 × 1122 px), „PlazaWorks: spójny masthead i nawigacja usług”. Otworzono tę referencję oraz prawdziwy render. Porównania ze wspólnie ułożonymi obrazami: qa/comparison-desktop.jpg, qa/comparison-mobile.jpg i qa/comparison-project.jpg. Oceniono także powiększone detale logotypu, paska usług, kadrowania, nazwy pracy i zakładek.

Dowody: qa/desktop-full.jpg (1363 × 5971 px), qa/mobile-390.jpg (390 × 844 px), qa/mobile-project.jpg (390 × 844 px), qa/mobile-320.jpg (320 × 740 px).

Chrome, okno 1363 × 936 CSS px. Dodatkowo uruchomiona prawdziwa strona w tymczasowych ramkach z obszarem treści 320, 390, 768 i 1440 CSS px. Do ramki dodano 15 px na klasyczny pasek przewijania; sprawdzono clientWidth i scrollWidth dokumentu. To kontrola responsywnych widoków w Chrome, nie test fizycznego Androida ani emulacja jego dotyku. Pliki ramek usunięto przed końcowym buildem.

Referencja jest planszą koncepcyjną bez zadeklarowanego viewportu i gęstości: widok komputera wycięto jako 1045 × 1122 px, widok telefonu od x=1062 (340 px szerokości). Referencję skalowano proporcjonalnie do szerokości renderu; sam render telefonu pozostał 1:1. Porównano stan początkowy oraz osobno Blast Battalion / Działanie. Różnic wysokości planszy i okna nie traktowano jako błędu. Pliki przeglądarkowe zachowano w natywnej gęstości; normalizacja dotyczy wyłącznie plansz porównawczych.

## Znalezione problemy i historia poprawek

1. **P1, obrazy:** atrybut height pozostawał skuteczny po zmniejszeniu szerokości. Obraz Driving Game miał na telefonie ok. 720 px wysokości, Blast Battalion ok. 810 px; pokazywał się wąski wycinek gry. Dodano height:auto. Nowe renderowanie pokazuje pełny kadr 16:9. Dowód po poprawce: mobile-390.jpg i mobile-project.jpg.
2. **P2, pierwszy ekran:** zbędny opis pod „Projekty”, nadmierne odstępy mastheadu i łamanie nazw usług oddalały obraz od nagłówka. Usunięto dodatkowy opis i dopasowano odstępy oraz wypełnienia usług. Przy 390 px nazwy usług mieszczą się w dwóch kolumnach; przy 320 px dłuższe nazwy łamią się czytelnie. Nagłówek z menu i CTA mieści się w jednym rzędzie. Dowód: mobile-390.jpg, mobile-320.jpg i comparison-mobile.jpg.
3. **P2, kolejność pracy:** na telefonie obraz poprzedzał nazwę projektu. Ułożono: nazwa i stan, materiał, Działanie/Budowa, opis, odnośnik. Dowód: mobile-project.jpg i comparison-project.jpg.
4. **P2, powrót do pracy:** dodano przewijanie po aktywowaniu panelu wskazanego w kotwicy, także przy początkowym wejściu. Sprawdzono opis HZ Bot i powrót do aktywnego hz-bot: górna krawędź panelu ok. 46 px od początku widoku. Sprawdzono również Blast Battalion.
5. **P2, kadr komputera:** wprowadzono szeroki format 12:5. Pierwsza korekta kadrowała zbyt nisko, więc przesunięto punkt kadrowania, zachowując samochód i słońce, oraz wykonano kolejny pełny render. Na telefonie pozostało 16:9. Dowód: desktop-full.jpg i comparison-desktop.jpg.

Pierwsze wspólne porównanie wykazało problemy 1–3 i 5. Po poprawkach wykonano nowe zrzuty, sprawdzono trasę powrotną (4), dopracowano kadr i odstępy i ponownie otworzono końcowe porównania. W sprawdzonym zakresie nie pozostały problemy P0/P1/P2.

## Wymagane powierzchnie wizualne

| Powierzchnia | Wynik |
|---|---|
| Typografia | Lokalny Archivo załadowany; czytelne polskie znaki, pojedynczy opis działalności, spójne wagi i hierarchia. Cały logotyp jasny. Wielkości tekstu dobrane do rzeczywistego ekranu, nie mechanicznie powiększone z planszy. |
| Odstępy i układ | Wspólne marginesy, 4/2 kolumny usług, mobilna kolejność pracy, brak przepełnienia w sprawdzonych szerokościach. Wiersze indeksu są wyższe niż w koncepcji, aby ułatwić trafienie na telefonie. |
| Kolory | #0A0D12, #F2F5FB, #315CF5, #172D69. Widoczna aktywna praca, zakładka i fokus. Bez osobno kolorowanego „Wor” i dekoracyjnych strzałek. |
| Obrazy | Rzeczywiste materiały, poprawne proporcje i ostrość. Materiał pracy zachowuje oryginalne 16:9 zamiast spłaszczonej ilustracji z planszy. HZ Bot pokazuje autentyczny fragment konfiguracji. Kadr i podpis zastępują niegotowy film, bez pozornego przycisku odtwarzania. |
| Treść | Jedna sekcja Projekty, osiem prac i jawne stany rozwoju. AI nie jest przedstawione jako nieistniejące wdrożenia klientów. Własny e-mail pusty na życzenie Marcina. |

## Interakcje sprawdzone w przeglądarce

- Menu mobilne: otwarcie, Escape, powrót fokusu, aria-expanded; otwarty nagłówek mieści się przy 320 px.
- Wszystkie osiem prac: wybór właściwego panelu, zaznaczenie indeksu, Działanie/Budowa, strzałka w lewo; dodatkowo Home/End na komputerze i aria-selected.
- Pełne opisy Blast Battalion i HZ Bot; powrót do właściwego projektu i pozycji.
- Przejście od usługi do kontaktu z tematem „Automatyzacja lub AI”.
- Natywna walidacja pustego formularza; przygotowanie testowego opisu bez odbiorcy; komunikat, że nic nie wysłano; kopiowanie potwierdzone komunikatem interfejsu.
- Pobranie ze zwykłego widoku: przeglądarka zwróciła ścieżkę, zapisany plik 115 B zawiera oczekiwaną treść testową. Nasłuch zdarzenia pobierania w ramce mobilnej zawiesił narzędzie; nie uznano tego za potwierdzenie pobrania na Androidzie.
- Pierwszy ekran, indeks, oferta, AI, autor, współpraca, kontakt i stopka obejrzane w renderze. clientWidth = scrollWidth przy 320/390/768/1440 px.
- Konsola: brak błędów aplikacji. Zaobserwowano osobne błędy rozszerzenia z chrome-extension://…/content-script.bundle.js; nie pochodzą z kodu strony.

## Ograniczenia i dalsze dopracowanie

Nie sprawdzono fizycznego telefonu, systemowej klawiatury, TalkBack, Safari ani trybu bez JavaScript w przeglądarce. Kod i testy kontrolują zwykłe trasy i linki; nie zastępuje to testu tych środowisk. prefers-reduced-motion oraz awaryjne kopiowanie oceniono w kodzie, bez wymuszania tych warunków w przeglądarce.

Świadome różnice względem planszy: tekstowy przycisk Menu, praktyczne wielkości pól i wierszy na telefonie, pełne proporcje autentycznych obrazów pracy, czytelne podpisy i prawdziwa treść mechanizmów zamiast dekoracyjnych ikon. Zachowano hierarchię i kierunek zaakceptowanej koncepcji.

Film zbiorczy pozostaje osobnym zadaniem. Prywatny podgląd zachowuje noindex i publicationReady=false. Własny adres e-mail nie jest wymagany do obejrzenia podglądu; formularz przygotowuje opis lokalnie. Gotowość do indeksowanej publikacji firmowej jest osobnym etapem.

## Lista wykonania

- [x] Otworzyć referencję i render, porównać je na wspólnych planszach.
- [x] Obejrzeć detale nagłówka i pracy.
- [x] Poprawić P1/P2, ponownie przechwycić i porównać.
- [x] Sprawdzić główne interakcje, szerokości i konsolę.
- [x] Zachować dowody i opisać granice testów.
- [x] Usunąć pomocnicze ramki z publicznego builda.

## Aktualizacja: film i opis Blast Battalion, 21 października 2026

- Natywny film dodano do wybranej pracy na głównej oraz do pełnego opisu. Materiał ma 9 s, 1280 × 720 px, H.264, 30 fps, 4 154 047 B i nie zawiera ścieżki audio. Planszę startową wycięto z tego samego nagrania. Podpis pełnego opisu wyjaśnia sterowanie botem w wersji rozwojowej.
- W przeglądarce przed naciśnięciem Play: paused=true, currentTime=0, readyState=0, preload=none, brak autoplay. Po prawdziwym kliknięciu: paused=false, currentTime rośnie, duration=9, readyState=4, brak błędu medium.
- Zmiana z Blast Battalion na Driving Game podczas odtwarzania dała paused=true, ended=false, currentTime=0,951277 oraz hidden=true dla panelu filmu. Powrót nie uruchamia filmu automatycznie.
- Na stronie pracy film uruchomiono również w ramce z obszarem treści 390 px: currentTime=0,198583, paused=false, duration=9 i brak błędu medium. Odtwarzacz ma w tym widoku 354 × 199,125 CSS px i zachowuje 16:9.
- Sprawdzono pełny opis, aktualne odnośniki do kodu 24ba4c5, sekcję pracy z AI i powrót do aktywnego projektu na głównej. Przy szerokościach treści 320 i 390 px clientWidth=scrollWidth. Tytuł, odtwarzacz, podpis i tekst mieszczą się w ekranie.
- Dowody: `qa/blast-film-mobile-case.jpg`, `qa/blast-film-mobile-card.jpg`, `qa/blast-film-320.jpg`. Zrzuty są wycinkami rzeczywistego obszaru strony z natywnych zrzutów Chrome; ucięto wyłącznie pusty obszar poza ramką testową. To kontrola układu i odtwarzania w Chrome, bez testu fizycznego Androida ani systemowego pełnego ekranu telefonu.
- 8 testów przechodzi. Astro: 0 błędów, 0 ostrzeżeń. Build i kontrola tras oraz materiałów przechodzą. Pomocnicze ramki usunięto przed końcowym buildem. Film zbiorczy pozostaje oddzielnym materiałem.

## Aktualizacja: oferta, współpraca i odbiór zapytań, 21 października 2026

Ta sekcja zastępuje wcześniejszy opis kolejności strony i lokalnego formularza. Oferta jest przed projektami, szczegóły czterech usług rozwijają się natywnie, a współpraca ma cztery etapy obejmujące wycenę, postępy i przekazanie. Sekcja AI zawiera opis weryfikacji i odnośniki do rzeczywistego przykładu Blast Battalion. Zakładka Budowa pokazuje zakres pracy oraz drogę do architektury.

- Chrome: obejrzano komputer i mobilny obszar treści 320 oraz 390 CSS px, z dodatkowymi 15 px ramki na pasek przewijania. clientWidth=scrollWidth dla głównej, rozwiniętej usługi i opisu projektu. To kontrola responsywnego układu w Chrome, bez testu fizycznego Androida.
- Sprawdzono menu i Escape, otwieranie zakresu z niebieskiego paska, przejście od usługi do formularza z właściwym tematem oraz wybór WOT Rust, Budowa, odnośnik do architektury i powrót do aktywnej pracy.
- Rzeczywiste zapytanie testowe wysłano z przeglądarki do lokalnej bazy. UI potwierdził zapis, a niezależny odczyt lokalnej D1 wykazał jeden rekord. Dane testowe nie są migrowane do hostowanej bazy.
- Wymuszono niedostępny endpoint wyłącznie przyciskiem pomocniczej strony QA. Formularz wyświetlił czytelny błąd, zachował wpisaną treść i przywrócił przycisk. Pomocnicza strona nie wchodzi do finalnego builda.
- 14 testów przechodzi, w tym trwały zapis na SQLite z rzeczywistą migracją, walidacja, pochodzenie żądania, ponowienia bez duplikatów, awaria zapisu, limit i natywny formularz bez JavaScript. Autoryzacja odrzuca puste i obce tożsamości.
- Astro: 0 błędów, 0 ostrzeżeń i 0 podpowiedzi. Oba etapy builda i weryfikacja tras, materiałów, migracji oraz zgodności statycznej strony z artefaktem Worker przechodzą.
- Dowód: `qa/offer-mobile.jpg`. Widoki współpracy i AI obejrzano również w przeglądarce. Wycięto wyłącznie obszar poza rzeczywistą stroną w ramce; nie zmieniano treści ani proporcji renderu.
- Nie zweryfikowano w przeglądarce zalogowanej sesji właściciela skrzynki: lokalny podgląd zarządzany nie dostarcza tożsamości produkcyjnej. Kod panelu sprawdza tożsamość na serwerze przed odczytem D1, a odpowiedzi mają no-store. Nie uznano prób połączenia z lokalnym HTTP z terminala za potwierdzenie działania panelu; ten kanał nie był dostępny.
- Widoczne błędy rozszerzenia Chrome dotyczą `chrome-extension://.../content-script.bundle.js`, nie kodu witryny. Testowany błąd odbioru był celowo wywołanym scenariuszem awarii.

Prywatny podgląd i noindex pozostają włączone. Własny e-mail nie jest publikowany; zapytania odczytuje się w skrzynce. Nie skonfigurowano powiadomień e-mail. Nagrania nie były rozbudowywane w tym etapie.

## Aktualizacja: jeden blok usług, 22 października 2026

- Zlikwidowano niebieski pasek i podwójne prezentowanie tych samych kategorii. Pod logo są cztery kolumny z nazwą, krótkim opisem i rozwijanym zakresem. Na telefonie te same elementy tworzą cztery wiersze. Usunięto osobne duże wprowadzenie oferty.
- Chrome: obszary treści 320 i 390 CSS px mają clientWidth=scrollWidth. Sprawdzono pierwszy ekran, otwarty zakres, przełączenie między usługami i wejście przez istniejącą kotwicę `#aplikacje-i-systemy`. Na komputerze rozwinięty zakres ma pełną szerokość bloku (1268 CSS px w sprawdzonym oknie).
- Space otwiera wskazaną usługę i zamyka poprzednią; Escape zamyka zakres i przywraca fokus przycisku. Stan aria-expanded i widoczność paneli zgadzają się; równocześnie otwarty jest jeden zakres.
- Odnośnik usługi AI do kontaktu ustawia temat „Automatyzacja lub AI”. Formularz i odbiór zapytań nie były zmieniane.
- W kodzie sprawdzono wariant bez JavaScript: nagłówki i pełne zakresy są widoczne, przyciski ukryte. Nie wymuszano wyłączenia JavaScript w przeglądarce.
- Dowody: `qa/services-mobile-20261022.jpg` i `qa/services-desktop-20261022.jpg`. Zrzut mobilny wycięto z rzeczywistego renderu Chrome; usunięto wyłącznie obszar poza testowaną stroną. Gotowe pliki ponownie obejrzano. To kontrola układu w przeglądarce, bez testu fizycznego Androida.
- 14 istniejących testów przechodzi, Astro zgłasza 0 błędów, 0 ostrzeżeń i 0 podpowiedzi. Oba etapy builda oraz weryfikacja tras, materiałów i artefaktu Worker przechodzą. Plik pomocniczy QA usunięto przed finalnym buildem.
