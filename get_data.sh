pip install --upgrade kaggle

if [ -f "/root/.kaggle/kaggle.json" ]
then
    echo "Kaggle config file already exists."
else
    mkdir -p ~/.kaggle
    echo '{"username":"kevinlyons","key":"a632b39ad6d3c00be284cd7e41542e42"}' > ~/.kaggle/kaggle.json
    chmod 600 ~/.kaggle/kaggle.json
fi

if [ -d "./sales-of-video-games/" ]
then
    echo "Directory ./sales-of-video-games/ exists."
else
    echo "Directory ./sales-of-video-games does not exist. Downloading."
    kaggle datasets download -d arslanali4343/sales-of-video-games
    mkdir sales-of-video-games
    unzip sales-of-video-games.zip -d sales-of-video-games/
    rm -f sales-of-video-games.zip
fi
