// Retrieve remote BrowserWindow
const {BrowserWindow} = require('electron').remote
const shell = require('electron').shell
let remote = require('electron').remote;
let app = remote.app

function init() {
    // Minimize task
    document.getElementById("minim").addEventListener("click", (e) => {
        var window = BrowserWindow.getFocusedWindow();
        window.minimize();
    });

    // Close app
    document.getElementById("close").addEventListener("click", (e) => {
        var window = BrowserWindow.getFocusedWindow();
        window.close();
    });
};

document.onreadystatechange =  () => {
    if (document.readyState == "complete") {
        init();
        settings_menu();
        setVersionTitle();
    }
};

let donateButton = document.getElementById('donate-button')

donateButton.addEventListener('click', (e) => {
    shell.openExternal("https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WYLGEEY75WQV2&source=url")
})

let appTitle = document.getElementById('title')

appTitle.addEventListener('click', (e) => {
    shell.openExternal("https://forums.x-plane.org/index.php?/forums/topic/138974-b737-800x-zibo-mod-info-installation-download-links/")
})


const ipcRenderer = require('electron').ipcRenderer;

// wait for an updateReady message
ipcRenderer.on('updateReady', function(event, info) {
    // changes the text of the button
    window.update_modal(info)

    var container = document.getElementById('current-version-field');
    container.innerHTML = "New app version!";
    container.style.cursor = "pointer"
    container.onclick = "ipcRenderer.send('quitAndInstall')"
});

window.update_modal = function(info) {
    //////  Update notif  ///////
    var modal = document.getElementById('update-page');

    // Get the <span> element that closes the modal
    //var span = document.getElementsByClassName("close")[0];


    var release_heading = document.getElementById('release-heading');
    release_heading.innerHTML = "Release: " + info.releaseName
    
    var release_notes = document.getElementById('release-notes');
    if ((typeof info.releaseNotes !== 'undefined')) {
        release_notes.innerHTML = info.releaseNotes;
    }
     

    // When the user clicks on the button, open the modal 
    // btn.onclick = function() {
    modal.style.display = "block";
    // }

    // When the user clicks on <span> (x), close the modal
    // span.onclick = function() {
    // modal.style.display = "none";
    // }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }
}




function settings_menu() {
    //////  Settings MENU  ///////
    var modal = document.getElementById('settings-page');

    // Get the button that opens the modal
    var btn = document.getElementById("settings-button");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal 
    btn.onclick = function() {
    modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
    modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }
}

function setVersionTitle() {
    var title = document.getElementById('title').children[0]
    title.innerHTML = title.innerHTML + " " + app.getVersion();
}