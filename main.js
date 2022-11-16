const button = document.querySelector('#nav-logo');
const content = document.querySelector("#content");

const imgSourceLarge = "https://image.tmdb.org/t/p/original";
const imgSourceSmall = "https://image.tmdb.org/t/p/w500"

const navSolidElem = document.querySelector('#nav-solid-wrapper');
const navShadedElem = document.querySelector('#nav-shade-wrapper');
const navBarElem = document.querySelector('#topNav');

let globalViewHeight = window.innerHeight;
let globalCardCount; //number of cards to be placed in container
let globalScrollPosition;

let webData = {
    createTemp: function(id, arr){
        this[id] = {};
        arr.forEach(i => {
            const key = Object.keys(i);
            this[id][key[0]] = i[key[0]];
        })
        this.temp.push(id)
      },
    trendingShows: {//trending shows
        url: 'https://truth-spice-eater.glitch.me/tmdb/trending/tv/week!api_key=KEY',
        title: "Trending shows",
        cardIndex: 0,
        objEndpoint: "results",
        jsonData: {}
    },
    trendingMovies: {
        url: 'https://truth-spice-eater.glitch.me/tmdb/trending/movie/week!api_key=KEY',
        title: "Trending movies",
        cardIndex: 0,
        objEndpoint: "results",
        jsonData: {}
      },
      tvgenre: {
        url: "https://truth-spice-eater.glitch.me/tmdb/genre/tv/list!api_key=KEY&language=en-US",
        title: "Genres",
        mediaType: "tv",
        cardIndex: 0,
        objEndpoint: "genres",
        jsonData: {}
      },
      topRatedTV: {
        url: "https://truth-spice-eater.glitch.me/tmdb/tv/top_rated!api_key=KEY&language=en-US&page=1",
        title: "Top rated shows",
        cardIndex: 0,
        objEndpoint: "results",
        jsonData: {}
      },
      moviegenre: {
        url: "https://truth-spice-eater.glitch.me/tmdb/genre/movie/list!api_key=KEY&language=en-US",
        title: "Genres",
        mediaType: "movie",
        cardIndex: 0,
        objEndpoint: "genres",
        jsonData: {}
      },
      topRatedMovies: {
        url: "https://truth-spice-eater.glitch.me/tmdb/movie/top_rated!api_key=KEY&language=en-US&page=1",
        title: "Top rated movies",
        cardIndex: 0,
        objEndpoint: "results",
        jsonData: {}
      },
      searchResults: {
        objEndpoint: "results",
        searchTerm: "",
        parameter: "",
        jsonData: {results: []}
      },
      myStuff: {
        title: "My saved content",
        objEndpoint: "results",
        cardIndex: 0,
        jsonData: {results: []}
      },
      temp: []
}
//local  / stuff;
function handleStuffStorage(data, exists){//add or remove data from local storage
    const key = data.id;
    if(exists){//returns false if item is already in local storage
        localStorage.removeItem(key);
        handleStuffIndex(key, exists);
        return false;
    }
    else {//if item is not in storage
        localStorage.setItem(key, JSON.stringify(data));
        handleStuffIndex(key, exists);
        return true;
    }
}
function handleStuffIndex(key, add){//add remove data from index of keys and updates webdata
    const indexKey = "stuff"
    if(!localStorage.getItem(indexKey)){
        localStorage.setItem(indexKey, JSON.stringify({index: []})); 
    }
    const indexArr = retrieveStuff(indexKey).index;
    if(!add){
        indexArr.push(key);
    }
    if(add){
        indexArr.splice(indexArr.indexOf(key) ,1);
    }
    localStorage.setItem(indexKey, JSON.stringify({index: indexArr})); 
    webData.myStuff.jsonData.results = indexArr.map(key => retrieveStuff(key));
}
function retrieveStuff(key){// retrieves and converts from json
    const response = localStorage.getItem(key);
    if(!response){
        return ""
    }
    else return JSON.parse(response);
}
function handleStuff(buttonElem, data){
    const dataExists = retrieveStuff(data.id) === "" ? false: true;
    handleStuffStorage(data, dataExists);
    if(dataExists){//change add button 
        buttonElem.target.classList.add("add");
        buttonElem.target.classList.remove("remove");
    }
    else{
        buttonElem.target.classList.remove("add");
        buttonElem.target.classList.add("remove");
    }
    if(document.querySelector(".text-button.active").textContent === "My Stuff"){
        const stuffWrapper =  document.querySelector(".stuff-content");
        if(webData.myStuff.jsonData.results.length === 0){
            return stuffWrapper.textContent = "You have no saved shows"
        }
        const newStuff= createCardImages(webData.myStuff.jsonData.results, "poster_path","myStuff", 0, webData.myStuff.jsonData.results.length)
        appendContent(newStuff, stuffWrapper, true);
    }
}
function clearAllStuff(){
    document.querySelector(".stuff-content").innerHTML = "You have no saved shows";
    webData.myStuff.jsonData.results = [];
    localStorage.clear();
}
//search page
function clearSearch(){
    document.querySelector(".search-bar").value = "";
    document.querySelector(".search-text").textContent = "";
}
function displaySearch(){
    document.querySelector(".search-text").textContent = `for "${document.querySelector(".search-bar").value}"`
}
function handleAdvancedSearch(){
    document.querySelector(".add-remove").classList.toggle("add");
    document.querySelector(".search-options").classList.toggle("active");
}
function handleInlineImage(title, obj, wrapper){
    if(obj.poster_path === null || obj.profile_path === null){
        wrapper.classList.add("nullImg")
        return wrapper.textContent = title;
    }
    else{
        console.log(obj)
        const imagePath = obj.media_type == "person" ? "profile_path" : "poster_path";
        const img = createElementFunc("img", ["cardImage"]);
        img.src = `https://image.tmdb.org/t/p/w300${obj[imagePath]}`;
        img.alt = `an image for ${title}`;
        wrapper.append(img);
    }
}
function createInlineCard(id, index, obj, handleImg){
    const nameKey = obj.media_type == "movie" ? "title" : "name";
    const wrapper = createElementFunc("div", ["inline-wrapper"]);
    if(obj.media_type != "person"){
        wrapper.addEventListener("click", handleFocusBanner);
    }
    wrapper.dataset.id = `${id}_${index}`;
    wrapper.innerHTML = `
        <span class="card-image-wrapper flex-center"></span>
        <span class="card-title">${obj[nameKey]}</span>
        <span class="card-type">${obj.media_type}</span>
    `
    handleImg(obj[nameKey], obj, wrapper.querySelector(".card-image-wrapper"));
    return wrapper;
}
function appendSearch(elemConstructor, start, end, wrapper, purge){//createInlineCard(id, index, obj, handleImg)
    if(purge){
        wrapper.innerHTML = "";
    }
    if(!webData.searchResults.jsonData.results || webData.searchResults.jsonData.results.length == 0){
        return wrapper.textContent = "0 results OR improper search term";
    }
    let elemArr = [];
    for(let i=start; i <end; i++){
        let obj = webData.searchResults.jsonData.results[i];
        elemArr.push(elemConstructor("searchResults", i, obj, handleInlineImage));
    }
    appendContent(elemArr, wrapper, false);
}
function handleSearch(){
    const searchValue = document.querySelector(".search-bar").value;
    const searchParameter = document.querySelector('input[name="search-type"]:checked').value;
    if((searchValue == webData.searchResults.searchTerm || searchValue == "") && searchParameter == webData.searchResults.parameter){
        return;
    }
    else webData.searchResults.searchTerm = searchValue;
    const url = `https://truth-spice-eater.glitch.me/tmdb/search/${searchParameter}!api_key=KEY&language=en-US&query=${searchValue}&page=1&include_adult=false`
    fetch(url).then(res => {
        if(!res.ok){
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        else return res.json();
    }).then(data => {
        if(searchParameter == "tv" || searchParameter == "movie"){
            data.results.forEach(i => i.media_type = searchParameter);
        }
        webData.searchResults.jsonData = data;
        webData.searchResults.parameter = searchParameter;
        appendSearch(
            createInlineCard, 0, webData.searchResults.jsonData.results.length, document.querySelector(".search-results"), true
        )
    })
}
//focused-content season details
function handleSeasons(data){//get number of seasons and show/tv info
    if(webData.tempFocusedData.render){
        const realID = data.id;
        const getSeasonNum = `https://truth-spice-eater.glitch.me/tmdb/tv/${realID}!api_key=KEY&language=en-US`
        fetch(getSeasonNum).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
        }).then(data2 => {
            webData.tempFocusedData.jsonData = data2;
            appendSeasonSelector(webData.tempFocusedData.jsonData.number_of_seasons);
            webData.tempFocusedData.render = false;
        })
    }
}
function appendSeasonSelector(maxSeason){
    const seasonSelector = document.querySelector("#season-selector");
    seasonSelector.innerHTML = "";
    function append(season){
        const seasonElem = document.createElement("option");
        seasonElem.textContent = `Season ${season}`
        seasonElem.value = season;
        seasonElem.addEventListener("click", ()=>{//handles episodes
            if(document.querySelector("#season-wrapper").dataset.season != seasonElem.value){
                handleSeasonEpisodes(seasonElem.value, webData.tempFocusedData.jsonData.id);
            }
        })
        return seasonSelector.append(seasonElem);
    }
    for(let i=1; i < maxSeason+1; i++){
        append(i)
    }
}
function handleSeasonEpisodes(season, realID){//fetch season episodes
    handleLoadingBar(document.querySelector(".loading-bar-wrapper"), true);
    const seasonInfo = `https://truth-spice-eater.glitch.me/tmdb/tv/${realID}/season/${season}!api_key=KEY&language=en-US`
    fetch(seasonInfo).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
    }).then(data => {
        //catch episode data?
        appendEpisodes(season, data);
        handleLoadingBar(document.querySelector(".loading-bar-wrapper"), false);
    })
}
function appendEpisodes(season, episodeData){
    const dataSource = episodeData.episodes;
    const arr = [];
    const images = createCardImages(dataSource, "still_path", "tempEpisodes", 0, 19, true);
    images.forEach((image, index) => {
        const container = createElementFunc("div", ["full-card-wrapper"]);
        const descriptionWrapper = createElementFunc("div", ["card-description-wrapper"]);
        descriptionWrapper.innerHTML = `
            <p class="episode-num">Episode ${dataSource[index].episode_number}</p>
            <p class="episode-title">${dataSource[index].name}</p>
            <p class="episode-description">${dataSource[index].overview}</p>
        `
        container.append(image);
        container.append(descriptionWrapper);
        arr.push(container);
    })
    appendContent(arr, document.querySelector("#season-wrapper"), true);
    document.querySelector("#season-wrapper").dataset.season = season;
}
//focused-content recommendations
function getRecommendations(data){
    //fetch
    const realID = data.id;
    const tempData = webData.tempFocusedSuggestions;
    if(tempData.render){
        handleLoadingBar(document.querySelector(".loading-bar-wrapper"), true);
        const url = `https://truth-spice-eater.glitch.me/tmdb/${data.media_type}/${realID}/recommendations!api_key=KEY&language=en-US&page=1`
        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        }).then(data => {
            tempData.jsonData = data;
            const maxSuggestions = data.results.length;
            if(maxSuggestions === 0){
                document.querySelector("#focused-suggestions").innerHTML = "<h3>Cannot find recommendations</h3>";
            }
            else{
                const numSuggestions = maxSuggestions < 19 ? maxSuggestions : 19;
                appendContent(createCardImages(data.results, "poster_path", "tempFocusedSuggestions", 0, numSuggestions), document.querySelector("#focused-suggestions"), true);
            }
            handleLoadingBar(document.querySelector(".loading-bar-wrapper"), false);
            webData.tempFocusedSuggestions.render = false;
    })
    }
}
function createFocusNavBar(data){
    //create navbar
    const navContainer = createElementFunc("div", ["focused-nav"]);
    navContainer.innerHTML = `
    <span id="focused-nav-highlighter"></span>
    <span id="focused-nav-description" class="focused-nav-item flex-center active">Details</span>
    <span id="focused-nav-suggestions" class="focused-nav-item flex-center">You May Also Like</span>
    <span id="focused-nav-seasons" class="focused-nav-item flex-center seasons"></span>
    `                        
    document.querySelector(".focused-nav-wrapper").append(navContainer);
    const highLighterElem = document.querySelector("#focused-nav-highlighter");

    function handleWrapper(exception){//open and close content wrapper
        const exceptionID = exception.replace("-nav", "")
        document.querySelectorAll(".focused-content").forEach(item => {
            if(item.id === exceptionID){
                item.classList.remove("hidden");
            }
            else item.classList.add("hidden");
        })
    }
    function handleNav(exception){
        document.querySelectorAll(".focused-nav-item").forEach(item => {
            if(item.id === exception.id){
                item.classList.add("active");
            }
            else item.classList.remove("active");
        })
    }
    navContainer.querySelectorAll(".focused-nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            const ele = e.target;
            highLighterElem.style.width = `${ele.offsetWidth}px`;
            highLighterElem.style.left = `${ele.offsetLeft}px`
            handleNav(ele)
            handleWrapper(item.id);
            if(item.id === "focused-nav-suggestions"){
                getRecommendations(data);
            }
            if(item.id === "focused-nav-seasons"){
                handleSeasons(data);
                handleSeasonEpisodes(1, data.id)
            }
        })
    })
};
function createDescription(data){
    const about = document.querySelector(".focused-about");
    const title = document.querySelector(".focused-name");
    const description = document.querySelector(".focused-description");
    const typeOF = document.querySelector(".focused-type");
    const releaseDate = document.querySelector(".focused-released");

    about.textContent = `About this ${data.media_type === "tv" ? "show" : "movie"}`
    title.textContent = data[data.media_type == "tv" ? "name" : "title"]; //title(movie) / name (series)
    description.textContent = data.overview; //description
    typeOF.innerHTML = `Type: <br>&emsp; ${data.media_type}`
    releaseDate.innerHTML = `Released: <br>&emsp; ${
        data.media_type === "tv" ? data.first_air_date : data.release_date
    }`  
}
function createFocusBanner(data){//create focused-content banner
    const bannerContainer = document.querySelector("#focused-banner-area");
    const bannerElem = createBannerElement(data, true);
    bannerContainer.append(bannerElem);
    bannerContainer.querySelector(".banner-content").onload = ()=>{
        const color = handleColorTheme(bannerContainer.querySelector(".banner-content"), pickColor);
        document.querySelector(":root").style.setProperty("--focused-banner-color", color);
    }
}
function handleFocusBanner(){//handles when user clicks on a show. new pop-up = focused-content
    const id = this.dataset.id.match(/[a-z]+/i)[0];
    const index = parseToNum(this.dataset.id.match(/([0-9])+/g)[0]);
    const data = webData[id].jsonData.results[index];
    handleUnfocus(false);

    document.querySelector(".focused-nav-wrapper").classList.remove("hidden")
    const wrapper = document.querySelector("#focused-wrapper");
    wrapper.classList.remove("hidden");

    webData.createTemp("tempFocusedData", [{render: true}]); //render season selector
    webData.createTemp("tempFocusedSuggestions", [{render: true}]); //render similar
    createFocusBanner(data); //create banner
    createDescription(data);//details page
    createFocusNavBar(data);
    document.querySelector("#focused-nav-description").click();
    if(data.media_type === "tv"){ //sets text for either tv or movie
        document.querySelector(".seasons").textContent = "Seasons";
        document.querySelector(".focused-title").textContent = data.name
    }
    else{ document.querySelector(".seasons").textContent = "";
    document.querySelector(".focused-title").textContent = data.title;
    }
        //handle scrolling
    globalScrollPosition = window.scrollY;
    window.scrollTo(0, 0);
}
function handleFocusGenres(){//when user clicks on genre card. creates a new popup called focused-genre that recommends content based off of genre
    function handleURL(type, sortType, genreID){//type = "tv" or "movie" / sortType = "&sort_by=vote_count.desc" .etc 
        return `discover/${type}!api_key=KEY&language=en-US&sort_by=${sortType}&page=1&vote_count.gte=50&with_genres=${genreID}&include_null_first_air_dates=false`
    }
    function getGenreData(key, value, endpoint){
        return webData[`${type}genre`].jsonData.genres[webData[`${type}genre`].jsonData.genres.findIndex(i => i[key] == value)][endpoint];
    }
    const wrapper = document.querySelector("#focused-wrapper");
    const container = document.querySelector("#focused-genre");
    const title = document.querySelector(".focused-title");
    const primaryGenreID = this.dataset.id;
    const type = this.dataset.type;
    const primaryGenreName = getGenreData("id", primaryGenreID, "name");
    
    document.querySelector("#focused-genre").classList.remove("hidden");
    wrapper.classList.remove("hidden");
    document.querySelector(".focused-title-wrapper").classList.add("solid");

    webData.createTemp("tempGenrePopular", [
        {url: handleURL(type, "popularity.desc", primaryGenreID)},
        {title: `Highest rated ${primaryGenreName} ${type === "movie"? "movies": "shows"}`},
        {cardIndex: 0},
        {objEndpoint: "results"}
    ]);
    //combines two genres
    const secondaryGenreID = primaryGenreID == 35? 18 : 35;
    const secondaryGenreName = getGenreData("id", secondaryGenreID, "name");
    const title2 = `${primaryGenreName} & ${secondaryGenreName}`;
    const id2 = `tempPrimary${secondaryGenreName}`;

    webData.createTemp(id2, [
        {url: handleURL(type, "popularity.desc", `${primaryGenreID},${secondaryGenreID}`)},
        {title: title2},
        {cardIndex: 0},
        {objEndpoint: "results"}
    ]);
    title.textContent = `${primaryGenreName} ${type}`;
    fetchData([webData.tempGenrePopular, webData[id2]], ()=>{
        webData.tempGenrePopular.jsonData.results.forEach(i => i.media_type = type);
        createAppendCardWrapper(container, "tempGenrePopular");
        const cards = createCardImages(webData.tempGenrePopular.jsonData.results, "poster_path","tempGenrePopular", 0, cardDisplayHandler(true)); 
        appendContent(cards, container.querySelector("#tempGenrePopular .card-row"), false);

        webData[id2].jsonData.results.forEach(i => i.media_type = type);
        createAppendCardWrapper(container, id2);
        const cards2 = createCardImages(webData[id2].jsonData.results, "poster_path", id2, 0, cardDisplayHandler(true)); 
        appendContent(cards2, container.querySelector(`#${id2} .card-row`), false);

        globalScrollPosition = window.scrollY;
        window.scrollTo(0, 0);
    })
}
//bottom divider
function createAnnouncementBanner(appendTo, id, height){
    // height is height of banner in px
    const banner = document.createElement("div");
    banner.classList.add("announcement-banner");
    banner.style.height = `${height}px`;
    banner.id = id;
    banner.innerHTML = `<span class="announcement-banner-pattern left"></span>
        <div class="announcement-banner-text flex-center">{announcements and special occasions}</div>
        <span class="announcement-banner-pattern right"></span>`
    
    function calculateBubbleStyle(min, max, num){//between 0 and 10 where 0 is 0% and 10 is 100% 
        return Math.round((Math.random() * (max - min) + min) / 10 * num);
    };
    
    function createBubbles(){
        const bubble = document.createElement("div");
        bubble.classList.add("banner-bubble");

        const dimensions = calculateBubbleStyle(2, 11, height);
        bubble.style.left = `${calculateBubbleStyle(-1, 9, 100)}%`;
        bubble.style.bottom = `${calculateBubbleStyle(-1, 8, 100)}%`;
        bubble.style.width = `${dimensions}px`;
        bubble.style.height = `${dimensions}px`;
        return bubble;
    }

    banner.querySelectorAll(`.announcement-banner-pattern`).forEach(i => {
        for(let y = 0; y < 20; y++){
            i.append(createBubbles())
        }
    })
    appendTo.append(banner);
}
// handles cards
function createAppendCardWrapper(parentEle, id, title){//creates card wrapper and add functionality to slider bvuttons
    const wrapper = document.createElement("div");
    wrapper.classList.add("content-row");
    const contentTitle = title? title : webData[id].title;
    wrapper.id = id;
    wrapper.innerHTML = `
        <div class="slider-button-wrapper slider-button-wrapper-right">
            <button class="slider-button slider-button-right"></button>
        </div>
        <div class="slider-button-wrapper slider-button-wrapper-left"> 
            <button class="slider-button disabled slider-button-left"></button>
        </div>
        <div class="content-title">${contentTitle}</div>
        <div class="card-row-wrapper">
            <span class="card-row"></span>
        </div>
    `
    parentEle.append(wrapper);
    //handles resizing of window and distribution of content
    wrapper.querySelectorAll(".slider-button").forEach(ele => {
        ele.addEventListener("mouseup", (e)=>{
            ele.disabled = false;
            handleSliderButton(id, e);
            ele.disabled = true;
            setTimeout(() => {
                ele.disabled = false;
            }, 1000);
        })
    })
};
function createCardGenres(iteratedPath, id, start, end){
    let cards = [];
    for(let i=start; i< end; i++){
        if(iteratedPath[i] === undefined){
            break;
        }
        const card = document.createElement("span");
        card.classList = `card flex-center focus-genre`;
        card.dataset.id = iteratedPath[i].id;
        card.dataset.type = `${webData[id].mediaType}`;
        card.innerHTML = `
        <div class="card-filter flex-center"></div>
        <h4>${iteratedPath[i].name}</h4>
        `
        card.addEventListener("click", handleFocusGenres);
        cards.push(card);
    }
    return cards;
}
function createCardImages(iteratedPath, imgEndpoint, id, start, end, listen){
    let cards = [];
    if(iteratedPath.length === 0 || !iteratedPath){
        return console.log("no cards on file");
    }
    const name = iteratedPath[0].media_type === "movie" ? "title" : "name";
    for(let i = start; i < end; i++){
        if(iteratedPath[i] === undefined || !iteratedPath[i][imgEndpoint]){
            break;
        }
        const url = imgSourceSmall + iteratedPath[i][imgEndpoint];
        const card = document.createElement("span");
        card.classList = `card flex-center focus-content`; 
        card.dataset.id = `${id}_${i}`;
        card.dataset.realid = iteratedPath[i].id;
        if(listen === undefined){
            card.addEventListener("click", handleFocusBanner);
        }
        card.innerHTML = `
        <div class="card-filter card-play flex-center"></div>
        <img class="cardImage" data-id="${id}_${i}" src="${url}" alt="an image for ${iteratedPath[i][name]}">
        `
        cards.push(card);
    }
    return cards;
}
function cardDisplayHandler(update){//determines how many cards can fit inside its wrapper
    const container = document.querySelector(".card-row"); 
    if(!container){
        return false;
    }  
    const gap = parseToNum(window.getComputedStyle(document.querySelector(".card-row")).gap);
    let cardMaxWidth, cardMinWidth;
    //!todo change max and min width when width changes below threshold
    cardMaxWidth = 220;
    cardMinWidth = 150;
    const cardContainerWidth = container.offsetWidth;
    let cardsNum = Math.ceil(cardContainerWidth / (cardMaxWidth + gap));
    if(cardsNum > 9){
        cardsNum = 9;
    }
    if(update){
        globalCardCount = cardsNum
    }
    return cardsNum;
}
function handleSliderEvent(id, direction){//handles sliding transition of cards
    const parent = document.querySelector(`#${id}`);
    const data = webData[id];
    function x_to_center(){//create new cards to slide in
        //wrapper
        const cardWrapperElem = document.createElement("div");
        cardWrapperElem.classList.add("card-row", `${direction}`, "offscreen"); 
        parent.querySelector(".card-row-wrapper").append(cardWrapperElem);
        const cardWrapper =  parent.querySelector(`.${direction}`);
        const newCards = webData[id].objEndpoint == "results" ?
            createCardImages(webData[id].jsonData.results, "poster_path", id, data.cardIndex, data.cardIndex + globalCardCount) :
            createCardGenres(webData[id].jsonData.genres, id, data.cardIndex, data.cardIndex + globalCardCount);
        appendContent(newCards, cardWrapper, false);

        setTimeout(() => {
            cardWrapper.classList.remove(`${direction}`);
        }, 10);
        //!todo make card loading asynch
    }
    function center_to_x(){//slide out old cards
        const x = direction === "right"? "left" : "right";
        parent.querySelector(".card-row").classList.add(`translate-${x}`);
        setTimeout(() => {
            parent.querySelector(`.translate-${x}`).remove();
            parent.querySelector(".offscreen").classList.remove("offscreen");
        }, 500);
    }
    center_to_x();
    x_to_center();
}
function handleSliderButton(id, event){
    nextButton = document.querySelector(`#${id} .slider-button-right`);
    prevButton = document.querySelector(`#${id} .slider-button-left`);
    let maxCards = webData[id].jsonData[webData[id].objEndpoint].length;
    if(event){
        if(event.target.classList.contains("slider-button-right")){
            webData[id].cardIndex = webData[id].cardIndex + globalCardCount;
            handleSliderEvent(id, "right");
        }
        else if(event.target.classList.contains("slider-button-left")){
            webData[id].cardIndex = webData[id].cardIndex - globalCardCount;
            if(webData[id].cardIndex < 1){
                webData[id].cardIndex = 0;
            }
            handleSliderEvent(id, "left");
        }
    }
    webData[id].cardIndex < 1 ? prevButton.classList.add("disabled") : prevButton.classList.remove("disabled");
    webData[id].cardIndex + globalCardCount >= maxCards ? nextButton.classList.add("disabled"): nextButton.classList.remove("disabled");
}
//handle banners
function createBannerElement(data, focused){//creates banner element 
    const bannerElem = document.createElement("div");
    bannerElem.classList.add("banner-wrapper");
    let buttonElems;
    const description = data.name == undefined ? data.title : data.name;
    if(!focused){
        buttonElems = `<div class="banner-button-wrapper">
        <button class="banner-play-button focus-content">Play</button>
        <button class="banner-content-details focus-content">Details</button>
    </div>`
    }
    else buttonElems = `<div class="banner-button-wrapper">
    <div class="banner-play-circle flex-center">
        <div>▶</div>
    </div>
    <div class="banner-action-text">Watch ${data.name == undefined ? "Movie":"Show"}</div>
    <div class="add-remove ${retrieveStuff(data.id) == ""? "add": "remove"} flex-center">
    <div class="add-stuff-bubble stuff-bubble flex-center">Add to my stuff</div>
    </div>
    </div>`
    bannerElem.innerHTML = `
                    <div class="banner-text-area">
                        <div class="banner-color-filter"></div>
                        <div class="banner-info">
                            <div class="banner-title">${description}</div>
                            <div class="banner-description"></div>
                        ${buttonElems}
                        </div>
                    </div> 
    `
    //create image element
    if(focused){
        bannerElem.querySelector(".add-remove").addEventListener("click", (e)=>{
            handleStuff(e, data)
        })
    }
    if(!data.backdrop_path){
        const noImageElem = createElementFunc("div", ["image-null", "banner-content", "flex-center"]);
        noImageElem.textContent = "Image Unavailable"
        bannerElem.append(noImageElem);
    }
    else{
        let imgElem = document.createElement("img");
        imgElem.setAttribute("src", imgSourceLarge + data.backdrop_path);
        imgElem.classList.add("banner-content");
        imgElem.setAttribute("alt", description+ " poster");
        bannerElem.append(imgElem);
    }
    return bannerElem;
}
function handleHomeBanner(parentEle, id, index, elem){//appends banner element and handle color filter
    elem.querySelectorAll(".focus-content").forEach(x => {
        x.addEventListener("click", handleFocusBanner);
        x.dataset.id = `${id}_${index}`;
    });
    parentEle.append(elem);
    //handle banner filter color
    elem.querySelector(".banner-content").onload = ()=>{
        const color = handleColorTheme(elem.querySelector(".banner-content"), pickColor);
        document.querySelector(":root").style.setProperty("--banner-color", color)
    }
}
//handle banner color filter
function pickColor(arr){
    const colorPalette = {//corrosponding rbg color theme of image colors
        white: "93,219,219", //light teal
        grey: "44,134,179",
        black: "55,43,193",
    }
    const index = {
        0: "red",
        1: "green",
        2: "blue"
    }
    const pixelColors = {
        white: 0,
        black: 0,
        grey: 0,
        red: [],
        green: [],
        blue: []
    };
    for(let i=0; i<arr.length; i++){//take array of colors in rgb num
        let prefix;
        const sorted = [...arr[i]].sort((a,b) => a - b); //sort each rgb num from lowest to highest
        if(sorted[2] < 50){
            pixelColors.black = pixelColors.black + 1;  //if all three num are similar (diffrence between num less than 50) then its grey
            continue;
        }
        if(sorted[0] > 245){
            pixelColors.white = pixelColors.white + 1; //if lowest is greater than 245 than its white
            continue; 
        }
        if(sorted[2] - sorted[0] < 50){
            pixelColors.grey = pixelColors.grey + 1;
            continue;
        }
        else prefix = index[arr[i].indexOf(sorted[2])]; //tally colors into red blue or green for further calculations
        pixelColors[prefix].push(arr[i]);
    }
    if(pixelColors.white > 70){
        return colorPalette.white;
    }
    if(pixelColors.black > 70){
        return colorPalette.black 
    }
    return colorPalette.grey;
}
function handleColorTheme(img, decideColor){//iterate through canvas img and create an array of colors
    let fullColorArr = [];
    const imgDimensions = img.getClientRects()[0];
    const canvas = new OffscreenCanvas(imgDimensions.width, imgDimensions.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const y_increment = Math.round(canvas.height / 40); //collects pixel color at every Nth increment
    const x_increment = Math.round(canvas.width / 40);

    function percentageOfLength(length, percent){
        return Math.round(length * percent);
    }
    function getColorAtPX(x, y){
        const pixel = ctx.getImageData(x, y, 1, 1);
        const pixelData = [pixel.data[0], pixel.data[1], pixel.data[2]];
        fullColorArr.push(pixelData);
    }
    function pickLocation(canvasLengthStart, canvasLengthEnd, canvasIncrement, incrementStart, incrementEnd, incremenet){
        for(let i = canvasLengthStart; i < canvasLengthEnd; i = i + canvasIncrement){
            for(let j = incrementStart; j < incrementEnd; j= j + incremenet){
                i= i + canvasIncrement;
                if(i > canvasLengthEnd){
                    return;
                }
                if(canvasIncrement > incremenet){
                    getColorAtPX(i, j);
                }
                else getColorAtPX(j, i);
            }
        }
    }
    //pick the colors across top right bottom and left portion of image
    pickLocation(0, canvas.width, x_increment, 5, percentageOfLength(canvas.height, 0.2), y_increment); //top
    pickLocation(0, canvas.width, x_increment, percentageOfLength(canvas.height, 0.8), canvas.height, y_increment); //bottom
    pickLocation(0, canvas.height, y_increment, 0, percentageOfLength(canvas.height, 0.15), x_increment); //left
    pickLocation(0, canvas.height, y_increment, percentageOfLength(canvas.height, 0.85), canvas.height, x_increment); //right
    return decideColor(fullColorArr); //pass the array of images and return a rgb theme color string
}   
//page type
function handlePageType(dataLocation, loadPage, loadingScreen){
    if(loadingScreen){
        handleLoadingScreen(true);
    }
    fetchData(dataLocation, loadPage);
}
function handleHomePage(){
    const html = `
    <div id="headline-content-wrapper">
    <div id="headline"> 
        <div id="banner-dark-filter"></div>
    </div>
    <div id ="headline-content">
        <div class="color-filter-bottom"></div> 

        <div id="headline-row"></div>
    </div>
    </div>
    <div class="lower-content">
    </div>
    `
    document.querySelector("#main-content").innerHTML = html;
    const randomIndex = Math.floor(Math.random()*webData.trendingShows.jsonData.results.length);
    handleHomeBanner(document.querySelector('#headline'), "trendingShows", randomIndex, createBannerElement(webData.trendingShows.jsonData.results[randomIndex]), false);
    
    createAppendCardWrapper(document.querySelector('#headline-row'), "trendingShows");//create and append card wrapper
    const cards = createCardImages(webData.trendingShows.jsonData.results, "poster_path","trendingShows", 0, cardDisplayHandler(true)); //create card nodes
    appendContent(cards, document.querySelector("#headline-row .card-row"), false); //append them to parent

    createAppendCardWrapper(document.querySelector('.lower-content'), "trendingMovies");
    const cards2 = createCardImages(webData.trendingMovies.jsonData.results, "poster_path","trendingMovies", 0, cardDisplayHandler(true)); 
    appendContent(cards2, document.querySelector(".lower-content .card-row"), false);

    createAnnouncementBanner(document.querySelector(".lower-content"), "genericBanner_home1", 50); 
    setTimeout(() => {
        handleLoadingScreen(false);
    }, 1000);
}
function handleTVpage(){
    webData.topRatedTV.jsonData.results.forEach(show => show.media_type = "tv"); //need to set media type so seasons get rendered
    const container = createElementFunc("div", ["lower-content"]);
    document.querySelector('#main-content').append(container);

    createAppendCardWrapper(container, "tvgenre");
    const genres = createCardGenres(webData.tvgenre.jsonData.genres, "tvgenre",0, cardDisplayHandler(true));
    appendContent(genres, document.querySelector('.card-row'), false);

    createAppendCardWrapper(container, "trendingShows");//create and append card wrapper
    const cards = createCardImages(webData.trendingShows.jsonData.results, "poster_path","trendingShows", 0, cardDisplayHandler(true)); //create card nodes
    appendContent(cards, container.querySelector("#trendingShows .card-row"), false); //append them to parent

    createAppendCardWrapper(container, "topRatedTV");//create and append card wrapper
    const cards2 = createCardImages(webData.topRatedTV.jsonData.results, "poster_path","topRatedTV", 0, cardDisplayHandler(true)); //create card nodes
    appendContent(cards2, container.querySelector("#topRatedTV .card-row"), false); //append them to parent

    createAnnouncementBanner(container, "genericBanner_TV1", 50); 
    setTimeout(() => {
        handleLoadingScreen(false);
    }, 1000);
}
function handleMoviePage(){
    webData.topRatedMovies.jsonData.results.forEach(show => show.media_type = "movie");
    const container = createElementFunc("div", ["lower-content"]);
    document.querySelector('#main-content').append(container);

    createAppendCardWrapper(container, "moviegenre");
    const genres = createCardGenres(webData.moviegenre.jsonData.genres, "moviegenre",0, cardDisplayHandler(true));
    appendContent(genres, document.querySelector('#moviegenre .card-row'), false);

    createAppendCardWrapper(container, "trendingMovies");
    const cards= createCardImages(webData.trendingMovies.jsonData.results, "poster_path","trendingMovies", 0, cardDisplayHandler(true))
    appendContent(cards, container.querySelector("#trendingMovies .card-row"), false);

    createAppendCardWrapper(container, "topRatedMovies");//create and append card wrapper
    const cards2 = createCardImages(webData.topRatedMovies.jsonData.results, "poster_path","topRatedMovies", 0, cardDisplayHandler(true)); //create card nodes
    appendContent(cards2, container.querySelector("#topRatedMovies .card-row"), false); //append them to parent

    createAnnouncementBanner(container, "genericBanner_TV1", 50); 
    setTimeout(() => {
        handleLoadingScreen(false);
    }, 1000);
}
function handleStuffPage(){
    const container = document.querySelector('#main-content');
    const contentWrapper = createElementFunc("div", ["stuff-wrapper"]);
    const banner = createElementFunc("div", ["stuff-banner"]);
    banner.innerHTML = `
        <div class="stuff-banner-description">
            <h2>My Stuff</h2>
            <span><p id="idk">Use the</p><div class="add-remove add flex-center"></div><p>button to add content you want to keep track of.</p></span>
        </div>
    `
    contentWrapper.innerHTML = `
        <div class="clear-all-stuff">
        <span onclick="clearAllStuff()">Clear All</span>
        </div>
        <div class="stuff-content"></div>
    `
    container.append(banner);
    container.append(contentWrapper);

    const savedID = retrieveStuff("stuff");
    if(savedID === ""){
        return clearAllStuff();
    }
    const stuffArr = [];
    savedID.index.forEach(i => {
        const data = retrieveStuff(i);
        stuffArr.push(data);
    })
    const stuffContainer = document.querySelector(".stuff-content");
    webData.myStuff.jsonData.results = stuffArr;
    const cards= createCardImages(webData.myStuff.jsonData.results, "poster_path","myStuff", 0, webData.myStuff.jsonData.results.length)
    appendContent(cards, stuffContainer, false);
}
function handleSearchPage(){
    const container = document.querySelector('#main-content');
    const contentWrapper = createElementFunc("div", ["search-wrapper"]);
    contentWrapper.innerHTML = `
    <div class="search-inline">
        <input type="text" placeholder="Search" value="" class="search-bar">
        <span class="clear-search-input flex-center displacer" onclick="clearSearch()">Clear</span>
    </div>
    <div class="search-block">
        <div class="search-option-wrapper">
            <div class="add-remove add flex-center" onclick="handleAdvancedSearch()"></div>
            <div class="search-options">
                <fieldset>
                <legend>Select a search option:</legend>
                <span>
                <input type="radio" id="search-all" name="search-type" value="multi" checked>
                <label for="search-all">Search all</label>
                </span>
                <span>
                <input type="radio" id="search-movie" name="search-type" value="movie">
                <label for="search-movie">Search for movies</label>
                <span>
                <input type="radio" id="search-tv" name="search-type" value="tv">
                <label for="search-tv">Search for shows</label>
                </span>
                </fieldset>
            </div>
        </div>
        <div class="search-inline">
            <button class="search-button" onclick="handleSearch()">
                <div class="search-button-text">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>Search</p>
                    <p class="search-text">For "{placeholder name"}</p>
                </div>
                <div class="">
                </div>
            </button>
            <div class="displacer"></div>
        </div>
    </div>
    <div class="search-results"></div>
    `
    container.append(contentWrapper);
    document.querySelector(".search-bar").addEventListener("keyup", displaySearch);
}
function purgePage(){
    document.querySelector("#main-content").innerHTML = "";
}
//event handler functions
function createShadedNav(){
    navSolidElem.classList.remove('active');
    navShadedElem.classList.add('active');
}
function addMediaType(obj, type){
    obj.media_type = type;
}
function createSolidNav(){
    navSolidElem.classList.add('active');
    navShadedElem.classList.remove('active');
}
function handleScrollEvent(){//changes the top navigation bar based off of y position
    if(window.scrollY < 2 && document.querySelector("#headline")){//only has shaded nav bar when on home page
        createShadedNav()
    }
    if(window.scrollY > 0){
        createSolidNav();
        navBarElem.classList.remove('thin');
    }
    if(window.scrollY > globalViewHeight* 0.4){
        navBarElem.classList.add('thin');
    }
}
function handleWindowResize(newCardCount){ //add or delete cards when window size changes
    if(newCardCount === globalCardCount || !newCardCount){//globalcardcount is current number of cards
        return;
    }
    globalViewHeight = window.innerHeight;
    if(newCardCount !== globalCardCount){
        while(newCardCount > globalCardCount){
            globalCardCount++;
            document.querySelectorAll(".content-row").forEach(elem => {
                const container = elem.querySelector(".card-row");
                const index = webData[elem.id].cardIndex;
                const card_is_image = container.querySelector(".card").classList.contains("focus-content") ? true : false;
                if(container.children.length < globalCardCount){  
                    appendContent(
                        card_is_image ? createCardImages(webData[elem.id].jsonData.results, "poster_path", elem.id, index + container.children.length, index + container.children.length + 1) :
                            createCardGenres(webData[elem.id].jsonData.genres, elem.id, index + container.children.length, index + container.children.length + 1),
                        container, 
                        false
                    );
                    handleSliderButton(elem.id, null);
                }
            })
        }
        while(newCardCount < globalCardCount){//remove when shrinks
            globalCardCount--;
            document.querySelectorAll(".content-row").forEach(elem => {
                const container = elem.querySelector(".card-row");
                const index = webData[elem.id].cardIndex;
                const card_is_image = container.querySelector(".card").classList.contains("focus-content") ? true : false;
                const maxCards = card_is_image ? webData[elem.id].jsonData.results.length : webData[elem.id].jsonData.genres.length;
                if(index + globalCardCount <= maxCards && container.children.length > 1){
                    container.lastElementChild.remove(); 
                }
                handleSliderButton(elem.id, null);
            })
            
        }
    }
}
//global functions //helper functions
function handleLoadingBar(loadingElem, toggle){
    if(toggle){//true = turns on
        loadingElem.classList.remove("hidden");
    }
    else loadingElem.classList.add("hidden");
}
function handleLoadingScreen(toggle){
    const page = document.querySelector("#wrapper");
    const loadingElem = document.querySelector("#loading-screen");
    if(toggle){
        page.classList.add("loading");
        loadingElem.classList.remove("hidden");
    }
    else {
        page.classList.remove("loading");
        loadingElem.classList.add("hidden");
    }
}
function parseToNum(str){//converts string to number
    return parseInt(str.match(/[0-9]+/), 10);
}
function appendContent(arr, parent, purge){
    //append an array of elements where arr is the array, 
    //start is index of first element, appendNum number of elements and parent the parent container
    if(purge){
        parent.innerHTML = "";
    }
    for(let i = 0; i< arr.length; i++){
        parent.append(arr[i]);
    }
}
function createElementFunc(type, classList, other){//classlist is array of strings
    const elem = document.createElement(type);
    classList.forEach(c => elem.classList.add(c));
    if(other){
        other;
    }
    return elem;
}
function fetchData(dataLocationArr, runFunc){
    Promise.all(dataLocationArr.map(i => fetch(i.url))).then(response => {
        const fixedResponse = response.map(res => {
            if(!res.ok){
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            else return res.json();
        })
        return Promise.all(fixedResponse);
    }).then(data => {
        console.log(data)
        dataLocationArr.forEach((item, index) => {
            item.jsonData = data[index];
        })
        runFunc();
    })
}
function deleteTemp(){
    webData.temp.forEach(i => delete webData[i]);
    webData.temp = [];
}
function handleUnfocus(hide){
    const focused = document.querySelector("#focused-wrapper");
    if(focused.classList.contains("hidden")){
        return;
    }
    handleLoadingBar(document.querySelector(".loading-bar-wrapper"), false);
    document.querySelector("#focused-banner-area").innerHTML = "";
    focused.querySelector(".focused-nav-wrapper").innerHTML = "";
    focused.querySelectorAll(".focused-content").forEach(i => i.classList.add("hidden"));
    document.querySelector("#focused-genre").innerHTML = "";
    document.querySelector("#focused-genre").classList.add("hidden");
    document.querySelector(".focused-title-wrapper").classList.remove("solid");
    if(hide){
        focused.classList.add("hidden");
        window.scroll(0, globalScrollPosition);
        deleteTemp();
    }
}
function debounce(func, wait = 300, immediate = true) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
window.addEventListener('load', ()=>{
    handlePageType([webData.trendingShows, 
        webData.trendingMovies
    ], 
        handleHomePage, true);
})
document.addEventListener('scroll', ()=>{
  debounce(handleScrollEvent())
})
document.querySelectorAll(".nav-handler").forEach(btn => {
    btn.addEventListener("click", (e)=>{
        console.log(e)
        if(e.target.classList.contains("nav-handler")){
            if(e.target.classList.contains("active")){
                return;
            }
            document.querySelector(".nav-handler.active").classList.remove("active");
            purgePage();
            switch(e.target.id){
                case "nav-logo":
                    createShadedNav();
                    handlePageType([webData.trendingShows, webData.trendingMovies], handleHomePage, true);
                    document.querySelector("#nav-home").classList.add("active");
                    break;
                case "nav-home":
                    createShadedNav();
                    handlePageType([webData.trendingShows, webData.trendingMovies], handleHomePage, true);
                    e.target.classList.add("active");
                    break;
                case "nav-tv":
                    createSolidNav();
                    handlePageType([webData.tvgenre, webData.topRatedTV], handleTVpage, true);
                    e.target.classList.add("active");
                    break;
                case "nav-movies":
                    createSolidNav();
                    handlePageType([webData.moviegenre, webData.topRatedMovies], handleMoviePage, true);
                    e.target.classList.add("active");
                    break;
                case "nav-stuff":
                    createSolidNav();
                    handleStuffPage();
                    e.target.classList.add("active");
                    break;
                case "nav-search":
                    createSolidNav();
                    handleSearchPage();
                    e.target.classList.add("active");
                    break;
            }
        }
    })  
})
document.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" && document.querySelector(".search-wrapper")){
        handleSearch();
    }
})
let resizeTimeOut; //handles resizing of window and distribution of content
window.onresize = function(){
    clearTimeout(resizeTimeOut);
    resizeTimeOut = setTimeout(()=>{
        handleWindowResize(cardDisplayHandler(false));
    }, 100);
};
//leaves focused content
document.querySelectorAll(".unfocus-content").forEach(button => {//
    button.addEventListener("click", (event) => {
        if(event.target.classList.contains("unfocus-content")){
            if(!wrapper.classList.contains("hidden")){
                return handleUnfocus(true);
            }
        }
    });
})
