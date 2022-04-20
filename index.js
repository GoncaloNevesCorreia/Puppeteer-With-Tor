const Browser = require("./browser/index.js");

const browserInstance = new Browser();

(async () => {
    const browser = await browserInstance.launch({ headless: false });

    // Now you can go wherever you want

    await updateIpAddressMultipleTimes(browser, 5);

    // You would add additional code to do stuff...

    // Then when you're done, just close
    await browser.close();
})();

async function updateIpAddressMultipleTimes(browser, n) {
    console.log(
        `Updating IP address ${n} times, with 12s of interval between updates`
    );

    const logIpAddress = async (page) => {
        await page.waitForSelector("div.content > p > strong");
        const element = await page.$("div.content > p > strong");
        const ipAddress = await page.evaluate((el) => el.textContent, element);
        console.log(`Current IP Address: ${ipAddress}`);
    };

    const page = await browser.newPage();

    await page.goto("https://check.torproject.org/");
    logIpAddress(page);

    for (let i = 0; i < n; i++) {
        await page.waitForTimeout(12000);

        await browser.newIpAddress();

        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

        logIpAddress(page);
    }
}
