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

1. Put soundfonts files in /instruments/soundfile.sf2
2. Put MIDI files in /MIDIs/General Genre/Specific Genre/Artist/Song.mid
3. Put Spotify's API credentials in *render_songs.py*
4. Run script:

```bash
python3 render_songs.py <number_of_songs>
```


#### TODO
- in the 'for each section' loop:
    - if X% of the full audio is silence, don't save it

### Step 2: Generate prompts

1. Download [ollama](https://ollama.com/) and a local LLM