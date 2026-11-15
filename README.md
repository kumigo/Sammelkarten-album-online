# Pokémon Sammelbuch

Digitales Sammelalbum fürs Handy: Karte fotografieren, die App liest Name und Nummer, die App zeigt den aktuellen Cardmarket-Wert, ob du die Karte schon hast und was deine ganze Sammlung wert ist.

## So funktioniert es

- **App:** `index.html` läuft als Webseite auf GitHub Pages. Im Handy-Browser über „Zum Startbildschirm hinzufügen“ wird sie wie eine App installiert.
- **Preise:** Die GitHub Action `.github/workflows/preise.yml` lädt jeden Tag um 03:00 UTC (04:00 Uhr Winterzeit) die öffentliche Preisliste und Produktliste für Pokémon von Cardmarket, macht daraus `data/katalog.json` und `data/preise.json` und veröffentlicht die Seite neu. Von Hand starten: *Actions → Preise aktualisieren und veröffentlichen → Run workflow*.
- **Kartenerkennung:** läuft kostenlos direkt auf dem Handy (Texterkennung mit Tesseract.js). Das Foto verlässt das Gerät nicht. Deutsche Pokémon-Namen werden über eine Namensliste von PokeAPI ins Englische übersetzt, weil Cardmarket englische Namen führt.
- **Kosten:** keine. GitHub Pages und GitHub Actions sind für öffentliche Repositories kostenlos.
- **Sammlung:** liegt im Speicher deines Handy-Browsers. Mit *Backup speichern* / *Backup laden* sicherst du sie oder ziehst sie auf ein anderes Gerät um.

## Uhrzeit des Preis-Updates ändern

In `.github/workflows/preise.yml` die Zeile `cron: "0 3 * * *"` anpassen (Minute, Stunde in UTC, Tag, Monat, Wochentag). Beispiel nur sonntags 06:00 UTC: `"0 6 * * 0"`.
