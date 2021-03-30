import pandas as pd

data = pd.read_csv('./sales-of-video-games/vgsales.csv')

data_filt = data \
    .dropna(subset=['Year', 'Publisher', 'Global_Sales']) \
    .reset_index(drop=True)

data_filt.to_csv('vgsales_clean.csv')

print('cleaning complete. see vgsales_clean.csv')
