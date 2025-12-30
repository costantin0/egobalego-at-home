## How to add a new language to Egobalego at Home

You wish to translate Egobalego at Home in your language? You can follow this guide!

Now, here's what you have to do:

- First, download the webapp from the [releases](https://github.com/costantin0/egobalego-at-home/releases) (if you are familiar with GitHub, clone the repository instead, so that you can make a pull request later) and open its folder, possibly with [Visual Studio Code](https://code.visualstudio.com/) or similar programs.

- Choose a code for your language, possibly from the [Minecraft language list](https://minecraft.wiki/w/Language). For example, English is `en_us`.

- Navigate to the [translations folder](./../program/translations), create a copy of the `en_us.json` file and rename it to your language code (for example `es_es.json`), then open it with your favorite text editor. The file will contain a [JSON object](https://www.w3schools.com/js/js_json.asp) having all the `key: translation` pairs used by the webapp (the keys are used in the HTML to get the corresponding string). Now you can replace the english strings with yours, like this:
```jsonc
    {
        "home_greeting": "Greetings, Game Master!  ->  Hola, Game Master!",
        // ...
    }
```

- Navigate to the [content folder](./../program/templates/content/), create a copy of the `en_us` folder, rename it to your language's code and translate the files inside it.

- Create in the [root](./..) folder a new .bat file called `start-server-YOUR_LANGUAGE_NAME.bat` and write this inside it (replace `YOUR_LANGUAGE_CODE` with the code of your language):
```ps1
    @echo off
    powershell -ExecutionPolicy Bypass -File "%~dp0/run-app.ps1" "YOUR_LANGUAGE_CODE"
    pause
```

And that's it! You can run the newly created .bat file to test your translation.

If you are familiar with Git and GitHub and you cloned the repository, make a pull request, I'll merge it and add the new language!
If you are not familiar with them, you can [create a discussion](https://github.com/costantin0/egobalego-at-home/discussions) and attach your translation files there, I'll manage from there.
