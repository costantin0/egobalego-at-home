Welcome to Egobalego at Home, your personal console for controlling the mod remotely!

If you're here just to try it out in your game you can start right away, as the mod should automatically connect to the server with its default settings (you just need to enable <u>web synchronization</u> from the settings). Otherwise, make sure to follow the documentation on GitHub on how to make the server accessible from the outside before doing anything.

The app is divided into five main sections, reachable from the header:

*   **STRUCTURES**: to spawn the mod's structures into the world;
*   **QUEST**: to activate the steps of the researcher's final quest;
*   **COMMUNICATIONS**: to manage various communications, such as sending notifications, making the researcher say things, making him write diaries or replace pre-set ones, and rewriting the books present in the structures;
*   **TRADES**: to add trades to the researcher's repertoire;
*   **COMMANDS**: to execute manual commands or mod-specific ones;
*   **WEBSOCKET**: to send simple events (like dialogues, notifications etc.) to the mod in real time, without having to wait for it to reload.

If it's the first time you visit a section, make sure to **read the corresponding help** before doing anything (you can open it from the question mark in the top right corner of the page), and always keep in mind these infos:

*   During normal usage events will trigger only once, even if edited, in order for the mod to function correctly; if you want to spawn a structure a second time or change the text of a notification, for example, you need to create a new entry!  
    <u>Note</u>: this doesn't apply to all events (trades work differently, for example), but if you follow the next point you won't have any issues;
*   Do not delete events that have been received by the mod; it's advisable to **deactivate them** and **leave them in the page** to keep a history of what you've done (for the same reason as before, even if you leave them, they won't be re-executed).

Finally, here are some useful pieces of information:

*   If you see a "Reload mod data" button on the bottom of a page, it means that the mod is connected to the WebSocket service; you can use it to make the mod instantly reload the website data (it turns green if successful, red if there was an issue).
*   Events are displayed in chronological order based on their initialization (an event is initialized every time it changes color from grey to red);
*   If the program starts behaving strangely or stops working, check the terminal that opened when you launched it. Normal messages are in cyan, warnings in yellow, errors in red, and any crashes are marked in white at the end of the log. If you encounter problems, you can report them on the [website's GitHub](https://github.com/costantin0/egobalego-at-home/issues);
    *   If it looks like some events are not triggering and the website log shows nothing, the problem might be with the mod itself: ask the player to send you the log from their session as soon as it ends, they can find it in the "logs" folder inside the game's directory. The file will be called "latest.log" if they haven't closed and reopened the game after receiving the data from the website, otherwise it will be in one of the "date-number.gz" files (which can be opened with [7zip](https://www.7-zip.org/) or other decompression tools). If you find error lines marked "Ruins of Growsseth", you can report them on the [mod's GitHub](https://github.com/filloax/ruins-of-growsseth/issues).

That's it! If you want to return to the Home for any reason you can click on the website's logo, have fun!
