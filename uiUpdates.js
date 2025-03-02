export function generateTitleBox(event) {
    //Create a new div
    const titleBox = document.createElement("div")
    titleBox.classList.add("info-container")

    //Create a match header to display league and teams
    const titleHeader = document.createElement("h2")
    const titleString = event.title + ": " + event.homeTeam + " vs " + event.awayTeam
    titleHeader.innerHTML = titleString
    titleBox.appendChild(titleHeader)

    //Create a paragraph for commence time
    const commenceTimeText = document.createElement("p")
    const formattedCommenceTime = formatCommenceTime(event.commenceTime)
    commenceTimeText.innerHTML = formattedCommenceTime
    titleBox.appendChild(commenceTimeText)

    
    

    return titleBox
}

export function generateMiddleParagraph(event) {
    const middleParagraph = document.createElement("p")
    const score = event.winCombo.score
    const scoreString = "Totals: yli/alle " + score
    middleParagraph.innerHTML = scoreString
    return middleParagraph
}

export function generateOddBox(event) {
    const oddBox = document.createElement("div")
    oddBox.classList.add("odds-container")

    //Container for overbet
    const overbetBox = generateOverBetBox(event)
    oddBox.appendChild(overbetBox)

    //Container for underbet
    const underbetBox = generateUnderBetBox(event)
    oddBox.appendChild(underbetBox)

    //Container for total probability
    const totalProbBox = generateTotalProbabilityBox(event)
    oddBox.appendChild(totalProbBox)

    //Container for profit
    const profitBox = generateProfitBox(event)
    oddBox.appendChild(profitBox)
    

    return oddBox
}

export function generateOverBetBox(event) {
    const overBetBox = document.createElement("div")
    overBetBox.classList.add("odd-box")
    const overMarketparagraph = document.createElement("p")
    overMarketparagraph.innerHTML = event.winCombo.overBooker + ": yli " + event.winCombo.score
    overBetBox.appendChild(overMarketparagraph)

    const overBetDecimalBox = document.createElement("p")
    overBetDecimalBox.classList.add("decimal")
    overBetDecimalBox.innerHTML = event.winCombo.overPrice
    overBetBox.appendChild(overBetDecimalBox)

    return overBetBox
}

export function generateUnderBetBox(event) {
    const underBetBox = document.createElement("div")
    underBetBox.classList.add("odd-box")
    const underMarketparagraph = document.createElement("p")
    underMarketparagraph.innerHTML = event.winCombo.underBooker + ": alle " + event.winCombo.score
    underBetBox.appendChild(underMarketparagraph)

    const underBetDecimalBox = document.createElement("p")
    underBetDecimalBox.classList.add("decimal")
    underBetDecimalBox.innerHTML = event.winCombo.underPrice
    underBetBox.appendChild(underBetDecimalBox)

    return underBetBox
}

export function generateTotalProbabilityBox(event) {
    const totalProbBox = document.createElement("div")
    totalProbBox.classList.add("odd-box")
    const totalProbParagraph = document.createElement("p")
    totalProbParagraph.innerHTML = "Yhteenlaskettu tod. näk."
    totalProbBox.appendChild(totalProbParagraph)

    const totalProbDecimalBox = document.createElement("p")
    totalProbDecimalBox.classList.add("decimal")

    const overProbability = 1 / event.winCombo.overPrice
    const underProbability = 1 / event.winCombo.underPrice
    const totalProbability = overProbability + underProbability

    totalProbDecimalBox.innerHTML = parseFloat((totalProbability).toFixed(3));
    totalProbBox.appendChild(totalProbDecimalBox)

    return totalProbBox
}

export function generateProfitBox(event) {
    const profitBox = document.createElement("div")
    profitBox.classList.add("odd-box")

    const profitParagraph = document.createElement("p")
    profitParagraph.innerHTML = "Voittoprosentti"
    profitBox.appendChild(profitParagraph)

    const profitDecimalBox = document.createElement("p")
    profitDecimalBox.classList.add("decimal")

    const overProbability = 1 / event.winCombo.overPrice
    const underProbability = 1 / event.winCombo.underPrice
    const totalProbability = overProbability + underProbability
    const profit = 1 - totalProbability
    const profitPercentage = profit * 100
    const roundedProfit = parseFloat((profitPercentage).toFixed(2));
    profitDecimalBox.innerHTML = roundedProfit + "%"

    profitBox.appendChild(profitDecimalBox)

    if (profit > 0) {
        profitDecimalBox.style.color = "lightgreen";
    } else if (profit > -0.01) {
        profitDecimalBox.style.color = "yellow";
    } else if (profit > -0.05) {
        profitDecimalBox.style.color = "orange";
    } else {
        profitDecimalBox.style.color = "red";
    }

    return profitBox
}

function formatCommenceTime(isoString) {
    const date = new Date(isoString);

    // Extract date components
    const day = String(date.getUTCDate()).padStart(2, '0'); // Ensure two digits
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getUTCFullYear();

    // Extract time components
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}