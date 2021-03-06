// This module enables the dialog for the browse buttons on the page

let remote = require('electron').remote;
let app = remote.app
let dialog = remote.dialog


let browseZibo = document.getElementById('browse-zibo')
let browseDl = document.getElementById('browse-dl');

let pathZibo = document.getElementById('zibo-path')
let pathDl = document.getElementById('dl-path')
pathDl.innerHTML = app.getPath("downloads")

browseZibo.addEventListener('click', (e) => {
    browseZibo.className = browseZibo.className + " active"

    dialog.showOpenDialog({title: 'Select zibo directory', properties: ['openDirectory']}, (filepath => {
        if (filepath == undefined) {
            browseZibo.className = "browse-button"
            return;
        }
        else {
            pathZibo.innerHTML = filepath
            browseZibo.className = "browse-button"
            window.versionCheck()
        }
        browseZibo.className = "browse-button"
    }))
})

browseDl.addEventListener('click', (e) => {
    browseDl.className = browseDl.className + " active"

    dialog.showOpenDialog({title: 'Select download directory', properties: ['openDirectory']}, (filepath => {
        if (filepath == undefined) {
            window.dlPathSetState = false;
            browseDl.className = "browse-button"
            return;
        }
        else {
            window.dlPathSetState = true;
            pathDl.innerHTML = filepath
            browseZibo.className = "browse-button"
        }
        browseDl.className = "browse-button"
    }))
})