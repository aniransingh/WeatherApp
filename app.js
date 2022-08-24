/**
 * todo remove dups from search result
 * todo plant responsive
 * todo sunrise sunset
 * todo autosync
 * todo fix sun position
 * ? weather map
 * ? multi day
 * ? animation
 */

const apiKey = '945f2e42c4d222b963cc21d0a51b7f03'
let limit = 5

const container = document.querySelector('#container')
const weather = document.querySelector('#weather')
const title = document.querySelector('#title')

const city = document.querySelector('#city')
const searchContainer = document.querySelector('#search-container')
const searchBar = document.querySelector('#search-bar')
const search = document.querySelector('#search')
const error = document.querySelector('#error')
const searchResult = document.querySelector('#search-result')
const loading = document.querySelector('#loading')

const displayContainer = document.querySelector('#display-container')

const locale = document.querySelector('#locale')
const time = document.querySelector('#time')
const units = document.querySelector('#units')
const times = document.querySelector('#times')

const weatherVisual = document.querySelector('#weather-visual')
const visualDesc = document.querySelector('#visual-desc')
const temp = document.querySelector('#temp')
const feelsLike = document.querySelector('#feels-like')
const tempHigh = document.querySelector('#temp-high')
const tempLow = document.querySelector('#temp-low')

const details = document.querySelector('#details')
const wind = document.querySelector('#wind')

const sunrise = document.querySelector('#sunrise')
const sunset = document.querySelector('#sunset')
const lineHead = document.querySelector('#line-head')

let unitFormat = {
    standard: { temp: 'K', speed: 'm/s', gust: 'm/s' },
    metric: { temp: '°C', speed: 'm/s', gust: 'm/s' },
    imperial: { temp: '°F', speed: 'mph', gust: 'mph' },
}
let unitSystem = 'metric'

let timeFormat = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

const nightVisual = './assets/night.json'
const sunnyVisual = './assets/sunny.json'
const cloudyNightVisual = './assets/cloudy-night.json'
const partlyCloudyVisual = './assets/partly-cloudy.json'
const rainyNightVisual = './assets/rainy-night.json'
const partlyShowerVisual = './assets/partly-shower.json'
const stormVisual = './assets/storm.json'
const snowNightVisual = './assets/snow-night.json'
const snowSunnyVisual = './assets/snow-sunny.json'
const mistVisual = './assets/mist.json'
const windyVisual = './assets/windy.json'
const foggyVisual = './assets/foggy.json'

const getLocaleTime = (offset) => {
    let d = new Date()
    let utc = d.getTime() + d.getTimezoneOffset() * 60000
    let newTime = new Date(utc + 3600000 * offset)

    return newTime
}

const convertTimestamp = (time) => {
    let d = new Date()
    d.setTime(time * 1000)

    return d
}

const capitalCase = (str) => {
    let strArr = str.split(' ')
    strArr = strArr.map((x) => x.replace(x[0], x[0].toUpperCase()))

    return strArr.join(' ')
}

let previousResult

const displayWeather = (result) => {
    let lat = result.getAttribute('lat')
    let lon = result.getAttribute('lon')
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSystem}`)
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
            title.style.display = 'none'
            searchResult.classList.remove('drop')

            locale.innerHTML = `<span>${result.getAttribute('city')}</span>, ${
                result.getAttribute('state') === 'undefined' ? '' : `${result.getAttribute('state')},`
            } ${result.getAttribute('country')}`

            let offset = res.timezone / 3600
            let localeTime = getLocaleTime(offset)
            if (localeTime.getHours() >= 20 || localeTime.getHours() <= 5) isNight = true
            else isNight = false
            if (isNight) container.setAttribute('data-theme', 'night')
            else container.setAttribute('data-theme', 'light')

            time.innerText = localeTime.toLocaleTimeString('en-US', timeFormat)

            let visual = ''
            switch (res.weather[0].main) {
                case 'Clear':
                    if (isNight) visual = nightVisual
                    else visual = sunnyVisual
                    break
                case 'Clouds':
                    if (isNight) visual = cloudyNightVisual
                    else visual = partlyCloudyVisual
                    break
                case 'Drizzle':
                case 'Rain':
                    if (isNight) visual = rainyNightVisual
                    else visual = partlyShowerVisual
                    break
                case 'Thunderstrom':
                case 'Tornado':
                    visual = stormVisual
                    break
                case 'Snow':
                    if (isNight) visual = snowNightVisual
                    else visual = snowSunnyVisual
                    break
                case 'Mist':
                case 'Smoke':
                case 'Haze':
                case 'Dust':
                case 'Sand':
                case 'Ash':
                    visual = mistVisual
                    break
                case 'Squall':
                    visual = windyVisual
                    break
                case 'Fog':
                    visual = foggyVisual
                    break
            }

            switch (visual) {
                case sunnyVisual:
                case nightVisual:
                    container.style.backgroundImage = 'var(--clear-gradient)'
                    break
                case mistVisual:
                case windyVisual:
                case partlyCloudyVisual:
                case cloudyNightVisual:
                    container.style.backgroundImage = 'var(--clouds-gradient)'
                    break
                case partlyShowerVisual:
                case rainyNightVisual:
                    container.style.backgroundImage = 'var(--rain-gradient)'
                    break
                case stormVisual:
                    container.style.backgroundImage = 'var(--storm-gradient)'
                    break
            }

            weatherVisual.innerHTML = `<lottie-player
                src="${visual}"
                id="lottie-player"
                background="transparent"
                speed="1"
                loop
                autoplay
                ></lottie-player>`
            visualDesc.innerText = capitalCase(res.weather[0].description)
            temp.innerHTML = `${Math.round(res.main.temp)}<span>${unitFormat[unitSystem].temp}</span>`
            feelsLike.innerText = `Feels like ${Math.round(res.main.feels_like)}${unitFormat[unitSystem].temp}`
            tempHigh.innerHTML = `<h1>High</h1><p>${Math.round(res.main.temp_max)}${unitFormat[unitSystem].temp}</p>`
            tempLow.innerHTML = `<h1>Low</h1><p>${Math.round(res.main.temp_min)}${unitFormat[unitSystem].temp}</p>`

            details.innerHTML = `<p><span>Clouds:</span> ${res.clouds.all}%</p> 
                <p><span>Humidity:</span> ${res.main.humidity}%</p>
                <p><span>Visibilty:</span> ${res.visibility} m</p>
                <p><span>Pressure Sea Level:</span> ${res.main.pressure} hPa</p>
                ${res.main.grnd_level ? `<p><span>Pressure Ground Level:</span> ${res.main.grnd_level} hPa</p>` : ''}`

            wind.innerHTML = `<div>
                <p><span>Degree:</span> ${res.wind.deg}°</p>
                    ${res.wind.gust ? `<p><span>Gust:</span> ${res.wind.gust} ${unitFormat[unitSystem].gust}</p>` : ''}
                    <p><span>Speed:</span> ${res.wind.speed} ${unitFormat[unitSystem].speed}</p>
                </div>`

            let sRise = new Date((res.sys.sunrise + res.timezone) * 1000)
            let sSet = new Date((res.sys.sunset + res.timezone) * 1000)

            sunrise.innerText = sRise.toLocaleTimeString('en-US', { ...timeFormat, timeZone: 'UTC' })
            sunset.innerText = sSet.toLocaleTimeString('en-US', { ...timeFormat, timeZone: 'UTC' })

            let val
            let totalDiff = sSet.getUTCHours() - sRise.getUTCHours()
            let diff = localeTime.getHours() - sRise.getUTCHours()
            if (localeTime.getHours() >= 0 && localeTime.getHours() <= sRise.getUTCHours()) {
                val = 0
            } else if (localeTime.getHours() >= sSet.getUTCHours() && localeTime.getHours() <= 24) {
                val = 100
            } else {
                val = (diff / totalDiff) * 100
            }
            lineHead.style.left = `calc(${val}% - 48px)`

            searchContainer.classList.add('active')
            displayContainer.classList.add('reveal')
        })
        .catch(() => alert('weather error'))
}

const geolocate = (cityName) => {
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${apiKey}`)
        .then((res) => res.json())
        .then((res) => {
            if (res.length === 0) {
                error.innerText = 'Invalid input'
                error.classList.remove('hide')
            }

            let country
            res.map((data) => {
                const result = document.createElement('div')
                result.classList.add('result')
                result.setAttribute('lat', `${data.lat}`)
                result.setAttribute('lon', `${data.lon}`)
                result.setAttribute('city', `${data.name}`)
                result.setAttribute('state', `${data.state}`)
                country = regionNames.of(data.country)
                result.setAttribute('country', `${country}`)
                result.innerHTML = `<div>${data.name}, ${
                    data.state === undefined ? '' : `${data.state},`
                } ${country}</div><div><span>${(data.lat).toFixed(2)}</span> <span>${(data.lon).toFixed(2)}</span></div>`

                searchResult.appendChild(result)
            })

            searchResult.classList.add('drop')

            let results = document.querySelectorAll('.result')
            results.forEach((result) => {
                result.addEventListener('click', () => {
                    console.log('click')
                    previousResult = result
                    displayWeather(result)
                })
            })

            console.log(res)
        })
        .catch(() => alert('geo error'))
}

const handleSearch = () => {
    searchResult.innerHTML = ''
    
    if (city.value === '') {
        error.innerText = 'Please enter a city name'
        error.classList.remove('hide')
    } else {
        geolocate(city.value)
    }
}

weather.addEventListener('click', () => {
    searchResult.classList.remove('drop')
})

searchContainer.addEventListener('click', (event) => {
    event.stopPropagation()
})

search.addEventListener('click', handleSearch)
searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSearch()
})

city.addEventListener('input', () => {
    error.innerText = ''
    error.classList.add('hide')

    if (city.value === '') {
        searchResult.classList.remove('drop')
    }
})

units.addEventListener('click', () => {
    if (units.innerText === 'Metric') {
        units.innerText = 'Imperial'
        unitSystem = 'imperial'
    } else if (units.innerText === 'Imperial') {
        units.innerText = 'Standard'
        unitSystem = 'standard'
    } else {
        units.innerText = 'Metric'
        unitSystem = 'metric'
    }

    displayWeather(previousResult)
})

times.addEventListener('click', () => {
    if (times.innerText === '12 Hr') {
        times.innerText = '24 Hr'
        timeFormat.hour12 = false
    } else {
        times.innerText = '12 Hr'
        timeFormat.hour12 = true
    }

    displayWeather(previousResult)
})
