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

#### TODO
- turn notebook into script with params
- in the 'for each section' loop:
    - if X% of the full audio is silence, don't save it
- some post-generation volume normalization among all audio files

### Step 2: Generate prompts

1. Run [ollama](https://ollama.com/) server