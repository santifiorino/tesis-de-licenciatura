const AUDIOS_PER_PAGE = 4
let audiosToShow = []
let idToData = {}
let page = 0

let genreToIds = {}
let instrumentToIds = {}
let effectToId = {}

document.getElementById('categoriesList').insertAdjacentHTML('beforeend',sideBarCategoryElement('Genres'))
document.getElementById('categoriesList').insertAdjacentHTML('beforeend', sideBarCategoryElement('Instruments'))
document.getElementById('categoriesList').insertAdjacentHTML('beforeend',sideBarCategoryElement('Effects'))

function sideBarCategoryElement(categoryName) {
    return `
        <div x-data="{ isActive: false, open: false }">
            <a
                @click="$event.preventDefault(); open = !open"
                class="flex items-center p-2 text-zinc-50 font-bold transition-colors rounded-md hover:bg-zinc-600"
                :class="{'bg-zinc-600': isActive || open}"
                role="button"
                aria-haspopup="true"
                :aria-expanded="(open || isActive) ? 'true' : 'false'"
            >
            <span class="ml-2 text-xl"> ${categoryName} </span>
            <span aria-hidden="true" class="ml-auto">
                <svg
                class="w-4 h-4 transition-transform transform"
                :class="{ 'rotate-180': open }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </span>
            </a>
            <div id="${categoryName}List" x-show="open" class="mt-2 space-y-2 px-7" role="menu">
            </div>
        </div>
    `
}

fetch('/audiosMetadata')
    .then(response => response.json())
    .then(files => {
        const audiosMetadata = files.content
        audiosMetadata.forEach(data => {
            addGenre(data)
            addInstrument(data)
            addEffect(data)
            idToData[data.id] = data
        })
    })

function addGenre(data) {
    if (data.genre in genreToIds) {
        genreToIds[data.genre].push(data.id)
        let genreBadge = document.getElementById(data.genre + 'Badge')
        genreBadge.innerText = parseInt(genreBadge.innerText) + 1
    } else {
        genreToIds[data.genre] = [data.id]
        let genresList = document.getElementById('GenresList')
        genresList.insertAdjacentHTML('beforeend', sideBarItemElement("showGenre", data.genre));
    }
}

function addInstrument(data) {
    if (data.instrument in instrumentToIds) {
        instrumentToIds[data.instrument].push(data.id)
        let instrumentBadge = document.getElementById(data.instrument + 'Badge')
        instrumentBadge.innerText = parseInt(instrumentBadge.innerText) + 1
    } else {
        instrumentToIds[data.instrument] = [data.id]
        let instrumentsList = document.getElementById('InstrumentsList')
        instrumentsList.insertAdjacentHTML('beforeend', sideBarItemElement('showInstrument', data.instrument));
    }
}

function addEffect(data) {
    const effects = 'pedals' in data ? data.pedals : [];
    effects.forEach(effect => {
        if (effect.name in effectToId) {
            effectToId[effect.name].push(data.id)
            let effectBadge = document.getElementById(effect.name + 'Badge')
            effectBadge.innerText = parseInt(effectBadge.innerText) + 1
        } else {
            effectToId[effect.name] = [data.id]
            let effectsList = document.getElementById('EffectsList')
            effectsList.insertAdjacentHTML('beforeend', sideBarItemElement('showEffect', effect.name));
        }
    })
}

function sideBarItemElement(functionName, buttonName) {
    return `
        <a
            onclick="${functionName}('${buttonName}')"
            role="menuitem"
            class="block p-2 text-md font-bold text-zinc-50 transition-colors duration-200 rounded-md hover:text-violet-600 select-none hover:cursor-pointer"
        >
            ${buttonName}
            <span id="${buttonName}Badge" class="bg-violet-900 text-zinc-50 text-xs font-bold me-2 ml-2 px-2.5 py-0.5 rounded-xl select-none">
                1
            </span>
        </a>
        `
}

function showGenre(genre) {
    showNewList(genre + " Songs", genreToIds[genre])
}

function showInstrument(instrument) {
    showNewList("Songs played with " + instrument, instrumentToIds[instrument])
}

function showEffect(effect) {
    showNewList("Songs with " + effect, effectToId[effect])
}

function showNewList(newTitle, newList) {
    page = 0
    document.getElementById('prevNextButtons').className = ""
    document.getElementById('mainTitle').innerText = newTitle
    audiosToShow = newList
    updateShowingAudios()
}

function updateShowingAudios(){
    const audiosOnDisplay = document.getElementById('audioList')
    audiosOnDisplay.innerHTML = ""
    const startIndex = page * AUDIOS_PER_PAGE;
    const endIndex = Math.min((page + 1) * AUDIOS_PER_PAGE, audiosToShow.length)
    audiosToShow.slice(startIndex, endIndex).forEach((audioId, index) => {
        showAudio(audioId)
    })
}

function showAudio(audioId) {
    const audioList = document.getElementById('audioList')
    const newItemHTML = idToListElement(audioId);
    audioList.insertAdjacentHTML('beforeend', newItemHTML)
}

function idToListElement(audioId) {
    const data = idToData[audioId]
    const instrumentBadge = `
    <span class="bg-violet-800 text-zinc-50 text-xs font-bold me-2 ml-2 px-2.5 py-0.5 rounded-xl select-none">
    ${data.instrument}
    </span>
    `
    const effects = 'pedals' in data ? data.pedals : [];
    const effectsBadges = effects.map(effect => 
        `<span class="bg-blue-800 text-zinc-50 text-xs font-bold me-2 px-2.5 py-0.5 rounded-xl select-none">
            ${effect.name}
        </span>`
    ).join('');

    const audioPlayer = `
        <audio controls class="flex-shrink-0">
            <source src="/${data.id}.wav" type="audio/wav">
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
                        ${effectsBadges}
                    </p>
                    <p class="mt-1 truncate text-xs font-semibold leading-5 text-zinc-600">${data.artist} | ${data.specific_genre}</p>
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

                <button
                  class="bg-red-500 hover:bg-red-700 text-white font-bold px-4 rounded-full ml-auto border-none outline-none"
                  onclick="deleteAudio('${data.id}')"
                >
                    DELETE
                </button>
            </div>
            
        </li>
    `
}

function changePrompt(event, id, newPrompt) {
    if (event.key === 'Enter') {
        event.target.blur();
        fetch(`/${id}.json`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: newPrompt
            })
          })
          .then(response => console.log(response))
          .catch(error => console.error('Error:', error))
    }
}

function deleteAudio(id){
    document.getElementById(id).remove()
    audiosToShow = audiosToShow.filter(audio => audio !== id)
    fetch(`/${id}.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(
        updateShowingAudios()
    )
    .catch(error => console.error('Error:', error))
}

function previousPage() {
    if (page*AUDIOS_PER_PAGE - AUDIOS_PER_PAGE < 0) return
    page -= 1
    updateShowingAudios()
}

function nextPage() {
    if (page*AUDIOS_PER_PAGE + AUDIOS_PER_PAGE >= audiosToShow.length) return
    page += 1
    updateShowingAudios()
}