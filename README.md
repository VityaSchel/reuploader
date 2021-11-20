# Автоматический перезалив стримов YouTube

Эта штука следит за тем, стримит ли канал, сама начинает запись и заканчивает, конвертирует и заливает на ютуб как видео.

Как оно работает:

![блок-схема](https://user-images.githubusercontent.com/59040542/142624163-818a17bd-292b-46a0-98ad-4106a5b19629.png)

*важное уточнение: задержку можно настроить*

## Установка

### Способ 1: простой для умных

Если вы выбрали этот способ то вам ничего не нужно объяснять. Делайте пул и переходите к шагу Использование:

```
mkdir ~/reuploader && cd $_
nano .env
nano config.js
```

```
docker run ghcr.io/Vityaschel/reuploader:latest -v $(pwd)/*:/root/
```

### Способ 2: для тех кто не осилил докер и контейнеры

1. Клонируйте репозиторий
```
git clone https://github.com/VityaSchel/reuploader && cd reuploader && npm i
```
2. Установите [nodejs 16+](https://nodejs.org/en/download/), [python 3](https://www.python.org/downloads/), [pip](https://pip.pypa.io/en/stable/installation/), [streamlink **с помощью pip**](https://streamlink.github.io/install.html#pypi-package-and-source-code) и [ffmpeg](https://www.ffmpeg.org/download.html). Все они должны быть доступны из командной строки (добавлены в переменную PATH)
3. Заполните .env файл и по желанию config.js, см. формат ниже (nano — обычный текстовый редактор)
```
nano .env
nano config.js
```

## Использование

Файл .env имеет следующий формат:

```env
CHANNEL_ID=[Id канала YouTube (24 символа, начинается на U)]
TELEGRAM_NOTIFICATION_CHAT_ID=[если youtube api выключен, chat_id в телеграме вас для вашего бота]
TELEGRAM_NOTIFICATION_BOT_TOKEN=[если youtube api выключен, токен bot api телеграма]
CLIENT_ID=[client id приложения в google console developers]
CLIENT_SECRET=[client secret приложения в google console developers]
VISITOR_TOKEN=[значение куки VISITOR_INFO1_LIVE с сайта youtube.com]
```

Если у вас **есть доступ** к YouTube API (см. след пункт), то вы должны прописать CLIENT_ID и CLIENT_SECRET, а TELEGRAM_NOTIFICATION_CHAT_ID и TELEGRAM_NOTIFICATION_BOT_TOKEN необязательные и не будут использоваться.

Если у вас **нет доступа** к YouTube API, создайте бота в телеграме и запишите токен из bot father и ваш chat_id в .env. Если вам вообще ничего не хочется после конвертации, оставьте 4 поля в .env пустыми и поставьте значение `youtubeApiEnabled = null` в config.js

**CHANNEL_ID и VISITOR_TOKEN в .env обязательно нужно заполнить**

Файл config.js имеет следующий формат:

```javascript
export const checksInterval = [ // moscow time, intervals in seconds
  { from: '9:00', to: '15:50', intervals: 60 },
  { from: '15:58', to: '16:03', intervals: 10 },
  { from: '15:50', to: '16:20', intervals: 30 },
]
export const defaultInterval = 60*5
export const youtubeApiEnabled = false
```

Название|Описание|Значения
---|---|---
checksInterval|Интервалы, с которыми в разное время суток будет проверяться канал на наличие стрима. Например, если канал всегда стримит в 16:00 по мск, то вы можете поставить интервал в 10 секунд на проверку в это время, а в остальное время дня раз в 5 минут|Массив объектов `{ from: String, to: String, intervals: Number }`
defaultInterval|Интервал по-умолчанию, если не найдено значение в checksInterval|Число секунд
youtubeApiEnabled|Если true то загружает видео на ютуб, если false отсылает уведомление в телеграм, если значение null, после конвертации ничего не делается|true/false/null

`checksInterval` — проверка идет с первого по последний элемент, проверяется начался ли интервал и не закончился ли он, после нахождения скрипт сразу выходит. То есть более короткие интервалы надо ставить в начале, чтобы скрипт сначала проверил их.

Изменить название и описание загружаемых видео можно в файле /src/upload.js, а текст уведомления в /index.js

После всего проделанного просто запустите скрипт на фоне, например с помощью [process manager 2](https://pm2.keymetrics.io/):

```
pm2 start 'npm start' --name='Stream Reuploader'
```

## YouTube API (необязательно включать)

Если вы хотите автоматически загружать видео на ютуб, вам понадобится доступ к YouTube Data API. Его не так просто получить, потому что нужно заполнить специальную форму и получить одобрение от гугла. **Если вам достаточно просто автоматической записи, то следующие пункты вы можете пропустить, не заполнять CLIENT_ID и CLIENT_SECRET и установить `youtubeApiEnabled = false` в config.js**

1. Перейдите в [Google Developers Console](https://console.cloud.google.com/projectcreate) и создайте проект
2. Зайдите в Library и включите YouTube Data API
3. Зайдите в Credentials -> Create credentials -> OAuth client ID
4. Добавьте https://example.com в список разрешенных редиректов
5. Скопируйте client id и client secret в .env файл
6. Зайдите в OAuth consent screen -> Test users -> ADD USERS и добавьте почту аккаунта, на канал которого будут загружаться ролики
7. Запустите `node src/authorize.js` и следуйте инструкциям после чего скопируйте код авторизации в аргументе https://example.com/?code=[здесь код]&..., ваши токены запишутся в файлы secrets/accessToken и secrets/refreshToken

Теперь вы можете установить `youtubeApiEnabled = true` в config.js, но обратите внимание, что вы можете загрузить до 6 видео в сутки с помощью API, а далее превысите квоту (квота изменяется запросом в гугл по ссылке в форме ниже). Аккуратнее с тестами.

Более того, все загруженные через API видео будут заблокированы с пометкой "Условия и правила", это потому что с 2020 года необходимо ручное одобрение вашего кейса ютубом. Для этого необходимо заполнить форму: [https://support.google.com/youtube/contact/yt_api_form](https://support.google.com/youtube/contact/yt_api_form) запросите периодическое одобрение и заполните все поля. Никаких советов не могу дать, мне самому еще не одобрили. Если не одобрят, то придется загружать все видео вручную.

## Тесты и полезные инструменты

Вы также можете использовать некоторые инструменты в репозитории с cli. Выполните команду: `node src/[название файла] [аргументы через пробел]`

Название файла|Описание|Аргументы
---|---|---
authorize.js|Получить accessToken и refreshToken (второй только если вы даете доступ приложению первый раз, иначе надо запретить доступ вашему приложению через настройки вашего гугл аккаунта)|-
convert.js|Конвертирует .ts файлы, созданные streamlink в .mp4 файлы|1: Путь к файлу .ts (указывается без расширения .ts)
isStreaming.js|Проверяет стримит ли канал с помощью http get screen scrape запроса|1: ID канала (24 символа, начинается на U)
record.js|Записывает стрим|1: ID видео (после /watch?v=) <br></br> 2: Название файла без расширения .ts
refreshAccessToken.js|Обновляет accessToken с помощью refreshToken|-
upload.js|Загружает видео на ютуб|1: Название файла в папке video (указывается без расширения .mp4)
video/fragments/cut.js|Вырезать фрагмент из видео|1: сурс (или строка с ссылкой на видео на ютубе https://youtube.com/watch?v=... или путь к файлу) <br></br> 2: начало в формате 00:00 или 00:00:00 <br></br> 3: конец в том же формате <br></br> 4: имя файла для записи в /src/video/ с расширением

## Важное

- Аккуратнее с трафиком, видео записываются в 720p с фолбеком на 480p и затем на best. Если каким то образом стрим доступен только в 1080p то он будет записываться в full hd, а такие видео весят не мало. Если у вас на сервере не unmetered traffic, то есть смысл вручную записывать стримы и заливать их.
- ctrl+c делает неизвестно что, поэтому просто лучше не нажимайте его во время записи. может однажды я сделаю его обработку и буду передавать в streamlink/ffmpeg чтобы они не портили файлы, а до тех пор просто не трогайте скрипт когда он записывает стрим или конвертирует его в mp4
- .ts файлы не удаляются после конвертации, как и .mp4 файлы
- Если вы хотите использовать мой скрипт для заработка, пожалуйста поставьте звездочку на этот репозиторий или задонатьте любую сумму [https://donate.qiwi.com/payin/vityaschel](https://donate.qiwi.com/payin/vityaschel) (в зависимости от того, что вам проще сделать)