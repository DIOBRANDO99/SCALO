# SCALO

SCALO è una piattaforma web che aiuta i viaggiatori a trovare voli più economici
sfruttando uno scalo intermedio in una città da visitare. L'utente specifica
origine, destinazione e la città di scalo desiderata; il sistema cerca le migliori
combinazioni di due biglietti separati e mostra il risparmio rispetto al volo diretto.

## Struttura del Progetto

```
backend/           Server Express (API REST)
  adapters/        Wrapper per provider di dati di volo (SerpApi, mock)
  services/        Logica di business (FlightService)
  routes/          Endpoint HTTP
scripts/           Script CLI esplorativi (fase prototipale, non parte del server)
doc/               Documentazione e specifiche
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
FLIGHT_PROVIDER=mock
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

Il backend supporta due provider, selezionabili tramite `FLIGHT_PROVIDER` in `backend/.env`:

| Valore | Descrizione |
|--------|-------------|
| `mock` | Dati generati localmente — usa durante lo sviluppo, non consuma quota API |
| `serpapi` | SerpApi Google Flights — solo per demo e test finali |

> **Nota:**
> Usa sempre `FLIGHT_PROVIDER=mock` durante lo sviluppo.
