import pandas as pd

data = pd.read_csv('./sales-of-video-games/vgsales.csv')

data_filt = data \
    .dropna(subset=['Year', 'Publisher', 'Global_Sales']) \
    .reset_index(drop=True)

# map the Platform field
platform_map = {
    'Wii': 'Wii',
    'NES': 'Nintendo Entertainment System',
    'GB': 'Game Boy',
    'DS': 'Nintendo DS',
    'X360': 'Xbox 360',
    'PS3': 'PlayStation 3',
    'PS2': 'PlayStation 2',
    'SNES': 'Super Nintendo Entertainment System',
    'GBA': 'Game Boy Advance',
    '3DS': 'Nintendo 3DS',
    'PS4': 'PlayStation 4',
    'N64': 'Nintendo 64',
    'PS': 'PlayStation',
    'XB': 'Xbox',
    '2600': 'Atari 2600',
    'PSP': 'PlayStation Portable',
    'XOne': 'Xbox One',
    'GC': 'GameCube',
    'WiiU': 'Wii U',
    'GEN': 'Sega Genesis',
    'DC': 'Dreamcast',
    'PSV': 'PlayStation Vita',
    'SAT': 'Sega Saturn',
    'SCD': 'Sega CD',
    'WS': 'WonderSwan',
    'NG': 'Neo Geo',
    'TG16': 'TurboGrafx-16',
    '3DO': '3DO Interactive Multiplayer',
    'GG': 'Game Gear',
    'PCFX': 'PC-FX'
}
data_filt.Platform = data_filt.Platform.map(platform_map)

data_filt.to_csv('vgsales_clean_2.csv', index=False)
data_filt.to_json('vgsales_clean_2.json', orient='records')

print('cleaning complete. see csv and json files.')
