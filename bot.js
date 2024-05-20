// Requirements and constants
const { Client, Events, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fetch = require("cross-fetch");

let REFRESHTIME;
let TOKEN;
const INFOREFRESHTIME = 1 * 60 * 60 * 1000;

const DEPLOYMENTCHANNELID = null;

const premiumM = [ "Акционный", "Премиумный" ];
const premiumF = [ "Акционная", "Премиумная" ];

const classes =
{
    light: "лёгкий танк",
    medium: "средний танк",
    heavy: "тяжёлый танк",
    spg: "САУ",
    spaa: "ЗСУ",
    fighter: "истребитель",
    attacker: "штурмовик",
    bomber: "бомбардировщик",
    heli: "вертолёт",
    barge: "баржа",
    boat: "катер",
    chaser: "морской охотник",
    destroyer: "эсминец",
    cruiser: "крейсер",
    battleship: "линкор",
};

const clFeminine =
{
    light:      false,
    medium:     false,
    heavy:      false,
    spg:                true,
    spaa:               true,
    fighter:    false,
    attacker:   false,
    bomber:     false,
    heli:       false,
    barge:              true,
    boat:       false,
    chaser:     false,
    destroyer:  false,
    cruiser:    false,
    battleship: false,
};

const nations =
{
    usa: "США",
    germany: "Германии",
    ussr: "СССР",
    britain: "Великобритании",
    france: "Франции",
    italy: "Италии",
    japan: "Японии",
    china: "Китая",
    sweden: "Швеции",
    israel: "Израиля"
};

let info = null;

const MESSAGES =
[
    { ch: "1242114214261162046", msg: "1242118576937373726" }
];

try
{
    // dev
    const configFile = require("./config.json");

    TOKEN = configFile.token;
    REFRESHTIME = 3;

    console.log("--- MARATHON DEV LAUNCHED ---");
}
catch (e)
{
    // prod
    TOKEN = process.env.TOKEN;
    REFRESHTIME = 30;
}

// Initialization
const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]});

client.once(Events.ClientReady, async () =>
{
    console.log("Marathon bot ready at " + (new Date()).toString());

    await fetchInfo();
    console.log("Info loaded successfully");

    // Deployment
    if (DEPLOYMENTCHANNELID != null)
    {
        const deploymentChannel = await client.channels.fetch(DEPLOYMENTCHANNELID);
        await deploymentChannel.send("ඞඞඞ");
    }

    setInterval(async () => { await fetchInfo(); }, INFOREFRESHTIME);
});

async function fetchInfo()
{
    const response = await fetch("https://script.google.com/macros/s/AKfycbxyQMThOMmK27oyssUpxa6G_EXENPWT-5PeUnDl-fwhqRb4Jaoo7bB_DdWvRmXKeMkT/exec");
    const responseText = await response.text();
    info = JSON.parse(responseText);
}

async function refreshStatusMessages()
{
    for (const msg of MESSAGES)
    {
        let channel, message;

        try
        {
            channel = await client.channels.fetch(msg.ch);
        }
        catch (e)
        {
            continue;
        }

        if (channel == null) continue;

        try
        {
            message = await channel.messages.fetch(msg.msg);
        }
        catch (e)
        {
            continue;
        }

        if (message == null) continue;

        message.edit({ content: null, embeds: [ marathonFunction() ] });
    }
}

setInterval(async () =>
{
    if (info == null) return;
    await refreshStatusMessages();
}, REFRESHTIME * 1000);

function marathonFunction()
{
    const premium = clFeminine[info.class] ? premiumF[parseInt(info.premium)] : premiumM[parseInt(info.premium)];
    const duration = "с " + info.startDay + "." + (info.startMonth.length > 1 ? "" : "0") + info.startMonth + " по " + info.endDay + "." + (info.endMonth.length > 1 ? "" : "0") + info.endMonth;

    const boosty = "[Boosty](https://boosty.to/solawk)";
    const github = "[GitHub](https://github.com/solawk/wtlineup)";

    const msg = new EmbedBuilder()
        .setTitle(info.name)
        .setDescription(premium + " " + classes[info.class] + " " + info.rank + "-го ранга " + nations[info.nation])
	    .setURL(info.wiki !== "" ? info.wiki : null)
        .setThumbnail(info.image !== "" ? info.image : null)
        .addFields(
            { name: duration,
                value: "6 этапов, техника открывается на 6-м",
                inline: true },
            /*{ name: availableIn + lineups.nextHours + hours + lineups.nextMinutes + minutes,
                value: "[" + lineups.bottomNext + "](" + link(lineups.bottomNext) + ") и " + "[" + lineups.topNext + "](" + link(lineups.topNext) + ")",
                inline: true },
            { name: future,
                value: futureLineupsString },
            { name: asb,
                value: aviaNowString,
                inline: true },
            { name: availableIn + lineups.aviaNextDays + days + lineups.aviaNextHours + hours + lineups.aviaNextMinutes + minutes,
                value: aviaNextString,
                inline: true },
            { name: squadron,
                value: squadronResetString + cycleDay },*/
            { name: " ",
                value: boosty + ", " + github }
        )
        .setFooter({ text: "by Solawk" });

    return msg;
}

client.login(TOKEN);