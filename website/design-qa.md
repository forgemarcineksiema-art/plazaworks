# PlazaWorks — kontrola projektu i implementacji

final result: blocked

## Wybrany punkt odniesienia

Ostatni zaakceptowany szkic z rozmowy: czerń, autorski jasny napis PlazaWorks z małym opisem obok (na telefonie pod nazwą), głębszy niebieski pasek usług, pojedyncza sekcja Projekty, duży materiał z Driving Game i indeks z wybranym Blast Battalion. Bez dekoracyjnych strzałek i bez opisu powtórzonego przy nazwisku.

## Stan

- Środowisko wykonywania poleceń jest niedostępne w tej rozmowie.
- Przeglądarka do uruchomienia strony i kontroli wyglądu nie jest dostępna.
- Nie wykonano świeżych zrzutów strony, porównania w tym samym widoku ani testów interakcji w przeglądarce.
- Przygotowanie źródeł i testów nie oznacza przejścia kontroli wizualnej.

## Wymagane sprawdzenia po uruchomieniu

- 1440 px i telefon 390 px; dodatkowo 320 px pod kątem przepełnienia.
- Skala, czytelność i kadrowanie osobnego pliku logotypu; relacja z opisem i paskiem usług.
- Brak przewijania strony w poziomie.
- Menu: dotyk, klawiatura, zamykanie Escape i powrót fokusu.
- Wybór ośmiu prac, link bezpośredni oraz Działanie/Budowa z klawiaturą.
- Kontakt: walidacja, przygotowanie wiadomości, kopiowanie (w tym niedostępny schowek), pobranie pliku i otwieranie poczty po ustawieniu adresu.
- Zwykłe linki do opisów prac przy wyłączonym JavaScript.
- Wygląd i działanie przy prefers-reduced-motion.
- Konsola przeglądarki i brak nieoczekiwanych żądań sieciowych.
- Działanie z BASE_PATH=/ i BASE_PATH=/plazaworks/.

Dokumentu nie należy oznaczać jako passed na podstawie samego builda lub testów logiki.
