fetch('/filenames')
    .then(response => response.json())
    .then(files => {
        const jsonFiles = files.filter(file => file.endsWith('.json'))
        jsonFiles.forEach(file => {
            fetch(`/renders/${file}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    const id = file.slice(0, -5)

                    addAudio(id, data)
                })
            })
    })

function addAudio(id, data) {
    const audioList = document.getElementById('audioList')
    const newItemHTML = listElementAsHTML(id, data);
    audioList.insertAdjacentHTML('beforeend', newItemHTML);
}

function listElementAsHTML(id, data) {
    const instrumentBadge = `
    <span class="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
    ${data.instrument}
    </span>
    `
    const pedals = data?.pedals || [];
    const pedalBadges = pedals.map(pedal => 
        `<span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            ${pedal.name}
        </span>`
    ).join('');
    
    return `
        <li class="flex flex-col gap-y-4 py-5" id=${id}>
            <div class="flex min-w-0 gap-x-4 items-center">
                <audio controls class="flex-shrink-0">
                    <source src="/renders/${id}.wav" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
                <div class="min-w-0 flex-auto">
                    <p class="text-sm font-semibold leading-6 text-gray-900">
                        ${data.song}
                        ${instrumentBadge}
                        ${pedalBadges}
                    </p>
                    <p class="mt-1 truncate text-xs leading-5 text-gray-500">${data.artist}</p>
                </div>
            </div>

            <div class="flex gap-x-4 mt-2 divide-x">
                <p class="text-sm text-gray-600">${data.tempo} BPM</p>
                <p class="text-sm text-gray-600">${data.key} ${data.mode}</p>

                <p class="text-sm text-gray-600">Energy:</p>
                <div class="w-40 bg-gray-200 rounded-full h-3.5 mb-4 dark:bg-gray-700">
                    <div class="bg-green-600 h-3.5 rounded-full dark:bg-green-500" style="width: ${Math.round(parseFloat(data.energy) / 1 * 100)}%"></div>
                </div>

                <p class="text-sm text-gray-600">Danceability:</p>
                <div class="w-40 bg-gray-200 rounded-full h-3.5 mb-4 dark:bg-gray-700">
                    <div class="bg-green-600 h-3.5 rounded-full dark:bg-green-500" style="width: ${Math.round(parseFloat(data.danceability) / 1 * 100)}%"></div>
                </div>
            </div>
            
        </li>
    `;
}



function deleteAudio(id){
    document.getElementById(id).remove()
    // TODO: Actually remove it from server (DELETE to /renders/id)
}
