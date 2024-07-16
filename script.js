console.log("Hello");

async function getFolders(){
    let f = await fetch("/songs/");
    let response = await f.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let folder = [];

    for(let i=0; i<as.length; i++){
        let curr = as[i];
        if(curr.href.includes("/songs/") && curr.href.endsWith("/")){
            console.log(curr.href)
            folder.push(curr.href.split("/songs/")[1]);
        }
    }
    return folder;
}

async function getSongs(folder) {
    let s = await fetch(`/songs/${folder}`);
    let response = await s.text();
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 1; i < as.length; i++) {
        let curr = as[i];
        if (curr.href.endsWith(".mp3")) {
            songs.push(curr.href);
            // console.log(curr.href)
        }
    }
    return songs;
}

let currsong = new Audio();
let currFolder;

const playMusic = (song, pause = false) => {
    currsong.src = song;
    if (!pause) {
        currsong.play();
        document.querySelector("#play").src = "/Images/PauseSongButton.svg"
    }
    else{
        document.querySelector("#play").src = "/Images/PlaySongButton.svg"
    }
    let temp = song.split(`/${currFolder}`)[1];
    // let songName = temp.replaceAll("%20", " ");
    let songName = decodeURI(temp);
    songName = songName.replaceAll("%2C", "");
    // console.log(temp)
    document.querySelector(".songName").innerHTML = songName;
};

function secondToMin(seconds) {
    if(isNaN(seconds)){
        return "00:00";
    }
    seconds = parseInt(Math.floor(seconds));
    div = Math.floor(seconds / 60);
    rem = Math.floor(seconds % 60);
    return `${div}.${rem}`;
}

async function main() {
    //making default folder and song to play ar first
    let folders = await getFolders();
    currFolder = folders[0];
    let songs = await getSongs(currFolder);
    playMusic(songs[0], true);

    //creating dynamic card using folder count and name and image
    let cardContainer = document.querySelector(".cardContainer");
    for(let folder of folders){
        // console.log(folder);
        let header = folder.replaceAll("%20"," ");
        header = header.slice(0,-1);
        // console.log(header)
        let txtFile = `/songs/${folder}Desc.txt`;
        let desc = await fetch(txtFile);
        desc = await desc.text();
        // console.log(desc)
        let image = `/songs/${folder}Banner.jpg`;
        let i = folders.indexOf(folder);
        cardContainer.innerHTML += ` <div data-folder="${folder}" class="card card${i}">
                                        <img src="${image}" alt="">
                                        <h1>${header}</h1>
                                        <p>${desc}</p>
                                        <div class="play">
                                            <img src="/Images/PlayButtion.svg" alt="">
                                        </div>
                                    </div>`
    }

    // Folder song in library by cliking that folder
    let card = document.querySelectorAll(".card");
    Array.from(document.getElementsByClassName("card")).forEach((e, index)=>{
        e.addEventListener("click", async (item)=>{
            console.log(index)
            songs = await getSongs(`${folders[index]}`)
            currFolder = folders[index];
            // songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0], true);

            let sl = document.querySelector(".songList");
            let ul = sl.getElementsByTagName("ul")[0];
            ul.innerHTML = ""
            for (const i of songs) {
                let temp = i.split(folders[index])[1];
                // let songName = temp.replaceAll("%20", " ");
                let songName = decodeURI(temp);
                songName = songName.replaceAll("%2C", "");
                ul.innerHTML += `<li>
                                    <div class="name">
                                        <img src="/Images/MusicIcon.svg" alt="">
                                        <p>${songName}</p>
                                    </div>
                                    <div class="playicon">
                                        <p>Play Now</p>
                                        <img src="/Images/PlaySongButton.svg" alt="">
                                    </div>
        
                                </li>`;
            }
        
            //play music funcationality from libray song list
            let temp = Array.from(
                document.querySelector(".songList").getElementsByTagName("li")
            );
            temp.forEach((e) => {
                e.addEventListener("click", (elements) => {
                    playMusic(
                        "/songs/" +currFolder+
                        e.querySelector(".name").getElementsByTagName("p")[0].innerHTML
                    );
                    // console.log(e.querySelector(".name").getElementsByTagName("p")[0].innerHTML)
                });
            });


        })
    })
    
    songs = await getSongs(currFolder);
    playMusic(songs[0], true);

    // Add al song name to song libray
    let sl = document.querySelector(".songList");
    let ul = sl.getElementsByTagName("ul")[0];
    for (const i of songs) {
        let temp = i.split(currFolder)[1];
        let songName = decodeURI(temp);
        songName = songName.replaceAll("%2C", "");
        ul.innerHTML += `<li>
                            <div class="name">
                                <img src="/Images/MusicIcon.svg" alt="">
                                <p>${songName}</p>
                            </div>
                            <div class="playicon">
                                <p>Play Now</p>
                                <img src="/Images/PlaySongButton.svg" alt="">
                            </div>

                        </li>`;
    }

    //play music funcationality from libray song list
    let temp = Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    );
    temp.forEach((e) => {
        e.addEventListener("click", (elements) => {
            playMusic(
                "/songs/" +currFolder+
                e.querySelector(".name").getElementsByTagName("p")[0].innerHTML
            );
            // console.log(e.querySelector(".name").getElementsByTagName("p")[0].innerHTML)
        });
    });

    //Play pause music by clicking buttons
    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currsong.paused) {
            play.src = "/Images/PauseSongButton.svg";
            currsong.play();
            // playMusic(currsong.src)
        } else {
            currsong.pause();
            play.src = "/Images/PlaySongButton.svg";
        }
    });

    // get time updata
    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondToMin(
            currsong.currentTime
        )} : ${secondToMin(currsong.duration)}`;
        document.querySelector(".gola").style.left = `${(currsong.currentTime / currsong.duration) * 100
            }%`;
    });

    //add Event Listener to seekbar to control duration to song time
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".gola").style.left = `calc(${percent}% - 7px)`;
        currsong.currentTime = currsong.duration * (percent / 100);
    });

    //Menu bar fuuntionality for mobile device
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100vw";
    });
    document.querySelectorAll(".close")[1].addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100vw";
    });

    document.getElementById("menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0vw";
        document.querySelector(".left").style.width = "80vw";
    });

    //making previous and play funcanlity
    document.querySelector("#prev").addEventListener("click", () => {
        let index = songs.indexOf(currsong.src)
        if(index > 0){
            playMusic(songs[index-1]);
        }
        else{
            playMusic(songs[songs.length-1])
        }
    });

    document.querySelector("#next").addEventListener("click", () => { 
        let index = songs.indexOf(currsong.src)
        if(index < songs.length-1){
            playMusic(songs[index+1]);
        }
        else{
            playMusic(songs[0]);
        }
    });

    // Volume bar function
    document.querySelector(".volbar").addEventListener("click", (e)=>{
        // console.log(e.x/ e.target.getBoundingClientRect().width)
        console.log(e)
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".volgola").style.left = `calc(${percent}% - 5px)`;
        currsong.volume = percent/100;
    })

    document.getElementById("mute").addEventListener("click", ()=>{
        currsong.volume = 0;
        document.querySelector(".volgola").style.left = "0%";
    })
    document.getElementById("unmute").addEventListener("click", ()=>{
        currsong.volume = 1;
        document.querySelector(".volgola").style.left = "100%";
    })

    //auto play after finish one song
    currsong.addEventListener("ended", ()=>{
        let index = songs.indexOf(currsong.src);
        if(index < songs.length-1){
            playMusic(songs[index+1]);
        }
        else{
            playMusic(songs[0], true)
        }
    })
}
main();
