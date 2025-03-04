//Import functions from other files
import { generateEventToDisplay, filterNonhalfPointers, generateWinnerCombo, filterMostFrequentOverScore, filterDifferentPoints, generateBettingMarkets } from './dataFilter.js';
import { generateTitleBox, generateMiddleParagraph, generateOddBox } from './uiUpdates.js';
import { generateLink, fetchOdds } from "./APILink.js"


//Hide menu within lauch
toggleMenuVisibility();

//variables
var eventCombosToDisplay = []
var selectedLeagueIndex = 0
var JSONResults = []

//Change to use test or live data
var useLiveData = false


//ADD EVENT LISTENERS
//Handle menu clicks
document.getElementById("league-button").addEventListener("click", function() {
    toggleMenuVisibility()
    console.log(selectedLeagueIndex)
});

// Attach click event listeners to each league
document.querySelectorAll("#menu li").forEach((item, index) => {
  item.addEventListener("click", function() {
      selectLeague(index, item.textContent);
  });
});

//Handle the update button click
document.getElementById("update-button").addEventListener("click", function() {

  const button = this;
  button.disabled = true
  button.classList.add("disabled-button");
  eventCombosToDisplay = []
  clearEventContainers();

  if (useLiveData) {
    const requestLink = generateLink(selectedLeagueIndex); // Get API URL
    fetchOdds(requestLink).then((data) => {
        if (data) {
            console.log("Successfully retrieved odds data!");
            JSONResults = data
            parseData();
        }
    });
  } else {
      parseData();
  }

  setTimeout(() => {
    button.disabled = false;
    button.classList.remove("disabled-button"); 
}, 3000); 
});

//UI interaction
function toggleMenuVisibility() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("hidden"); // Toggle visibility
}

function selectLeague(index, leagueName) {
  const button = document.getElementById("league-button");
  button.textContent = leagueName; // Update button text
  selectedLeagueIndex = index; // Save the selected index
  toggleMenuVisibility(); // Close menu after selection
  console.log(`Selected League: ${leagueName}, Index: ${selectedLeagueIndex}`);
}






function parseData() {

    var dataArray = []

    if (useLiveData) {
        dataArray = JSONResults
    } else {
        dataArray = testJSONdata
    }
    //Loop through each item in JSON
    dataArray.forEach(game => {

      //generate a betting market object from JSON data
      var bettingMarkets = generateBettingMarkets(game.bookmakers);

      //Keep totals of half goals to avoid complicated winning logics
      bettingMarkets = filterNonhalfPointers(bettingMarkets);

      //Filter out markets that provide different points
      bettingMarkets = filterDifferentPoints(bettingMarkets)

      //Keep the most frequently appearing score of markets
      bettingMarkets = filterMostFrequentOverScore(bettingMarkets);
      
      //Generate a winner from different markets with highest odds pair
      const winner = generateWinnerCombo(bettingMarkets)
      
      //Generate an object with information to display & save for later use
      const event = generateEventToDisplay(game, winner)
      eventCombosToDisplay.push(event)
    })
    sortEvents(eventCombosToDisplay);
    displayEvents();
}


function displayEvents() {
  eventCombosToDisplay.forEach((event, index) => {
      setTimeout(() => {
          displayOneEvent(event);
      }, index * 50); 
  });
}


function displayOneEvent(event) {
  const newEventBox = document.createElement("div")
        newEventBox.classList.add("event-container")

        const titleBox = generateTitleBox(event)
        newEventBox.appendChild(titleBox)

        const middleParagraph = generateMiddleParagraph(event)
        newEventBox.appendChild(middleParagraph)

         //Create div to display bookers, odds, true odds and payback
         const oddBox = generateOddBox(event)
         newEventBox.appendChild(oddBox)


        const arbitraceBox = document.getElementById("arbitrace-container")
        const eventBox = document.getElementById("highest-odds-container")

        if (calculateProfit(event) > 0) {
            arbitraceBox.appendChild(newEventBox)
        } else {
            eventBox.appendChild(newEventBox)
        }

        requestAnimationFrame(() => {
          newEventBox.classList.add("fade-in");
        });
}

function sortEvents(events) {
  events.sort((a, b) => calculateProfit(b) - calculateProfit(a)); // Sort descending (highest profit first)
}

function calculateProfit(event) {
      const overPrice = event.winCombo.overPrice
      const underPrice = event.winCombo.underPrice
      const overProb = 1 / overPrice
      const underProb = 1 / underPrice
      const totalProb = overProb + underProb
      const profit = 1 - totalProb
      return profit
}

function clearEventContainers() {
  const arbitraceBox = document.getElementById("arbitrace-container");
  const eventBox = document.getElementById("highest-odds-container")
  while (arbitraceBox.firstChild) {
      arbitraceBox.removeChild(arbitraceBox.firstChild);
  }

  while (eventBox.firstChild) {
      eventBox.removeChild(eventBox.firstChild)
  }
}





//Analyzing function for testing/debug purposes (Not used in ready code)
function analyzeBettingMarkets(markets) {
    markets.forEach(market => {
        const debugString = market.name + ": over: " + market.overPrice + " under: " + market.underPrice
        console.log(debugString)
    })
}









//TESTING JSON
const testJSONdata = [
    {
      "id": "2879e10fd4c53c2b9582c7275a4c2ff1",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-02-28T19:30:00Z",
      "home_team": "VfB Stuttgart",
      "away_team": "Bayern Munich",
      "bookmakers": [
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betmgm",
          "title": "BetMGM",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.2,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.61,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.15,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.61,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.14,
                  "point": 3.75
                },
                {
                  "name": "Under",
                  "price": 1.76,
                  "point": 3.75
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.48,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.48,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.35,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.48,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.48,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.48,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.48,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.4,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.43,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.51,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 7.5,
                  "point": 4.5
                },
                {
                  "name": "Under",
                  "price": 1.06,
                  "point": 4.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.27,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.58,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.33,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.61,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "matchbook",
          "title": "Matchbook",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.83,
                  "point": 3.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "aa7f6ef60ffc8c9b04dc12b472cf4557",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-01T14:30:00Z",
      "home_team": "1. FC Heidenheim",
      "away_team": "Borussia Monchengladbach",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.34,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.83,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.12,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.76,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.61,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.01,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.83,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.01,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.83,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.05,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.8,
                  "point": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "c7ce226d5a9f3d29f6235b1751c67d09",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-01T14:30:00Z",
      "home_team": "FC St. Pauli",
      "away_team": "Borussia Dortmund",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.71,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.9,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.77,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.88,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.01,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.92,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.78,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.77,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "6301daf04b0837710d96381c28f4795e",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-01T14:30:00Z",
      "home_team": "RB Leipzig",
      "away_team": "FSV Mainz 05",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.71,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.83,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.77,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.84,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.8,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.98,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.8,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.79,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.77,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.81,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "bd24e6c99f43b10265adee1210ea5807",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-01T14:30:00Z",
      "home_team": "VfL Bochum",
      "away_team": "TSG Hoffenheim",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.69,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.36,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.95,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.87,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.05,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.85,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.57,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.05,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.81,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.61,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.61,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.29,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.04,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.81,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.04,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.81,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "4811f3bbe88d05b5a26b324e7b0bad2b",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-01T14:30:00Z",
      "home_team": "Werder Bremen",
      "away_team": "VfL Wolfsburg",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.59,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.73,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.29,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.86,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2.03,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.12,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.76,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.16,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.86,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.86,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.19,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.14,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.75,
                  "point": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "244e824546bff7d91803df60ce971cf7",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-01T17:30:00Z",
      "home_team": "Eintracht Frankfurt",
      "away_team": "Bayer Leverkusen",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.59,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.89,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.28,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.12,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.18,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.16,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.88,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.94,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.88,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.94,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.16,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.74,
                  "point": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "626655dea78a5e2b0339a5354152a447",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-02T14:30:00Z",
      "home_team": "Union Berlin",
      "away_team": "Holstein Kiel",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.76,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.87,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.92,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.12,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.89,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.89,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.13,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.18,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.12,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "matchbook",
          "title": "Matchbook",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.24,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.21,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.71,
                  "point": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "372b7e10cf33ffd2663b592a8b3bd1de",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-02T16:30:00Z",
      "home_team": "Augsburg",
      "away_team": "SC Freiburg",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.1,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.59,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.32,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.71,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.95,
                  "point": 2.25
                },
                {
                  "name": "Under",
                  "price": 1.87,
                  "point": 2.25
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.2,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.01,
                  "point": 2.25
                },
                {
                  "name": "Under",
                  "price": 1.88,
                  "point": 2.25
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.2,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.62,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.12,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.62,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.17,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.63,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "lowvig",
          "title": "LowVig.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.98,
                  "point": 2.25
                },
                {
                  "name": "Under",
                  "price": 1.85,
                  "point": 2.25
                }
              ]
            }
          ]
        },
        {
          "key": "betonlineag",
          "title": "BetOnline.ag",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.98,
                  "point": 2.25
                },
                {
                  "name": "Under",
                  "price": 1.85,
                  "point": 2.25
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.2,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.71,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.2,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.61,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "matchbook",
          "title": "Matchbook",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.32,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.74,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "gtbets",
          "title": "GTbets",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.14,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.68,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betus",
          "title": "BetUS",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.69,
                  "point": 2
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "25ea75704f91aababe4afdaed7e6b8a4",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-07T19:30:00Z",
      "home_team": "Borussia Monchengladbach",
      "away_team": "FSV Mainz 05",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.71,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.8,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.8,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.84,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.98,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.85,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.04,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.77,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "coolbet",
          "title": "Coolbet",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.76,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.03,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "topsport",
          "title": "TopSport",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 1.98,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "03b60851d1e5374490021aa3b6ff7d99",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-08T14:30:00Z",
      "home_team": "Borussia Dortmund",
      "away_team": "Augsburg",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.69,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.36,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.59,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.57,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2.03,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.23,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "2c3e8dfb4efae4d7ae67008badb88844",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-08T14:30:00Z",
      "home_team": "Bayer Leverkusen",
      "away_team": "Werder Bremen",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.35,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.42,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.66,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.2,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.56,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.15,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.4,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.58,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.4,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.58,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.5,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.45,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.97,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.56,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.35,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.55,
                  "point": 3.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "0cc5b2479177688f17ad6e7fe93b1bf5",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-08T14:30:00Z",
      "home_team": "Bayern Munich",
      "away_team": "VfL Bochum",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.89,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 2.06,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.91,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.85,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.3,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 3.6,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.3,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 3.6,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.3,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 3.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.83,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.78,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.89,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.93,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.8,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 3.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "c439ce7865499337eb78c294eb866fef",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-08T14:30:00Z",
      "home_team": "VfL Wolfsburg",
      "away_team": "FC St. Pauli",
      "bookmakers": [
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.14,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.95,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.88,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.93,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.89,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "5647886c35dff3d30b40c03724a1cdfa",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-08T14:30:00Z",
      "home_team": "Holstein Kiel",
      "away_team": "VfB Stuttgart",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.36,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.69,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.15,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.15,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.65,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.63,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.63,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.5,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.5,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.81,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 2.03,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.82,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.56,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.3,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.57,
                  "point": 3.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.25,
                  "point": 3.5
                },
                {
                  "name": "Under",
                  "price": 1.6,
                  "point": 3.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "bd78b1f02ce94086fa173a944584843b",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-08T17:30:00Z",
      "home_team": "SC Freiburg",
      "away_team": "RB Leipzig",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.8,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.17,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.75,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.73,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.93,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.91,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.95,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.87,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.02,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.72,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.07,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.08,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "c1761cb4d560aa5e78e954364729068a",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-09T14:30:00Z",
      "home_team": "Eintracht Frankfurt",
      "away_team": "Union Berlin",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.74,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.26,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.7,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.05,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.68,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.88,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.96,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.87,
                  "point": 2.75
                },
                {
                  "name": "Under",
                  "price": 1.95,
                  "point": 2.75
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.64,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.1,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.67,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.65,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.15,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "4f43a8297717005f73a3af6997684108",
      "sport_key": "soccer_germany_bundesliga",
      "sport_title": "Bundesliga - Germany",
      "commence_time": "2025-03-09T16:30:00Z",
      "home_team": "TSG Hoffenheim",
      "away_team": "1. FC Heidenheim",
      "bookmakers": [
        {
          "key": "onexbet",
          "title": "1xBet",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.66,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.42,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "fliff",
          "title": "Fliff",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "windcreek",
          "title": "Wind Creek",
          "last_update": "2025-02-28T21:02:08Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:02:08Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tipico_de",
          "title": "Tipico",
          "last_update": "2025-02-28T21:15:14Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:14Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "williamhill",
          "title": "William Hill",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.62,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.2,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "pinnacle",
          "title": "Pinnacle",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.83,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "bovada",
          "title": "Bovada",
          "last_update": "2025-02-28T21:15:11Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:11Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 2.02,
                  "point": 3
                },
                {
                  "name": "Under",
                  "price": 1.82,
                  "point": 3
                }
              ]
            }
          ]
        },
        {
          "key": "betrivers",
          "title": "BetRivers",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "ballybet",
          "title": "Bally Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "leovegas",
          "title": "LeoVegas",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.53,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.32,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_uk",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betparx",
          "title": "betPARX",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "casumo",
          "title": "Casumo",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "unibet_eu",
          "title": "Unibet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "grosvenor",
          "title": "Grosvenor",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "tabtouch",
          "title": "TABtouch",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.56,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.35,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "nordicbet",
          "title": "Nordic Bet",
          "last_update": "2025-02-28T21:15:12Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:12Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "betsson",
          "title": "Betsson",
          "last_update": "2025-02-28T21:15:17Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:17Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.63,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.3,
                  "point": 2.5
                }
              ]
            }
          ]
        },
        {
          "key": "playup",
          "title": "PlayUp",
          "last_update": "2025-02-28T21:15:13Z",
          "markets": [
            {
              "key": "totals",
              "last_update": "2025-02-28T21:15:13Z",
              "outcomes": [
                {
                  "name": "Over",
                  "price": 1.6,
                  "point": 2.5
                },
                {
                  "name": "Under",
                  "price": 2.25,
                  "point": 2.5
                }
              ]
            }
          ]
        }
      ]
    }
  ]