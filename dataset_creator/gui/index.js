const AUDIOS_PER_PAGE = 4
let page = 0
let instruments = {}
let genres = {}

fetch('/filenames')
    .then(response => response.json())
    .then(files => {
        const jsonFiles = files.filter(file => file.endsWith('.json'))
        jsonFiles.forEach(file => {
            const id = file.slice(0, -5)
            fetch(`/renders/${file}`)
                .then(response => response.json())
                .then(data => {
                    data.id = id
                    addGenre(data)
                    addInstrument(data)
                })
            })
    })

function addGenre(data) {
    if (data.genre in genres) {
        genres[data.genre].push(data.id)
        let genreBadge = document.getElementById(data.genre + 'Badge')
        genreBadge.innerText = parseInt(genreBadge.innerText) + 1
    } else {
        genres[data.genre] = [data.id]
        let genresList = document.getElementById('genresList')
        const newGenreButton = `
            <a
                onclick="showGenre('${data.genre}')"
                role="menuitem"
                class="block p-2 text-md font-bold text-zinc-50 transition-colors duration-200 rounded-md hover:text-violet-600 select-none"
            >
                ${data.genre}
                <span id="${data.genre}Badge" class="bg-violet-900 text-zinc-50 text-xs font-bold me-2 ml-2 px-2.5 py-0.5 rounded-xl select-none">
                    0
                </span>
            </a>
        `
        genresList.insertAdjacentHTML('beforeend', newGenreButton);
    }
}

function addInstrument(data) {
    if (data.instrument in instruments) {
        instruments[data.instrument].push(data.id)
        let instrumentBadge = document.getElementById(data.instrument + 'Badge')
        instrumentBadge.innerText = parseInt(instrumentBadge.innerText) + 1
    } else {
        instruments[data.instrument] = [data.id]
        let instrumentsList = document.getElementById('instrumentsList')
        const newInstrumentButton = `
            <a
                onclick="showInstrument('${data.instrument}')"
                role="menuitem"
                class="block p-2 text-md font-bold text-zinc-50 transition-colors duration-200 rounded-md hover:text-violet-600 select-none hover:cursor-pointer"
            >
                ${data.instrument}
                <span id="${data.instrument}Badge" class="bg-violet-900 text-zinc-50 text-xs font-bold me-2 ml-2 px-2.5 py-0.5 rounded-xl select-none">
                    0
                </span>
            </a>
        `
        instrumentsList.insertAdjacentHTML('beforeend', newInstrumentButton);
    }
}

function showGenre(genre) {
    document.getElementById('mainTitle').innerText = genre + " Songs"
    const audioList = document.getElementById('audioList')
    audioList.innerHTML = ""
    showAudios(genres[genre])
}

function showInstrument(instrument) {
    document.getElementById('mainTitle').innerText = instrument + " Songs"
    const audioList = document.getElementById('audioList')
    audioList.innerHTML = ""
    showAudios(instruments[instrument])
}

function showAudios(audioIdList) {
    const startIndex = page * AUDIOS_PER_PAGE;
    const endIndex = Math.min((page + 1) * AUDIOS_PER_PAGE, audioIdList.length)
    audioIdList.slice(startIndex, endIndex).forEach((audioId, index) => {
        showAudio(audioId)
    })
}

function showAudio(id) {
    fetch(`/renders/${id}.json`)
        .then(response => response.json())
        .then(data => {
            data.id = id
            const audioList = document.getElementById('audioList')
            const newItemHTML = audioToListElement(data);
            audioList.insertAdjacentHTML('beforeend', newItemHTML)
        })
}



function audioToListElement(data) {
    const instrumentBadge = `
    <span class="bg-violet-900 text-zinc-50 text-xs font-bold me-2 ml-2 px-2.5 py-0.5 rounded-xl select-none">
    ${data.instrument}
    </span>
    `
    const pedals = 'pedals' in data ? data.pedals : [];
    const pedalBadges = pedals.map(pedal => 
        `<span class="bg-blue-800 text-zinc-50 text-xs font-bold me-2 px-2.5 py-0.5 rounded-xl select-none">
            ${pedal.name}
        </span>`
    ).join('');

    const audioPlayer = `
        <audio controls class="flex-shrink-0 w-128">
            <source src="/renders/${data.id}.wav" type="audio/wav">
            Your browser does not support the audio element.
        </audio>
    `

    const prompt = 'prompt' in data ? data.prompt : ''

    return `
        <li class="flex flex-col gap-y-2 py-5" id=${data.id}>
            <div class="mb-2">
                <input type="text" class="w-full p-2 bg-zinc-800 text-zinc-100 rounded-lg"
                value="${prompt}"
                onkeydown="changePrompt(event, '${data.id}', this.value)">
            </div>
            
            <div class="flex min-w-0 gap-x-4 items-center">
                ${audioPlayer}
                <div class="min-w-0 flex-auto">
                    <p class="text-md font-black leading-6 text-zinc-50">
                        ${data.song}
                        ${instrumentBadge}
                        ${pedalBadges}
                    </p>
                    <p class="mt-1 truncate text-xs font-semibold leading-5 text-zinc-600">${data.artist}</p>
                </div>
            </div>

            <div class="flex gap-x-4 divide-x">
                <p class="text-xl font-bold text-zinc-50">${data.tempo} BPM</p>
                <p class="text-xl font-bold text-zinc-50 pl-4">${data.key} ${data.mode}</p>

                <p class="text-xl font-bold text-zinc-50 pl-4">Energy:</p>
                <div class="w-32 bg-zinc-900 outline outline-zinc-50 rounded-full h-4 mt-2">
                    <div class="bg-green-500 h-4 rounded-full" style="width: ${Math.round(parseFloat(data.energy) / 1 * 100)}%"></div>
                </div>

                <p class="text-xl font-bold text-zinc-50 pl-4">Danceability:</p>
                <div class="w-32 bg-zinc-900 outline outline-zinc-50 rounded-full h-4 mt-2">
                    <div class="bg-green-500 h-4 rounded-full" style="width: ${Math.round(parseFloat(data.danceability) / 1 * 100)}%"></div>
                </div>
            </div>
            
        </li>
    `;
}

function changePrompt(event, id, newPrompt) {
    if (event.key === 'Enter') {
        event.target.blur();
        fetch(`/renders/${id}.json`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: newPrompt
            })
          })
          .then(response => console.log(response))
          .catch(error => console.error('Error:', error));
    }
}

function deleteAudio(id){
    document.getElementById(id).remove()
    // TODO: Actually remove it from server (DELETE to /renders/id)
}

function nextPage() {
    console.log("next page")
    page += 1
}