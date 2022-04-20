const net = require("net");
const os = require("os");
const colors = require("colors/safe");

class Tor {
    constructor() {
        this.ip = "127.0.0.1";
        this.port = "9050";
        this.controlPort = "9051";
        this.controlPassword = "giraffe";
    }

    proxyServer() {
        return `--proxy-server=socks5://${this.ip}:${this.port}`;
    }

    sendCommands = (commands) => {
        const options = {
            host: this.ip,
            port: this.controlPort,
        };

        return new Promise((resolve, reject) => {
            const socket = net.connect(options, () => {
                const commandString = commands.join("\n") + "\n";
                socket.write(commandString);
            });

            socket.on("error", (err) => {
                reject(err);
            });

            let data = "";
            socket.on("data", (chunk) => {
                data += chunk.toString();
            });

            socket.on("end", () => {
                resolve(data);
            });
        });
    };

    newIpAddress = async () => {
        const commands = [
            `authenticate "${this.controlPassword}"`, // authenticate the connection
            "signal newnym", // send the signal (renew Tor session)
            "quit", // close the connection
        ];

        await new Promise((resolve, reject) => {
            this.sendCommands(commands)
                .then((data) => {
                    let lines = data.split(os.EOL).slice(0, -1);
                    let success = lines.every((val) => {
                        // each response from the ControlPort should start with 250 (OK STATUS)
                        return val.length <= 0 || val.indexOf("250") >= 0;
                    });

                    if (!success) {
                        let err = new Error(
                            "Error communicating with Tor ControlPort\n" + data
                        );
                        console.error(err.message);
                        reject();
                    }

                    console.log(
                        colors.green.bold("Tor session successfully renewed!!")
                    );
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };
}

module.exports = Tor;
