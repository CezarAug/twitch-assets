let eventsLimit = 5,
    direction = "top",
    textOrder = "nameFirst",
    audio = '',
    volume = '',
    jokes = [];

let totalEvents = 0;

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) {
      return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        obj.detail.listener = "redemption-latest"
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;
    const bitAmount = 2;

    //TODO: Use the proper addEvent function and handle multiple cheers
    if (listener === 'cheer') {
        if (bitAmount == event.amount) {
            document.getElementById("joke_content").innerHTML = jokes[Math.floor(Math.random()*jokes.length)];  
            document.getElementById("pave_picture").src= 'https://c.tenor.com/HzOKOjVwjSIAAAAC/prassometro-pracometro.gif';
            playAudio(audio, volume);
            setTimeout(hideJoke, 15000);
        }
    }
});

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

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    eventsLimit = fieldData.eventsLimit;
    direction = fieldData.direction;
    textOrder = fieldData.textOrder;
    fadeoutTime = fieldData.fadeoutTime;
    audio = fieldData.defaultSound;
    volume = fieldData.volumeSlider;

    initializeJokes();
});

function initializeJokes() {
    fetch('https://raw.githubusercontent.com/CezarAug/twitch-assets/main/pave/pave.json', {
        method: 'GET'
    }).then((response) => response.json())
        .then((data) => {
            jokes = data.piadasPave;
        });
}


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