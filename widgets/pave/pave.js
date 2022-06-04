let eventsLimit = 5,
    userLocale = "en-US",
    includeFollowers = true,
    includeRedemptions = true,
    includeHosts = true,
    minHost = 0,
    includeRaids = true,
    minRaid = 0,
    includeSubs = true,
    includeTips = true,
    minTip = 0,
    includeCheers = true,
    direction = "top",
    textOrder = "nameFirst",
    minCheer = 0,
    audio = '',
    volume = '',
    jokes = [];

let userCurrency,
    totalEvents = 0;

function playAudio(sound, volume) {
    let audio = new Audio(sound);
    audio.volume = volume * .01;
    audio.play();
    return audio.duration;
}

function hideJoke() {
    document.getElementById("joke_content").innerHTML = '';
    document.getElementById("pave_picture").src= '';
}

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) {
      return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        obj.detail.listener = "redemption-latest"
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;

    if (listener === 'host') {
        console.log('host');
    } else if (listener === 'cheer') {
        if (2 == event.amount) {
            /**
             * Puxar imagem do cazalbé (https://c.tenor.com/Q-klpMNKAXMAAAAC/prassometro-pracometro.gif)
             * https://c.tenor.com/HzOKOjVwjSIAAAAC/prassometro-pracometro.gif
             * Puxar lista de piadas e sortear uma
             * 
             * Pave JSON:
             * https://raw.githubusercontent.com/CezarAug/twitch-assets/main/pave/pave.json
             */

            document.getElementById("joke_content").innerHTML = jokes[Math.floor(Math.random()*jokes.length)];  
            document.getElementById("pave_picture").src= 'https://c.tenor.com/HzOKOjVwjSIAAAAC/prassometro-pracometro.gif';
            playAudio(audio, volume);
            setTimeout(hideJoke, 15000);
        }
    }
});

window.addEventListener('onWidgetLoad', function (obj) {
    let recents = obj.detail.recents;
    recents.sort(function (a, b) {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
    userCurrency = obj.detail.currency;
    const fieldData = obj.detail.fieldData;
    eventsLimit = fieldData.eventsLimit;
    includeFollowers = (fieldData.includeFollowers === "yes");
    includeRedemptions = (fieldData.includeRedemptions === "yes");
    includeHosts = (fieldData.includeHosts === "yes");
    minHost = fieldData.minHost;
    includeRaids = (fieldData.includeRaids === "yes");
    minRaid = fieldData.minRaid;
    includeSubs = (fieldData.includeSubs === "yes");
    includeTips = (fieldData.includeTips === "yes");
    minTip = fieldData.minTip;
    includeCheers = (fieldData.includeCheers === "yes");
    minCheer = fieldData.minCheer;
    direction = fieldData.direction;
    userLocale = fieldData.locale;
    textOrder = fieldData.textOrder;
    fadeoutTime = fieldData.fadeoutTime;
    audio = fieldData.defaultSound;
    volume = fieldData.volumeSlider;

    // Initializing Joke list
    fetch('https://raw.githubusercontent.com/CezarAug/twitch-assets/main/pave/pave.json', {
        method: 'GET'
    }).then((response) => response.json())
    //Then with the data from the response in JSON...
    .then((data) => {
        jokes = data.piadasPave;
    });

    // let eventIndex;
    // for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
    //     const event = recents[eventIndex];

    //     if (event.type === 'follower') {
    //         if (includeFollowers) {
    //             addEvent('follower', 'Follower', event.name);
    //         }
    //     } else if (event.type === 'redemption') {
    //         if (includeRedemptions) {
    //             addEvent('redemption', 'Redeemed', event.name);
    //         }
    //     } else if (event.type === 'subscriber') {
    //         if (!includeSubs) continue;
    //         if (event.amount === 'gift') {
    //             addEvent('sub', `Sub gift`, event.name);
    //         } else {
    //             addEvent('sub', `Sub X${event.amount}`, event.name);
    //         }

    //     } else if (event.type === 'host') {
    //         if (includeHosts && minHost <= event.amount) {
    //             addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
    //         }
    //     } else if (event.type === 'cheer') {
    //         if (includeCheers && minCheer <= event.amount) {
    //             addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
    //         }
    //     } else if (event.type === 'tip') {
    //         if (includeTips && minTip <= event.amount) {
    //             if (event.amount === parseInt(event.amount)) {
    //                 addEvent('tip', event.amount.toLocaleString(userLocale, {
    //                     style: 'currency',
    //                     minimumFractionDigits: 0,
    //                     currency: userCurrency.code
    //                 }), event.name);
    //             } else {
    //                 addEvent('tip', event.amount.toLocaleString(userLocale, {
    //                     style: 'currency',
    //                     currency: userCurrency.code
    //                 }), event.name);
    //             }
    //         }
    //     } else if (event.type === 'raid') {
    //         if (includeRaids && minRaid <= event.amount) {
    //             addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
    //         }
    //     }
    // }
});


function addEvent(type, text, username) {
    totalEvents += 1;
    let element;
    if (textOrder === "actionFirst") {
        element = `
    <div class="event-container" id="event-${totalEvents}">
        <div class="backgroundsvg"></div>
        <div class="event-image event-${type}"></div>
        <div class="username-container">${text}</div>
       <div class="details-container">${username}</div>
    </div>`;
    } else {
        element = `
    <div class="event-container" id="event-${totalEvents}">
        <div class="backgroundsvg"></div>
        <div class="event-image event-${type}"></div>
        <div class="username-container">${username}</div>
       <div class="details-container">${text}</div>
    </div>`;
    }
    if (direction === "bottom") {
        $('.main-container').removeClass("fadeOutClass").show().append(element);
    } else {
        $('.main-container').removeClass("fadeOutClass").show().prepend(element);
    }
    if (fadeoutTime !== 999) {
        $('.main-container').addClass("fadeOutClass");
    }
    if (totalEvents > eventsLimit) {
        removeEvent(totalEvents - eventsLimit);
    }
}

function removeEvent(eventId) {
    $(`#event-${eventId}`).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(`#event-${eventId}`).remove();
    });
}