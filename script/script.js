console.log("let's play with javascript");

let currentSong = new Audio();
let songUl;
let currFolder;

//seconds to minute seconds conversion
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){

    currFolder = folder;

    let b = await fetch(`http://127.0.0.1:3000/${currFolder}/`);

    let resposne = await b.text();

    // console.log(resposne);
    let div = document.createElement("div");
    div.innerHTML = resposne;
    let as = div.getElementsByTagName("a");

    songs = [];
    for(let i= 0 ; i<as.length ; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    //show all the songs in the playlist
    songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML="";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `  <li>
        <img class="invert" src="Images/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20"," ")}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="Images/playsong.svg" alt="">
        </div>
    </li>` ;
    }

    //Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click" , element =>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
        
    })

    return songs;
    
}

const playMusic = (track , pause=false)=>{
    
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "Images/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML=decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00.00";
}

async function displayAlbums(){

    let b = await fetch(`http://127.0.0.1:3000/songs/`);

    let resposne = await b.text();

    // console.log(resposne);
    let div = document.createElement("div");
    div.innerHTML = resposne;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        
    
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0];
            
            //get the metadat of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let resposne = await a.json();
            // console.log(resposne);

            cardContainer.innerHTML = cardContainer.innerHTML +`<div data-folder="${folder}" class="card ">
            <div  class="play"><img src="Images/playbtn.svg" alt=""></div>                
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h4>${resposne.title}</h4>
            <p class="p">${resposne.description}</p>
        </div>`
        }
        //Load the playlist whenever card is clicked

        Array.from(document.getElementsByClassName("card")).forEach(e=>{
            // console.log(e);
            e.addEventListener("click" ,async item=>{
                // console.log(item.currentTarget.dataset);
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0]);
                
            })
        })
    }
    
}
async function main(){

    //get the list of all the songs
     await getSongs("songs/ncs");
    // console.log(songs);
    playMusic(songs[0] ,true);

    //Display all the albums on the page
    displayAlbums();

    
    //Attach an envent listner to play , next and previous
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "Images/pause.svg";
        }else{
            currentSong.pause();
            play.src="Images/playsong.svg";
        }
    })

    //Listen for timeupdate event

    currentSong.addEventListener("timeupdate" , ()=>{

        // console.log(currentSong.currentTime ,currentSong.duration );
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left = currentSong.currentTime / currentSong .duration * 100 +"%";

    })

    //Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click" , e=>{
        // console.log(e.offsetX , e.offsetY); 

        let timepercent = e.offsetX / e.target.getBoundingClientRect().width*100 ;

        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width *100)+"%";

        currentSong.currentTime = currentSong.duration * timepercent / 100 ;
    })

    //Add an event listner for hamburger
    
    document.querySelector(".hamburger").addEventListener("click" ,()=>{
        document.querySelector(".left").style.left = 0;
        document.querySelector(".left").style.transition = "all 0.8s ease-out";
    })

    //Add an event listner for close button
    document.querySelector(".close").addEventListener("click" ,()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an event listner to previous and next

    previous.addEventListener("click" , ()=>{
        currentSong.pause()
        // console.log("previous");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]); 
        if(index-1 >= 0)
        playMusic(songs[index-1])
    })

    next.addEventListener("click" , ()=>{
        currentSong.pause()
        // console.log("next");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        // console.log(index);

        if(index+1 < songs.length)
        playMusic(songs[index+1])
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e)=>{
        // console.log("setting value to",e.target.value);
        currentSong.volume =parseInt(e.target.value)/100;
        if(currentSong.volume > 0){
            document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg","volume.svg")
        }
    })

    //Adde event listenr to mute the track
    document.querySelector(".volume img").addEventListener("click",e=>{
        // console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value= 0;
            currentSong.volume=0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value= 0.10;

        }
    })

    document.querySelector(".volume").addEventListener("mouseover" , ()=>{
        document.querySelector(".range").classList.remove("hide");
    })   

    document.querySelector(".volume").addEventListener("mouseout" , ()=>{
        setTimeout(()=>{
            document.querySelector(".range").classList.add("hide");
        },6000)
    }) 
}
main();