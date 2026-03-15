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
doc/               Documentazione e specifiche
discover.js        Script CLI — esplorazione destinazioni (fase esplorativa)
route_probe.js     Script CLI — test rotte specifiche (fase esplorativa)
```

## Setup Backend

**Requisiti:** Node.js 18+

```bash
cd backend
npm install
cp .env
```

Modifica `backend/.env` con la tua chiave SerpApi:

```
SERPAPI_KEY=la_tua_chiave_serpapi
FLIGHT_PROVIDER=mock
PORT=3001
```

Avvia il server:

```bash
cd backend && npm run dev

cd backend && npm start
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

## Script CLI (Fase Esplorativa)

Gli script nella root sono stati usati per validare il concetto con dati reali.
Non fanno parte del backend.

```bash
npm install
cp .env    # aggiungi SERPAPI_KEY

node route_probe.js     # testa rotte specifiche A→B
node discover.js        # scopri destinazioni da un'origine fissa
```
