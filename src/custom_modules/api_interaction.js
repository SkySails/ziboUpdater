const fetch = require('node-fetch');

const fs = require('fs');

var DecompressZip = require('decompress-zip')
const DownloadManager = require("electron").remote.require("electron-download-manager")

var api_key = 'AIzaSyBJDnLIa7vFYGOqjKYV7S2lB0GrKyVSIn0';
var folderId = '0B-tdl3VvPeOOYm12Wm80V04wdDQ';
var g_url = "https://www.googleapis.com/drive/v3/files?q='" + folderId + "'+in+parents&fields=files(id%2CmodifiedTime%2Cname%2CwebContentLink%2Csize)&key=" + api_key;

let driveDirectory
let ziboUpdates
window.downloadedUpdates = []
window.allAvailableDownloads = []

// Function that queries the google API for a list of updates.
window.get_updates = function() {
    fetch(g_url, {method: 'get'}).then(function(promise) {
        console.log("Loading...")
        return promise.json();
    }).then(function(json) {
        console.log("Success! List recieved.", json)
        window.driveDirectory = json.files
        removeNonUpdates(window.driveDirectory);
        console.log("Shortened, sorted list:", window.ziboUpdates)


        for (var patch in window.ziboUpdates) {
            var list = window.ziboUpdates
            var patchName = list[patch].name
            var link = list[patch].id
            link = "https://www.googleapis.com/drive/v3/files/" + link + "/?key=AIzaSyBJDnLIa7vFYGOqjKYV7S2lB0GrKyVSIn0&alt=media"
            if (window.zibo_version_number === "Not_installed") {
                buildDlElement(window.ziboUpdates[patch], link);
                var info = {
                    link: link,
                    name: window.ziboUpdates[patch].name
                }
                allAvailableDownloads.push(info)
            } else {
                var installedVersion = window.zibo_version_number.replace(/ /g,"_").replace(/[.]/,"_")
                if (patchName.indexOf(installedVersion) === -1) {
                console.log(window.ziboUpdates[patch].name, window.zibo_version_number.replace(/ /g,"_").replace(/[.]/,"_"))
                buildDlElement(window.ziboUpdates[patch], link);
                var info = {
                    link: link,
                    name: window.ziboUpdates[patch].name
                }
                allAvailableDownloads.push(info)
                } else {
                    break;
                }
            }
            
        }
    
        
    }).catch(function(err) {
        console.log("Oops! That's an error. Maybe no internet access, eh?", err)
    });
}


// Function to filter out non-needed updates from the recieved list.
function removeNonUpdates(list) {
    window.ziboUpdates = list.filter(item=>item.name.includes("B73"));
    window.ziboUpdates = window.ziboUpdates.filter(item=>item.name.includes("3_34"));
}


//Choose unit (Gb/Mb) depending on filesize
function sizeUnit(downloads) {
    var size = downloads.size
    if ((size/100000) < 1024) {
        return(Math.round(size/100000*10)/10 + "Mb")
    } else {
        return(Math.round(size/100000000*10)/100 + "Gb")
    } 
}


// Main constructor for the download list.
function buildDlElement(downloads, bigLink) {
    var name = downloads.name
    var size = sizeUnit(downloads)
    var link = bigLink


    var nameSpan = document.createElement("SPAN")
    nameSpan.appendChild(document.createTextNode(name))
    var nameDiv = document.createElement("DIV")
    nameDiv.appendChild(nameSpan)
    nameDiv.className = "name-table"

    var sizeSpan = document.createElement("SPAN")
    sizeSpan.appendChild(document.createTextNode(size))
    var sizeDiv = document.createElement("DIV")
    sizeDiv.appendChild(sizeSpan)
    sizeDiv.className = "size-table"

    var nameSizeContainerDiv = document.createElement("DIV")
    nameSizeContainerDiv.className = "name-size-container"
    nameSizeContainerDiv.appendChild(nameDiv)
    nameSizeContainerDiv.appendChild(sizeDiv)

    var tdDivContainer = document.createElement("TD")
    tdDivContainer.colSpan = "2";
    tdDivContainer.className =  "progress"
    tdDivContainer.appendChild(nameSizeContainerDiv)

    var buttonElement = document.createElement("BUTTON")
    buttonElement.className = "dl-button"
    buttonElement.innerHTML = "Download"
    buttonElement.setAttribute('ident', downloads.name)
    buttonElement.onclick = function() {downloadSingle(link, downloads.name, [this.parentElement.parentElement])}

    var buttonTd = document.createElement("TD")
    buttonTd.className ="download-table"
    buttonTd.appendChild(buttonElement)


    var trElement = document.createElement("TR")
    trElement.className = "download-entry"
    trElement.appendChild(tdDivContainer)
    trElement.appendChild(buttonTd)
    
    document.getElementById('downloads').children[1].appendChild(trElement) 
}

window.downloadAll = function() {
    var links = []
    for (var object in allAvailableDownloads) {
        links.push(allAvailableDownloads[object].link)
    }
    
    var allElements = document.querySelectorAll('.download-entry')

    for (var index in links) {
        window.downloadSingle(links[index], window.ziboUpdates[index].name)
    }
}



const { ipcRenderer } = require('electron');

//Downloads by bulk not working atm, using multiple singledownloads
window.downloadSingle = function(link, name) {
    if (link) {
        console.error("LINK EXISTS!", link)
    }
    var dlfolder = (document.getElementById('dl-path').innerText)
    var dlName = name;

    let Data = {
        link: link,
        folder: dlfolder,
        path: "/ZU_Downloads",
        customFileName: dlName
    };
    ipcRenderer.send('request-mainprocess-action', Data);
}

//Request to update progress from main
ipcRenderer.on('downloadProgress', function(event, progressObject, fileName) {
    var progress = Math.round(progressObject.progress)
    var progressedItem = fileName
    

    var reverse = function(num, min, max) {
        return (max + min) - num;
    }

    var invertedProgress = reverse(progress, 0, 100)
    var progressElement = document.querySelectorAll('[ident="' +fileName+ '"]')[0].parentElement.parentElement.children[0]
    var w = progressElement.offsetWidth;
    var v = ((invertedProgress * w))/80 
    progressElement.style.backgroundPositionX = -v + "px";

    if (progress > 99) {
        progressElement.children[0].children[0].style.backgroundColor = "rgba(79, 88, 97, 0.6)"
        progressElement.children[0].children[1].style.backgroundColor = "rgba(79, 88, 97, 0.6)"
    }

  });


// App-wide download function. Uses bulk download and is therefore capable of downloading multiple files.
window.download = function (links, fileName) {
    console.log(links)
    var dlPath = (document.getElementById('dl-path').innerText) + "/" + fileName;

    DownloadManager.bulkDownload({
        urls: links,
        downloadFolder: dlPath + "/ZU_Downloads",
        onProgress: (progress, item) => {
            console.log(progress);
            console.log(item.getFilename())
            console.log(item.getTotalBytes())
        }

    }, function (error, finished, errors) {
        if (error) {
            console.log("finished: " + finished);
            console.log("errors: " + errors);
            return;
        }

        console.log("all finished", finished);
        // Make buttons green when done
        for (let element of elements) {
            element.children[0].style = "background:#5d9c7d!important;transition:.2s;"
            element.children[1].style = "background:#5d9c7d!important;transition:.2s;"
        }
    })
}

window.unzipDirectory = function() {
    var dlPath = (document.getElementById('dl-path').innerText) + "/ZU_Downloads";
    var filesArray = fs.readdirSync(dlPath)
    filesArray = filesArray.filter(function(s){ return ~s.indexOf("B73") })

    var compareItems = function(a,b){
        var valueA = a.match(/\d+(?=.zip)/)[0];
        var valueB = b.match(/\d+(?=.zip)/)[0];
        console.log(valueA, valueB);
    
        if (+valueA < +valueB) {
            console.log(b + " is more than " + a);
            return -1;
        } else {
            console.log(a + " is more than " + b);
            return 1;
        }
    };

    window.checkDiff = function(arr1, arr2) {
        var ret = [];
        for(var i in arr1) {   
            if(arr2.indexOf(arr1[i]) > -1){
                ret.push(arr1[i]);
            }
        }
        return ret;
    };

    filesArray = filesArray.sort(compareItems)
    console.log("Sorted list for unzip: ", filesArray)

    var diffNames = []
    for (var object in allAvailableDownloads) {
        diffNames.push(allAvailableDownloads[object].name)
    }

    var rensad = window.checkDiff(filesArray, diffNames)
    console.log(rensad)

    if (!Array.isArray(rensad) || !rensad.length) {
        // array does not exist, is not an array, or is empty
        // ⇒ do not attempt to process array
          console.log("All files extracted or no files in directory.")
          return;
    }

    window.unzipFunction(rensad, dlPath)
    
}


window.unzipFunction = function(list, dlPath) {
    var file = list[0]
    console.log(file)
    if (!Array.isArray(list) || !list.length) {
        // array does not exist, is not an array, or is empty
        // ⇒ do not attempt to process array
          console.log("All files extracted.")
          window.versionCheck()
          return;
    }

    list.shift()
    var remaining = list
    console.log(file)
    
    //progressElement = document.querySelectorAll('[ident="B738X_3_34_rc1.11.zip"]')[0].parentElement.parentElement.children[0]
    
    var progressElement = document.querySelectorAll('[ident="' + file + '"]')[0].parentElement.parentElement.children[0]
    progressElement.className = "progress-blue"
    
    var pathZibo = document.getElementById('zibo-path').innerHTML

    var filePath = dlPath + "/" + file
    var destPath = pathZibo
    var unzipper = new DecompressZip(filePath)

    // Errors
    unzipper.on('error', function(err) {
        console.log("Error!", err);
    });

    // When done
    unzipper.on('extract', function(log) {
        console.log("Finished with extraction.", log);
        progressElement.children[0].children[0].style.backgroundColor = "rgba(88, 183, 224, 0.6)"
        progressElement.children[0].children[1].style.backgroundColor = "rgba(88, 183, 224, 0.6)"
        window.unzipFunction(remaining, dlPath)
    });

    // Progress
    unzipper.on('progress', function(fileIndex, fileCount) {
        var progress = Math.round(((fileIndex + 1)/(fileCount))*100) 
        console.log("Current zip: " + file + "Extracted file: " + (fileIndex + 1) + ' of ' + fileCount + "(" + progress + "%)");

        var reverse = function(num, min, max) {
            return (max + min) - num;
        }

        var invertedProgress = reverse(progress, 0, 100)
        
        var w = progressElement.offsetWidth;
        var v = ((invertedProgress * w))/80 
        progressElement.style.backgroundPositionX = -v + "px";
    });

    // Start extraction
    unzipper.extract({
        path: destPath,
        strip: 1,
        restrict: false
    })

}



// File reader. Used to determine currently installed version by looking for versios in the readme.
window.versionCheck = function() {
    var path = document.getElementById('zibo-path').innerText
    var lastVersion = window.zibo_version_number
    fs.readFile((path+"/README.txt"), function(err, data) {
        if (err) {
            console.error(err);
            console.log("This means that zibo is not installed. Showing all updates.")
            window.zibo_version_number = "Not_installed"
            return; 
        }
        var split = data.toString().slice(data.indexOf("Release note") + 30)
        window.zibo_version_name = split.split(/:(.+)?/)[0];
        window.zibo_version_number = zibo_version_name.split(/\s(\D*)$/)[0];
        console.log(window.zibo_version_name, window.zibo_version_number)
        if ((window.zibo_version_number != lastVersion) && (window.dlPathSetState)) {
            window.clearDownloads()
        }
    })
}

window.clearDownloads = function () {
    var list = document.querySelectorAll(".download-entry")

    for (var i = 0; i < list.length; i++) {
    	list[i].remove()
    }

    allAvailableDownloads = []
    window.versionCheck();
    window.get_updates();
}