# Dataset Creator

## Install Requirements:

1. Install [FFmpeg](https://www.ffmpeg.org/)
2. Install [FluidSynth](https://www.fluidsynth.org/)
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage:

1. Put soundfonts files in /instruments/soundfile.sf2
2. Put MIDI files in /MIDIs/General Genre/Specific Genre/Artist/Song.mid

### TODO
- turn notebook into script with params
- post production:
    - remove leading/trailing silence
    - if X% of the full audio is silence, remove audio
    - ¿normalize volume? ¿maybe just add a compressor to the pedalboard fixes it?