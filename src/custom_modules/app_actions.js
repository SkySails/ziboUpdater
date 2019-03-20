// Retrieve remote BrowserWindow
const {BrowserWindow} = require('electron').remote
const shell = require('electron').shell

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
ipcRenderer.on('updateReady', function(event, text) {
    // changes the text of the button
    var container = document.getElementById('current-version-field');
    container.innerHTML = "New app version!";
    container.style.cursor = "pointer"
    container.onclick = "ipcRenderer.send('quitAndInstall')"
});
