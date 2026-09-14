<h1 style="color:#da47ff; font-size:2rem; border-bottom:3px solid #da47ff; padding-bottom:8px;">PWA Pasti di Casa</h1>

<p style="color:#8E9084; font-size:0.95rem;">Dieta + Dispensa + Spesa</p>

> <strong>Progetto da zero</strong> nel workspace vuoto. Tutto on-device, offline, installabile su iOS da Safari (Aggiungi a Home). Nessun backend.

---

## <span style="color:#da47ff">Stack</span>

| Tecnologia | Ruolo |
|:---|:---|
| <strong style="color:#da47ff">Vite + React + TypeScript</strong> | Build & bundler |
| <strong style="color:#da47ff">React Router</strong> | Navigazione (poche route) |
| <strong style="color:#da47ff">Dexie</strong> | IndexedDB wrapper |
| <strong style="color:#da47ff">vite-plugin-pwa</strong> | Service Worker + manifest |
| <strong style="color:#da47ff">motion (Framer)</strong> | Spring/layout animation |
| <strong style="color:#da47ff">View Transitions API</strong> | Cambi tab/route |
| <strong style="color:#da47ff">CSS variables</strong> | Token design system |
| <em>nessun UI kit pesante</em> | Shell: 100dvh, main unico scroll, tabbar overlay, env(safe-area-inset-*) |

---

## <span style="color:#da47ff">Architettura</span>

```
flowchart TB
  subgraph shell [AppShell]
    Topbar
    Main[main scroll]
    Tabbar[Oggi Dieta Dispensa Spesa]
  end
  Main --> Dexie
  Dexie --> Ingredients
  Dexie --> MealTemplates
  Dexie --> Occurrences
  Ingredients -->|inCasa false| ShoppingList
```

---

## <span style="color:#da47ff">Look & Motion</span>

> Obiettivo: app personale, scura, reattiva — non è "health green", non clone Instagram. Un accento acido e un coral (finito). Vetro leggero sulla tabbar; in PWA non esiste il Liquid Glass nativo iOS.

### <span style="color:#da47ff">Palette</span> <span style="color:#8E9084">(default, dark)</span>

| Token | Colore | Uso |
|:---|:---:|:---|
| <code>bg</code> | <span style="background:#0E0F0C;color:#F3F0E7;padding:2px 8px;border-radius:4px;">#0E0F0C</span> | sfondo |
| <code>surface</code> | <span style="background:#181A16;color:#F3F0E7;padding:2px 8px;border-radius:4px;">#181A16</span> | card pasto |
| <code>surface2</code> | <span style="background:#23261F;color:#F3F0E7;padding:2px 8px;border-radius:4px;">#23261F</span> | chip, campi |
| <code>text</code> | <span style="background:#F3F0E7;color:#0E0F0C;padding:2px 8px;border-radius:4px;">#F3F0E7</span> | titoli, chip |
| <code>muted</code> | <span style="color:#8E9084;padding:2px 8px;">#8E9084</span> | "Poi oggi", hint |
| <code>line</code> | <span style="opacity:0.08;color:#F3F0E7;padding:2px 8px;">━━━</span> | bordi (testo al 8%) |
| <code style="color:#da47ff">accent</code> | <span style="background:#da47ff;color:#0E0F0C;padding:2px 8px;border-radius:4px;font-weight:bold;">#DA47FF</span> | CTA, tab attiva, focus |
| <code>danger</code> | <span style="background:#FF6A3D;color:#0E0F0C;padding:2px 8px;border-radius:4px;font-weight:bold;">#FF6A3D</span> | Finito, badge Spesa |
| <code>ok</code> | <span style="background:#9BE7B8;color:#0E0F0C;padding:2px 8px;border-radius:4px;font-weight:bold;">#9BE7B8</span> | check spesa / In casa |
| <code>glass</code> | <code>rgba(24,26,22,0.72) + blur 20px</code> | tabbar / topbar |

> <strong>Regola accent:</strong> Un solo accent per l'azione primaria (viola). Coral solo per "finito". Card Prossimo: surface + bordo line. CTA piena, testo su bg.

**Tipografia:** `Bricolage Grotesque` per COLAZIONE (grande, tight) + `system-ui` per il resto.

**Radius:** chip <span style="color:#da47ff">20px</span>, card <span style="color:#da47ff">28px</span>, tabbar <span style="color:#da47ff">999px</span>. Hit min <span style="color:#da47ff">52px</span>.

---

## <span style="color:#da47ff">Cosa Animare</span>

> Anima lo stato che l'utente ha appena causato. Niente bounce a caso. `prefers-reduced-motion: reduce` = crossfade 80ms o niente.

| Azione | Animazione |
|:---|:---|
| **Tap** | scale 1 → 0.96 → 1, spring ~120ms |
| **Chip Finito** | bordo/badge coral + micro-shake 4px, 220ms (azione clou) |
| **Chip torna In casa** | coral out, 180ms, niente shake |
| **Ho finito il pasto** | card Prossimo esce in alto, la nuova entra dal basso, spring ~450ms |
| **Giornata finita** | card si stringe, copy empty fade 300ms |
| **Poi oggi** | press + slide verso dettaglio, 240ms |
| **Cambio tab** | View Transition fade + 8px y, 200ms (non slide full screen) |
| **Scroll giù (liste)** | tabbar si compatta in pill (scroll-linked) |
| **Scroll su / cima** | tabbar si riespande |
| **Check Spesa** | strikethrough 280ms, poi height 0 |
| **Badge Spesa** | pop spring 200ms |
| **Form pasto** | sheet dal basso 320ms |
| **Overlap giorni** | flash coral + shake sul blocco ripetizione |
| **Empty** | fade 200ms, niente Lottie in loop |

### <span style="color:#FF6A3D">Non fare</span>

> parallax, particelle, gradienti infiniti, stagger su tutta la dispensa (max 3-4 chip sulla card Prossimo)

---

## <span style="color:#da47ff">Componenti</span>

| Componente | Descrizione |
|:---|:---|
| **Tabbar** | overlay, glass; espansa icona+label; compatta solo icone. Attiva = <span style="color:#da47ff">viola</span>. Badge Spesa = disco coral. |
| **Card Prossimo** | tipo 34-40px; chip full-width uno sotto l'altro. |
| **Chip Finito** | bordo coral, label "Finito"; resta leggibile e cliccabile (niente opacity 40%). |
| **Poi oggi** | solo tipo a sx, `>` a dx, ~52px, niente ingredienti. |

> Token in `src/styles.css`; motion su chip/card/spesa; `startViewTransition` sulle tab se Safari lo supporta.

---

## <span style="color:#da47ff">Modello Dati</span>

### <span style="color:#da47ff">Ingrediente</span> <span style="color:#8E9084">(catalogo dispensa, riusato in più pasti)</span>

| Campo | Tipo | Note |
|:---|:---|:---|
| `id` | string | |
| `name` | string | |
| `inCasa` | boolean | default `true` |
| `esauritoDa` | `{date, tipo, occurrenceId}` \| `null` | Occorrenza "da questo pasto in poi" (segnalata) se `(date, tipo)` è ≤ esauritoDa nell'ordine calendario + sequenza del giorno (colazione → merenda → pranzo → cena). |

> <strong>Nessun timestamp.</strong> Un'occorrenza è "da questo pasto in poi" se segnalata.

### <span style="color:#da47ff">Template pasto</span> <span style="color:#8E9084">(la dieta)</span>

| Campo | Tipo | Note |
|:---|:---|:---|
| `id` | string | |
| `title` | string? | opzionale (es. "Colazione proteica") |
| `tipo` | `colazione` \| `merenda` \| `pranzo` \| `cena` | |
| `ingredientIds` | `string[]` | ordine = ordine in UI |
| `ricorrenza` | object | vedi sotto |
| `attivo` | boolean | |

**Ricorrenza:**

| Campo | Tipo | Note |
|:---|:---|:---|
| `freq` | `daily` \| `weekly` | |
| `days` | `number[]` | 0=dom … 6=sab (solo se weekly) |
| `interval` | `number?` | ogni N giorni / ogni N settimane |
| `startDate` | string | |
| `endDate` | string? | |

> <strong style="color:#FF6A3D">Vincolo giorni:</strong> in un dato giorno di calendario può esserci al massimo <strong>un template attivo per tipo</strong>. "Ogni giorno" occupa tutti i giorni: non si può aggiungere una seconda colazione. In salvataggio, se c'è intersezione → errore in UI ("Quel giorno hai già una colazione").

### <span style="color:#da47ff">Occorrenza</span>

| Campo | Tipo | Note |
|:---|:---|:---|
| `id` | string | stabile: `{templateId}_{YYYY-MM-DD}` |
| `date` | string | YYYY-MM-DD (niente ora) |
| `tipo` | MealTipo | denormalizzato per ordinare |
| `status` | `pending` \| `done` | |

> Generata in lettura per oggi…+14g; scritta su Dexie solo se completi il pasto o segni un ingrediente da quel pasto.

### <span style="color:#da47ff">Glossario</span>

| Termine | Definizione |
|:---|:---|
| **Template** | la regola della dieta (es. "colazione Lun Mer Ven, yogurt"). Non è "un pasto mangiato". |
| **Occorrenza** | quella regola in un giorno preciso. Esempio: template "colazione Lun-Mer-Ven" → occorrenza lunedì 15, mercoledì 17, venerdì 19. Completare "Ho finito" marca solo l'occorrenza di oggi, non cancella il template. |

> L'utente in UI vede "pasto", non la parola occorrenza. È solo un concetto interno/codice.

### <span style="color:#da47ff">Lista spesa</span> <span style="color:#8E9084">(derivata, non una terza fonte di verità)</span>

- Tutti gli ingredienti con `inCasa === false`
- Check in spesa = `inCasa = true` e `esauritoDa = null` → sparisce dalla lista e non è più segnalato nei pasti futuri

### <span style="color:#da47ff">Regola UI ingrediente in un pasto</span>

| Stato | Comportamento |
|:---|:---|
| `inCasa === true` | normale |
| `inCasa === false` e questo pasto ≤ `esauritoDa` | <span style="color:#FF6A3D">segnalato</span> (bordo/badge "finito"), resta cliccabile per annullare |
| Completare il pasto | non tocca la dispensa; solo il tap sull'ingrediente lo fa |

---

## <span style="color:#da47ff">Route & Tab</span>

| Tab | Route | Ruolo |
|:---:|:---:|:---|
| <span style="color:#da47ff">Oggi</span> | `/` | Prossimo pasto; "Poi oggi" solo tipo + `>` |
| <span style="color:#da47ff">Dieta</span> | `/dieta` | Tutti i template, crea/modifica |
| <span style="color:#da47ff">Dispensa</span> | `/dispensa` | Catalogo in casa / finito |
| <span style="color:#da47ff">Spesa</span> | `/spesa` | Derivata dai finiti |

> Pagine stack (sopra la tab, back in topbar): `/pasti/nuovo`, `/pasti/:id`, `/pasti/:occurrenceId`

---

## <span style="color:#da47ff">Layout & Mockup</span>

> <strong>Convenzione visiva:</strong> topbar fissa, main scroll, tabbar overlay in basso. Chip ingrediente = target dito alto (~56px). Stato Finito = bordo evidenziato + label, non sparisce dalla lista. Zero orari in tutta l'app.

**Interazioni:** tap chip = toggle dispensa; tap riga "Poi oggi" o titolo pasto = dettaglio; CTA = completa occorrenza.

### <span style="color:#da47ff">Shell</span> <span style="color:#8E9084">(tutte le tab)</span>

```
+----------------------------------+
| [safe area]                      |
| Oggi          gio 10 set         |  topbar
+----------------------------------+
|                                  |
|           MAIN SCROLL            |
|                                  |
+----------------------------------+
|  Oggi   Dieta   Dispensa  Spesa  |  tabbar + home indicator
|   *                    (2)       |
+----------------------------------+
```

> Tab attiva sottolineata/pill. Badge numerico solo su Spesa se count > 0.

### <span style="color:#da47ff">1. Oggi</span> <span style="color:#8E9084">— pasto successivo (stato normale)</span>

```
+----------------------------------+
| Oggi                    gio 10   |
+----------------------------------+
| PROSSIMO                         |
| +------------------------------+ |
| | COLAZIONE                    | |
| |                              | |
| | +--------------------------+ | |
| | |     Yogurt greco         | | |  chip grande, tap
| | +--------------------------+ | |
| | +--------------------------+ | |
| | |     Miele                | | |
| | +--------------------------+ | |
| | +--------------------------+ | |
| | |     Banana               | | |
| | +--------------------------+ | |
| |                              | |
| | [     Ho finito il pasto   ] | |  CTA primaria
| +------------------------------+ |
|                                  |
| Poi oggi                         |
|  Pranzo                        > |
|  Cena                          > |
|                                  |
+----------------------------------+
| *Oggi  Dieta  Dispensa  Spesa    |
+----------------------------------+
```

### <span style="color:#da47ff">1b. Oggi</span> <span style="color:#8E9084">— yogurt cliccato (segnalato)</span>

```
+----------------------------------+
| Oggi                    gio 10   |
+----------------------------------+
| PROSSIMO                         |
| +------------------------------+ |
| | COLAZIONE                    | |
| | +--------------------------+ | |
| | | Yogurt greco    FINITO   | | |  badge + bordo
| | +--------------------------+ | |
| | | Miele                    | | |
| | +--------------------------+ | |
| | [     Ho finito il pasto   ] | |
| +------------------------------+ |
| Poi oggi ...                     |
+----------------------------------+
| Oggi  Dieta  Dispensa  Spesa (1) |
+----------------------------------+
```

> Il badge Spesa passa a (1). Nei pasti successivi yogurt resta FINITO; in quelli già conclusi prima del tap no.

### <span style="color:#da47ff">1c. Oggi</span> <span style="color:#8E9084">— tutti i pasti di oggi completati</span>

```
+----------------------------------+
| Oggi                    gio 10   |
+----------------------------------+
|                                  |
|     Niente da mangiare ora       |
|     Prossimo: colazione          |
|     domani                       |
|                                  |
| +------------------------------+ |
| | Domani → COLAZIONE           | |
| | Yogurt greco  FINITO         | |
| +------------------------------+ |
|                                  |
| Completati oggi           4/4    |
+----------------------------------+
| Oggi  Dieta  Dispensa  Spesa     |
+----------------------------------+
```

### <span style="color:#da47ff">1d. Oggi</span> <span style="color:#8E9084">— empty (nessun template)</span>

```
+----------------------------------+
| Oggi                    gio 10   |
+----------------------------------+
|                                  |
|     Nessun pasto in programma    |
|     Crea la tua dieta            |
|     [  Vai a Dieta  ]            |
|                                  |
+----------------------------------+
| Oggi  *Dieta  Dispensa  Spesa    |
+----------------------------------+
```

---

### <span style="color:#da47ff">2. Dettaglio occorrenza</span> <span style="color:#8E9084">`/occorrenze/:id`</span>

```
+----------------------------------+
| <  Colazione → gio 10     Modifica|
+----------------------------------+
| COSA MANGI                       |
| +------------------------------+ |
| | Yogurt greco          FINITO | |  riga intera
| +------------------------------+ |
| | Miele                 In casa| |
| +------------------------------+ |
| | Banana                In casa| |
| +------------------------------+ |
|                                  |
| Tap su un ingrediente = ultimo   |
| pezzo finito / annulla errore    |
|                                  |
| [      Ho finito il pasto      ] |
+----------------------------------+
| Oggi  Dieta  Dispensa  Spesa     |
+----------------------------------+
```

> Se già done: CTA diventa "Annulla completamento". Modifica apre il template (`/pasti/:templateId`).

### <span style="color:#da47ff">2b. Dettaglio</span> <span style="color:#8E9084">— pasto già fatto</span>

```
+----------------------------------+
| <  Pranzo → gio 10        Modifica|
+----------------------------------+
| Completato                       |
| pasta                            |
| olio                             |
| [    Annulla completamento     ] |
+----------------------------------+
| Oggi  Dieta  Dispensa  Spesa     |
+----------------------------------+
```

---

### <span style="color:#da47ff">3. Dieta</span> <span style="color:#8E9084">`/dieta`</span>

```
+----------------------------------+
| Dieta                           + |
+----------------------------------+
| COLAZIONE                        |
| +------------------------------+ |
| | Lun Mer Ven                  | |
| | aaaa                         | |
| +------------------------------+ |
| +------------------------------+ |
| | Mar Gio Sab                  | |
| | aaaa                         | |
| +------------------------------+ |
|                                  |
| MERENDA                          |
| +------------------------------+ |
| | Lun Mer Ven                  | |
| | mela, mandorle               | |
| +------------------------------+ |
|                                  |
| PRANZO                           |
| +------------------------------+ |
| | Ogni giorno                  | |
| | pasta, olio, parmigiano      | |
| +------------------------------+ |
|                                  |
| CENA                             |
|   (vuoto — hint: + per creare)   |
+----------------------------------+
| Oggi  *Dieta  Dispensa  Spesa    |
+----------------------------------+
```

> `+` in topbar → `/pasti/nuovo`. Tap card → modifica template. Più card sotto lo stesso heading (COLAZIONE/MERENDA/…) se i giorni non si coprono.

### <span style="color:#da47ff">3b. Dieta empty</span>

```
+----------------------------------+
| Dieta                           + |
+----------------------------------+
|                                  |
|     Ancora nessun pasto          |
|     Aggiungi colazione, pranzo,  |
|     merenda o cena               |
|     [  Nuovo pasto  ]            |
|                                  |
+----------------------------------+
| Oggi  *Dieta  Dispensa  Spesa    |
+----------------------------------+
```

---

### <span style="color:#da47ff">4. Nuovo / modifica pasto</span> <span style="color:#8E9084">`/pasti/nuovo` e `/pasti/:id`</span>

```
+----------------------------------+
| Annulla                    Salva |
+----------------------------------+
| TIPO                             |
| [Cola] [Mere] [*Pranzo*] [Cena]  |  uno selezionato
|                                  |
| RIPETIZIONE                      |
| (*) Ogni giorno                  |
| ( ) Giorni della settimana       |
|     L  M  M  G  V  S  D          |  visibile se weekly
|     [x][x][ ][x][x][ ][ ]        |
| ( ) Ogni N giorni    [ 2 ] [-][+] |
| Dal  [10/09/2026]                |
| Al   [opzionale        ]         |
| → Ogni lunedì e giovedì, da oggi |  riepilogo live
|                                  |
| COSA MANGIO                      |
| | Pasta                     x  | |
| | Olio                      x  | |
| | Parmigiano                x  | |
| +------------------------------+ |
| | Aggiungi ingrediente...      | |  autocomplete
| +------------------------------+ |
|   suggerimenti: pasta, riso, ... |
|   [ Crea "Yogurt greco" ]        |  se nessun match
|                                  |
| TITOLO (opzionale)               |
| [ Pranzo veloce              ]   |
+----------------------------------+
```

> Tabbar assente o secondaria: focus sul form. Nessun campo orario. Se i giorni scelti si sovrappongono a un altro template dello stesso tipo, **Salva è bloccato** + messaggio.

### <span style="color:#da47ff">4b. Autocomplete aperto</span>

```
| Aggiungi ingrediente... yogurt   |
| +------------------------------+ |
| | Yogurt greco                 | |  esistente in dispensa
| | Yogurt bianco                | |
| | + Crea "yogurt"              | |
| +------------------------------+ |
```

---

### <span style="color:#da47ff">5. Dispensa</span> <span style="color:#8E9084">`/dispensa`</span>

```
+----------------------------------+
| Dispensa                         |
| [ cerca ingredienti...         ] |
| [ Tutti ] [ In casa ] [ Finiti ] |
+----------------------------------+
| [ + Nuovo ingrediente ]          |
| Banana                    In casa|
| Miele                     In casa|
| Pasta                     In casa|
| Yogurt greco               Finito|  riga contrastata
+----------------------------------+
| Oggi  Dieta  *Dispensa  Spesa (1)|
+----------------------------------+
```

> Tap sulla riga (o sul pill "In casa"/"Finito") = stesso toggle del chip nel pasto. Finito da qui = `esauritoDa` adesso (non retroattivo).

### <span style="color:#da47ff">5b. Dispensa</span> <span style="color:#8E9084">— solo Finiti</span>

```
| [ Tutti ] [ In casa ] [*Finiti*] |
| Yogurt greco               Finito|
| (vuoto se nessuno)               |
```

### <span style="color:#da47ff">5c. Sheet nuovo ingrediente</span>

```
| +------------------------------+ |
| | Nuovo ingrediente            | |
| | [ nome                     ] | |
| | Parte: (*) In casa  ( ) Finito|
| | [ Annulla ]        [ Aggiungi]|
| +------------------------------+ |
```

---

### <span style="color:#da47ff">6. Spesa</span> <span style="color:#8E9084">`/spesa` — con voci</span>

```
+----------------------------------+
| Spesa                      1 voce|
+----------------------------------+
| Da comprare                      |
| +------------------------------+ |
| | [ ]  Yogurt greco            | |  checkbox grande
| +------------------------------+ |
|                                  |
| Check = l'ho ricomprato          |
| (torna In casa, via dai pasti)   |
+----------------------------------+
| Oggi  Dieta  Dispensa  *Spesa (1)|
+----------------------------------+
```

> Lista solo `inCasa === false`. Nessuna riga extra da digitare qui (si crea in Dispensa o nel form pasto).

### <span style="color:#da47ff">6b. Spesa empty</span>

```
+----------------------------------+
| Spesa                            |
+----------------------------------+
|                                  |
|     Niente da comprare           |
|     Tutto in casa                |
|                                  |
+----------------------------------+
| Oggi  Dieta  Dispensa  *Spesa    |
+----------------------------------+
```

---

## <span style="color:#da47ff">Mappa Schermate</span> <span style="color:#8E9084">(flussi)</span>

```
flowchart LR
  Oggi --> Occorrenza
  Oggi --> Dieta
  Occorrenza --> Template
  Dieta --> Template
  Dieta --> Nuovo
  Oggi -->|tap chip| DispensaState
  DispensaState --> Spesa
  Dispensa --> Spesa
  Spesa -->|check| DispensaState
```

> Niente altre pagine in v1. Primo avvio = Oggi empty che spinge a Dieta.

---

## <span style="color:#da47ff">Logica "prossimo pasto"</span> <span style="color:#8E9084">(senza orologi)</span>

> Ordine fisso nella giornata: **colazione → merenda → pranzo → cena** (al più uno per tipo per data, grazie al vincolo).

1. **Espandi** template attivi su oggi…+14g
2. **Tieni** le occorrenze `status !== done`
3. **Ordina** per date, poi per tipo in quella sequenza
4. **Il prossimo** è la prima di questa lista (inclusi i pending di oggi non ancora completati: se salti la colazione, resta "prossimo" finché non la segni o non è il giorno dopo — resta in coda oggi prima di merenda)

### <span style="color:#da47ff">"Poi oggi"</span>

Gli altri pending di oggi dopo il prossimo; riga = solo label tipo + `>` (niente ingredienti, niente ora).

---

## <span style="color:#da47ff">File Principali</span> <span style="color:#8E9084">(da creare)</span>

| File | Descrizione |
|:---|:---|
| `index.html` | Entry point |
| `vite.config.ts` | PWA config |
| `src/main.tsx` | Bootstrap React |
| `src/App.tsx` | Router + shell |
| `src/db.ts` | Dexie schema v1 |
| `src/lib/recurrence.ts` | Espansione ricorrenze |
| `src/lib/nextMeal.ts` | Logica prossimo pasto |
| `src/lib/stock.ts` | Toggle finito + regola "da questo pasto" |
| `src/pages/` | Pagine (Oggi, Dieta, Dispensa, Spesa) |
| `src/styles.css` | Token dark, chip Finito, tabbar glass + compact on scroll, reduced-motion |

---

## <span style="color:#FF6A3D">Fuori v1</span> <span style="color:#8E9084">(esplicito)</span>

> Sync cloud, calorie/macro, grammi, barcode, notifiche, due pasti dello stesso tipo nello stesso giorno (es. due merende martedì: vietato in v1). Nessun orario neanche in v2 a meno che non lo chieda.

---

## <span style="color:#da47ff">Verifica</span>

- [ ] Build locale, Lighthouse-ish PWA (manifest + sw)
- [ ] **Flusso completo:** crea colazione ogni giorno con yogurt → Oggi mostra chip → tap yogurt → Spesa ha yogurt e i pasti successivi lo mostrano segnalato → check spesa → segnalazione sparisce
- [ ] Completa pasto → compare il successivo
- [ ] Offline dopo prima visita; istruzioni iOS "Aggiungi a Home" nel README breve
