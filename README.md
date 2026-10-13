# Natività in AR (Quest 2, WebXR)

Fase 1: scheletro, sessione `immersive-ar`, ripiego 3D su PC, Sacra Famiglia + asinello animato.

## 1. Installare
```
npm install
```

## 2. Preparare i modelli (una volta sola)
Copia i due GLB originali in `models-src/` **con questi nomi**:

- `animated_realistic_donkey__3d_animal_model.glb`  →  `models-src/donkey.glb`
- `holy_family_with_mary_joseph_and_child_jesus.glb` →  `models-src/holy-family.glb`

Poi:
```
npm run models
npm run models:inspect   # controlla triangoli e dimensione dei file ottenuti
```
Risultato atteso: `public/models/holy-family.glb` con circa 35.000 triangoli (l'originale ne ha 500.000, quattro volte e mezzo il budget dell'intero presepe) e `public/models/donkey.glb` con circa 4.400.
Se `npm run models` dà errore, incolla qui l'errore: i comandi sono quelli di gltf-transform e vanno solo adattati.

## 3. Provare sul PC
```
npm run dev
```
Apri l'indirizzo mostrato (localhost va bene, conta come sicuro). Aggiungi `?debug` per FPS e conteggio triangoli.

Senza visore vedi la versione 3D con OrbitControls. Per simulare il Quest installa l'estensione Chrome **Immersive Web Emulator** (Meta): con l'emulatore attivo compare il pulsante "Entra in AR" e puoi muovere visore e controller.

## 4. Pubblicare
`npm run build` crea `dist/` (percorsi relativi, adatto a GitHub Pages).

## Dove mettere le mani
- `js/scene/holyFamily.js` → `JESUS_ANCHOR`: punto della luce di Gesù (stimato, da verificare con `?debug`).
- `js/scene/stage.js` → posizioni sul tavolo, intensità luci.
- `js/credits-data.js` → crediti CC BY (già compilati per i due modelli).

## Struttura
`index.html`, `css/`, `js/` come richiesto. `models/` e `audio/` stanno dentro `public/` perché Vite copia nel build solo quella cartella.
