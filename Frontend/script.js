const apiKey = "31a2af07e78647ec40b0a12a520dec5a";

/* ------------------ DARK MODE ------------------ */
const themeToggle = document.getElementById("themeToggle");
const toggleIcon = themeToggle.querySelector(".toggle-icon");

themeToggle.onclick = () => {
    
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")) {
        toggleIcon.textContent = "☀️";
    } else {
        toggleIcon.textContent = "🌙";
    }
};

/* ------------------ SEARCH HISTORY ------------------ */
function loadHistory() {
    const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    history.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.onclick = () => { 
            document.getElementById("cityInput").value = city;
            getWeather();
        };
        list.appendChild(li);
    });
}

function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) history.pop();
        localStorage.setItem("weatherHistory", JSON.stringify(history));
    }

    loadHistory();
}

loadHistory();


/* ------------------ WEATHER SEARCH ------------------ */
async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) return;

    saveHistory(city);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        showWeather(data);
        getForecast(city);
        changeBackground(data.weather[0].main);

    } catch {
        alert("City not found.");
    }
}

/* ------------------ GPS AUTO-LOCATION ------------------ */
function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        const res = await fetch(url);
        const data = await res.json();

        showWeather(data);
        getForecast(data.name);
        changeBackground(data.weather[0].main);
    });
}

/* ------------------ DISPLAY WEATHER ------------------ */
function showWeather(data) {
    document.getElementById("weatherInfo").innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png">
        <p class="temperature">${data.main.temp}°C</p>
        <p>${data.weather[0].main} — ${data.weather[0].description}</p>
        <p>💧Humidity: ${data.main.humidity}%</p>
        <p>💨Wind: ${data.wind.speed} m/s</p>
    `;
}

/* ------------------ IMPROVED 3-DAY FORECAST ------------------ */
async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    // Filter to get midday forecast from each day
    const daily = data.list.filter(f => f.dt_txt.includes("12:00:00"));

    // Only keep first 3 days
    const threeDays = daily.slice(0, 3);

    threeDays.forEach(day => {
        const date = new Date(day.dt_txt);
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const icon = day.weather[0].icon;
        const temp = Math.round(day.main.temp);
        const wind = day.wind.speed;
        const humidity = day.main.humidity;

        forecastDiv.innerHTML += `
            <div class="forecast-day enhanced">
                <p class="day-name">${weekday}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p class="temp-main">${temp}°C</p>
                 <p class="extra">💨 Wind: ${wind} m/s</p>
                <p class="extra">💧 Humidity: ${humidity}%</p>
                
            </div>
            
            
        `;
    });
}

/* ------------------ ANIMATED BACKGROUND ------------------ */
function changeBackground(weather) {
    
    const body = document.body;

    if (weather.includes("Cloud")) {
        body.style.background = "linear-gradient(to bottom, #57d6d4, #f7leec)";

    } 
    else if (weather.includes("Rain")) {
        body.style.background ="linear-gradient(to bottom, #5bc8fb, #80eaff)";
    }
    else if (weather.includes("Clear")) {
        body.style.background =" linear-gradient(to bottom, #f3b07c, #fcd283)";


    }
    else if (weather.includes("Snow")) {
        body.style.background = "linear-gradient(to bottom, #aff2ff, #fff)";

    }
    else {
        body.style.background = "linear-gradient(to bottom, #57d6d4, #71eeec)";
    }
    
}


function createCharts(hours, temps, hums) {
    

    const tempCtx = document.getElementById("tempChart").getContext("2d");
    const humCtx = document.getElementById("humidityChart").getContext("2d");

    // Destroy old charts to avoid duplication
    if (tempChartInstance) tempChartInstance.destroy();
    if (humidityChartInstance) humidityChartInstance.destroy();

    // Temperature chart
    tempChartInstance = new Chart(tempCtx, {
        type: "line",
        data: {
            labels: hours,
            datasets: [{
                label: "Temperature (°C)",
                data: temps,
                borderColor: "#ff5733",
                backgroundColor: "rgba(255,99,71,0.3)",
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });

    // Humidity chart
    humidityChartInstance = new Chart(humCtx, {
        type: "line",
        data: {
            labels: hours,
            datasets: [{
                label: "Humidity (%)",
                data: hums,
                borderColor: "#1e90ff",
                backgroundColor: "rgba(30,144,255,0.3)",
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
    

    
}
