# Dataset Creator

## Install Requirements:

1. Install [FFmpeg](https://www.ffmpeg.org/)
2. Install [FluidSynth](https://www.fluidsynth.org/)
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage:

### Step 1: Generate audios and metadata

1. Put soundfonts files in /Instrument Type/Instrument.sf2
2. Put MIDI files in /MIDIs/General Genre/Specific Genre/Artist/Song.mid
3. Put Spotify's API credentials in *render_songs.py*
4. Run script:

```bash
python3 render_songs.py <number_of_songs>
```

### Step 2: Generate prompts

1. Download [ollama](https://ollama.com/) and Llama 3.1
2. Run script:
```bash
python3 generate_prompts.py
```

### (OPTIONAL) Step 3: Visualize and edit audios

1. Install [Node.js](https://nodejs.org/en/download/package-manager)
2. Run server:
```bash
node gui/server.js
```
3. Visit http://localhost:3000 to listen to the audios by genre, instrument or effects, edit their promps or delete them

<img src="https://i.imgur.com/Iwhown6.png"></img>