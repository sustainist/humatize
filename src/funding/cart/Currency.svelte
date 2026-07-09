<script lang="ts">
  import { onMount } from "svelte";
  import { httpsCallable } from "firebase/functions";
  import { functions } from "../../firebase";
  import { currencies, formatCurrency, showFormCheckout } from "..";
  import { currency, formId } from ".";

  function updateCurrency() {
    if (selectedCurrency) {
      const symbol = $currencies.find(
        (c) => c.code === selectedCurrency,
      )?.symbol;
      if (symbol)
        return ($currency = {
          code: selectedCurrency,
          symbol,
        });
    }
    $currency = null;
  }

  const mostTradedCurrenciesApril2025 = [
    "eur",
    "usd",
    "jpy",
    "gbp",
    "cny",
    "chf",
    "aud",
    "cad",
    "hkd",
    "sgd",
    "inr",
    "krw",
    "sek",
    "mxn",
    "nzd",
    "nok",
    "twd",
    "brl",
    "zar",
    "pln",
    "dkk",
    "idr",
    "try",
    "thb",
    "ils",
    "huf",
    "czk",
    "clp",
    "php",
    "cop",
    "myr",
    "aed",
    "sar",
    "ron",
    "pen",
  ];

  const availableCurrenciesMarch2026: string[] = [
    "eur",
    "usd",
    "jpy",
    "gbp",
    "cny",
    "chf",
    "aud",
    "cad",
    "hkd",
    "sgd",
    "inr",
    "krw",
    "sek",
    "mxn",
    "nzd",
    "nok",
    "twd",
    "brl",
    "zar",
    "pln",
    "dkk",
    "idr",
    "try",
    "thb",
    "ils",
    "huf",
    "czk",
    "clp",
    "php",
    "cop",
    "myr",
    "aed",
    "sar",
    "ron",
    "pen",
    "afn",
    "all",
    "amd",
    "ang",
    "aoa",
    "ars",
    "awg",
    "azn",
    "bam",
    "bbd",
    "bdt",
    "bif",
    "bmd",
    "bnd",
    "bob",
    "bsd",
    "bwp",
    "byn",
    "bzd",
    "cdf",
    "crc",
    "cve",
    "djf",
    "dop",
    "dzd",
    "egp",
    "etb",
    "fjd",
    "fkp",
    "gel",
    "gip",
    "gmd",
    "gnf",
    "gtq",
    "gyd",
    "hnl",
    "htg",
    "isk",
    "jmd",
    "kes",
    "kgs",
    "khr",
    "kmf",
    "kyd",
    "kzt",
    "lak",
    "lbp",
    "lkr",
    "lrd",
    "lsl",
    "mad",
    "mdl",
    "mga",
    "mkd",
    "mmk",
    "mnt",
    "mop",
    "mur",
    "mvr",
    "mwk",
    "mzn",
    "nad",
    "ngn",
    "nio",
    "npr",
    "pab",
    "pgk",
    "pkr",
    "pyg",
    "qar",
    "rsd",
    "rub",
    "rwf",
    "sbd",
    "scr",
    "shp",
    "sle",
    "sos",
    "srd",
    "std",
    "szl",
    "tjs",
    "top",
    "ttd",
    "tzs",
    "uah",
    "ugx",
    "uyu",
    "uzs",
    "vnd",
    "vuv",
    "wst",
    "xaf",
    "xcd",
    "xcg",
    "xof",
    "xpf",
    "yer",
    "zmw",
  ];

  let search: string | null = $state(null);

  const filteredCurrencies = $derived(
    $currencies.filter(
      ({ currency }) =>
        !search || currency.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  let selectedCurrency: string | null = $derived($currency?.code || null);

  /* currencies.subscribe((value) => {
  const item = {
    value: value,
    expiry: new Date().getTime() + 365 * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem("currencies", JSON.stringify(item));
}); */

  onMount(() => {
    if (!$currencies.length) {
      /* // const stored = localStorage.getItem("currencies");
      // if (stored) {
      //   const parsedStored = JSON.parse(stored);
      //   if (new Date().getTime() > parsedStored.expiry) {
      //     localStorage.removeItem("currencies");
      functions &&
        httpsCallable(functions, "getCurrencyCodes")().then(
          ({ data: { currencyCodes } }: any) => {
            $currencies = (currencyCodes as string[])
              .sort((a, b) => {
                const p = mostTradedCurrenciesApril2025.indexOf(a);
                const q = mostTradedCurrenciesApril2025.indexOf(b);
                return (
                  p + (p < 0 ? Infinity : 0) - (q + (q < 0 ? Infinity : 0)) ||
                  a.localeCompare(b, undefined, {
                    sensitivity: "base",
                  })
                );
              })
              .map((code) => ({
                ...formatCurrency(code),
                code,
              }));
          },
        ); 
      //   } else {
      //     $currencies = parsedStored.value;
      //   }
      // } */

      $currencies = availableCurrenciesMarch2026
        .sort((a, b) => {
          const p = mostTradedCurrenciesApril2025.indexOf(a);
          const q = mostTradedCurrenciesApril2025.indexOf(b);
          return (
            p + (p < 0 ? Infinity : 0) - (q + (q < 0 ? Infinity : 0)) ||
            a.localeCompare(b, undefined, {
              sensitivity: "base",
            })
          );
        })
        .map((code) => ({
          ...formatCurrency(code),
          code,
        }));
    }

    function hideSearchOnPointerDown() {
      search = null;
    }

    function hideSearchOnEscape(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Esc") {
        search = null;
      }
    }

    document.addEventListener("pointerdown", hideSearchOnPointerDown);
    document.addEventListener("keydown", hideSearchOnEscape);

    return () => {
      document.removeEventListener("pointerdown", hideSearchOnPointerDown);
      document.removeEventListener("keydown", hideSearchOnEscape);
    };
  });
</script>

<!-- {console.log(JSON.stringify($currencies))} -->
{#if $currencies.length}
  <div>
    {#if search !== null}
      <span style="display: flex; gap: 0.25em; align-items: center;">
        <label>
          <input
            oninput={() => {
              selectedCurrency = !filteredCurrencies.find(
                (c) => c.code === selectedCurrency,
              )
                ? filteredCurrencies[0]?.code || null
                : selectedCurrency;
              updateCurrency();
            }}
            onpointerdown={(e) => {
              e.stopPropagation();
            }}
            type="text"
            name="{$formId}-currency-search"
            placeholder="Search currency..."
            bind:value={search}
          />
        </label>
        <button
          title="close"
          style="background: none; border: none; cursor: pointer;"
          type="button"
          onpointerdown={() => (search = null)}
        >
          <i class="fas fa-times"></i>
        </button>
      </span>
    {/if}
    {#if filteredCurrencies.length}
      <label>
        <select
          name="{formId}-currency"
          onpointerdown={(e) => {
            e.stopPropagation();
            if (search === null) search = "";
          }}
          bind:value={selectedCurrency}
          onchange={() => {
            updateCurrency();
            $showFormCheckout = null;
          }}
        >
          {#each filteredCurrencies as { code, currency }}
            {@const max = 30}
            <option value={code} title={currency}
              >{currency.substring(0, max - 1) +
                (currency.length > max ? "..." : "")}</option
            >
          {/each}
        </select>
      </label>
    {:else}
      <small>Not found</small>
    {/if}
  </div>
{/if}

<style>
  div {
    display: flex;
    gap: 0.5em;
    flex-direction: column;
  }
</style>
