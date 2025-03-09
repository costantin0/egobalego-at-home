Eccoci su Egobalego at Home, la tua console personale per controllare la mod a distanza!

Se sei qui solo per provare nella tua partita puoi iniziare subito, in quanto la mod dovrebbe connettersi automaticamente al server con le sue impostazioni di default (devi solo attivare la <u>sincronizzazione web</u> dalle impostazioni), altrimenti assicurati prima di usare il sito di aver seguito la documentazione su GitHub su come rendere accessibile il server dall'esterno.

Il sito è diviso in cinque sezioni principali, accessibili dall'header:

*   **STRUTTURE**: per spawnare le strutture della mod nel mondo;
*   **QUEST**: per attivare gli step della quest finale del ricercatore;
*   **COMUNICAZIONI**: per gestire comunicazioni di vario genere, come mandare notifiche, far dire cose al ricercatore, fargli scrivere diari o sostituire quelli preimpostati, e riscrivere i libri presenti nelle strutture;
*   **SCAMBI**: per aggiungere scambi al repertorio del ricercatore;
*   **COMANDI**: per eseguire comandi manuali o specifici della mod;
*   **WEBSOCKET**: per mandare eventi semplici (come dialoghi, notifiche ecc.) alla mod in tempo reale, senza dover aspettare che ricarichi per conto proprio.

Mi raccomando, la prima volta che entri in una sezione del sito assicurati prima di tutto di **leggere l'aiuto** corrispondente (puoi aprirlo dai punti di domanda in alto a destra), e tieni sempre a mente queste cose:

*   Nell'uso normale, per il corretto funzionamento della mod gli eventi si attiveranno una volta sola, anche se modificati; se si vuole spawnare nuovamente una struttura o modificare il testo di una notifica, per esempio, occorre creare una nuova entry!  
    <u>Nota</u>: questa cosa non vale per tutti gli eventi (gli scambi funzionano in modo diverso per esempio), ma se segui il prossimo punto non avrai problemi;
*   Non cancellare gli eventi che sono stati ricevuti dalla mod, è consigliabile **disattivarli** e **lasciarli nella pagina** in modo da tenere uno storico di ciò che hai fatto (per lo stesso motivo di prima, anche se li lasci non verranno ri-eseguiti);
*   L'ordine con cui gli eventi sono mostrati nelle varie pagine è dato da quello in cui sono stati inizializzati (un evento viene inizializzato ogni volta che da grigio diventa rosso).

Se vedi un pulsante con su scritto "Ricarica dati mod" in fondo a una pagina significa che la mod è connessa al servizio di WebSocket; puoi usarlo per far ricaricare istantaneamente i dati del sito alla mod. Per cambiare il tema del sito clicca sull'icona del sole in alto a sinistra.

Questo è tutto! Se vuoi tornare alla home per qualsiasi motivo puoi cliccare sul logo del sito, divertiti!
