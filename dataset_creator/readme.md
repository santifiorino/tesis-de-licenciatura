# Dataset Creation
For this project, we need a dataset of audio files with prompts describing what’s playing. We will render `.mid` files using various VST instruments and apply different effects to create a collection of `.wav` files. Additionally, we will retrieve metadata for the synthesized tracks using different APIs and combine it into a `.json` file. This file will then be used by an LLM to generate human-readable prompts based on the metadata.

## 1. The MIDI Dataset
We start by using [The Lakh MIDI Dataset v0.1](https://colinraffel.com/projects/lmd/) (specifically, the Clean MIDI subset). This dataset contains 17,257 MIDI files, named after songs and organized in directories by the artist's name. However, it's incomplete for our purposes, as we also need metadata for each track. In the notebook `clean_lakh_dataset.ipynb`, we follow these steps to clean the MIDI dataset and prepare it for rendering:

1. **Removing duplicates:** The original dataset contains many duplicates. To avoid rendering the same song multiple times and to ensure a more diverse `.wav` dataset, we remove the duplicates.
2. **Fetching metadata:** Since we have the artist and song title for each MIDI file, and most are from relatively well-known artists, we can look them up in various databases. We use the LastFM dataset because it provides a list of user-curated tags. These tags are invaluable, as they contain information that’s otherwise impossible to infer from the `.mid` or `.wav` file, such as adjectives describing the sound’s emotional quality, like "melancholic," "warm," or "gentle," as well as the song’s genre. Additionally, we query Spotify's database for musical information such as "key," "mode," "tempo," and other attributes like "acousticness" and "energy." From Spotify, we also retrieve the song's "sections," which we’ll use to split the synthesized `.wav` into smaller segments.
3. **Splitting the MIDI files:** Since each instrument will be synthesized separately, using different instruments, presets, and effects, it's helpful to isolate each instrument track in its own MIDI file. In the original dataset, all tracks are bundled into one file, so we split each MIDI file into separate ones, each corresponding to a different instrument.
4. **Removing corrupt MIDI files and empty directories:** Any corrupt files or empty directories are deleted during the cleaning process.

After processing the original dataset through the notebook, for each folder of MIDI files, we obtain a clean set of `.json` files containing the following information:
```json
{
  "Song": "Here Comes The Sun - Remastered 2009",
  "Artist": "The Beatles",
  "Tags": [
    "sunshine pop",
    "rock",
    "60s",
    ...
  ],
  "duration_ms": 185733,
  "acousticness": 0.0339,
  "energy": 0.54,
  "key": "A",
  "mode": "Major",
  "tempo": 129.177,
  "sections": [
    {
      "start": 0.0,
      "duration": 16.22566,
      "confidence": 1.0,
      "loudness": -23.088,
      "tempo": 129.83,
      "tempo_confidence": 0.518,
      "key": 9,
      "key_confidence": 0.797,
      "mode": 1,
      "mode_confidence": 0.713,
      "time_signature": 3,
      "time_signature_confidence": 0.625
    },
    ...
  ]
}
```

## 2. Rendering the MIDIs