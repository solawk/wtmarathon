// Requirements and constants
const { Client, Events, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fetch = require("cross-fetch");

let REFRESHTIME;
let TOKEN;
const INFOREFRESHTIME = 20 * 60 * 1000;

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

const months =
[
    "января", "февраля", "марта",
    "апреля", "мая", "июня",
    "июля", "августа", "сентября",
    "октября", "ноября", "декабря"
];

const ranks =
[
    "3-", "4 ", "5 ", "6 ", "7+"
];

let info = null;

const MESSAGES =
[
    { ch: "1242114214261162046", msg: "1242145311913410732" },
    { ch: "1058469561323749459", msg: "1141072037973078137" },
    { ch: "1109917653075775600", msg: "1243257526901014578" }
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
    const response = await fetch("https://script.google.com/macros/s/AKfycbxWFyYlThzw5sXAMczj72wRWvEz422Pwrz-tb8wyPn3R16kx7zJdQJCaOvYChIALSCu/exec");
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

        message.edit({ content: null, embeds: [ marathonFunction() ] }).catch(() => { });
    }
}

setInterval(async () =>
{
    if (info == null) return;
    await refreshStatusMessages();
}, REFRESHTIME * 1000);

function marathonFunction()
{
    // Actual data

    const currentDate = new Date();

    const startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), parseInt(info.startMonth) - 1, parseInt(info.startDay), parseInt(info.eventHour)));
    const endDate = new Date(Date.UTC(new Date().getUTCFullYear() + (parseInt(info.startMonth) > parseInt(info.endMonth) ? 1 : 0), parseInt(info.endMonth) - 1, parseInt(info.endDay), parseInt(info.eventHour)));

    const timeDifference = endDate.getTime() - startDate.getTime();
    const durationInDays = timeDifference / (1000 * 60 * 60 * 24);
    const durationInStages = Math.round(durationInDays / parseInt(info.daysPerStage));

    const timeElapsed = currentDate.getTime() - startDate.getTime();
    const isMarathonOver = timeElapsed > timeDifference;
    const isMarathonNotStarted = currentDate < startDate;
    const currentStage = Math.ceil(timeElapsed / (1000 * 60 * 60 * 24 * parseInt(info.daysPerStage)));

    const stageStartTimestamp = startDate.getTime() + (1000 * 60 * 60 * 24 * parseInt(info.daysPerStage) * (currentStage - 1));
    const stageTimeElapsed = currentDate.getTime() - stageStartTimestamp;
    const stageEndTimestamp = startDate.getTime() + (1000 * 60 * 60 * 24 * parseInt(info.daysPerStage) * currentStage);

    const remainingStageTime = stageEndTimestamp - currentDate.getTime();
    const remainingStageDays = Math.floor(remainingStageTime / (1000 * 60 * 60 * 24));
    const remainingStageHours = Math.floor(remainingStageTime / (1000 * 60 * 60)) - (remainingStageDays * 24);
    const remainingStageMinutes = Math.floor(remainingStageTime / (1000 * 60)) - (remainingStageDays * 24 * 60) - (remainingStageHours * 60);

    const halfhourMinutes = (currentStage > 1 && stageTimeElapsed < (1000 * 60 * 30)) ? (30 - Math.floor(stageTimeElapsed / (1000 * 60))) : -1;

    const modeMultipliers = [ parseFloat(info.multAB), parseFloat(info.multRB), parseFloat(info.multSB) ];
    const rankMultipliers = [ parseFloat(info.multIII), parseFloat(info.multIV), parseFloat(info.multV), parseFloat(info.multVI), parseFloat(info.multVII) ];
    const stageScore = parseInt(info.stageScore);
    const couponScore = parseInt(info.couponScore);

    const scores = [];
    for (let mode = 0; mode < 3; mode++)
    {
        scores[mode] = [];
        for (let rank = 0; rank < 5; rank++)
        {
            scores[mode][rank] = { stage: Math.ceil(stageScore / modeMultipliers[mode] / rankMultipliers[rank]), coupon: Math.ceil(couponScore / modeMultipliers[mode] / rankMultipliers[rank]) };
        }
    }

    // Mental disorders

    const premium = clFeminine[info.class] ? premiumF[parseInt(info.premium)] : premiumM[parseInt(info.premium)];
    const duration = "Марафон проходит с " + info.startDay + (info.startMonth !== info.endMonth ? " " + months[parseInt(info.startMonth) - 1] : "")
                        + " по " + info.endDay + " " + months[parseInt(info.endMonth) - 1] + "";
    const rewardStageString = info.rewardStage + (info.rewardStage < 5 ? " этапа" : " этапов");
    const currentStageString = "Текущий этап – **" + currentStage + "/" + durationInStages + "**";
    const stageRemaining = "До следующего " + remainingStageDays + " д " + remainingStageHours + " ч " + remainingStageMinutes + " м";
    const halfhourRemaining = (halfhourMinutes > -1) ? "\nПредыдущий этап доступен ещё " + halfhourMinutes + " м" : "";

    function asbn(n) // Add spaces before number (for 6 symbols)
    {
        if (n < 100000) return " ";
        else return "";
    }

    //                 "RR XXXXXX XXXXXX XXXXXX"
    const modeHeader = "Ранг АБ     РБ     СБ\n";
    let stageScores = modeHeader;
    let couponScores = modeHeader;
    for (let rank = 0; rank < 5; rank++)
    {
        stageScores += ranks[rank];
        couponScores += ranks[rank];
        for (let mode = 0; mode < 3; mode++)
        {
            stageScores += " " + asbn(scores[mode][rank].stage) + scores[mode][rank].stage;
            couponScores += " " + asbn(scores[mode][rank].coupon) + scores[mode][rank].coupon;
        }
        stageScores += "\n";
        couponScores += "\n";
    }

    const boosty = "[Boosty](https://boosty.to/solawk)";
    const github = "[GitHub](https://github.com/solawk/wtmarathon)";

    const msg = new EmbedBuilder()
        .setTitle(info.name)
        .setDescription(premium + " " + classes[info.class] + " " + info.rank + "-го ранга " + nations[info.nation])
	    .setURL(info.wiki !== "" ? info.wiki : null)
        .setThumbnail(info.image !== "" ? info.image : null)
        .addFields(
            {   name: duration,
                value: "Наградная техника выдаётся за " + rewardStageString },
            {   name: !isMarathonOver ? (!isMarathonNotStarted ? currentStageString : "Марафон скоро начнётся") : "Марафон завершился!",
                value: !isMarathonOver ? (!isMarathonNotStarted ? stageRemaining + halfhourRemaining : "Готовьтесь к гринду") : "Ожидайте нового гринда" },
            {   name: "Очков на этап – **" + info.stageScore + "**",
                value: "```" + stageScores + "```" },
            {   name: "Очков на купон – **" + info.couponScore + "**",
                value: "```" + couponScores + "```" },
            { name: "от Solawk",
                value: boosty + ", " + github }
        );

    return msg;
}

client.login(TOKEN);