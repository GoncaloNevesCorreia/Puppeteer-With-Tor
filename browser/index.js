const puppeteer = require("puppeteer");
const Tor = require("./Tor.js");
const colors = require("colors/safe");

class Browser extends Tor {
    constructor() {
        super();
        this.defaultOptions = {
            headless: false,
        };
    }

    async launch(options = {}) {
        const args = [this.proxyServer()];

        const browser = await puppeteer.launch({
            args,
            ...this.defaultOptions,
            ...options,
        });

        const api = {
            newIpAddress: this.newIpAddress,
        };

        const page = await browser.newPage();
        await page.goto("https://check.torproject.org/");
        const isUsingTor = await page.$eval("body", (el) =>
            el.innerHTML.includes(
                "Congratulations. This browser is configured to use Tor"
            )
        );

        if (!isUsingTor) {
            await browser.close();
            throw new Error("Not using Tor. Closing...");
        }

        console.log(colors.green.bold("Using Tor. Continuing... "));

        await page.close();

        return Object.assign(browser, api);
    }
}

module.exports = Browser;
