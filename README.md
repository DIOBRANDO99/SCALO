# SCALO

SCALO è una piattaforma web che aiuta i viaggiatori a trovare voli più economici
sfruttando uno scalo intermedio in una città da visitare. L'utente specifica
origine, destinazione e la città di scalo desiderata; il sistema cerca le migliori
combinazioni di due biglietti separati e mostra il risparmio rispetto al volo diretto.

## Struttura del Progetto

```
backend/           Server Express (API REST)
  adapters/        Wrapper per provider di dati di volo (serpapi, mock_fake, mock_real)
  services/        Logica di business (flights.js)
  routes/          Endpoint HTTP
  tests/           Script di test manuali
scripts/           Script CLI per fetching campioni API reali
doc/
  api_samples/     Risposte reali SerpAPI usate da mock_real
```

## Setup

**Requisiti:** Node.js 18+

Ogni cartella ha le proprie dipendenze. Va eseguito `npm install` almeno una volta in ciascuna prima di poterla usare.

Per il server:

```bash
cd backend && npm install
```

Per gli script esplorativi (solo se necessario):

```bash
cd scripts && npm install
```

Crea il file `backend/.env` e inserisci:

```
SERPAPI_KEY=la_tua_chiave_serpapi
FLIGHT_PROVIDER=mock_real
PORT=3001
```

Avvia il server:

```bash
npm run dev    # sviluppo — riavvio automatico ad ogni modifica
npm start      # esecuzione normale, nessun riavvio automatico
```

Verifica che il server sia attivo:

```bash
curl http://localhost:3001/health
# { "status": "ok", "provider": "mock", "timestamp": "..." }
```

## Provider di Dati di Volo

Il backend supporta tre provider, selezionabili tramite `FLIGHT_PROVIDER` in `backend/.env`:

| Valore | Descrizione |
|--------|-------------|
| `mock_real` | Risposte reali SerpAPI salvate in `doc/api_samples/` — default per sviluppo |
| `mock_fake` | Dati inventati per testare casi limite (stopover caro, nessun volo diretto, ranking) |
| `serpapi` | SerpApi Google Flights live — solo per demo e deploy |

## Aggiornare i Dati di Mock Reali

I file in `doc/api_samples/` sono risposte reali SerpAPI catturate in un momento specifico.
Per aggiornarli con prezzi freschi (richiede una `SERPAPI_KEY` valida in `scripts/.env`):

```bash
cd scripts && npm install
node fetch_leg_responses.js
```

Questo sovrascrive i 4 file in `doc/api_samples/` con nuove risposte live per i percorsi:
- MXP → IST (solo andata)
- IST → BKK (solo andata)
- BKK → MXP (solo andata)
- MXP → BKK (andata e ritorno — baseline volo diretto)

## Aggiungere Nuovi Aeroporti ai Campioni

Per aggiungere una nuova rotta ai dati reali (es. MXP → DXB come scalo):

**1.** In `scripts/fetch_leg_responses.js`, aggiungi una voce all'array `LEGS`:

```js
{ key: "MXP_DXB_oneway", departure_id: "MXP", arrival_id: "DXB", outbound_date: "2026-06-10", type: "2" },
```

I campi modificabili sono:

| Campo | Descrizione |
|-------|-------------|
| `key` | Nome identificativo — diventa il nome del file (`leg_<key>.json`) |
| `departure_id` | Codice IATA dell'aeroporto di partenza |
| `arrival_id` | Codice IATA dell'aeroporto di arrivo |
| `outbound_date` | Data di partenza in formato `YYYY-MM-DD` |
| `return_date` | Data di ritorno — solo per andata e ritorno (`type: "1"`), omettere per solo andata |
| `type` | `"2"` = solo andata, `"1"` = andata e ritorno |

**2.** Riesegui lo script per scaricare il nuovo file:

```bash
cd scripts && node fetch_leg_responses.js
```

**3.** In `backend/adapters/mock_real.js`, aggiungi una riga al map `ROUTES`:

```js
"MXP→DXB:2": JSON.parse(readFileSync(join(samplesDir, "leg_MXP_DXB_oneway.json"), "utf8")),
```

Il tipo va specificato come `:1` per andata e ritorno, `:2` per solo andata.

## Testare gli Endpoint HTTP

Con il server avviato (`npm run dev` da `backend/`), è possibile testare gli endpoint con `curl`.

**POST /api/search** — cerca i voli con uno scalo specifico:

```bash
curl -s -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"MXP","destination":"BKK","stopover":"IST","outboundDate":"2026-06-10","returnDate":"2026-06-20","stopoverNights":3}' \
  | jq '.summary'
```

Con `FLIGHT_PROVIDER=mock_real` il risultato atteso è:

```json
{
  "bestCombinedPrice": 629,
  "directPrice": 1176,
  "savings": 547,
  "currency": "EUR"
}
```

La risposta completa include anche i tre legs (andata leg1, andata leg2, ritorno) con il prezzo migliore e tutte le opzioni di volo disponibili per ciascuno.

In caso di parametri mancanti o non validi il server risponde con HTTP 400 e un messaggio esplicativo. In caso di quota API esaurita risponde con HTTP 429.

## Eseguire i Test

I test si trovano in `backend/tests/` e si eseguono da quella cartella.

**test_real.js** — verifica che il servizio calcoli correttamente i prezzi usando i dati reali catturati:

```bash
# assicurati che FLIGHT_PROVIDER=mock_real in backend/.env
cd backend/tests && node test_real.js
```

**test_fake.js** — verifica i casi limite con dati inventati (stopover costoso, nessun volo diretto, ordinamento):

```bash
# imposta FLIGHT_PROVIDER=mock_fake in backend/.env
cd backend/tests && node test_fake.js
```
