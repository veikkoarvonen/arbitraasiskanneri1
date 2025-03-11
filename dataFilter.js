

//Filter points that are not halfs
export function filterNonhalfPointers(markets) {
    var filteredMarkets = []
    markets.forEach(market => {
        if (market.overScore % 1 === 0.5) {
            filteredMarkets.push(market)
        }
    })
    return filteredMarkets
}

//Generate the best possible betting combo from markets
export function generateWinnerCombo(markets) {
    var winnerCombo = new winnerMarketCombo(0, "Empty", 0, "Empty", 0, 0)

    //Loop through markets to find highest odds
    markets.forEach(market => {
            if (market.overPrice > winnerCombo.overPrice) {
                winnerCombo.overBooker = market.name
                winnerCombo.overPrice = market.overPrice
            }

            if (market.underPrice > winnerCombo.underPrice) {
                winnerCombo.underBooker = market.name
                winnerCombo.underPrice = market.underPrice
            }
    })

    winnerCombo.score = markets[0].overScore

    //Calculate the payback/profit
    const overOdds = 1 / winnerCombo.overPrice
    const underOdds = 1 / winnerCombo.underPrice
    const totalProbability = overOdds + underOdds
    const profit = (1 - totalProbability) / totalProbability
    const pb = parseFloat((1 + profit).toFixed(3));
    winnerCombo.payback = pb
    return winnerCombo
}

//Get different point occurrences
export function getPointVariations(markets) {
    var occurredPoints = []
    markets.forEach(market => {
        const point = market.overScore
        if (!occurredPoints.includes(point)) {
            occurredPoints.push(point)
        }
    })
    return occurredPoints
}

//Filter array to display only the most frequent score
export function filterMostFrequentOverScore(markets) {
    if (markets.length === 0) return [];


    const scoreCounts = {};
    markets.forEach(market => {
        scoreCounts[market.overScore] = (scoreCounts[market.overScore] || 0) + 1;
    });

  
    const maxCount = Math.max(...Object.values(scoreCounts));

 
    const mostFrequentScores = Object.keys(scoreCounts)
        .map(Number)
        .filter(score => scoreCounts[score] === maxCount);

   
    const highestFrequentScore = Math.max(...mostFrequentScores);

   
    return markets.filter(market => market.overScore === highestFrequentScore);
}





//Filter markets with different over & under scores
export function filterDifferentPoints(markets) {
    var filteredMarkets = []
    markets.forEach(market => {
      if (market.overScore == market.underScore) {
        filteredMarkets.push(market)
      }
    })
    return filteredMarkets
}

//Generate betting market array
export function generateBettingMarkets(bookmarkers) {
    var markers = []
    bookmarkers.forEach(bookmarker => {
        const name = bookmarker.title
        const overOutcome = bookmarker.markets[0].outcomes[0]
        const underOutcome = bookmarker.markets[0].outcomes[1]
        const overPoint = overOutcome.point
        const overPrice = overOutcome.price
        const underPoint = underOutcome.point
        const underPrice = underOutcome.price
        const market = new bettingMarket(name, overPoint, overPrice, underPoint, underPrice)
        markers.push(market)
    })
    return markers
}

//Generate an object for displayable event
export function generateEventToDisplay(event, winCombo) {
    const title = event.sport_title
    const home = event.home_team
    const away = event.away_team
    const beginning = event.commence_time
    const winningCombo = winCombo
    const newEvent = new eventToDisplay(title, home, away, beginning, winningCombo)
    return newEvent
}


//CUSTOM OBJECTS

class bettingMarket {
    constructor(name, overScore, overPrice, underScore, underPrice) {
        this.name = name;
        this.overScore = overScore;
        this.overPrice = overPrice;
        this.underScore = underScore
        this.underPrice = underPrice
    }
}

class winnerMarketCombo {
    constructor(score, overBooker, overPrice, underBooker, underPrice, payback) {
        this.score = score
        this.overBooker = overBooker
        this.overPrice = overPrice
        this.underBooker = underBooker
        this.underPrice = underPrice
        this.payback = payback
    }
}

class eventToDisplay {
    constructor(title, homeTeam, awayTeam, commenceTime, winCombo) {
        this.title = title
        this.homeTeam = homeTeam
        this.awayTeam = awayTeam
        this.commenceTime = commenceTime
        this.winCombo = winCombo
    }
}