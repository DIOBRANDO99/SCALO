# SCALO

> **Lavoro in corso.** Questo progetto è in fase esplorativa. Nessuna scelta è definitiva — l'architettura, le API utilizzate e il modello di business sono ancora in fase di valutazione.

SCALO è una piattaforma web che offre delle alternative più economiche per dei voli da A a B, includendo uno scalo. Lo scopo non è solo di risparmiare, ma anche di proporre scali che permettono ai viaggiatori di visitare la città in cui fanno lo scalo.

## Servizi
Attualmente la piattaforma offre due servizi differenti:

- **Partenza e destinazione specificata da utente**
    L'utente decide da dove e dove vuole andare, l'applicazione propone alternative (se esistono) più economiche con scalo.
    **User story** -> "I want to check specific routes I already have in mind."

- **Partenza specificata da utente**
    L'utente decide da dove partire, l'applicazione offre una serie di destinazioni popolari includendo uno scalo. Le proposte sono ordinate in base al risparmio economico rispetto al volo diretto.
    **User story** -> "I'm in Milan, show me everywhere I could go with an interesting stopover deal."

## Setup

**Requisiti:** Node.js installato.

1. Installa le dipendenze:
    ```bash
    npm install
    ```

3. Abbonati a SerpApi per ottenere la chiave API necessaria per eseguire gli scripts. **(SerpApi ha un limite di 250 chiamate al mese, usare con parsimonia durante la fase di sviluppo)**

4. Crea il file `.env` nella root del progetto:
    Inserisci la tua chiave SerpApi nel file `.env`:
    ```
    SERPAPI_KEY=la_tua_chiave
    ```

5. Esegui uno dei due script:
    ```bash
    node route_probe.js   # testa rotte specifiche A→B
    node discover.js      # scopri destinazioni da un'origine fissa
    ```
