import os
import sys
import json
import random
import subprocess
# Spotify API
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
# Rendering
from pedalboard import Pedalboard, Compressor
from pedals import Distortion, Phaser, Chorus, Bitcrush, Delay, Reverb
from pedalboard.io import AudioFile
from pydub import AudioSegment
from pydub.silence import detect_leading_silence
# Loudness normalization
import soundfile as sf
import pyloudnorm as pyln

# Spotify API credentials
CLIENT_ID = 'CLIENT_ID'
CLIENT_SECRET = 'CLIENT_SECRET'

key_dict = {
    0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F', 6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
}

mode_dict = {
    0: 'Minor', 1: 'Major'
}

def main():
    number = read_input()

    auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
    sp = spotipy.Spotify(auth_manager=auth_manager)
    safe_remove('./MIDIs/.gitkeep')
    genres = os.listdir("./MIDIs")
    safe_remove('./instruments/.gitkeep')
    instruments_types = os.listdir("./instruments")

    os.makedirs('tmp', exist_ok=True)
    os.makedirs('renders', exist_ok=True)

    id = 0
    for i in range(number):
        print(f"{i+1}/{number}")

        data = get_random_song(genres)
        print(f"  Song: {data['song']} by {data['artist']}")
        instrument_type = random.choice(instruments_types)
        instrument = random.choice(os.listdir(f'./instruments/{instrument_type}'))
        data['instrument'] = instrument[:-4] + " " + instrument_type
        print(f"  Instrument: {data['instrument']}")
        render_audio(
            f'./instruments/{instrument_type}/{instrument}',
            f'./MIDIs/{data["genre"]}/{data["specific_genre"]}/{data["artist"]}/{data["song"]}.mid',
            './tmp/render.wav'
        )
        
        track_id = find_on_spotify(sp, data)
        if track_id is None:
            print("  Couldn't find song's metadata on Spotify")
            print()
            continue

        features = get_spotify_features(sp, track_id)
        data.update(features)

        analysis = sp.audio_analysis(track_id)
        audio = AudioSegment.from_wav('./tmp/render.wav')
        print(f"  Separating sections and applying effects...")
        print()
        for section in analysis["sections"]:
            cut_audio = cut_section(audio, section)
            if cut_audio is None:
                continue
            cut_audio = strip_silence(cut_audio)
            if len(cut_audio) < 4 * 1000 or len(cut_audio) > 47 * 1000:
                continue # Too short or too longs
            data['duration'] = len(cut_audio) / 1000

            cut_audio.export('./tmp/render_cut.wav', format='wav')

            data.update({
                'tempo': int(section['tempo']),
                'mode': mode_dict[section['mode']],
            })
            
            if section['key'] != -1:
                data['key'] = key_dict[section['key']]

            board = Pedalboard([Compressor()])
            pedals = get_random_pedals()
            if len(pedals) > 0: data['pedals'] = []
            for pedal in pedals:
                board.append(pedal.get_pedal())
                data['pedals'].append({
                    "name": pedal.__class__.__name__,
                    **pedal.get_params()
                })
            
            save_wav_with_effects(id, board)
            normalize_loudness(id)
            save_metadata(id, data)
            id += 1
    safe_remove('./tmp/render_cut.wav')
    safe_remove('./tmp/render.wav')
    os.rmdir('tmp')

    print("Done!")

def read_input():
    if len(sys.argv) != 2:
        print("Usage: python3 render_songs.py <number_of_songs>")
        sys.exit(1)
    try:
        number = int(sys.argv[1])
        if number <= 0:
            raise ValueError("Number must be positive.")
    except ValueError:
        print("Please provide a valid number.")
        sys.exit(1)
    return number

def safe_remove(file):
    try:
        os.remove(file)
    except OSError:
        pass

def get_random_song(genres):
    # Pick a random song
    general_genre = random.choice(genres)
    specific_genre = random.choice(os.listdir(f"./MIDIs/{general_genre}"))
    artist = random.choice(os.listdir(f"./MIDIs/{general_genre}/{specific_genre}"))
    song = random.choice(os.listdir(f"./MIDIs/{general_genre}/{specific_genre}/{artist}"))
    return {
        'genre': general_genre,
        'specific_genre': specific_genre,
        'artist': artist,
        'song': song[:-4]
    }

def render_audio(instrument_path, midi_path, output_path):
    subprocess.call(['fluidsynth',
                     '-ni', instrument_path, midi_path,
                     '-F', output_path,
                     '-r 44100', # sample rate
                     '-q' # quiet
                     ])

def find_on_spotify(sp, data):
    # Find it on Spotify
    res = sp.search(data['artist'] + " " + data['song'], limit=1, type='track')
    if len(res['tracks']['items']) == 0:
        return None
    return res['tracks']['items'][0]['id']

def get_spotify_features(sp, track_id):
    spotify_features = sp.audio_features([track_id])
    return {
        'danceability': spotify_features[0]['danceability'],
        'energy': spotify_features[0]['energy'],
        # 'instrumentalness': spotify_features[0]['instrumentalness'],
        # 'acousticness': spotify_features[0]['acousticness'],
    }

def cut_section(audio, section):
    start = section['start']*1000
    if (start > len(audio)):
        return None # Could happen if the piano part ends earlier
    
    end = section['start']*1000 + section['duration']*1000
    end = min(end, len(audio))

    return audio[start:end]

def trim_leading_silence(x):
    return x[detect_leading_silence(x) :]

def trim_trailing_silence(x):
    return trim_leading_silence(x.reverse()).reverse()

def strip_silence(x):
    return trim_trailing_silence(trim_leading_silence(x))

def get_random_pedals():
    num_pedals = random.choices([0, 1, 2, 3], weights=[40, 40, 15, 5], k=1)[0]
    pedals = [Distortion(), Phaser(), Chorus(), Bitcrush(), Delay(), Reverb()]
    pedals = random.sample(pedals, num_pedals)
    return sorted(pedals, key=lambda x: x.order)

def save_wav_with_effects(id, board):
    with AudioFile('./tmp/render_cut.wav') as f:
        with AudioFile(f'./renders/{id:04}.wav', 'w', f.samplerate, f.num_channels) as o:
            while f.tell() < f.frames:
                chunk = f.read(f.samplerate)
                effected = board(chunk, f.samplerate, reset=False)
                o.write(effected)

def save_metadata(id, data):
    with open(f'./renders/{id:04}.json', 'w') as json_file:
        json.dump(data, json_file)

def normalize_loudness(id):
    data, rate = sf.read(f'renders/{id:04}.wav')
    meter = pyln.Meter(rate) # create BS.1770 meter
    loudness = meter.integrated_loudness(data)
    loudness_normalized_audio = pyln.normalize.loudness(data, loudness, -12.0)
    sf.write(f'renders/{id:04}.wav', loudness_normalized_audio, rate)

if __name__ == "__main__":
    main()