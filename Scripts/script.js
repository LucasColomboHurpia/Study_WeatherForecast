const wDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let tableWeekly = $('#weeklyForecast')
let tableDaily = $('#dailyForecast')

onload = function () {
	let long;
	let lat;
	addItemstoTable();
	//checks if user location is enabled
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(position =>{
			long = JSON.stringify(position.coords.longitude) //gets user's longitude
			lat = JSON.stringify(position.coords.latitude) //gets user's latitude
			let apiKeyWeather = 'https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+long+'&appid=9385b8268cca9aab82984c29d70ac185'
			let apiKeyOneCall = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+long+'&appid=9385b8268cca9aab82984c29d70ac185'
			getTemp(apiKeyWeather); //update top row of information
			getWeeklyHourly(apiKeyOneCall); //update tables row of information
			update(apiKeyWeather,apiKeyOneCall); //keeps updating
		})
	} else {alert("Please Enable your location!")}
}

//updates info each N minutes
const update = (apiKeyWeather,apiKeyOneCall) =>{
	let interval = 1000 * 60 * 20 //change this last number to set how many minutes per update
	setInterval(function(){
		getTemp(apiKeyWeather);
		getWeeklyHourly(apiKeyOneCall); }, interval);
}
// api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
//populates table
const addItemstoTable = () => {
	//'populates' the weekly table
	let newItem = '<tr><td>###</td><td>###</td><td>###</td><td>###</td></tr>'
	for(i=0;i<8;i++){tableWeekly.append(newItem)}
	//'populates' the daily table
    newItem = '<tr><td>###</td><td>###</td><td>###</td></tr>'
	for(i=0;i<8;i++){tableDaily.append(newItem)}
}
//gets top table info
const getTemp = (apiKey) =>{
	fetch(apiKey)
	.then(response => response.json())
	.then(data => {
	dt = new Date()
	//sets temperature (kelvin to celsius)
	  $('#currentTemp').html(convertKelvin(data['main']['temp'])+ ' ºC')
	//sets time 
	  $('#dayTime').html(wDay[dt.getDay()])
	//sets climate
	  $('#summary').html(data['weather'][0]['description'])
	//sets city
	  $('#location').html(data['name']+', '+data['sys']['country'])
	//sets cloudiness
	  $('#cloudiness').html('Cloudiness ' + data['clouds']['all'] + '%')
	//sets humidity
	  $('#humidity').html('Humidity '+ data['main']['humidity'] + '%')
	//sets wind
	  $('#wind').html('Wind ' + data['wind']['speed'] + 'm/s')
	//set last updated
	  $('#lastUpdateTime').html(new Date().getHours() +':' + new Date().getMinutes())
	})
	.catch(err => alert(err));
}
//gets bottom tables info
const getWeeklyHourly = (apiKey) =>{
	fetch(apiKey)
	.then(response => response.json())
	.then(data => {
		//weekly//
			for(i=0;i<8;i++){ //fill out entire weekly table
			//get day
			let timeTr = tableWeekly[0].children[0].children[i+1].children[0] //access to weekly column tr
			timeTr.innerHTML = timeConverter(data.daily[i].dt)// on [i+1] pass trough each row
			//get conditions
			let conditions = data.daily[i].weather[0].description
			let conditionTr = tableWeekly[0].children[0].children[i+1].children[1] //access to condition column tr
			conditionTr.innerHTML = conditions
			//get hi and lo
				//lo
				let lowTemp = data.daily[i].temp.min
				let lowTempTr = tableWeekly[0].children[0].children[i+1].children[2] //access to loTemp column tr
				lowTempTr.innerHTML = convertKelvin(lowTemp) + ' ºC'
				//hi
				let hiTemp = data.daily[i].temp.max
				let hiTempTr = tableWeekly[0].children[0].children[i+1].children[3] //access to hiTemp column tr
				hiTempTr.innerHTML = convertKelvin(hiTemp) + ' ºC'
			}
		//dayly//
		for(i=0;i<8;i++){
		//get time
			let timeTr = tableDaily[0].children[0].children[i+1].children[0] //access to Daily column tr
			timeTr.innerHTML = formatUnixTime(data.hourly[i].dt)// on [i+1] pass trough each row
			//get conditions
			let conditions = data.hourly[i].weather[0].description
			let conditionTr = tableDaily[0].children[0].children[i+1].children[1] //access to condition column tr
			conditionTr.innerHTML = conditions
			//temp
			let temp = data.hourly[i].temp
			let tempTr = tableDaily[0].children[0].children[i+1].children[2] //access to loTemp column tr
			tempTr.innerHTML = convertKelvin(temp) + ' ºC'
		}
		setMoodByCondition(formatUnixTime(data.hourly[0].dt));
	})
	.catch(err => console.log(err));
}
//checks if its day or night. Call for functions to change icon and background image
const setMoodByCondition = (x) =>{
	let currentTime = x[0]+x[1]  
	let dayNightVar = 'd' //sets the variable to 'day'. 
	if(currentTime < 18 && currentTime > 6){setIcon(dayNightVar);} //sets day when currentTime is 6am to 18pm
	else{dayNightVar='n'; setIcon(dayNightVar)} //sets the variable to 'night'

//possible conditions:
	///clear sky
	///few clouds
	///scattered clouds
	///broken clouds
	///shower rain
	///rain
	///thunderstorm
	///snow
	///mist
}
//sets icon depending on current conditions
const setIcon = (dayNightVar) =>{
	let icon = $('#weatherICon')
	let condition = $('#summary').html();

	//if dayNightVar is 'd' use the day icons, otherwise use the night icons
	if(condition=='clear sky'){icon.attr('src','http://openweathermap.org/img/wn/01'+dayNightVar+'@2x.png')}
	if(condition=='few clouds'){icon.attr('src','http://openweathermap.org/img/wn/02'+dayNightVar+'@2x.png')}
	if(condition=='scattered clouds'){icon.attr('src','http://openweathermap.org/img/wn/03'+dayNightVar+'@2x.png')}
	if(condition=='broken clouds'){icon.attr('src','http://openweathermap.org/img/wn/04'+dayNightVar+'@2x.png')}
	if(condition=='shower rain'){icon.attr('src','http://openweathermap.org/img/wn/09'+dayNightVar+'@2x.png')}
	if(condition=='rain'){icon.attr('src','http://openweathermap.org/img/wn/10'+dayNightVar+'@2x.png')}
	if(condition=='thunderstorm'){icon.attr('src','http://openweathermap.org/img/wn/11'+dayNightVar+'@2x.png')}
	if(condition=='snow'){icon.attr('src','http://openweathermap.org/img/wn/13'+dayNightVar+'@2x.png')}
	if(condition=='mist'){icon.attr('src','http://openweathermap.org/img/wn/50'+dayNightVar+'@2x.png')}

	setBackground(condition, dayNightVar);
}
//sets backsground depending on current conditions and time of the day
const setBackground = (condition, dayNightVar) =>{
	let newBg
	if(dayNightVar=='d'){ //day backgrounds
		if(condition=='clear sky'){newBg = './Assets/weatherBackground/dayBg/ClearSky.jpg'}
		if(condition=='few clouds'){newBg = './Assets/weatherBackground/dayBg/fewclouds.jpg'}
		if(condition=='scattered clouds'){newBg = './Assets/weatherBackground/dayBg/Clouded.jpg'}
		if(condition=='broken clouds'){newBg = './Assets/weatherBackground/dayBg/veryclouded.jpg'}
		if(condition=='shower rain'){newBg = './Assets/weatherBackground/dayBg/rainyday.jpg'}
		if(condition=='rain'){newBg = './Assets/weatherBackground/dayBg/rainyday.jpg'}
		if(condition=='thunderstorm'){newBg = './Assets/weatherBackground/ThunderstormDayNight.jpg'}
		if(condition=='snow'){newBg = './Assets/weatherBackground/dayBg/snow.jpg'}
		if(condition=='mist'){newBg = './Assets/weatherBackground/dayBg/mists.jpg'}
	}
	else{ //night backgrounds
		if(condition=='clear sky'){newBg = './Assets/weatherBackground/nightBg/clearsky.jpg'}
		if(condition=='few clouds'){newBg = './Assets/weatherBackground/nightBg/fewclouds.jpg'}
		if(condition=='scattered clouds'){newBg = './Assets/weatherBackground/nightBg/clouded.jpg'}
		if(condition=='broken clouds'){newBg = './Assets/weatherBackground/nightBg/veryclouded.jpg'}
		if(condition=='shower rain'){newBg = './Assets/weatherBackground/nightBg/rainy.jpg'}
		if(condition=='rain'){newBg = './Assets/weatherBackground/nightBg/rainy.jpg'}
		if(condition=='thunderstorm'){newBg = './Assets/weatherBackground/ThunderstormDayNight.jpg'}
		if(condition=='snow'){newBg = './Assets/weatherBackground/nightBg/snow.jpg'}
		if(condition=='mist'){newBg = './Assets/weatherBackground/nightBg/mists.jpg'}
	}
	$('#body').css('background-image', 'url('+newBg+')')
}
//converts unix time (for dates)
const timeConverter=(UNIX_timestamp)=>{
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var month = months[a.getMonth()];
	var date = a.getDate();
	var time = month + ' ' + date
	return time;
}
//converts unix time (for time of the day)
const formatUnixTime = (x) =>{
let unix_timestamp = x
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
var date = new Date(unix_timestamp * 1000);
// Hours part from the timestamp
var hours = date.getHours();
// Minutes part from the timestamp
var minutes = "0" + date.getMinutes();
var formatedTime = hours + ':' + minutes.substr(-2)
return formatedTime
}
//converts kelvin to celsius (for time of the day)
const convertKelvin = (x) =>{
	let celcius = Math.round((x)-273)
	return celcius
}
//pops up alert if location is null
const alert = (err) =>{alert("Please Enable your location!"); console.log(err)}