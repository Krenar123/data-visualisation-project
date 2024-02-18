import requests
import csv

def get_access_token(client_id, client_secret):
    url = 'https://accounts.spotify.com/api/token'
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
    }
    response = requests.post(url, headers=headers, data=data)
    return response.json().get('access_token')

def search_artists(country, access_token):
    url = 'https://api.spotify.com/v1/search'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {
        'q': f'genre:albanian',
        'type': 'artist',
        'market': country,
        'limit': 50,
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

def get_top_tracks(artist_id, access_token):
    url = f'https://api.spotify.com/v1/artists/{artist_id}/top-tracks'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'country': 'AL'}
    response = requests.get(url, headers=headers, params=params)
    return response.json().get('tracks', [])

def search_artist_tracks(artist_name, access_token):
    url = 'https://api.spotify.com/v1/search'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {
        'q': f'artist:{artist_name}',
        'type': 'track',
        'limit': 50,
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json().get('tracks', {}).get('items', [])

def get_audio_features(track_id, access_token):
    url = f'https://api.spotify.com/v1/audio-features/{track_id}'
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(url, headers=headers)
    return response.json()

client_id = 'YOUR_CLIENT_ID'
client_secret = 'YOUR_CLIENT_SECRET'

access_token = get_access_token(client_id, client_secret)

country_code = 'AL'
result = search_artists(country_code, access_token)

# Create a CSV file to store the data
# If you like the version created then move it to data folder
csv_file_path = 'albanian_songs_v2.csv'
with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
    fieldnames = ['Artist', 'Artist Popularity', 'Artist Followers', 'Song Name', 'Year', 'Explicit', 'Popularity', 'Valence', 'Loudness', 'Danceability', 'Energy']
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()

    # Going through artists that are fetched
    for artist in result.get('artists', {}).get('items', []):
        artist_name = artist.get('name')
        artist_id = artist.get('id')
        artist_popularity = artist.get('popularity')
        artist_followers = artist.get('followers', {}).get('total')

        # Get artists top tracks - sometimes its not working fine if more than 30 songs are pulled as it pulls some random songs(might be because using not paid version)
        top_tracks = search_artist_tracks(artist_name, access_token)


        # Extract and write the data to the CSV
        for track in top_tracks:
            track_id = track.get('id')
            song_name = track.get('name')
            year = track.get('album', {}).get('release_date', '').split('-')[0]
            explicit = track.get('explicit', False)
            popularity = track.get('popularity', 0)

            # Get audio features -> Danceability, Valence, Loudness, Energy
            audio_features = get_audio_features(track_id, access_token)

            writer.writerow({
                'Artist': artist_name,
                'Artist Popularity': artist_popularity,
                'Artist Followers': artist_followers,
                'Song Name': song_name,
                'Year': year,
                'Explicit': explicit,
                'Popularity': popularity,
                'Valence': audio_features.get('valence', 0),
                'Loudness': audio_features.get('loudness', 0),
                'Danceability': audio_features.get('danceability', 0),
                'Energy': audio_features.get('energy', 0),
            })

print(f'Data has been saved to {csv_file_path}')
