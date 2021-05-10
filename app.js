// import MusicbrainzApi from '/musicbrainz-api-master';
 
// const mbApi = new MusicbrainzApi({
//   appName: 'my-app',
//   appVersion: '0.1.0',
//   appContactInfo: 'user@mail.org'
// });

let myLibrary = [];

// const authText = document.getElementById("auth-text");
// const auth = firebase.auth();
// const provider = new firebase.auth.GoogleAuthProvider();



// auth.onAuthStateChanged(user => {
//     if (!user) {
//         auth.signInWithPopup(provider);
//         authText.innerHTML = 'Login unsuccessful. Data is unauthenticated.';
//     } else {
//         authText.innerHTML = `Hi ${user.displayName}! User ID: ${user.uid}`;       
//     }
// });

// const firebase = require("firebase");

const db = firebase.firestore();

let dbRef

function Album(name, artist, year) {
    this.name = name;
    this.artist = artist;
    this.year = year;
}

function addAlbumToLibrary() {
    const name = document.getElementById('name').value;
    const artist = document.getElementById('artist').value;
    const date = document.getElementById('date').value;

    myLibrary[1] = new Album(name, artist, date);

    dbRef = db.collection('albums')
    
    dbRef.add({
        name: name,
        artist: artist,
        date: date
    })
    .then(function(docRef) {
        alert('The album: ' + name)
    });

}

myLibrary[0] = new Album('Hi Viz', 'The Presets', 2018);

// console.log(firebase)


// Functions for musicbrainz API

let artistSuggestion = document.getElementById('artist-datalist');
let albumSuggestion = document.getElementById('album-datalist');
let artistInput = document.getElementById('artist');
let albumInput = document.getElementById('album');
let dateInput = document.getElementById('date');
let option

let json

let i = 0



function reqListener() {
    // console.log(this.responseText)

    let json = JSON.parse(this.responseText)

    let jsonArtists = json["artists"]
    console.log(jsonArtists[0]["name"])
    let bandArtistName = []
    let bandSortName = []

    for (band in jsonArtists) {  
        bandSortName[band] = jsonArtists[band]["name"]
        bandArtistName[band] = jsonArtists[band]["name"]
        console.log('Band Sort = ' + bandSortName[band])
        console.log('Band Artist Name = ' + bandArtistName[band])
    }
    for (i in bandSortName) {
        option = document.createElement('option');
        option.setAttribute('value', bandSortName[i]);
        option.innerHTML = bandArtistName[i];
        console.log(option.innerHTML);
        artistSuggestion.append(option);
    }
}

function albListener() {
    json = JSON.parse(this.responseText)['release-groups']
    console.log(json)

    let albumYear = []
    let albumSortName = []
    let albumArtist = []

    for (album in json) {
        albumSortName[album] = json[album]["title"]
        if (json[album]["first-release-date"] != undefined){
            albumYear[album] = json[album]["first-release-date"].slice(0,4)
        }
        albumArtist[album] = json[album]['artist-credit'][0]["name"]
        console.log('Album Name = ' + albumSortName[album])
        console.log('Release year = ' + albumYear[album])
        console.log('Artist Name = ' + albumArtist[album])
    }

    for (i in albumSortName) {
        let albumValue = albumSortName[i]

        option = document.createElement("option");
        option.setAttribute('value', albumSortName[i]);
        option.innerHTML = albumSortName[i];
        option.addEventListener('click', () => {
            console.log('The click works ' + albumSortName[i])
            albumInput.value = albumValue;
            albumSuggestion.innerHTML = ""
        });
        albumSuggestion.append(option);
    }

}

function change() {
    console.log('change')
}

function artistSearch(text) {
    oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", `https://musicbrainz.org/ws/2/artist/?query=${text}*&limit=5&&fmt=json`)
    oReq.send()
};

function albumSearch(album, artist) {
    // album = album.replace(' ', '%20')
    // artist = artist.replace(' ', '%20')
    console.log("Album = " + album)
    console.log("Artist = " + artist)
    oReq = new XMLHttpRequest();
    oReq.addEventListener("load", albListener);
    oReq.open("GET", `https://musicbrainz.org/ws/2/release-group/?query=releasegroup:${album}*%20AND%20primarytype:album%20AND%20artist:${artist}*&limit=5&&fmt=json`)
    oReq.send()
};



//Text input for artist

let musicBrainzApiReady = 'yes'
let firstKeyStroke = 'no'
let apiTimer
let keyTimer
let text = ''

artistInput.oninput = keystrokeEventArtist
albumInput.oninput = keystrokeEventAlbum

artistInput.onchange = artistSelectOption
albumInput.onchange = albumSelectOption

// artistInput.onclick = artistClickEvent

albumInput.onclick = albumFocusEvent

albumInput.onfocus = function () {
    albumSuggestion.style.display = 'block';
}


function albumListPopulate() {
    let artistInputValue = artistInput.value
    if (artistInputValue == "") artistInputValue = "*"
    albumSuggestion.innerHTML = "";
    console.log("Album search = " + albumInput.value)
    
    albumSearch(albumInput.value, artistInputValue)
}

function artistListPopulate() {
    artistSuggestion.innerHTML = "";
    console.log("Artist search = " + artistInput.value)
    artistSearch(artistInput.value);
}

function reArmApi(inputField, originalText) {
    if (inputField == "artist") {
        musicBrainzApiReady = 'yes';
        console.log(`Original text = ${originalText} | Current text ${artistInput.value}`)
        if (artistInput.value != originalText) artistListPopulate()
    }
    if (inputField == "album"){
        musicBrainzApiReady = 'yes';
        console.log(`Original text = ${originalText} | Current text ${albumInput.value}`)
        if (albumInput.value != originalText) albumListPopulate()
    }
    console.log('Armed')
}

function apiCheck(inputField) {
    if (musicBrainzApiReady == 'yes'){ 
        text = artistInput.value
        if (inputField == "artist") artistListPopulate()
        else if (inputField == "album") albumListPopulate()
        musicBrainzApiReady = 'no'
        apiTimer = setTimeout(reArmApi, 1000, inputField, text)
    } else if (musicBrainzApiReady == 'no') {
        clearTimeout(apiTimer);
        apiTimer = setTimeout(reArmApi, 1000, inputField, text)
    } 
}

function keystrokeEvent(inputField) {
    // console.log("keystroke")
    if (firstKeyStroke == 'no') {
        firstKeyStroke = 'yes'
        keyTimer = setTimeout(apiCheck(inputField), 500)
    } else if (firstKeyStroke == 'yes') {
        clearTimeout(keyTimer);
        keyTimer = setTimeout(apiCheck(inputField), 100)
    }
}

function albumSelectOption() {
    console.log("ALBUMCHANGE")
    albumInput.blur()
    if (json[0]["first-release-date"] == undefined) dateInput.innerHTML = '-'
    else dateInput.value = json[0]["first-release-date"].slice(0,4)
    for (i in json) {
        if (albumInput.value == json[i]["title"]) {
            artistInput.value = json[i]["artist-credit"][0]['name']
            break
        }
    }
}

function artistSelectOption() {
    console.log("ARTISTCHANGE")
    artistInput.blur()
        if (artistInput.value != json[0]["artist-credit"][0]['name'] || artistInput.value == undefined) {
            albumSuggestion.innerHTML = ''
            albumInput.value = ''
            dateInput.value = ''
        }
}

function keystrokeEventAlbum() {
    keystrokeEvent("album")
}

function keystrokeEventArtist() {
    keystrokeEvent("artist")
}

function albumFocusEvent() {
    if (artistInput.value != "") keystrokeEventAlbum()
    console.log("coming through")
}
