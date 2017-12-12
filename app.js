const builder = require('botbuilder');
const restify = require('restify');

const vaidsOptions = {
    "Why Vaids?": {
        item: "whyVaids"
    },
    "Vaids Essentials": {
        item: "vaidsEssentials"
    },
    "Vaids Participation": {
        item: "vaidsParticipation"
    },
}


const connector = new builder.ChatConnector();
const bot =  new builder.UniversalBot(
    connector,
    [
        // function (session){
        //     builder.Prompts.text(session, 'Hello! Please, what is your name?');
        // },
        // function(session, results) {
        //     session.endDialog(`Hi, ${results.response}`);
        // }
        (session) => {
            session.beginDialog('greetings', session.userData.profile);
        },
        // (session, results) => {
        //     const profile = session.userData.profile = results.response;
        //     session.endConversation(`I hope I was able to answer your queries adequately. Goodbye ${profile.name}.`);
        // },
        (session) => {
            session.beginDialog('enquiry', session.userData.info);
        },
        (session, results) => {
            const profile = session.userData.profile = results.response;
            session.endConversation(`I hope I was able to answer your queries adequately. Goodbye.`);
        }
    ]
);

bot.dialog('greetings', [
    (session, args, next) => {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            session.send("Hello there!");
            builder.Prompts.text(session, `Before we begin, let me get to know you a bit. What is your name?`);
        } else {
            next();
        }
    },
    (session, results, next) => {
        if(results.response) {
            if((results.response).match(/\Wis\W/)){
                results.response = ((results.response).slice((results.response).indexOf('is')+2)).trim();
            }
            session.dialogData.profile.name = results.response;
        }
        if(!session.dialogData.profile.location) {
            builder.Prompts.text(session, `Oh hello ${results.response}. What area are you chatting from?`)
        } else {
            next();
        }
    },
    (session, results, next) => {
        if(results.response) {
            session.dialogData.profile.location = results.response;
            if((results.response).toLowerCase().match(/\Wfrom\W/)){
                results.response = ((results.response).slice((results.response).indexOf('from')+4)).trim();
                 }
            else if ((results.response).toLowerCase().match(/\Wis\W/)){
                results.response = ((results.response).slice((results.response).indexOf('is')+2)).trim();
            }
            session.dialogData.profile.location = results.response;
        }
        if(!session.dialogData.profile.issue) {
            builder.Prompts.text(session, `Ahh ${results.response}, not too far from me. Let's get on with your enquiry.`)
            session.endDialogWithResult({ response: session.dialogData.profile});
        } else {
            next();
        }
     },
]);

bot.dialog('enquiry', [
    (session, args, next) => {
        session.dialogData.info = args || {};
        if (!session.dialogData.info.enquiry) {
            builder.Prompts.choice(session, "Please select the closest option", "Why Vaids|Vaids Essentials|Vaids Participation", { listStyle: 3});
        } else {
            next();
        }
    },
    (session, results, next) => {
            // const res = results.response.entity
            // if((results.response.entity).toLowerCase().includes("why")){
            //     session.beginDialog('whyVaids');
            // }
            // else if((results.response.entity).toLowerCase().includes("essentials")){
            //     builder.Prompts.choice(session, "essentials");
            //     //session.beginDialog("vaidsEssentials");
            // }
            // else if((results.response.entity).toLowerCase().includes("participation")){
            //     builder.Prompts.choice(session, "participation");
            //     //session.beginDialog("vaidsParticipation");
            // }
        
        builder.Prompts.text(session, "Ok help me streamline exactly what you want to know");
        builder.Prompts.choice(session, "Please select the closest option", "What is the Voluntary Asset and Income Declaration Scheme?|Why is the Federal Government offering this scheme?|Why is the Federal Government implementing VAIDS now?|Why does government not simply prosecute tax evaders according to the law?", { listStyle: 3});
    },
    (session, results) => {
        builder.Prompts.text(session, "VAIDS is a time-limited opportunity for taxpayers to regularize their tax status relating to previous tax periods. In exchange for fully and honestly declaring previously undisclosed assets and income, tax payers will benefit from forgiveness of overdue interest and penalties, and the assurance that they will not face criminal prosecution for tax offences or be subject to tax investigations. VAIDS ushers in an opportunity to increase the nation’s general tax awareness and compliance."); 
    },   
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);
bot.dialog('whyVaids',[
    (session, args, next) => {
        session.dialogData.info = args || {};
        if (!session.dialogData.info.whyVaids) {
            builder.Prompts.text(session, "Ok help me streamline exactly what you want to know");
            builder.Prompts.choice(session, "Please select the closest option", "What is the Voluntary Asset and Income Declaration Scheme?|Why is the Federal Government offering this scheme?|Why is the Federal Government implementing VAIDS now?|Why does government not simply prosecute tax evaders according to the law?", { listStyle: 3});
       } else {
            next();
        }
    },
    (session, results, next) => {
        if(results.response) {
            builder.Prompts.text(session, `VAIDS is a time-limited opportunity for taxpayers to regularize their tax status relating to previous tax periods. In exchange for fully and honestly declaring previously undisclosed assets and income, tax payers will benefit from forgiveness of overdue interest and penalties, and the assurance that they will not face criminal prosecution for tax offences or be subject to tax investigations. VAIDS ushers in an opportunity to increase the nation’s general tax awareness and compliance.`)
        // builder.Prompts.text(session, ` ${results.response}?`)
        // console.log(results.response)
        // if((results.response).toLowerCase().includes("voluntary")){
        //     session.beginDialog("VolAssetScheme");
         }
}
])
.triggerAction({
    matches: /^why vaids$/i
});

bot.dialog("VolAssetScheme", [
    function(session){
        builder.Prompts.text(session, "VAIDS is a time-limited opportunity for taxpayers to regularize their tax status relating to previous tax periods. In exchange for fully and honestly declaring previously undisclosed assets and income, tax payers will benefit from forgiveness of overdue interest and penalties, and the assurance that they will not face criminal prosecution for tax offences or be subject to tax investigations. VAIDS ushers in an opportunity to increase the nation’s general tax awareness and compliance. ");
    },

])
.triggerAction({
    // The user can request this at any time.
    // Once triggered, it clears the stack and prompts the main menu again.
    matches: /^What is the Voluntary Asset and Income Declaration Scheme?$/i,
});


//create the host to server
const server = restify.createServer();
server.post('/api/messages', connector.listen());

server.listen(
    process.env.PORT || 3000,
    function (){console.log('I am working')}
)