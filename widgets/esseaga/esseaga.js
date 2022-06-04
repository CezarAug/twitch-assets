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
    audio = ''
	voulme = '';

let userCurrency,
    totalEvents = 0;



function hideEsseaga() {
	  $('#esseaga_container').addClass("invisible");
}

function gracefullyHideEsseaga() {
  console.log('some');
  $('#esseaga_container').addClass("animate__flipOutY");
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

  	let streamerData = {
        displayName: '',
        profile_image_url: '',
        id: '',
        gameName: ''
    }
  
    if (listener === 'message') {
        //console.log(getClientId());
        //console.log(getTwitchToken());
      	//console.log('Mensagem recebida');
      	//console.log(event.data);
      
      	if (event.data.nick === 'StreamElements') return;
      
    	// Filtrar cargo, filtrar comando
      	const cargo = event.data.badges.filter(function(badge) {
            return badge.type === 'broadcaster' ||
              badge.type === 'moderator'
          }).length;
      
      	if (cargo <= 0) {
          return;
        }
      
      	const command = '!esseaga ';
      
        if (event.data.text.startsWith(command)) {
          
          const streamerName = event.data.text.replace(command, '').replace('@', '');
          $('#esseaga_container').removeClass("animate__flipOutY");
          $('#profile_picture').removeClass("animate__flipInY");
          //console.log('hora do esseaga ' + streamerName);
          	// Buscar dados na TwitchAPI
      
          
          fetch('https://api.twitch.tv/helix/users?login='+streamerName, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + getTwitchToken(),
              'Client-Id': getClientId()
            }
          })
          .then((response) => response.json())
          //Then with the data from the response in JSON...
          .then((data) => {
            streamerData.displayName = data.data[0].display_name;
            streamerData.profile_image_url = data.data[0].profile_image_url;
            streamerData.id = data.data[0].id;            
            //console.log('Success:', data);
            //console.log(streamerData);
            
            fetch('https://api.twitch.tv/helix/channels?broadcaster_id='+streamerData.id, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + getTwitchToken(),
              'Client-Id': getClientId()
              }
            }).then((response) => response.json())
            //Then with the data from the response in JSON...
            .then((data) => {
				console.log('Channel data:', data);
				streamerData.gameName = data.data[0].game_name;


                console.log('Dados do esseaga: ');
                console.log(streamerData);
                // Exibir a recomendacao
                
                console.log(document.getElementById("profile_picture"));
                console.log(streamerData.displayName);
                
                console.log(streamerData);
                console.log(Object.getOwnPropertyNames(streamerData));
                
                
                document.getElementById("profile_picture").src= streamerData.profile_image_url;          
                document.getElementById("streamer_name").innerHTML= streamerData.displayName;
                document.getElementById("game_name").innerHTML= streamerData.gameName;
              	$('#esseaga_container').removeClass("invisible");
              	$('#profile_picture').addClass("animate__flipInY");
            	
              	setTimeout(gracefullyHideEsseaga, 10000);
              	setTimeout(hideEsseaga, 11000);              
            })
            //Then with the error genereted...
            .catch((error) => {
              console.error('Error:', error);
              return;
            });
          })
          //Then with the error genereted...
          .catch((error) => {
            console.error('Error:', error);
            return;
          });
          
         
          
          
        }
        return;
    }
  	if (listener === 'follower') {
        if (includeFollowers) {
            addEvent('follower', 'Follower', event.name);
        }
    } else if (listener === 'redemption') {
        if (includeRedemptions) {
            addEvent('redemption', 'Redeemed', event.name);
        }
    } else if (listener === 'subscriber') {
        if (includeSubs) {
            if (event.gifted) {
                addEvent('sub', `Sub gift`, event.name);
            } else {
                addEvent('sub', `Sub X${event.amount}`, event.name);
            }
        }
    } else if (listener === 'host') {
        if (includeHosts && minHost <= event.amount) {
            addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
        }
    } else if (listener === 'cheer') {
      
        console.log('antes');
          console.log('audio');
         // console.log(audio);
          console.log('volume');
          console.log(volume);
          //Teste testoso
          playAudio(audio, volume);
          console.log('depois')
          
        if (includeCheers && minCheer <= event.amount) {
            addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
        }
    } else if (listener === 'tip') {
        if (includeTips && minTip <= event.amount) {
            if (event.amount === parseInt(event.amount)) {
                addEvent('tip', event.amount.toLocaleString(userLocale, {
                    style: 'currency',
                    minimumFractionDigits: 0,
                    currency: userCurrency.code
                }), event.name);
            } else {
                addEvent('tip', event.amount.toLocaleString(userLocale, {
                    style: 'currency',
                    currency: userCurrency.code
                }), event.name);
            }
        }
    } else if (listener === 'raid') {
        if (includeRaids && minRaid <= event.amount) {
            addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
        }
    }
});

function playAudio(sound, volume) {
    let audio = new Audio(sound);
    audio.volume = volume * .01;
    audio.play();
    return audio.duration;
}



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

  	console.log('audio aqui');
    console.log(audio);
  
    let eventIndex;
    for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
        const event = recents[eventIndex];

        if (event.type === 'follower') {
            if (includeFollowers) {
                addEvent('follower', 'Follower', event.name);
            }
        } else if (event.type === 'redemption') {
            if (includeRedemptions) {
                addEvent('redemption', 'Redeemed', event.name);
            }
        } else if (event.type === 'subscriber') {
            if (!includeSubs) continue;
            if (event.amount === 'gift') {
                addEvent('sub', `Sub gift`, event.name);
            } else {
                addEvent('sub', `Sub X${event.amount}`, event.name);
            }

        } else if (event.type === 'host') {
            if (includeHosts && minHost <= event.amount) {
                addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
            }
        } else if (event.type === 'cheer') {
            if (includeCheers && minCheer <= event.amount) {
                addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
            }
        } else if (event.type === 'tip') {
            if (includeTips && minTip <= event.amount) {
                if (event.amount === parseInt(event.amount)) {
                    addEvent('tip', event.amount.toLocaleString(userLocale, {
                        style: 'currency',
                        minimumFractionDigits: 0,
                        currency: userCurrency.code
                    }), event.name);
                } else {
                    addEvent('tip', event.amount.toLocaleString(userLocale, {
                        style: 'currency',
                        currency: userCurrency.code
                    }), event.name);
                }
            }
        } else if (event.type === 'raid') {
            if (includeRaids && minRaid <= event.amount) {
                addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
            }
        }
    }
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




/**

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⠟⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠻⣿⣷⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣶⣿⡆⠀⠀⠉⠉⠀⠈⣶⡆⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⢻⣷⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡿⠟⠀⠀⠀⠀⠀⠀⠀⣸⣿⡄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣷
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⢰⣾⣿⠏
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣧⡔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠟⠁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
Ah shit, here we go again.














*/





function getClientId() {
	return 'clientId-tobefetchfromfielddata';
}


function getTwitchToken() {
	return 'token-tobefetchfromfielddata';
}
