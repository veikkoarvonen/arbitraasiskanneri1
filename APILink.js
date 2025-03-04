import { getAPIKey } from "./APIKey.js"

const sportKeys = [
    "soccer_argentina_primera_division", // Argentina Primera División
    "soccer_australia_aleague", // Australia A-League
    "soccer_austria_bundesliga", // Austria Bundesliga
    "soccer_belgium_first_div", // Belgium First Division A
    "soccer_brazil_campeonato", // Brazil Campeonato Brasileiro Série A
    "soccer_chile_campeonato", // Chile Campeonato Nacional
    "soccer_china_superleague", // China Super League
    "soccer_conmebol_copa_libertadores", // CONMEBOL Copa Libertadores
    "soccer_denmark_superliga", // Denmark Superliga
    "soccer_efl_champ", // EFL Championship
    "soccer_england_efl_cup", // England EFL Cup
    "soccer_england_league1", // England League One
    "soccer_england_league2", // England League Two
    "soccer_epl", // English Premier League (EPL)
    "soccer_fa_cup", // FA Cup
    "soccer_fifa_world_cup_winner", // FIFA World Cup Winner
    "soccer_france_ligue_one", // France Ligue 1
    "soccer_france_ligue_two", // France Ligue 2
    "soccer_germany_bundesliga", // Germany Bundesliga
    "soccer_germany_bundesliga2", // Germany Bundesliga 2
    "soccer_germany_liga3", // Germany 3. Liga
    "soccer_greece_super_league", // Greece Super League
    "soccer_italy_serie_a", // Italy Serie A
    "soccer_italy_serie_b", // Italy Serie B
    "soccer_japan_j_league", // Japan J-League
    "soccer_korea_kleague1", // South Korea K League 1
    "soccer_league_of_ireland", // League of Ireland Premier Division
    "soccer_mexico_ligamx", // Mexico Liga MX
    "soccer_netherlands_eredivisie", // Netherlands Eredivisie
    "soccer_norway_eliteserien", // Norway Eliteserien
    "soccer_poland_ekstraklasa", // Poland Ekstraklasa
    "soccer_portugal_primeira_liga", // Portugal Primeira Liga
    "soccer_spain_la_liga", // Spain La Liga
    "soccer_spain_segunda_division", // Spain Segunda División
    "soccer_spl", // Scottish Premiership (SPL)
    "soccer_sweden_allsvenskan", // Sweden Allsvenskan
    "soccer_switzerland_superleague", // Switzerland Super League
    "soccer_turkey_super_league", // Turkey Süper Lig
    "soccer_uefa_champs_league", // UEFA Champions League
    "soccer_uefa_europa_conference_league", // UEFA Europa Conference League
    "soccer_uefa_europa_league", // UEFA Europa League
    "soccer_usa_mls" // USA Major League Soccer (MLS)
];



    export function generateLink(sportKeyIndex) {
        const baseURL = "https://api.the-odds-api.com/v4/sports/";
        const sportID = sportKeys[sportKeyIndex]; // Get sport key from array
        const middleURL = "/odds/?apiKey=";
        const apiKey = getAPIKey(); // Fetch API key from the module
        const endURL = "&regions=us,us2,uk,au,eu&markets=totals&oddsFormat=decimal";
    
        if (!sportID) {
            console.error("Invalid sport index:", sportKeyIndex);
            return null;
        }
    
        const fullURL = `${baseURL}${sportID}${middleURL}${apiKey}${endURL}`;
        return fullURL;
    }

    export async function fetchOdds(requestLink) {
        try {
            const response = await fetch(requestLink);
    
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            
            const data = await response.json();
            //console.log("API Response:", data); 
    
            return data; 
        } catch (error) {
            console.error("Error fetching odds data:", error);
            return null; 
        }
    }




