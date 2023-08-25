// the api key
const APIkey = "074b0008c9908e74560eb4ed254c480c";

// get user country search item
function userCountrySearch () {
    const search = 'London';
    const searchQuery = $('.weather-search').val().trim();
    if (searchQuery === '' || searchQuery === undefined) {
        return search;
    }
    return searchQuery;
}

// render the icon associated with this weather condition
async function renderWeatherIcon(iconCode, iconTag) {
    let src = "http://openweathermap.org/img/w/" + iconCode + ".png";
    iconTag.attr('src', src);
}


// get the weather condition of the city from the openweather api
async function getWeaterData(value) {
    let searchQuery = value;
    if (searchQuery == null) searchQuery = userCountrySearch();
    try {
        let res = await $.get(`https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&appid=${APIkey}`);
        res = await $.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${res.coord.lat}&lon=${res.coord.lon}&units=metric&appid=${APIkey}`);
        saveToLocalStorage(searchQuery);
        return res;
    } catch (e) {
        throw new Error('The city name you entered does not exist, else check your connection');
    }
}

async function extractTodayAndFiveDayData(value = null) {
    let now = moment();
    let data = '';
    try {
        data = await getWeaterData(value);
        const relevantData = [];
        let currentDataDate = data.list[0].dt_txt.split(" ")[0];
        let counter = 1;
        for (let i = 0; i < data.list.length; i++) {
            if (counter == 7) break;
            if (now.format('YYYY-MM-DD') === currentDataDate) {
                const thisItem = data.list[i];
                thisItem.dt_txt = now.format('DD/MM/YYYY')
                relevantData.push(thisItem);
                now = moment().add(counter, 'days');
                counter++;
            }
        currentDataDate = data.list[i].dt_txt.split(" ")[0];
        }
        return relevantData
    } catch (e) {
        throw new Error('The city name you entered does not exist, else check your connection');
    }
}

function updateDOMForcastsWithRelData(relData, country = 'nothing') {
    let userCountry = country;
    if (country == 'nothing') userCountry = userCountrySearch();
    // get today DOM objects
    let todaydd = $('#today .dd')
    let todayicon = $('#today .wicon')
    let todaytp = $('#today .tp')
    let todaywd = $('#today .wd')
    let todayhd = $('#today .hd')

    // update today DOM objects with relevant today data
    todaydd.text(`${userCountry} (${relData[0].dt_txt})`);
    todaytp.text(`Temp: ${relData[0].main.temp}\u00B0C`);
    todaywd.text(`Wind: ${relData[0].wind.speed} KPH`);
    todayhd.text(`Humidity: ${relData[0].main.humidity}%`);
    renderWeatherIcon(relData[0].weather[0].icon, todayicon);

    // update 5 forecast information
    for (let i = 0; i < relData.length - 1; i++) {
        todaydd = $('.future')[i].children[0];
        todaydd.textContent = `${relData[i + 1].dt_txt}`;
        todayicon = $(`.wicon${i}`);
        renderWeatherIcon(relData[i + 1].weather[0].icon, todayicon);
        todaytp = $('.future')[i].children[2];
        todaytp.textContent = `Temp: ${relData[i + 1].main.temp}\u00B0C`;
        todaywd =  $('.future')[i].children[3];
        todaywd.textContent = `Wind: ${relData[i + 1].wind.speed} KPH`;
        todayhd =  $('.future')[i].children[4];
        todayhd.textContent = `Humidity: ${relData[i + 1].main.humidity}%`;
    }
}

// store search item to local storage
function saveToLocalStorage(item) {
    let history = [];
    if (localStorage.getItem('history') === null) {
        if (item !== null) {
            history.unshift(item);
            localStorage.setItem('history', JSON.stringify(history));
        }
    }
    else {
        history = JSON.parse(localStorage.getItem('history'));
        localStorage.removeItem('history');
        history.unshift(item);
        history = [...new Set(history)];
        localStorage.setItem('history', JSON.stringify(history));
    }
}

// render history from localstorage 
function renderHistory () {
    let history = localStorage.getItem('history');
    if (history !== null) {
        history = JSON.parse(history);
        $('.histBtns').remove();
        for (let i = 0; i < history.length; i++) {
            $('.dynamicBtns').append(`<button type="button" class="btn btn-primary histBtns">${history[i]}</button>`)
        }
    }
}

// render the user history
renderHistory();


// render relevant data in DOM as this promise resolves
extractTodayAndFiveDayData().then((res) => {
    updateDOMForcastsWithRelData(res);
}).catch((e) => {
    console.log(e);
    alert(e)
});



// attach an event listener to the search button
$('.search-button').click((event) => {
    event.preventDefault();
    extractTodayAndFiveDayData()
    .then((res) => {
        renderHistory();
        updateDOMForcastsWithRelData(res)
    })
    .catch((e) => {
        alert('The city name you entered does not exist, else check your connection');
    })
});


// also attach an event listener to the history buttons
$('.dynamicBtns').click((event) => {
    const targetvalue = event.target.textContent;
    if (targetvalue !== 'Search') extractTodayAndFiveDayData(targetvalue)
    .then((res) => {
        renderHistory();
        updateDOMForcastsWithRelData(res, targetvalue)
    })
    .catch((e) => {
        alert('The city name you entered does not exist, else check your connection');
    });
})