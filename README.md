<p align="center">
  <img src="icon128.png" alt="GSC URL Remover" width="100">
</p>

<h1 align="center">🔍 GSC URL Remover</h1>

<p align="center">
  <strong>Automatyzacja masowego usuwania URL z Google Search Console</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-1a73e8" alt="Manifest V3">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/version-1.1.0-blue" alt="Version">
</p>

---

## 🎯 O co chodzi?

Potrzebujesz usunąć **dziesiątki lub setki URL-i** z indeksu Google? Ręczne klikanie w Google Search Console to koszmar. Ta wtyczka robi to **automatycznie** — wklej listę URL-i, kliknij start i idź na kawę ☕

## ✨ Funkcje

| Funkcja | Opis |
|---|---|
| 📋 **Masowe przetwarzanie** | Wklej dowolną liczbę URL-i (każdy w nowej linii) |
| ⏱️ **Konfigurowalny delay** | Ustaw losowe opóźnienie między prośbami (od–do sekund) |
| 📊 **Pasek postępu** | Śledź postęp w czasie rzeczywistym |
| 🔄 **Popup niezależny** | Zamknij popup — proces kontynuuje się na karcie GSC! |
| ⏹️ **Przycisk stop** | Zatrzymaj w dowolnym momencie |
| 💾 **Zapamiętywanie** | URL-e i ustawienia zapisują się automatycznie |
| 🔔 **Badge na ikonce** | Widzisz postęp nawet bez otwierania popupu |

## 🚀 Instalacja

1. **Pobierz repozytorium:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gsc-url-remover.git
   ```
   Lub kliknij **Code → Download ZIP** i rozpakuj.

2. Otwórz Chrome i wejdź na:
   ```
   chrome://extensions/
   ```

3. Włącz **Tryb deweloperski** (przełącznik w prawym górnym rogu)

4. Kliknij **„Załaduj rozpakowane"** i wybierz folder z wtyczką

5. ✅ Gotowe! Ikona pojawi się na pasku narzędzi

## 📖 Jak używać?

1. **Przejdź do GSC → Usunięcia:**
   ```
   https://search.google.com/search-console/removals?resource_id=...
   ```

2. **Kliknij ikonę wtyczki** na pasku narzędzi Chrome

3. **Wklej adresy URL** (każdy w nowej linii):
   ```
   https://example.com/strona-1
   https://example.com/strona-2
   https://example.com/strona-3
   ```

4. **Ustaw opóźnienie** (zalecane: 3–8 sekund)

5. **Kliknij „Rozpocznij usuwanie"** ▶

6. 🎉 **Zostaw kartę GSC aktywną** i zamknij popup — wtyczka robi resztę! Możesz obserwować postęp na badge ikony wtyczki.

## ⚙️ Jak to działa?

Dla każdego URL-a wtyczka automatycznie:

```
1. Kliknięcie "Nowa prośba"
2. Wpisanie adresu URL (symulacja wpisywania znak po znaku)
3. Kliknięcie "Następne"
4. Kliknięcie "Prześlij prośbę"
5. Losowe opóźnienie z ustawionego zakresu
6. Powtórzenie od kroku 1
```

## 🛡️ Praca w tle

Content script (skrypt wstrzyknięty na stronę GSC) działa **niezależnie od tego, czy popup jest otwarty**. Dzięki **background service worker**:

- ✅ Możesz zamknąć popup wtyczki — proces będzie kontynuowany
- ✅ Badge na ikonce pokazuje aktualny postęp (numer przetwarzanego URL-a)
- ✅ Po ponownym otwarciu popupu zobaczysz aktualny stan procesu

> ⚠️ **Ważne:** Karta z Google Search Console (sekcja Usunięcia) **musi być aktywna (widoczna)** przez cały czas trwania procesu — nie przełączaj się na inną kartę! Popup wtyczki możesz zamknąć bez obaw — automatyzacja działa na poziomie karty, nie popupu.

## 📁 Struktura projektu

```
gsc-url-remover/
├── manifest.json      # Manifest V3
├── background.js      # Service worker (praca w tle)
├── popup.html         # Interfejs użytkownika (HTML + CSS)
├── popup.js           # Logika popupu
├── content.js         # Automatyzacja na stronie GSC
├── icon16.png         # Ikona 16×16
├── icon48.png         # Ikona 48×48
├── icon128.png        # Ikona 128×128
└── README.md          # Ten plik
```

## 🔒 Uprawnienia

| Uprawnienie | Cel |
|---|---|
| `activeTab` | Interakcja z aktywną kartą GSC |
| `scripting` | Wstrzykiwanie skryptu automatyzującego |
| `storage` | Zapisywanie URL-i, ustawień i postępu |
| `search.google.com` | Dostęp do strony GSC |

## ⚠️ Dobre praktyki

- **Musisz mieć GSC w języku polskim**
- **Nie przełączaj się na inną kartę** w trakcie procesu — karta GSC musi być aktywna
- Ustaw **rozsądne opóźnienie** (3–8 sekund), aby nie obciążać GSC
- Przed uruchomieniem **zaloguj się** do Google Search Console
- Sprawdź czy jesteś na właściwej podstronie (**Usunięcia**)
- Przed masowym usuwaniem upewnij się, że **naprawdę chcesz** usunąć te URL-e
- Popup wtyczki możesz zamknąć — proces będzie kontynuowany na karcie

## 📄 Licencja

[MIT License](LICENSE) — używaj, modyfikuj i udostępniaj bez ograniczeń.

## 👤 Autor

<p align="center">
  <strong>Created by <a href="https://www.linkedin.com/in/dawid-walczyk-a3400bab/">Przekot</a></strong>
  <br>
  <a href="https://www.linkedin.com/in/dawid-walczyk-a3400bab/">
    <img src="https://img.shields.io/badge/LinkedIn-Przekot-0A66C2?logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
</p>

---

<p align="center">
  ⭐ Jeśli wtyczka Ci się przydała, <strong>zostaw gwiazdkę</strong> na GitHubie!
</p>
