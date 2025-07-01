import { Game, InsertGame } from "@shared/schema";

interface ESPNGame {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: Array<{
    id: string;
    competitors: Array<{
      id: string;
      team: {
        id: string;
        displayName: string;
        abbreviation: string;
      };
      homeAway: "home" | "away";
      score: string;
    }>;
    odds?: Array<{
      details: string;
      overUnder: number;
    }>;
    status: {
      type: {
        name: string;
        state: string;
      };
    };
  }>;
}

interface ESPNResponse {
  events: ESPNGame[];
}

export class SportsDataService {
  private readonly baseUrl = "https://site.api.espn.com/apis/site/v2/sports";

  async fetchNBAGames(): Promise<InsertGame[]> {
    try {
      const response = await fetch(`${this.baseUrl}/basketball/nba/scoreboard`);
      const data: ESPNResponse = await response.json();
      return this.transformESPNGames(data.events, "NBA");
    } catch (error) {
      console.error("Error fetching NBA games:", error);
      return [];
    }
  }

  async fetchNFLGames(): Promise<InsertGame[]> {
    try {
      const response = await fetch(`${this.baseUrl}/football/nfl/scoreboard`);
      const data: ESPNResponse = await response.json();
      return this.transformESPNGames(data.events, "NFL");
    } catch (error) {
      console.error("Error fetching NFL games:", error);
      return [];
    }
  }

  async fetchMLBGames(): Promise<InsertGame[]> {
    try {
      const response = await fetch(`${this.baseUrl}/baseball/mlb/scoreboard`);
      const data: ESPNResponse = await response.json();
      return this.transformESPNGames(data.events, "MLB");
    } catch (error) {
      console.error("Error fetching MLB games:", error);
      return [];
    }
  }

  async fetchNHLGames(): Promise<InsertGame[]> {
    try {
      const response = await fetch(`${this.baseUrl}/hockey/nhl/scoreboard`);
      const data: ESPNResponse = await response.json();
      return this.transformESPNGames(data.events, "NHL");
    } catch (error) {
      console.error("Error fetching NHL games:", error);
      return [];
    }
  }

  async fetchAllSportsGames(): Promise<InsertGame[]> {
    const [nbaGames, nflGames, mlbGames, nhlGames] = await Promise.all([
      this.fetchNBAGames(),
      this.fetchNFLGames(),
      this.fetchMLBGames(),
      this.fetchNHLGames(),
    ]);

    return [...nbaGames, ...nflGames, ...mlbGames, ...nhlGames];
  }

  private transformESPNGames(espnGames: ESPNGame[], sport: string): InsertGame[] {
    return espnGames.map(game => {
      const competition = game.competitions[0];
      const homeTeam = competition.competitors.find(c => c.homeAway === "home");
      const awayTeam = competition.competitors.find(c => c.homeAway === "away");
      
      if (!homeTeam || !awayTeam) {
        throw new Error("Invalid game data: missing home or away team");
      }

      // Generate realistic betting lines based on sport
      const lines = this.generateBettingLines(sport, homeTeam.team.displayName, awayTeam.team.displayName);
      
      // Determine game status
      let status = "scheduled";
      if (competition.status.type.state === "in") {
        status = "live";
      } else if (competition.status.type.state === "post") {
        status = "finished";
      }

      return {
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        gameTime: new Date(game.date),
        sport,
        homeSpread: lines.homeSpread,
        awaySpread: lines.awaySpread,
        totalPoints: lines.total,
        homeMoneyline: lines.homeML,
        awayMoneyline: lines.awayML,
        status,
        homeScore: status === "finished" ? parseInt(homeTeam.score) || null : null,
        awayScore: status === "finished" ? parseInt(awayTeam.score) || null : null,
      };
    }).slice(0, 10); // Limit to 10 games per sport
  }

  private generateBettingLines(sport: string, homeTeam: string, awayTeam: string) {
    // Generate realistic betting lines based on sport and team strength
    const spread = this.calculateSpread(sport, homeTeam, awayTeam);
    const total = this.calculateTotal(sport);
    
    return {
      homeSpread: spread > 0 ? `-${spread.toFixed(1)}` : `+${Math.abs(spread).toFixed(1)}`,
      awaySpread: spread > 0 ? `+${spread.toFixed(1)}` : `-${Math.abs(spread).toFixed(1)}`,
      total: total.toFixed(1),
      homeML: spread > 0 ? this.spreadToMoneyline(spread) : this.spreadToMoneyline(-spread, true),
      awayML: spread > 0 ? this.spreadToMoneyline(-spread, true) : this.spreadToMoneyline(spread),
    };
  }

  private calculateSpread(sport: string, homeTeam: string, awayTeam: string): number {
    // Simple team strength estimation based on common team names
    const strongTeams = {
      NBA: ["Lakers", "Warriors", "Celtics", "Heat", "Bucks", "Nuggets", "Suns"],
      NFL: ["Chiefs", "Bills", "Eagles", "Cowboys", "49ers", "Ravens", "Packers"],
      MLB: ["Dodgers", "Yankees", "Astros", "Braves", "Phillies", "Mets", "Padres"],
      NHL: ["Avalanche", "Lightning", "Rangers", "Bruins", "Panthers", "Oilers", "Stars"]
    };

    const strong = strongTeams[sport as keyof typeof strongTeams] || [];
    const homeStrong = strong.some(team => homeTeam.includes(team));
    const awayStrong = strong.some(team => awayTeam.includes(team));

    let spread = Math.random() * 10 - 2; // Base range: -2 to +8 (home advantage)
    
    if (homeStrong && !awayStrong) spread += 3;
    if (!homeStrong && awayStrong) spread -= 3;
    
    // Sport-specific adjustments
    if (sport === "NBA") spread = Math.max(-15, Math.min(15, spread));
    if (sport === "NFL") spread = Math.max(-14, Math.min(14, spread));
    if (sport === "MLB") spread = Math.max(-2.5, Math.min(2.5, spread));
    if (sport === "NHL") spread = Math.max(-2.5, Math.min(2.5, spread));

    return Math.round(spread * 2) / 2; // Round to nearest 0.5
  }

  private calculateTotal(sport: string): number {
    const totals = {
      NBA: 210 + Math.random() * 30, // 210-240
      NFL: 40 + Math.random() * 20,  // 40-60
      MLB: 7 + Math.random() * 6,    // 7-13
      NHL: 5.5 + Math.random() * 2   // 5.5-7.5
    };

    const base = totals[sport as keyof typeof totals] || 100;
    return Math.round(base * 2) / 2; // Round to nearest 0.5
  }

  private spreadToMoneyline(spread: number, underdog = false): number {
    // Convert point spread to approximate moneyline
    const absSpread = Math.abs(spread);
    let ml: number;

    if (absSpread <= 1) ml = -110;
    else if (absSpread <= 2.5) ml = underdog ? 120 : -140;
    else if (absSpread <= 4.5) ml = underdog ? 160 : -180;
    else if (absSpread <= 7) ml = underdog ? 220 : -250;
    else ml = underdog ? 300 : -350;

    return ml;
  }
}

export const sportsDataService = new SportsDataService();