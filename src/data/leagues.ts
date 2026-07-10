import type { League, Club, AIPlayer, Position, LeagueName } from '../types';

const positions: Position[] = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

const englishFirst = [
  'James', 'Oliver', 'Harry', 'Jack', 'Charlie', 'Thomas', 'George', 'William', 'Henry',
  'Daniel', 'Samuel', 'Joseph', 'David', 'Luke', 'Alexander', 'Ryan', 'Nathan', 'Jake',
  'Dylan', 'Ethan', 'Aaron', 'Ben', 'Callum', 'Connor', 'Declan', 'Edward', 'Freddie',
  'Harvey', 'Isaac', 'Joshua', 'Kyle', 'Lewis', 'Max', 'Noah', 'Oscar', 'Patrick',
  'Riley', 'Sebastian', 'Toby', 'Zachary', 'Adam', 'Bradley', 'Craig', 'Darren',
  'Elliot', 'Frank', 'Graham', 'Ian', 'Jason', 'Kevin'
];

const englishLast = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Wilson', 'Taylor', 'Anderson',
  'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Robinson',
  'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Hill',
  'Moore', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell',
  'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards',
  'Collins', 'Stewart', 'Morris', 'Reid', 'Murray', 'Cook', 'Morgan', 'Bell',
  'Ward', 'Watson', 'Davies', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross',
  'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes',
  'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzalez', 'Bryant',
  'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton',
  'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens',
  'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson', 'Mcdonald', 'Cruz', 'Marshall',
  'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens'
];

const spanishFirst = [
  'Alejandro', 'Carlos', 'David', 'Diego', 'Francisco', 'Hector', 'Isco', 'Javier',
  'Jorge', 'Jose', 'Juan', 'Luis', 'Manuel', 'Marco', 'Miguel', 'Pablo', 'Pedro',
  'Rafael', 'Raul', 'Sergio', 'Alvaro', 'Andres', 'Antonio', 'Bruno', 'Cesar',
  'Daniel', 'Emilio', 'Enrique', 'Felipe', 'Fernando', 'Gabriel', 'Gonzalo',
  'Guillermo', 'Hugo', 'Ignacio', 'Iker', 'Jaime', 'Julian', 'Leonardo', 'Lucas'
];

const spanishLast = [
  'Garcia', 'Rodriguez', 'Martinez', 'Fernandez', 'Lopez', 'Gonzalez', 'Perez',
  'Sanchez', 'Ramirez', 'Torres', 'Moreno', 'Jimenez', 'Ruiz', 'Alvarez', 'Romero',
  'Navarro', 'Gutierrez', 'Dominguez', 'Vazquez', 'Ramos', 'Gil', 'Serrano',
  'Blanco', 'Suarez', 'Molina', 'Iglesias', 'Ortiz', 'Morales', 'Santos', 'Mendez',
  'Cruz', 'Delgado', 'Reyes', 'Castro', 'Ortega', 'Rubio', 'Marin', 'Campos',
  'Nunez', 'Iglesias', 'Cortes', 'Guerrero', 'Lorenzo', 'Herrera', 'Flores'
];

const italianFirst = [
  'Alessandro', 'Andrea', 'Antonio', 'Davide', 'Fabio', 'Federico', 'Francesco',
  'Gianluigi', 'Giorgio', 'Giovanni', 'Giuseppe', 'Leonardo', 'Lorenzo', 'Luca',
  'Marco', 'Matteo', 'Mattia', 'Michele', 'Niccolo', 'Nicolo', 'Paolo', 'Riccardo',
  'Roberto', 'Salvatore', 'Simone', 'Stefano', 'Tommaso', 'Valentino', 'Vincenzo',
  'Alberto', 'Alessio', 'Claudio', 'Daniele', 'Domenico', 'Emanuele', 'Fabrizio'
];

const italianLast = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci',
  'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'Costa', 'Mancini', 'Barbieri',
  'Fontana', 'Rinaldi', 'Caruso', 'Moretti', 'Rizzi', 'Fabbri', 'Marchetti',
  'Parisi', 'Vitali', 'Villa', 'Sartori', 'Guerra', 'Longo', 'Santoro', 'Ferri',
  'Ferrara', 'Bianco', 'Giordano', 'Riva', 'Palumbo', 'Sanna', 'Dangelo'
];

const germanFirst = [
  'Lukas', 'Felix', 'Leon', 'Maximilian', 'Jonas', 'Tim', 'Niklas', 'Finn',
  'Julian', 'Philipp', 'Moritz', 'Tobias', 'Jan', 'Marco', 'Bastian', 'Manuel',
  'Thomas', 'Mario', 'Lars', 'Sven', 'Kai', 'Lennart', 'Fabian', 'Dominik',
  'Timo', 'Heiko', 'Jannik', 'Marcel', 'Nico', 'Oliver', 'Rene', 'Stefan'
];

const germanLast = [
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker',
  'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schroeder',
  'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krueger', 'Hofmann', 'Hartmann',
  'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Schmid',
  'Schulze', 'Maier', 'Koehler', 'Herrmann', 'Koenig', 'Mayer', 'Walter', 'Peters'
];

const frenchFirst = [
  'Antoine', 'Aurelien', 'Benoit', 'Clement', 'Damien', 'Emmanuel', 'Florian',
  'Gabriel', 'Hugo', 'Jean', 'Jeremy', 'Jonathan', 'Julien', 'Kylian', 'Leo',
  'Lucas', 'Mathieu', 'Maxime', 'Nicolas', 'Olivier', 'Pierre', 'Quentin',
  'Raphael', 'Romain', 'Samuel', 'Sebastien', 'Theo', 'Thomas', 'Valentin',
  'William', 'Alexandre', 'Baptiste', 'Charles', 'Dorian', 'Etienne', 'Fabien'
];

const frenchLast = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand',
  'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David',
  'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'Andre', 'Lefevre',
  'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Francois', 'Martinez', 'Legrand',
  'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Rey'
];

const dutchFirst = [
  'Daan', 'Sem', 'Lukas', 'Levi', 'Finn', 'Milan', 'Jesse', 'Thomas', 'Tim',
  'Ryan', 'Noah', 'Lars', 'Sven', 'Bram', 'Niels', 'Dirk', 'Jasper', 'Wout',
  'Ruben', 'Dennis', 'Martijn', 'Stefan', 'Jeroen', 'Arjen', 'Robin', 'Danny'
];

const dutchLast = [
  'De Jong', 'Van Dijk', 'De Vries', 'Van den Berg', 'Van der Heijden', 'Bakker',
  'Janssen', 'Visser', 'Smit', 'De Boer', 'Mulder', 'De Groot', 'Bos', 'Vos',
  'Peters', 'Hendriks', 'Van Leeuwen', 'Dekker', 'Brouwer', 'De Wit', 'Dijkstra',
  'De Graaf', 'Van der Linden', 'Herman', 'Koning', 'Koeman', 'Bergkamp'
];

const portugueseFirst = [
  'Joao', 'Miguel', 'Pedro', 'Rui', 'Bruno', 'Carlos', 'Diogo', 'Duarte',
  'Filipe', 'Goncalo', 'Hugo', 'Jose', 'Luis', 'Manuel', 'Nuno', 'Paulo',
  'Ricardo', 'Ruben', 'Sergio', 'Tiago', 'Vasco', 'Andre', 'Bernardo', 'Cristiano'
];

const portugueseLast = [
  'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues',
  'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Goncalves', 'Pinto', 'Ribeiro',
  'Carvalho', 'Teixeira', 'Moreira', 'Correia', 'Mendes', 'Neves', 'Gomes',
  'Araujo', 'Lopes', 'Monteiro', 'Cardoso', 'Reis', 'Dias', 'Barbosa', 'Soares'
];

const brazilianFirst = [
  'Gabriel', 'Lucas', 'Rafael', 'Felipe', 'Marcos', 'Pedro', 'Bruno', 'Diego',
  'Gustavo', 'Vinicius', 'Caio', 'Thiago', 'Arthur', 'Joao', 'Igor', 'Leandro',
  'Renato', 'Ronaldo', 'Alex', 'Andre', 'Carlos', 'Eduardo', 'Fernando', 'Hugo',
  'Julio', 'Leonardo', 'Marcelo', 'Neymar', 'Paulo', 'Roberto'
];

const brazilianLast = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira',
  'Rodrigues', 'Almeida', 'Nascimento', 'Araujo', 'Ribeiro', 'Carvalho', 'Gomes',
  'Martins', 'Barbosa', 'Rocha', 'Dias', 'Moreira', 'Teixeira', 'Cardoso', 'Cavalcanti',
  'Mendes', 'Soares', 'Vieira', 'Monteiro', 'Campos', 'Freitas', 'Pinto'
];

const argentinianFirst = [
  'Lionel', 'Angel', 'Julian', 'Lautaro', 'Emiliano', 'Rodrigo', 'Paulo',
  'Alejandro', 'Gonzalo', 'Nicolas', 'Leandro', 'Mauro', 'Facundo', 'Sergio',
  'Juan', 'Lucas', 'Exequiel', 'German', 'Cristian', 'Matias', 'Federico',
  'Agustin', 'Guido', 'Marcos', 'Joaquin', 'Adrian', 'Alan', 'Braian'
];

const argentinianLast = [
  'Martinez', 'Fernandez', 'Gonzalez', 'Rodriguez', 'Lopez', 'Perez', 'Romero',
  'Garcia', 'Diaz', 'Torres', 'Moreno', 'Sosa', 'Alvarez', 'Gutierrez', 'Ruiz',
  'Castillo', 'Cruz', 'Medina', 'Gomez', 'Acosta', 'Dominguez', 'Herrera',
  'Pereyra', 'Rojas', 'Aguero', 'Battaglia', 'Palacios', 'Di Maria'
];


const americanFirst = [
  'Christian', 'Weston', 'Tyler', 'Giovanni', 'Timothy', 'Matt', 'Jordan',
  'Brenden', 'Ricardo', 'Walker', 'DeAndre', 'Kellyn', 'Paul', 'Cristian',
  'Luca', 'Cade', 'Cameron', 'Ethan', 'Sebastian', 'Josh', 'Miles', 'Aaron',
  'Brandon', 'Jesse', 'Sean', 'Chris', 'Michael', 'Andrew', 'Nicholas', 'Zach'
];

const americanLast = [
  'Pulisic', 'McKennie', 'Adams', 'Reyna', 'Weah', 'Turner', 'Dest', 'Aaronson',
  'Pepi', 'Zimmerman', 'Yedlin', 'Acosta', 'Arriola', 'Roldan', 'Ferreira',
  'Musah', 'Scally', 'Tillman', 'Booth', 'Sargent', 'Vazquez', 'Cowell',
  'Williamson', 'Zendejas', 'Morris', 'Lletget', 'Long', 'Brooks', 'Miazga',
  'Cannon', 'De La Torre', 'Busio', 'Hoppe', 'Paredes', 'Tessmann'
];

const turkishFirst = [
  'Ahmet', 'Mehmet', 'Ali', 'Hasan', 'Huseyin', 'Mustafa', 'Osman', 'Ibrahim',
  'Ismail', 'Yusuf', 'Murat', 'Omer', 'Kemal', 'Burak', 'Cenk', 'Emre',
  'Cengiz', 'Hakan', 'Mert', 'Can', 'Arda', 'Kerem', 'Eren', 'Baris',
  'Volkan', 'Tuncay', 'Serkan', 'Ugur', 'Gokhan', 'Orkun', 'Efe', 'Yasin'
];

const turkishLast = [
  'Yilmaz', 'Demir', 'Celik', 'Sahin', 'Kaya', 'Ozturk', 'Aydin', 'Dogan',
  'Yildiz', 'Aslan', 'Kara', 'Polat', 'Ozdemir', 'Arslan', 'Taskiran',
  'Aksoy', 'Koc', 'Kurt', 'Erdogan', 'Guler', 'Bulut', 'Turan', 'Kilic',
  'Sener', 'Korkmaz', 'Cakir', 'Yalcin', 'Kaplan', 'Ozer', 'Aktas', 'Genc'
];

const saudiFirst = [
  'Salem', 'Fahad', 'Mohammed', 'Abdullah', 'Sultan', 'Khalid', 'Nasser',
  'Yasser', 'Mansour', 'Majed', 'Hassan', 'Omar', 'Ali', 'Ibrahim',
  'Saad', 'Turki', 'Abdulaziz', 'Nawaf', 'Bandar', 'Hussein', 'Yahya'
];

const saudiLast = [
  'Al-Dawsari', 'Al-Faraj', 'Al-Muwallad', 'Al-Shahrani', 'Al-Owais', 'Al-Breik',
  'Al-Otaibi', 'Al-Qahtani', 'Al-Shehri', 'Al-Zahrani', 'Al-Ghamdi', 'Al-Harbi',
  'Al-Sulayhem', 'Al-Abed', 'Al-Hawsawi', 'Al-Jassim', 'Al-Sweilem', 'Al-Shammari',
  'Al-Khaibari', 'Al-Bishi', 'Al-Hamdan', 'Al-Malki', 'Al-Khalaf'
];

function baseOvr(reputation: number, variation: number): number {
  const min = Math.max(50, reputation - 25);
  const max = Math.min(94, reputation + 10);
  return Math.round(min + ((max - min) * variation) / 10);
}

function clamp(val: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, val)));
}

function attrValue(ovr: number, modifier: number): number {
  return clamp(ovr + modifier, 30, 99);
}

function generateAIPlayer(
  clubId: string,
  position: Position,
  index: number,
  clubRep: number,
  name: string,
  nationality: string,
  agePool: number[]
): AIPlayer {
  const variation = 1 - index * 0.07;
  const ovr = baseOvr(clubRep, variation);
  const age = agePool[index % agePool.length];
  const form = clamp(5 + Math.round(Math.random() * 4), 5, 9);
  const morale = clamp(40 + Math.round(Math.random() * 50), 40, 90);
  const contractYears = 1 + Math.round(Math.random() * 4);

  const weeklySalaryMultiplier = position === 'GK' || position === 'ST' || position === 'CAM' ? 1.2 : 1.0;
  const weeklySalary = Math.round((300 + ovr * 80) * weeklySalaryMultiplier);
  const value = Math.round(ovr * ovr * 850 + weeklySalary * 40);

  const gamesPlayed = Math.round(Math.random() * 30 + 6);
  const averageRating = clamp(6.0 + (ovr - 50) * 0.035 + (Math.random() - 0.5) * 0.4, 6.0, 8.5);

  let goals = 0;
  let assists = 0;
  let cleanSheets = 0;
  let yellowCards = Math.round(Math.random() * 5);
  let redCards = Math.round(Math.random() * 1);

  if (position === 'ST' || position === 'CF') {
    goals = Math.round(Math.random() * 20 + 3);
    assists = Math.round(Math.random() * 8);
  } else if (position === 'LW' || position === 'RW') {
    goals = Math.round(Math.random() * 12 + 1);
    assists = Math.round(Math.random() * 10);
  } else if (position === 'CAM' || position === 'CM') {
    goals = Math.round(Math.random() * 6);
    assists = Math.round(Math.random() * 10 + 2);
  } else if (position === 'GK') {
    cleanSheets = Math.round(Math.random() * 12 + 1);
  } else if (position === 'CB' || position === 'LB' || position === 'RB') {
    goals = Math.round(Math.random() * 3);
    assists = Math.round(Math.random() * 5);
  } else if (position === 'CDM') {
    goals = Math.round(Math.random() * 4);
    assists = Math.round(Math.random() * 5);
    yellowCards = Math.round(Math.random() * 8);
  }

  const isGK = position === 'GK';
  const isDef = position === 'CB' || position === 'LB' || position === 'RB' || position === 'CDM';
  const isFwd = position === 'ST' || position === 'CF' || position === 'LW' || position === 'RW';

  return {
    id: `${clubId}-${position}-${index + 1}`,
    name,
    position,
    ovr,
    age,
    nationality,
    form,
    morale,
    contractYears,
    weeklySalary,
    value,
    attributes: {
      pace: isGK ? clamp(ovr - 15 + Math.round(Math.random() * 10), 30, 99) : attrValue(ovr, isFwd ? 5 : isDef ? -3 : 0),
      acceleration: isGK ? clamp(ovr - 12 + Math.round(Math.random() * 10), 30, 99) : attrValue(ovr, isFwd ? 4 : isDef ? -2 : 0),
      sprintSpeed: isGK ? clamp(ovr - 18 + Math.round(Math.random() * 10), 30, 99) : attrValue(ovr, isFwd ? 5 : isDef ? -1 : 0),
      finishing: isGK ? 15 + Math.round(Math.random() * 15) : attrValue(ovr, isFwd ? 3 : -10),
      shotPower: isGK ? 20 + Math.round(Math.random() * 15) : attrValue(ovr, isFwd ? 4 : -5),
      longShots: isGK ? 15 + Math.round(Math.random() * 15) : attrValue(ovr, -2),
      passing: attrValue(ovr, position === 'CM' || position === 'CAM' ? 3 : -1),
      vision: attrValue(ovr, position === 'CAM' || position === 'CM' ? 4 : -2),
      crossing: attrValue(ovr, position === 'LM' || position === 'RM' || position === 'LW' || position === 'RW' || position === 'LB' || position === 'RB' ? 3 : -5),
      dribbling: attrValue(ovr, isFwd || position === 'CAM' ? 3 : -3),
      ballControl: attrValue(ovr, 1),
      agility: attrValue(ovr, isFwd ? 2 : isGK ? 0 : -2),
      balance: attrValue(ovr, isDef ? 1 : 0),
      heading: attrValue(ovr, position === 'CB' || position === 'ST' ? 4 : -3),
      strength: attrValue(ovr, isDef || position === 'ST' ? 3 : 0),
      jumping: attrValue(ovr, 1),
      stamina: attrValue(ovr, 2),
      defensiveAwareness: isGK ? clamp(ovr - 5 + Math.round(Math.random() * 8), 30, 99) : attrValue(ovr, isDef ? 5 : -10),
      standingTackle: isGK ? 15 + Math.round(Math.random() * 15) : attrValue(ovr, isDef ? 5 : -12),
      slidingTackle: isGK ? 10 + Math.round(Math.random() * 15) : attrValue(ovr, isDef ? 3 : -12),
      gkDiving: isGK ? attrValue(ovr, 3) : undefined,
      gkHandling: isGK ? attrValue(ovr, 1) : undefined,
      gkKicking: isGK ? attrValue(ovr, -1) : undefined,
      gkReflexes: isGK ? attrValue(ovr, 4) : undefined,
      gkPositioning: isGK ? attrValue(ovr, 2) : undefined,
    },
    injury: null,
    gamesPlayed,
    goals,
    assists,
    cleanSheets,
    yellowCards,
    redCards,
    averageRating,
  };
}

export function createSquad(
  clubId: string,
  clubRep: number,
  _namePool: string[],
  nationality: string,
  agePool: number[]
): AIPlayer[] {
  const firstNames: string[] = [];
  const lastNames: string[] = [];

  const pools = nationality.split('/');
  pools.forEach((nat) => {
    switch (nat.trim()) {
      case 'England': firstNames.push(...englishFirst); lastNames.push(...englishLast); break;
      case 'Spain': firstNames.push(...spanishFirst); lastNames.push(...spanishLast); break;
      case 'Italy': firstNames.push(...italianFirst); lastNames.push(...italianLast); break;
      case 'Germany': firstNames.push(...germanFirst); lastNames.push(...germanLast); break;
      case 'France': firstNames.push(...frenchFirst); lastNames.push(...frenchLast); break;
      case 'Netherlands': firstNames.push(...dutchFirst); lastNames.push(...dutchLast); break;
      case 'Portugal': firstNames.push(...portugueseFirst); lastNames.push(...portugueseLast); break;
      case 'Brazil': firstNames.push(...brazilianFirst); lastNames.push(...brazilianLast); break;
      case 'Argentina': firstNames.push(...argentinianFirst); lastNames.push(...argentinianLast); break;
      case 'Turkey': firstNames.push(...turkishFirst); lastNames.push(...turkishLast); break;
      case 'Saudi Arabia': firstNames.push(...saudiFirst); lastNames.push(...saudiLast); break;
      case 'USA': firstNames.push(...americanFirst); lastNames.push(...americanLast); break;
      default: firstNames.push(...englishFirst); lastNames.push(...englishLast); break;
    }
  });

  return positions.map((pos, i) => {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3 + clubRep) % lastNames.length]}`;
    return generateAIPlayer(clubId, pos, i, clubRep, name, nationality, agePool);
  });
}

function createClub(
  id: string,
  name: string,
  shortName: string,
  leagueName: LeagueName,
  reputation: number,
  rating: number,
  budget: number,
  weeklySalary: number,
  leaguePosition: number,
  primaryColor: string,
  secondaryColor: string,
  objectives: string[],
  stadium: string,
  namePool: string[],
  nationality: string,
  agePool: number[]
): Club {
  return {
    id,
    name,
    shortName,
    league: leagueName,
    reputation,
    rating,
    budget,
    weeklySalary,
    leaguePosition,
    colors: { primary: primaryColor, secondary: secondaryColor },
    objectives,
    stadium,
    aiSquad: createSquad(id, reputation, namePool, nationality, agePool),
  };
}

const engAge = [25, 28, 24, 30, 22, 27, 26, 23, 29, 21, 31];

// -- Real-club support (football-data.org) --

const CLUB_REPUTATION: Record<string, number> = {
  'Arsenal': 88, 'Aston Villa': 82, 'Chelsea': 85, 'Liverpool': 88, 'Manchester City': 90,
  'Manchester United': 87, 'Tottenham': 84, 'Newcastle United': 83, 'Brighton & Hove Albion': 78,
  'West Ham United': 79, 'Crystal Palace': 76, 'Everton': 75, 'Fulham': 76, 'Nottingham Forest': 75,
  'Brentford': 76, 'Wolverhampton Wanderers': 77, 'AFC Bournemouth': 74, 'Leicester City': 77,
  'Southampton': 74, 'Ipswich Town': 72,
  'Real Madrid': 92, 'Barcelona': 89, 'Atletico Madrid': 86, 'Athletic Club': 81, 'Real Sociedad': 80,
  'Real Betis': 79, 'Villarreal': 80, 'Valencia': 78, 'Sevilla': 80, 'Girona': 77, 'Osasuna': 75,
  'Celta Vigo': 76, 'Rayo Vallecano': 74, 'Getafe': 74, 'Las Palmas': 73, 'Mallorca': 74,
  'Alaves': 73, 'Espanyol': 74, 'Leganes': 72, 'Valladolid': 72,
  'Inter Milan': 88, 'AC Milan': 86, 'Juventus': 87, 'Roma': 83, 'Napoli': 85, 'Atalanta': 83,
  'Lazio': 81, 'Fiorentina': 80, 'Bologna': 79, 'Torino': 78, 'Udinese': 76, 'Genoa': 75,
  'Monza': 75, 'Hellas Verona': 74,   'Cagliari': 74, 'Lecce': 73, 'Empoli': 73, 'Como': 72,
  'Parma': 74, 'Venezia': 71,
  'Bayern Munich': 90, 'Borussia Dortmund': 85, 'RB Leipzig': 84, 'Bayer Leverkusen': 86,
  'VfB Stuttgart': 80, 'Eintracht Frankfurt': 81, 'VfL Wolfsburg': 78, 'SC Freiburg': 79,
  'Mainz 05': 76, 'FC Augsburg': 75, 'TSG Hoffenheim': 76, 'Werder Bremen': 76,
  'Borussia Monchengladbach': 77, 'Union Berlin': 76, '1. FC Heidenheim': 73, 'VfL Bochum': 73,
  'Holstein Kiel': 72, 'FC St. Pauli': 73,
  'Paris Saint-Germain': 89, 'Olympique Marseille': 82, 'AS Monaco': 82, 'Olympique Lyonnais': 81,
  'Lille OSC': 80, 'OGC Nice': 79, 'RC Lens': 78, 'Stade Rennais': 79, 'Toulouse FC': 75,
  'RC Strasbourg': 76, 'Montpellier HSC': 75, 'Stade Brestois': 76, 'Stade de Reims': 75,
  'Le Havre AC': 73, 'AJ Auxerre': 73, 'Angers SCO': 73, 'FC Nantes': 75, 'AS Saint-Etienne': 74,
  'Ajax': 83, 'PSV Eindhoven': 82, 'Feyenoord': 81, 'AZ Alkmaar': 78, 'FC Twente': 76,
  'FC Utrecht': 74, 'SC Heerenveen': 73, 'FC Groningen': 72, 'NEC Nijmegen': 72, 'Go Ahead Eagles': 71,
  'Heracles Almelo': 70, 'PEC Zwolle': 70, 'RKC Waalwijk': 69, 'NAC Breda': 70, 'Willem II': 70,
  'Almere City': 68, 'Sparta Rotterdam': 71,
  'Benfica': 83, 'FC Porto': 83, 'Sporting CP': 84, 'SC Braga': 78, 'Vitoria Guimaraes': 75,
  'Rio Ave': 72, 'FC Famalicao': 73, 'Moreirense FC': 71, 'Casa Pia': 71, 'Estoril Praia': 71,
  'FC Arouca': 70, 'SC Farense': 69, 'Boavista FC': 70, 'Gil Vicente': 70, 'Estrela da Amadora': 69,
  'CD Nacional': 70, 'AVS': 68, 'Santa Clara': 70,
  'Flamengo': 84, 'Palmeiras': 84, 'Botafogo': 82, 'Sao Paulo': 80, 'Corinthians': 80,
  'Fluminense': 79, 'Internacional': 79, 'Gremio': 79, 'Atletico Mineiro': 80, 'Bahia': 76,
  'Cruzeiro': 78, 'Vasco da Gama': 77, 'Athletico Paranaense': 78, 'Bragantino': 77, 'Cuiaba': 73,
  'Fortaleza': 77, 'Vitoria': 74, 'Juventude': 73, 'Criciuma': 73,
  'Leeds United': 78, 'Sheffield United': 76, 'Burnley': 77, 'Sunderland': 74,
  'West Bromwich Albion': 75, 'Norwich City': 74, 'Middlesbrough': 75, 'Bristol City': 72,
  'Coventry City': 73, 'Preston North End': 72, 'Millwall': 72, 'Queens Park Rangers': 73,
  'Blackburn Rovers': 74, 'Swansea City': 73, 'Watford': 74, 'Plymouth Argyle': 71,
  'Portsmouth': 72, 'Oxford United': 70, 'Stoke City': 73, 'Cardiff City': 72, 'Hull City': 72,
  'Derby County': 71, 'Luton Town': 71,
};

export function estimateReputation(name: string): number {
  if (CLUB_REPUTATION[name] != null) return CLUB_REPUTATION[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return 70 + (hash % 14); // 70..83
}

function nationalityForLeague(leagueName: LeagueName): string {
  switch (leagueName) {
    case 'Premier League':
    case 'Championship':
      return 'England';
    case 'LaLiga':
      return 'Spain';
    case 'Serie A':
      return 'Italy';
    case 'Bundesliga':
      return 'Germany';
    case 'Ligue 1':
      return 'France';
    case 'Eredivisie':
      return 'Netherlands';
    case 'Primeira Liga':
      return 'Portugal';
    case 'Campeonato Brasileiro Série A':
      return 'Brazil';
    default:
      return 'France';
  }
}

export function createClubFromApiTeam(
  team: { id: number; name: string; shortName?: string; tla?: string; crest?: string },
  leagueName: LeagueName,
  position: number
): Club {
  const reputation = estimateReputation(team.name);
  const rating = clamp(reputation - 3, 50, 95);
  const budget = Math.round(reputation * 1_500_000 + 10_000_000);
  const weeklySalary = Math.round(reputation * 30_000 + 500_000);
  const colors = { primary: '#6CABDD', secondary: '#FFFFFF' };
  const objectives = ['Win the league', 'European qualification', 'Cup success'];
  const nationality = nationalityForLeague(leagueName);
  const agePool = [25, 28, 24, 30, 22, 27, 26, 23, 29, 21, 31];
  const squad = createSquad(String(team.id), reputation, [], nationality, agePool);

  return {
    id: `api-${team.id}`,
    apiId: team.id,
    name: team.name,
    shortName: team.tla || team.shortName || team.name.slice(0, 3).toUpperCase(),
    league: leagueName,
    reputation,
    rating,
    budget,
    weeklySalary,
    leaguePosition: position,
    colors,
    objectives,
    stadium: `${team.name} Stadium`,
    crest: team.crest,
    aiSquad: squad,
  };
}
const spaAge = [26, 29, 23, 31, 24, 28, 22, 30, 25, 27, 32];
const itaAge = [27, 25, 29, 22, 30, 24, 28, 26, 31, 23, 33];
const gerAge = [24, 27, 22, 29, 25, 28, 23, 30, 26, 21, 31];
const fraAge = [25, 28, 23, 27, 24, 30, 22, 29, 26, 31, 32];
const nedAge = [24, 26, 22, 28, 23, 27, 25, 29, 21, 30, 31];
const porAge = [25, 28, 23, 30, 24, 27, 22, 29, 26, 31, 32];
const usaAge = [23, 26, 22, 28, 24, 27, 21, 29, 25, 30, 31];
const sauAge = [27, 30, 25, 32, 26, 29, 24, 31, 28, 33, 34];
const turAge = [25, 28, 23, 30, 24, 27, 26, 29, 22, 31, 32];

const engNat = 'England';
const spaNat = 'Spain';
const itaNat = 'Italy';
const gerNat = 'Germany';
const fraNat = 'France';
const nedNat = 'Netherlands';
const porNat = 'Portugal';
const usaNat = 'USA';
const sauNat = 'Saudi Arabia';
const turNat = 'Turkey';
const braNat = 'Brazil';
const argNat = 'Argentina';

const plTeam = 'England / Brazil / France / Spain';
const llTeam = 'Spain / Brazil / Argentina / France';
const saTeam = 'Italy / Brazil / Argentina / France';
const blTeam = 'Germany / France / Netherlands / England';
const l1Team = 'France / Brazil / Portugal / Spain';
const edTeam = 'Netherlands / Belgium / France / Germany';
const plTeam2 = 'Portugal / Brazil / France / Spain';
const mlsTeam = 'USA / Argentina / Brazil / France';
const splTeam = 'Saudi Arabia / Brazil / France / Portugal';
const tsTeam = 'Turkey / Brazil / France / Portugal';

// -- PREMIER LEAGUE --
const premierLeagueClubs: Club[] = [
  createClub('pl-arsenal', 'Arsenal', 'ARS', 'Premier League', 88, 85, 120000000, 3200000, 3, '#EF0107', '#FFFFFF',
    ['Win Premier League', 'Deep Champions League run', 'Domestic Cup'],
    'Emirates Stadium', [engNat, braNat, fraNat], plTeam, engAge),
  createClub('pl-aston-villa', 'Aston Villa', 'AVL', 'Premier League', 82, 80, 85000000, 2400000, 7, '#670E36', '#95BFE5',
    ['Top 4 finish', 'European competition', 'Domestic cup'],
    'Villa Park', [engNat, fraNat], plTeam, engAge),
  createClub('pl-chelsea', 'Chelsea', 'CHE', 'Premier League', 85, 83, 150000000, 3000000, 10, '#034694', '#FFFFFF',
    ['Top 4 finish', 'Build young squad', 'Win trophy'],
    'Stamford Bridge', [engNat, fraNat, braNat], plTeam, engAge),
  createClub('pl-liverpool', 'Liverpool', 'LIV', 'Premier League', 88, 86, 110000000, 3100000, 2, '#C8102E', '#FFFFFF',
    ['Win Premier League', 'Champions League glory', 'Domestic double'],
    'Anfield', [engNat, braNat], plTeam, engAge),
  createClub('pl-man-city', 'Manchester City', 'MCI', 'Premier League', 90, 88, 200000000, 3800000, 1, '#6CABDD', '#FFFFFF',
    ['Win Premier League', 'Champions League title', 'Domestic cups'],
    'Etihad Stadium', [engNat, braNat, porNat], plTeam, engAge),
  createClub('pl-man-united', 'Manchester United', 'MUN', 'Premier League', 87, 84, 180000000, 3500000, 5, '#DA291C', '#FBE122',
    ['Top 4 finish', 'Champions League qualification', 'Cup success'],
    'Old Trafford', [engNat, fraNat], plTeam, engAge),
  createClub('pl-tottenham', 'Tottenham', 'TOT', 'Premier League', 84, 81, 100000000, 2800000, 8, '#132257', '#FFFFFF',
    ['Top 4 finish', 'European football', 'Domestic cup'],
    'Tottenham Hotspur Stadium', [engNat, fraNat], plTeam, engAge),
  createClub('pl-newcastle', 'Newcastle United', 'NEW', 'Premier League', 83, 82, 90000000, 2700000, 4, '#241F20', '#FFFFFF',
    ['Top 6 finish', 'European qualification', 'Cup run'],
    "St. James' Park", [engNat], plTeam, engAge),
  createClub('pl-brighton', 'Brighton & Hove Albion', 'BRI', 'Premier League', 78, 76, 60000000, 1900000, 11, '#0057B8', '#FFFFFF',
    ['Mid-table security', 'Develop young talent', 'Top half finish'],
    'Amex Stadium', [engNat], plTeam, engAge),
  createClub('pl-west-ham', 'West Ham United', 'WHU', 'Premier League', 79, 77, 70000000, 2000000, 9, '#7A263A', '#1BB1E7',
    ['Top half finish', 'European run', 'Domestic cup'],
    'London Stadium', [engNat], plTeam, engAge),
  createClub('pl-crystal-palace', 'Crystal Palace', 'CRY', 'Premier League', 76, 74, 55000000, 1700000, 14, '#1B458F', '#A7A9AC',
    ['Premier League survival', 'Mid-table finish', 'Cup progress'],
    'Selhurst Park', [engNat], plTeam, engAge),
  createClub('pl-everton', 'Everton', 'EVE', 'Premier League', 75, 73, 50000000, 1600000, 16, '#003399', '#FFFFFF',
    ['Premier League survival', 'Rebuild squad', 'Cup run'],
    'Goodison Park', [engNat], plTeam, engAge),
  createClub('pl-fulham', 'Fulham', 'FUL', 'Premier League', 76, 75, 60000000, 1800000, 12, '#FFFFFF', '#000000',
    ['Mid-table finish', 'Top half push', 'Cup progress'],
    'Craven Cottage', [engNat], plTeam, engAge),
  createClub('pl-nottm-forest', 'Nottingham Forest', 'NFO', 'Premier League', 75, 74, 55000000, 1700000, 15, '#E53233', '#FFFFFF',
    ['Premier League survival', 'Consolidate', 'Cup run'],
    'The City Ground', [engNat], plTeam, engAge),
  createClub('pl-brentford', 'Brentford', 'BRE', 'Premier League', 76, 75, 50000000, 1650000, 13, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Smart recruitment', 'Cup progress'],
    'Gtech Community Stadium', [engNat], plTeam, engAge),
  createClub('pl-wolves', 'Wolverhampton Wanderers', 'WOL', 'Premier League', 77, 75, 60000000, 1800000, 17, '#FDB913', '#231F20',
    ['Premier League survival', 'Mid-table finish', 'Cup run'],
    'Molineux Stadium', [engNat, porNat], plTeam, engAge),
  createClub('pl-bournemouth', 'AFC Bournemouth', 'BOU', 'Premier League', 74, 72, 45000000, 1500000, 18, '#DA291C', '#000000',
    ['Premier League survival', 'Stay up', 'Cup progress'],
    'Vitality Stadium', [engNat], plTeam, engAge),
  createClub('pl-leicester', 'Leicester City', 'LEI', 'Premier League', 77, 76, 65000000, 1900000, 6, '#003090', '#FDBE11',
    ['Top half finish', 'European push', 'Domestic cup'],
    'King Power Stadium', [engNat], plTeam, engAge),
  createClub('pl-southampton', 'Southampton', 'SOU', 'Premier League', 74, 72, 45000000, 1500000, 19, '#D71920', '#FFFFFF',
    ['Premier League survival', 'Youth development', 'Cup progress'],
    "St. Mary's Stadium", [engNat], plTeam, engAge),
  createClub('pl-ipswich', 'Ipswich Town', 'IPS', 'Premier League', 72, 70, 35000000, 1300000, 20, '#0039A6', '#FFFFFF',
    ['Premier League survival', 'Stay up', 'Build for future'],
    'Portman Road', [engNat], plTeam, engAge),
];

// -- LALIGA --
const laLigaClubs: Club[] = [
  createClub('ll-real-madrid', 'Real Madrid', 'RMA', 'LaLiga', 92, 89, 200000000, 4000000, 1, '#FEBE10', '#FFFFFF',
    ['Win LaLiga', 'Champions League title', 'All competitions'],
    'Santiago Bernabeu', [spaNat, braNat, fraNat], llTeam, spaAge),
  createClub('ll-barcelona', 'Barcelona', 'BAR', 'LaLiga', 89, 87, 150000000, 3500000, 2, '#A50044', '#004D98',
    ['Win LaLiga', 'Champions League success', 'Domestic cup'],
    'Spotify Camp Nou', [spaNat, braNat], llTeam, spaAge),
  createClub('ll-atletico', 'Atletico Madrid', 'ATM', 'LaLiga', 86, 84, 100000000, 2800000, 3, '#CB3524', '#FFFFFF',
    ['Top 4 finish', 'European success', 'Cup win'],
    'Civitas Metropolitano', [spaNat, argNat], llTeam, spaAge),
  createClub('ll-athletic', 'Athletic Club', 'ATH', 'LaLiga', 81, 79, 70000000, 2000000, 5, '#EE2230', '#FFFFFF',
    ['Top 6 finish', 'European qualification', 'Basque talent'],
    'San Mames', [spaNat], llTeam, spaAge),
  createClub('ll-real-sociedad', 'Real Sociedad', 'RSO', 'LaLiga', 80, 78, 65000000, 1900000, 6, '#1B4F9B', '#FFFFFF',
    ['Top 6 finish', 'European football', 'Cup progress'],
    'Reale Arena', [spaNat], llTeam, spaAge),
  createClub('ll-betis', 'Real Betis', 'BET', 'LaLiga', 79, 77, 55000000, 1700000, 7, '#009A44', '#FFFFFF',
    ['Top half finish', 'European push', 'Cup run'],
    'Benito Villamarin', [spaNat], llTeam, spaAge),
  createClub('ll-villarreal', 'Villarreal', 'VIL', 'LaLiga', 80, 78, 60000000, 1800000, 8, '#FEE500', '#00529B',
    ['Top 6 finish', 'European competition', 'Cup progress'],
    'Estadio de la Ceramica', [spaNat], llTeam, spaAge),
  createClub('ll-valencia', 'Valencia', 'VAL', 'LaLiga', 78, 76, 50000000, 1600000, 10, '#F2A900', '#FFFFFF',
    ['Top half finish', 'Rebuild', 'Cup progress'],
    'Mestalla', [spaNat], llTeam, spaAge),
  createClub('ll-sevilla', 'Sevilla', 'SEV', 'LaLiga', 80, 78, 65000000, 1900000, 12, '#D4021D', '#FFFFFF',
    ['Top 6 finish', 'European football', 'Cup success'],
    'Ramon Sanchez Pizjuan', [spaNat], llTeam, spaAge),
  createClub('ll-girona', 'Girona', 'GIR', 'LaLiga', 77, 76, 45000000, 1500000, 4, '#E30613', '#FFFFFF',
    ['Top half finish', 'European push', 'Underdog story'],
    'Montilivi', [spaNat], llTeam, spaAge),
  createClub('ll-osasuna', 'Osasuna', 'OSA', 'LaLiga', 75, 73, 35000000, 1300000, 11, '#C41E24', '#003F87',
    ['Mid-table security', 'Survival', 'Cup run'],
    'El Sadar', [spaNat], llTeam, spaAge),
  createClub('ll-celta', 'Celta Vigo', 'CEL', 'LaLiga', 76, 74, 40000000, 1400000, 13, '#5CB2E8', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Abanca Balaidos', [spaNat], llTeam, spaAge),
  createClub('ll-rayo', 'Rayo Vallecano', 'RAY', 'LaLiga', 74, 72, 30000000, 1200000, 14, '#E31E24', '#FFFFFF',
    ['LaLiga survival', 'Mid-table', 'Cup progress'],
    'Estadio de Vallecas', [spaNat], llTeam, spaAge),
  createClub('ll-getafe', 'Getafe', 'GET', 'LaLiga', 74, 72, 30000000, 1200000, 15, '#005CA1', '#FFFFFF',
    ['LaLiga survival', 'Defensive solidity', 'Cup run'],
    'Coliseum', [spaNat], llTeam, spaAge),
  createClub('ll-las-palmas', 'Las Palmas', 'LPA', 'LaLiga', 73, 71, 25000000, 1100000, 16, '#F9E300', '#0071B9',
    ['LaLiga survival', 'Stay up', 'Cup progress'],
    'Gran Canaria', [spaNat], llTeam, spaAge),
  createClub('ll-mallorca', 'Mallorca', 'MLL', 'LaLiga', 74, 72, 30000000, 1200000, 9, '#E30613', '#000000',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Son Moix', [spaNat], llTeam, spaAge),
  createClub('ll-alaves', 'Alaves', 'ALA', 'LaLiga', 73, 71, 25000000, 1100000, 17, '#003F87', '#FFFFFF',
    ['LaLiga survival', 'Stay up', 'Cup progress'],
    'Mendizorrotza', [spaNat], llTeam, spaAge),
  createClub('ll-espanyol', 'Espanyol', 'ESP', 'LaLiga', 74, 72, 30000000, 1200000, 18, '#A8B8D4', '#1B4F9B',
    ['LaLiga survival', 'Promotion consolidation', 'Cup run'],
    'RCDE Stadium', [spaNat], llTeam, spaAge),
  createClub('ll-leganes', 'Leganes', 'LEG', 'LaLiga', 72, 70, 20000000, 1000000, 19, '#1F4870', '#FFFFFF',
    ['LaLiga survival', 'Stay up', 'Cup progress'],
    'Butarque', [spaNat], llTeam, spaAge),
  createClub('ll-valladolid', 'Valladolid', 'VLD', 'LaLiga', 72, 70, 20000000, 1000000, 20, '#7A263A', '#FFFFFF',
    ['LaLiga survival', 'Stay up', 'Cup progress'],
    'Jose Zorrilla', [spaNat], llTeam, spaAge),
];

// -- SERIE A --
const serieAClubs: Club[] = [
  createClub('sa-inter', 'Inter Milan', 'INT', 'Serie A', 88, 86, 130000000, 3200000, 1, '#010E80', '#000000',
    ['Win Serie A', 'Champions League glory', 'Domestic cup'],
    'San Siro', [itaNat, argNat], saTeam, itaAge),
  createClub('sa-ac-milan', 'AC Milan', 'ACM', 'Serie A', 86, 84, 120000000, 3000000, 3, '#FB090B', '#000000',
    ['Top 4 finish', 'Champions League push', 'Scudetto challenge'],
    'San Siro', [itaNat, fraNat], saTeam, itaAge),
  createClub('sa-juventus', 'Juventus', 'JUV', 'Serie A', 87, 85, 140000000, 3100000, 4, '#000000', '#FFFFFF',
    ['Win Serie A', 'Champions League progress', 'Cup success'],
    'Allianz Stadium', [itaNat], saTeam, itaAge),
  createClub('sa-roma', 'Roma', 'ROM', 'Serie A', 83, 81, 90000000, 2500000, 6, '#8E1F2F', '#F4B500',
    ['Top 4 finish', 'European football', 'Domestic cup'],
    'Stadio Olimpico', [itaNat, argNat], saTeam, itaAge),
  createClub('sa-napoli', 'Napoli', 'NAP', 'Serie A', 85, 83, 100000000, 2700000, 5, '#12A0D8', '#FFFFFF',
    ['Top 4 finish', 'Serie A challenge', 'Cup progress'],
    'Diego Armando Maradona', [itaNat], saTeam, itaAge),
  createClub('sa-atalanta', 'Atalanta', 'ATA', 'Serie A', 83, 81, 80000000, 2400000, 2, '#0D1E3E', '#FFFFFF',
    ['Top 4 finish', 'Champions League push', 'Cup run'],
    'Gewiss Stadium', [itaNat], saTeam, itaAge),
  createClub('sa-lazio', 'Lazio', 'LAZ', 'Serie A', 81, 79, 75000000, 2200000, 7, '#7CC4EC', '#FFFFFF',
    ['Top 6 finish', 'European qualification', 'Cup success'],
    'Stadio Olimpico', [itaNat], saTeam, itaAge),
  createClub('sa-fiorentina', 'Fiorentina', 'FIO', 'Serie A', 80, 78, 65000000, 2000000, 8, '#4B0082', '#FFFFFF',
    ['Top 6 finish', 'European push', 'Cup progress'],
    'Stadio Franchi', [itaNat], saTeam, itaAge),
  createClub('sa-bologna', 'Bologna', 'BOL', 'Serie A', 79, 77, 60000000, 1800000, 9, '#E32636', '#FFFFFF',
    ['Top half finish', 'European push', 'Cup run'],
    'Renato Dall\'Ara', [itaNat], saTeam, itaAge),
  createClub('sa-torino', 'Torino', 'TOR', 'Serie A', 78, 76, 55000000, 1700000, 10, '#A52A2A', '#FFFFFF',
    ['Top half finish', 'Mid-table solidity', 'Cup progress'],
    'Stadio Grande Torino', [itaNat], saTeam, itaAge),
  createClub('sa-udinese', 'Udinese', 'UDI', 'Serie A', 76, 74, 45000000, 1500000, 12, '#000000', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Develop talent'],
    'Dacia Arena', [itaNat], saTeam, itaAge),
  createClub('sa-genoa', 'Genoa', 'GEN', 'Serie A', 75, 73, 40000000, 1400000, 14, '#C41E24', '#003F87',
    ['Serie A survival', 'Mid-table', 'Cup run'],
    'Stadio Marassi', [itaNat], saTeam, itaAge),
  createClub('sa-monza', 'Monza', 'MNZ', 'Serie A', 75, 73, 40000000, 1400000, 11, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Consolidate', 'Cup progress'],
    'Stadio Brianteo', [itaNat], saTeam, itaAge),
  createClub('sa-verona', 'Hellas Verona', 'VER', 'Serie A', 74, 72, 35000000, 1300000, 15, '#1B458F', '#FEBE10',
    ['Serie A survival', 'Stay up', 'Cup progress'],
    'Stadio Bentegodi', [itaNat], saTeam, itaAge),
  createClub('sa-cagliari', 'Cagliari', 'CAG', 'Serie A', 74, 72, 35000000, 1300000, 13, '#C41E24', '#FFFFFF',
    ['Serie A survival', 'Mid-table', 'Cup run'],
    'Unipol Domus', [itaNat], saTeam, itaAge),
  createClub('sa-lecce', 'Lecce', 'LEC', 'Serie A', 73, 71, 30000000, 1200000, 16, '#E32636', '#FFFFFF',
    ['Serie A survival', 'Stay up', 'Cup progress'],
    'Stadio Via del Mare', [itaNat], saTeam, itaAge),
  createClub('sa-empoli', 'Empoli', 'EMP', 'Serie A', 73, 71, 30000000, 1200000, 17, '#003F87', '#FFFFFF',
    ['Serie A survival', 'Youth development', 'Cup progress'],
    'Stadio Castellani', [itaNat], saTeam, itaAge),
  createClub('sa-como', 'Como', 'COM', 'Serie A', 72, 70, 25000000, 1100000, 18, '#0066CC', '#FFFFFF',
    ['Serie A survival', 'Stay up', 'Build squad'],
    'Stadio Sinigaglia', [itaNat], saTeam, itaAge),
  createClub('sa-parma', 'Parma', 'PAR', 'Serie A', 74, 72, 35000000, 1300000, 19, '#F4B500', '#0D1E3E',
    ['Serie A survival', 'Promotion consolidation', 'Cup progress'],
    'Stadio Tardini', [itaNat], saTeam, itaAge),
  createClub('sa-venezia', 'Venezia', 'VEN', 'Serie A', 71, 69, 20000000, 1000000, 20, '#006751', '#F4A900',
    ['Serie A survival', 'Stay up', 'Cup progress'],
    'Stadio Penzo', [itaNat], saTeam, itaAge),
];

// -- BUNDESLIGA --
const bundesligaClubs: Club[] = [
  createClub('bl-bayern', 'Bayern Munich', 'BAY', 'Bundesliga', 90, 88, 180000000, 3600000, 1, '#DC052D', '#FFFFFF',
    ['Win Bundesliga', 'Champions League title', 'Domestic double'],
    'Allianz Arena', [gerNat], blTeam, gerAge),
  createClub('bl-dortmund', 'Borussia Dortmund', 'DOR', 'Bundesliga', 85, 83, 110000000, 2800000, 4, '#FDE100', '#000000',
    ['Top 4 finish', 'Champions League push', 'Cup success'],
    'Signal Iduna Park', [gerNat], blTeam, gerAge),
  createClub('bl-rb-leipzig', 'RB Leipzig', 'RBL', 'Bundesliga', 84, 82, 100000000, 2600000, 5, '#DD0741', '#FFFFFF',
    ['Top 4 finish', 'Champions League qualification', 'Cup run'],
    'Red Bull Arena', [gerNat], blTeam, gerAge),
  createClub('bl-leverkusen', 'Bayer Leverkusen', 'LEV', 'Bundesliga', 86, 84, 120000000, 2900000, 2, '#E32221', '#000000',
    ['Win Bundesliga', 'Champions League football', 'Domestic cup'],
    'BayArena', [gerNat], blTeam, gerAge),
  createClub('bl-stuttgart', 'VfB Stuttgart', 'STU', 'Bundesliga', 80, 78, 70000000, 2000000, 3, '#E32322', '#FFFFFF',
    ['Top 6 finish', 'European qualification', 'Cup run'],
    'MHPArena', [gerNat], blTeam, gerAge),
  createClub('bl-frankfurt', 'Eintracht Frankfurt', 'FRA', 'Bundesliga', 81, 79, 75000000, 2100000, 6, '#E1000F', '#FFFFFF',
    ['Top 6 finish', 'European football', 'Cup success'],
    'Deutsche Bank Park', [gerNat], blTeam, gerAge),
  createClub('bl-wolfsburg', 'VfL Wolfsburg', 'WOL', 'Bundesliga', 78, 76, 65000000, 1900000, 8, '#009640', '#FFFFFF',
    ['Top half finish', 'European push', 'Cup progress'],
    'Volkswagen Arena', [gerNat], blTeam, gerAge),
  createClub('bl-freiburg', 'SC Freiburg', 'FRE', 'Bundesliga', 79, 77, 55000000, 1800000, 7, '#ED1B2F', '#FFFFFF',
    ['Top 6 finish', 'European football', 'Cup run'],
    'Europa-Park Stadion', [gerNat], blTeam, gerAge),
  createClub('bl-mainz', 'Mainz 05', 'MAI', 'Bundesliga', 76, 74, 45000000, 1500000, 10, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Bundesliga survival', 'Cup progress'],
    'Mewa Arena', [gerNat], blTeam, gerAge),
  createClub('bl-augsburg', 'FC Augsburg', 'AUG', 'Bundesliga', 75, 73, 40000000, 1400000, 11, '#BA3733', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'WWK Arena', [gerNat], blTeam, gerAge),
  createClub('bl-hoffenheim', 'TSG Hoffenheim', 'HOF', 'Bundesliga', 76, 74, 45000000, 1500000, 12, '#1B63B3', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'PreZero Arena', [gerNat], blTeam, gerAge),
  createClub('bl-werder', 'Werder Bremen', 'BRE', 'Bundesliga', 76, 74, 45000000, 1500000, 9, '#1B9B4B', '#FFFFFF',
    ['Top half finish', 'Mid-table', 'Cup run'],
    'Weserstadion', [gerNat], blTeam, gerAge),
  createClub('bl-gladbach', 'Borussia Monchengladbach', 'BMG', 'Bundesliga', 77, 75, 50000000, 1600000, 13, '#000000', '#FFFFFF',
    ['Top half finish', 'European push', 'Cup progress'],
    'Borussia-Park', [gerNat], blTeam, gerAge),
  createClub('bl-union', 'Union Berlin', 'UNB', 'Bundesliga', 76, 74, 45000000, 1500000, 14, '#E30101', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Stadion An der Alten Forsterei', [gerNat], blTeam, gerAge),
  createClub('bl-heidenheim', '1. FC Heidenheim', 'HEI', 'Bundesliga', 73, 71, 30000000, 1200000, 15, '#C41E24', '#003F87',
    ['Bundesliga survival', 'Stay up', 'Cup progress'],
    'Voith-Arena', [gerNat], blTeam, gerAge),
  createClub('bl-bochum', 'VfL Bochum', 'BOC', 'Bundesliga', 73, 71, 30000000, 1200000, 16, '#005CA1', '#FFFFFF',
    ['Bundesliga survival', 'Stay up', 'Cup run'],
    'Vonovia Ruhrstadion', [gerNat], blTeam, gerAge),
  createClub('bl-holstein', 'Holstein Kiel', 'KIE', 'Bundesliga', 72, 70, 25000000, 1000000, 17, '#1A6B8A', '#FFFFFF',
    ['Bundesliga survival', 'Stay up', 'Cup progress'],
    'Holstein-Stadion', [gerNat], blTeam, gerAge),
  createClub('bl-st-pauli', 'FC St. Pauli', 'STP', 'Bundesliga', 73, 71, 30000000, 1200000, 18, '#593A2E', '#FFFFFF',
    ['Bundesliga survival', 'Stay up', 'Cup run'],
    'Millerntor-Stadion', [gerNat], blTeam, gerAge),
];

// -- LIGUE 1 --
const ligue1Clubs: Club[] = [
  createClub('l1-psg', 'Paris Saint-Germain', 'PSG', 'Ligue 1', 89, 87, 250000000, 4200000, 1, '#004170', '#E30613',
    ['Win Ligue 1', 'Champions League title', 'Domestic treble'],
    'Parc des Princes', [fraNat], l1Team, fraAge),
  createClub('l1-marseille', 'Olympique Marseille', 'MAR', 'Ligue 1', 82, 80, 90000000, 2500000, 3, '#2FAEE0', '#FFFFFF',
    ['Top 3 finish', 'Champions League push', 'Cup success'],
    'Stade Velodrome', [fraNat], l1Team, fraAge),
  createClub('l1-monaco', 'AS Monaco', 'MON', 'Ligue 1', 82, 80, 85000000, 2400000, 2, '#E63E32', '#FFFFFF',
    ['Top 3 finish', 'Champions League qualification', 'Cup run'],
    'Stade Louis II', [fraNat], l1Team, fraAge),
  createClub('l1-lyon', 'Olympique Lyonnais', 'LYO', 'Ligue 1', 81, 79, 80000000, 2300000, 6, '#1D2C6B', '#FFFFFF',
    ['Top 4 finish', 'European football', 'Cup progress'],
    'Groupama Stadium', [fraNat], l1Team, fraAge),
  createClub('l1-lille', 'Lille OSC', 'LIL', 'Ligue 1', 80, 78, 70000000, 2100000, 5, '#C41E24', '#003F87',
    ['Top 4 finish', 'European qualification', 'Cup run'],
    'Stade Pierre-Mauroy', [fraNat], l1Team, fraAge),
  createClub('l1-nice', 'OGC Nice', 'NIC', 'Ligue 1', 79, 77, 65000000, 2000000, 4, '#E30613', '#000000',
    ['Top 5 finish', 'European football', 'Cup progress'],
    'Allianz Riviera', [fraNat], l1Team, fraAge),
  createClub('l1-lens', 'RC Lens', 'LEN', 'Ligue 1', 78, 76, 55000000, 1800000, 7, '#E30613', '#F4B500',
    ['Top half finish', 'European push', 'Cup run'],
    'Stade Bollaert-Delelis', [fraNat], l1Team, fraAge),
  createClub('l1-rennes', 'Stade Rennais', 'REN', 'Ligue 1', 79, 77, 60000000, 1900000, 8, '#E30613', '#FFFFFF',
    ['Top 6 finish', 'European qualification', 'Cup success'],
    'Roazhon Park', [fraNat], l1Team, fraAge),
  createClub('l1-toulouse', 'Toulouse FC', 'TOU', 'Ligue 1', 75, 73, 40000000, 1400000, 10, '#8645B0', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Stade de Toulouse', [fraNat], l1Team, fraAge),
  createClub('l1-strasbourg', 'RC Strasbourg', 'STR', 'Ligue 1', 76, 74, 45000000, 1500000, 11, '#005CA1', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Stade de la Meinau', [fraNat], l1Team, fraAge),
  createClub('l1-montpellier', 'Montpellier HSC', 'MON', 'Ligue 1', 75, 73, 40000000, 1400000, 12, '#F4A900', '#005CA1',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Stade de la Mosson', [fraNat], l1Team, fraAge),
  createClub('l1-brest', 'Stade Brestois', 'BRE', 'Ligue 1', 76, 74, 40000000, 1400000, 9, '#E30613', '#FFFFFF',
    ['Top half finish', 'European push', 'Cup progress'],
    'Stade Francis-Le Ble', [fraNat], l1Team, fraAge),
  createClub('l1-reims', 'Stade de Reims', 'REI', 'Ligue 1', 75, 73, 40000000, 1400000, 13, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Stade Auguste-Delaune', [fraNat], l1Team, fraAge),
  createClub('l1-le-havre', 'Le Havre AC', 'HAC', 'Ligue 1', 73, 71, 30000000, 1200000, 14, '#0066CC', '#FFFFFF',
    ['Ligue 1 survival', 'Stay up', 'Cup progress'],
    'Stade Oceane', [fraNat], l1Team, fraAge),
  createClub('l1-auxerre', 'AJ Auxerre', 'AUX', 'Ligue 1', 73, 71, 30000000, 1200000, 15, '#005CA1', '#FFFFFF',
    ['Ligue 1 survival', 'Stay up', 'Cup run'],
    'Stade de l\'Abbé-Deschamps', [fraNat], l1Team, fraAge),
  createClub('l1-angers', 'Angers SCO', 'ANG', 'Ligue 1', 73, 71, 30000000, 1200000, 16, '#000000', '#FFFFFF',
    ['Ligue 1 survival', 'Stay up', 'Cup progress'],
    'Stade Raymond-Kopa', [fraNat], l1Team, fraAge),
  createClub('l1-nantes', 'FC Nantes', 'NAN', 'Ligue 1', 75, 73, 40000000, 1400000, 17, '#F4B500', '#00613D',
    ['Ligue 1 survival', 'Stay up', 'Cup run'],
    'Stade de la Beaujoire', [fraNat], l1Team, fraAge),
  createClub('l1-st-etienne', 'AS Saint-Etienne', 'STE', 'Ligue 1', 74, 72, 35000000, 1300000, 18, '#1B9B4B', '#FFFFFF',
    ['Ligue 1 survival', 'Stay up', 'Cup progress'],
    'Stade Geoffroy-Guichard', [fraNat], l1Team, fraAge),
];

// -- EREDIVISIE --
const eredivisieClubs: Club[] = [
  createClub('ed-ajax', 'Ajax', 'AJA', 'Eredivisie', 83, 81, 80000000, 2200000, 1, '#D31027', '#FFFFFF',
    ['Win Eredivisie', 'Champions League football', 'Cup success'],
    'Johan Cruijff ArenA', [nedNat], edTeam, nedAge),
  createClub('ed-psv', 'PSV Eindhoven', 'PSV', 'Eredivisie', 82, 80, 75000000, 2100000, 2, '#E30613', '#FFFFFF',
    ['Win Eredivisie', 'European football', 'Cup run'],
    'Philips Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-feyenoord', 'Feyenoord', 'FEY', 'Eredivisie', 81, 79, 70000000, 2000000, 3, '#C41E24', '#FFFFFF',
    ['Top 3 finish', 'European football', 'Cup success'],
    'De Kuip', [nedNat], edTeam, nedAge),
  createClub('ed-az', 'AZ Alkmaar', 'AZ', 'Eredivisie', 78, 76, 55000000, 1700000, 4, '#E30613', '#FFFFFF',
    ['Top 4 finish', 'European qualification', 'Cup progress'],
    'AFAS Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-twente', 'FC Twente', 'TWE', 'Eredivisie', 76, 74, 45000000, 1500000, 5, '#E30613', '#FFFFFF',
    ['Top 5 finish', 'European push', 'Cup run'],
    'De Grolsch Veste', [nedNat], edTeam, nedAge),
  createClub('ed-utrecht', 'FC Utrecht', 'UTR', 'Eredivisie', 74, 72, 35000000, 1300000, 7, '#E30613', '#FFFFFF',
    ['Top half finish', 'European play-offs', 'Cup progress'],
    'Stadion Galgenwaard', [nedNat], edTeam, nedAge),
  createClub('ed-heerenveen', 'SC Heerenveen', 'HEE', 'Eredivisie', 73, 71, 30000000, 1200000, 8, '#005CA1', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Abe Lenstra Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-groningen', 'FC Groningen', 'GRO', 'Eredivisie', 72, 70, 25000000, 1100000, 9, '#1B9B4B', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Euroborg', [nedNat], edTeam, nedAge),
  createClub('ed-nec', 'NEC Nijmegen', 'NEC', 'Eredivisie', 72, 70, 25000000, 1100000, 10, '#E30613', '#000000',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Goffertstadion', [nedNat], edTeam, nedAge),
  createClub('ed-go-ahead', 'Go Ahead Eagles', 'GAE', 'Eredivisie', 71, 69, 20000000, 1000000, 11, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'De Adelaarshorst', [nedNat], edTeam, nedAge),
  createClub('ed-heracles', 'Heracles Almelo', 'HER', 'Eredivisie', 70, 68, 18000000, 900000, 12, '#000000', '#FFFFFF',
    ['Eredivisie survival', 'Stay up', 'Cup run'],
    'Erve Asito', [nedNat], edTeam, nedAge),
  createClub('ed-zwolle', 'PEC Zwolle', 'ZWO', 'Eredivisie', 70, 68, 18000000, 900000, 13, '#005CA1', '#FFFFFF',
    ['Eredivisie survival', 'Stay up', 'Cup progress'],
    'MAC3PARK Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-rkc', 'RKC Waalwijk', 'RKC', 'Eredivisie', 69, 67, 15000000, 800000, 14, '#F4B500', '#005CA1',
    ['Eredivisie survival', 'Stay up', 'Cup run'],
    'Mandemakers Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-nac', 'NAC Breda', 'NAC', 'Eredivisie', 70, 68, 18000000, 900000, 15, '#F4B500', '#000000',
    ['Eredivisie survival', 'Stay up', 'Cup progress'],
    'Rat Verlegh Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-willem-ii', 'Willem II', 'WIL', 'Eredivisie', 70, 68, 18000000, 900000, 16, '#005CA1', '#FFFFFF',
    ['Eredivisie survival', 'Stay up', 'Cup run'],
    'Koning Willem II Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-almere', 'Almere City', 'ALM', 'Eredivisie', 68, 66, 15000000, 800000, 17, '#E30613', '#FFFFFF',
    ['Eredivisie survival', 'Stay up', 'Cup progress'],
    'Yanmar Stadion', [nedNat], edTeam, nedAge),
  createClub('ed-sparta', 'Sparta Rotterdam', 'SPA', 'Eredivisie', 71, 69, 20000000, 1000000, 6, '#C41E24', '#FFFFFF',
    ['Top half finish', 'European play-offs', 'Cup run'],
    'Het Kasteel', [nedNat], edTeam, nedAge),
];

// -- PRIMEIRA LIGA --
const primeiraLigaClubs: Club[] = [
  createClub('pl-benfica', 'Benfica', 'BEN', 'Primeira Liga', 83, 81, 90000000, 2400000, 2, '#E30613', '#FFFFFF',
    ['Win Primeira Liga', 'Champions League football', 'Cup success'],
    'Estadio da Luz', [porNat], plTeam2, porAge),
  createClub('pl-porto', 'FC Porto', 'POR', 'Primeira Liga', 83, 81, 85000000, 2300000, 3, '#005CA1', '#FFFFFF',
    ['Win Primeira Liga', 'Champions League football', 'Cup success'],
    'Estadio do Dragao', [porNat], plTeam2, porAge),
  createClub('pl-sporting', 'Sporting CP', 'SPO', 'Primeira Liga', 84, 82, 80000000, 2200000, 1, '#009640', '#FFFFFF',
    ['Win Primeira Liga', 'Champions League push', 'Cup success'],
    'Estadio Jose Alvalade', [porNat], plTeam2, porAge),
  createClub('pl-braga', 'SC Braga', 'BRA', 'Primeira Liga', 78, 76, 50000000, 1700000, 4, '#E30613', '#FFFFFF',
    ['Top 4 finish', 'European football', 'Cup progress'],
    'Estadio Municipal de Braga', [porNat], plTeam2, porAge),
  createClub('pl-guimaraes', 'Vitoria Guimaraes', 'GUI', 'Primeira Liga', 75, 73, 35000000, 1400000, 5, '#000000', '#FFFFFF',
    ['Top 6 finish', 'European qualification', 'Cup run'],
    'Estadio D. Afonso Henriques', [porNat], plTeam2, porAge),
  createClub('pl-rio-ave', 'Rio Ave', 'RIO', 'Primeira Liga', 72, 70, 20000000, 1000000, 7, '#009640', '#FFFFFF',
    ['Top half finish', 'Survival', 'Cup progress'],
    'Estadio dos Arcos', [porNat], plTeam2, porAge),
  createClub('pl-famalicao', 'FC Famalicao', 'FAM', 'Primeira Liga', 73, 71, 25000000, 1100000, 6, '#C41E24', '#FFFFFF',
    ['Top half finish', 'Survival', 'Cup run'],
    'Estadio Municipal de Famalicao', [porNat], plTeam2, porAge),
  createClub('pl-moreirense', 'Moreirense FC', 'MOR', 'Primeira Liga', 71, 69, 18000000, 900000, 8, '#009640', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Parque de Jogos Comendador', [porNat], plTeam2, porAge),
  createClub('pl-casa-pia', 'Casa Pia', 'CAS', 'Primeira Liga', 71, 69, 18000000, 900000, 9, '#000000', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Estadio Pina Manique', [porNat], plTeam2, porAge),
  createClub('pl-estoril', 'Estoril Praia', 'EST', 'Primeira Liga', 71, 69, 18000000, 900000, 10, '#F4B500', '#005CA1',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Estadio Antonio Coimbra da Mota', [porNat], plTeam2, porAge),
  createClub('pl-arouca', 'FC Arouca', 'ARO', 'Primeira Liga', 70, 68, 15000000, 800000, 11, '#F4B500', '#000000',
    ['Primeira Liga survival', 'Stay up', 'Cup run'],
    'Estadio Municipal de Arouca', [porNat], plTeam2, porAge),
  createClub('pl-farense', 'SC Farense', 'FAR', 'Primeira Liga', 69, 67, 12000000, 700000, 12, '#000000', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup progress'],
    'Estadio de Sao Luis', [porNat], plTeam2, porAge),
  createClub('pl-boavista', 'Boavista FC', 'BOA', 'Primeira Liga', 70, 68, 15000000, 800000, 13, '#000000', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup run'],
    'Estadio do Bessa', [porNat], plTeam2, porAge),
  createClub('pl-gil-vicente', 'Gil Vicente', 'GIL', 'Primeira Liga', 70, 68, 15000000, 800000, 14, '#E30613', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup progress'],
    'Estadio Cidade de Barcelos', [porNat], plTeam2, porAge),
  createClub('pl-estrela', 'Estrela da Amadora', 'EAM', 'Primeira Liga', 69, 67, 12000000, 700000, 15, '#E30613', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup run'],
    'Estadio Jose Gomes', [porNat], plTeam2, porAge),
  createClub('pl-nacional', 'CD Nacional', 'NAC', 'Primeira Liga', 70, 68, 15000000, 800000, 16, '#000000', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup progress'],
    'Estadio da Madeira', [porNat], plTeam2, porAge),
  createClub('pl-avs', 'AVS', 'AVS', 'Primeira Liga', 68, 66, 10000000, 600000, 17, '#E30613', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup run'],
    'Estadio do CD Aves', [porNat], plTeam2, porAge),
  createClub('pl-santa-clara', 'Santa Clara', 'SCL', 'Primeira Liga', 70, 68, 15000000, 800000, 18, '#E30613', '#FFFFFF',
    ['Primeira Liga survival', 'Stay up', 'Cup progress'],
    'Estadio de Sao Miguel', [porNat], plTeam2, porAge),
];

// -- MLS --
const mlsClubs: Club[] = [
  createClub('mls-inter-miami', 'Inter Miami CF', 'MIA', 'MLS', 80, 78, 70000000, 3500000, 1, '#F4A900', '#005CA1',
    ['Win MLS Cup', 'Supporters Shield', 'Cup success'],
    'DRV PNK Stadium', [usaNat, argNat], mlsTeam, usaAge),
  createClub('mls-la-galaxy', 'LA Galaxy', 'LAG', 'MLS', 78, 76, 60000000, 3000000, 3, '#00245D', '#F4B500',
    ['Win MLS Cup', 'Western Conference title', 'Cup run'],
    'Dignity Health Sports Park', [usaNat], mlsTeam, usaAge),
  createClub('mls-lafc', 'LAFC', 'LAF', 'MLS', 79, 77, 65000000, 3100000, 2, '#000000', '#C81E2C',
    ['Win MLS Cup', 'Supporters Shield', 'Cup success'],
    'BMO Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-atlanta', 'Atlanta United', 'ATL', 'MLS', 77, 75, 55000000, 2800000, 5, '#E30613', '#000000',
    ['MLS Cup push', 'Eastern Conference title', 'Cup run'],
    'Mercedes-Benz Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-ny-red-bulls', 'New York Red Bulls', 'NYR', 'MLS', 75, 73, 45000000, 2400000, 7, '#E30613', '#FFFFFF',
    ['Play-off push', 'Eastern Conference', 'Cup progress'],
    'Red Bull Arena', [usaNat], mlsTeam, usaAge),
  createClub('mls-nycfc', 'New York City FC', 'NYC', 'MLS', 75, 73, 45000000, 2400000, 8, '#6CACE4', '#F4A900',
    ['Play-off push', 'Eastern Conference', 'Cup run'],
    'Yankee Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-seattle', 'Seattle Sounders', 'SEA', 'MLS', 77, 75, 55000000, 2700000, 4, '#5D9741', '#00245D',
    ['MLS Cup push', 'Western Conference', 'Cup success'],
    'Lumen Field', [usaNat], mlsTeam, usaAge),
  createClub('mls-orlando', 'Orlando City', 'ORL', 'MLS', 74, 72, 40000000, 2200000, 6, '#6C1D45', '#FFFFFF',
    ['Play-off push', 'Eastern Conference', 'Cup progress'],
    'Inter&Co Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-columbus', 'Columbus Crew', 'CLB', 'MLS', 76, 74, 45000000, 2300000, 9, '#F4B500', '#000000',
    ['Play-off push', 'Eastern Conference', 'Cup run'],
    'Lower.com Field', [usaNat], mlsTeam, usaAge),
  createClub('mls-cincinnati', 'FC Cincinnati', 'CIN', 'MLS', 75, 73, 40000000, 2200000, 10, '#F4A900', '#005CA1',
    ['Play-off push', 'Eastern Conference', 'Cup progress'],
    'TQL Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-new-england', 'New England Revolution', 'NEP', 'MLS', 73, 71, 35000000, 2000000, 11, '#C41E24', '#00245D',
    ['Play-off push', 'Eastern Conference', 'Cup run'],
    'Gillette Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-philadelphia', 'Philadelphia Union', 'PHI', 'MLS', 74, 72, 35000000, 2000000, 12, '#00245D', '#F4B500',
    ['Play-off push', 'Eastern Conference', 'Cup progress'],
    'Subaru Park', [usaNat], mlsTeam, usaAge),
  createClub('mls-dallas', 'FC Dallas', 'DAL', 'MLS', 73, 71, 35000000, 2000000, 13, '#E30613', '#00245D',
    ['Western Conference push', 'Play-off push', 'Cup run'],
    'Toyota Stadium', [usaNat], mlsTeam, usaAge),
  createClub('mls-chicago', 'Chicago Fire', 'CHI', 'MLS', 72, 70, 30000000, 1800000, 14, '#E30613', '#005CA1',
    ['Play-off push', 'Eastern Conference', 'Cup progress'],
    'Soldier Field', [usaNat], mlsTeam, usaAge),
  createClub('mls-kansas', 'Sporting Kansas City', 'SKC', 'MLS', 73, 71, 35000000, 2000000, 15, '#005CA1', '#FFFFFF',
    ['Western Conference push', 'Play-off push', 'Cup run'],
    'Children\'s Mercy Park', [usaNat], mlsTeam, usaAge),
  createClub('mls-portland', 'Portland Timbers', 'POR', 'MLS', 73, 71, 35000000, 2000000, 16, '#1B458F', '#009640',
    ['Western Conference push', 'Play-off push', 'Cup success'],
    'Providence Park', [usaNat], mlsTeam, usaAge),
  createClub('mls-vancouver', 'Vancouver Whitecaps', 'VAN', 'MLS', 72, 70, 30000000, 1800000, 17, '#00245D', '#FFFFFF',
    ['Western Conference push', 'Play-off push', 'Cup progress'],
    'BC Place', [usaNat], mlsTeam, usaAge),
  createClub('mls-toronto', 'Toronto FC', 'TFC', 'MLS', 72, 70, 30000000, 1800000, 18, '#E30613', '#FFFFFF',
    ['Eastern Conference push', 'Play-off push', 'Cup run'],
    'BMO Field', [usaNat], mlsTeam, usaAge),
];

// -- SAUDI PRO LEAGUE --
const saudiProClubs: Club[] = [
  createClub('spl-al-hilal', 'Al Hilal', 'HIL', 'Saudi Pro League', 85, 83, 200000000, 4000000, 1, '#005CA1', '#FFFFFF',
    ['Win Saudi Pro League', 'AFC Champions League', 'Domestic cup'],
    'Kingdom Arena', [sauNat, braNat], splTeam, sauAge),
  createClub('spl-al-nassr', 'Al Nassr', 'NAS', 'Saudi Pro League', 84, 82, 180000000, 3800000, 2, '#F4B500', '#005CA1',
    ['Win Saudi Pro League', 'AFC Champions League', 'Cup success'],
    'Al Awwal Park', [sauNat, porNat], splTeam, sauAge),
  createClub('spl-al-ittihad', 'Al Ittihad', 'ITT', 'Saudi Pro League', 82, 80, 150000000, 3500000, 3, '#000000', '#F4B500',
    ['Win Saudi Pro League', 'AFC Champions League', 'Cup run'],
    'King Abdullah Sports City', [sauNat], splTeam, sauAge),
  createClub('spl-al-ahli', 'Al Ahli', 'AHL', 'Saudi Pro League', 80, 78, 130000000, 3200000, 4, '#009640', '#FFFFFF',
    ['Top 4 finish', 'AFC Champions League qualification', 'Cup success'],
    'King Abdullah Sports City', [sauNat], splTeam, sauAge),
  createClub('spl-al-shabab', 'Al Shabab', 'SHB', 'Saudi Pro League', 75, 73, 60000000, 2000000, 5, '#FFFFFF', '#000000',
    ['Top 4 finish', 'Asian football', 'Cup progress'],
    'Al Shabab Club Stadium', [sauNat], splTeam, sauAge),
  createClub('spl-al-taawon', 'Al Taawon', 'TAW', 'Saudi Pro League', 73, 71, 40000000, 1500000, 6, '#F4B500', '#005CA1',
    ['Top half finish', 'Survival', 'Cup run'],
    'King Abdullah Sport City', [sauNat], splTeam, sauAge),
  createClub('spl-al-fateh', 'Al Fateh', 'FAT', 'Saudi Pro League', 72, 70, 35000000, 1300000, 7, '#009640', '#FFFFFF',
    ['Top half finish', 'Survival', 'Cup progress'],
    'Prince Abdullah bin Jalawi', [sauNat], splTeam, sauAge),
  createClub('spl-al-ettifaq', 'Al Ettifaq', 'ETT', 'Saudi Pro League', 74, 72, 50000000, 1800000, 8, '#009640', '#FFFFFF',
    ['Top half finish', 'Survival', 'Cup run'],
    'Prince Mohamed bin Fahd', [sauNat], splTeam, sauAge),
  createClub('spl-al-raed', 'Al Raed', 'RAE', 'Saudi Pro League', 71, 69, 25000000, 1100000, 9, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'King Abdullah Sport City', [sauNat], splTeam, sauAge),
  createClub('spl-al-khaleej', 'Al Khaleej', 'KHA', 'Saudi Pro League', 70, 68, 20000000, 1000000, 10, '#005CA1', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Prince Mohamed bin Fahd', [sauNat], splTeam, sauAge),
  createClub('spl-al-okhdood', 'Al Okhdood', 'OKH', 'Saudi Pro League', 69, 67, 18000000, 900000, 11, '#C41E24', '#FFFFFF',
    ['Saudi League survival', 'Stay up', 'Cup progress'],
    'Prince Hathloul Stadium', [sauNat], splTeam, sauAge),
  createClub('spl-al-riyadh', 'Al Riyadh', 'RIY', 'Saudi Pro League', 69, 67, 18000000, 900000, 12, '#E30613', '#FFFFFF',
    ['Saudi League survival', 'Stay up', 'Cup run'],
    'Prince Turki bin Abdul Aziz', [sauNat], splTeam, sauAge),
  createClub('spl-akhdoud', 'Al Akhdoud', 'AKH', 'Saudi Pro League', 69, 67, 18000000, 900000, 13, '#009640', '#FFFFFF',
    ['Saudi League survival', 'Stay up', 'Cup progress'],
    'Prince Hathloul Stadium', [sauNat], splTeam, sauAge),
  createClub('spl-damac', 'Damac FC', 'DAM', 'Saudi Pro League', 71, 69, 25000000, 1100000, 14, '#E30613', '#FFFFFF',
    ['Saudi League survival', 'Stay up', 'Cup run'],
    'Prince Sultan bin Abdul Aziz', [sauNat], splTeam, sauAge),
  createClub('spl-abha', 'Abha FC', 'ABH', 'Saudi Pro League', 70, 68, 20000000, 1000000, 15, '#005CA1', '#FFFFFF',
    ['Saudi League survival', 'Stay up', 'Cup progress'],
    'Prince Sultan bin Abdul Aziz', [sauNat], splTeam, sauAge),
  createClub('spl-al-hazem', 'Al Hazem', 'HAZ', 'Saudi Pro League', 68, 66, 15000000, 800000, 16, '#F4B500', '#000000',
    ['Saudi League survival', 'Stay up', 'Cup run'],
    'Al Hazem Club Stadium', [sauNat], splTeam, sauAge),
];

// -- TURKISH SUPER LIG --
const turkishSuperLigClubs: Club[] = [
  createClub('ts-galatasaray', 'Galatasaray', 'GAL', 'Turkish Super Lig', 82, 80, 80000000, 2400000, 1, '#F4A900', '#E30613',
    ['Win Super Lig', 'European football', 'Cup success'],
    'Rams Park', [turNat, braNat], tsTeam, turAge),
  createClub('ts-fenerbahce', 'Fenerbahce', 'FEN', 'Turkish Super Lig', 81, 79, 75000000, 2300000, 2, '#F4B500', '#003F87',
    ['Win Super Lig', 'European football', 'Cup success'],
    'Ulker Stadium', [turNat], tsTeam, turAge),
  createClub('ts-besiktas', 'Besiktas', 'BES', 'Turkish Super Lig', 79, 77, 65000000, 2100000, 3, '#000000', '#FFFFFF',
    ['Win Super Lig', 'European football', 'Cup success'],
    'Tupraş Stadium', [turNat], tsTeam, turAge),
  createClub('ts-trabzonspor', 'Trabzonspor', 'TRA', 'Turkish Super Lig', 76, 74, 45000000, 1700000, 4, '#C41E24', '#003F87',
    ['Top 4 finish', 'European qualification', 'Cup run'],
    'Senol Gunes Stadium', [turNat], tsTeam, turAge),
  createClub('ts-basaksehir', 'Basaksehir', 'BAS', 'Turkish Super Lig', 75, 73, 40000000, 1600000, 5, '#F4A900', '#005CA1',
    ['Top 5 finish', 'European push', 'Cup progress'],
    'Basaksehir Fatih Terim', [turNat], tsTeam, turAge),
  createClub('ts-sivas', 'Sivasspor', 'SIV', 'Turkish Super Lig', 73, 71, 30000000, 1300000, 7, '#E30613', '#FFFFFF',
    ['Top half finish', 'Survival', 'Cup run'],
    'Yeni Sivas 4 Eylul', [turNat], tsTeam, turAge),
  createClub('ts-konya', 'Konyaspor', 'KON', 'Turkish Super Lig', 73, 71, 30000000, 1300000, 8, '#009640', '#FFFFFF',
    ['Top half finish', 'Survival', 'Cup progress'],
    'Konya Buyuksehir', [turNat], tsTeam, turAge),
  createClub('ts-kasimpasa', 'Kasimpasa', 'KAS', 'Turkish Super Lig', 72, 70, 25000000, 1200000, 9, '#005CA1', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Kasimpasa Recep Tayyip Erdogan', [turNat], tsTeam, turAge),
  createClub('ts-alanyaspor', 'Alanyaspor', 'ALA', 'Turkish Super Lig', 72, 70, 25000000, 1200000, 10, '#E30A17', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Alanya Oba Stadium', [turNat], tsTeam, turAge),
  createClub('ts-rizespor', 'Caykur Rizespor', 'RIZ', 'Turkish Super Lig', 71, 69, 20000000, 1000000, 11, '#009640', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup run'],
    'Caykur Didi Stadium', [turNat], tsTeam, turAge),
  createClub('ts-antalyaspor', 'Antalyaspor', 'ANT', 'Turkish Super Lig', 72, 70, 25000000, 1200000, 12, '#E30613', '#FFFFFF',
    ['Mid-table finish', 'Survival', 'Cup progress'],
    'Antalya Stadium', [turNat], tsTeam, turAge),
  createClub('ts-gaziantep', 'Gaziantep FK', 'GAZ', 'Turkish Super Lig', 71, 69, 20000000, 1000000, 13, '#C41E24', '#FFFFFF',
    ['Super Lig survival', 'Stay up', 'Cup run'],
    'Kalyon Stadium', [turNat], tsTeam, turAge),
  createClub('ts-adana', 'Adana Demirspor', 'ADA', 'Turkish Super Lig', 73, 71, 30000000, 1300000, 6, '#005CA1', '#FFFFFF',
    ['Top half finish', 'European push', 'Cup progress'],
    'Yeni Adana Stadium', [turNat], tsTeam, turAge),
  createClub('ts-samsunspor', 'Samsunspor', 'SAM', 'Turkish Super Lig', 71, 69, 20000000, 1000000, 14, '#E30613', '#FFFFFF',
    ['Super Lig survival', 'Stay up', 'Cup run'],
    'Samsun 19 Mayis', [turNat], tsTeam, turAge),
  createClub('ts-kayserispor', 'Kayserispor', 'KAY', 'Turkish Super Lig', 71, 69, 20000000, 1000000, 15, '#F4B500', '#E30613',
    ['Super Lig survival', 'Stay up', 'Cup progress'],
    'Kadir Has Stadium', [turNat], tsTeam, turAge),
  createClub('ts-hatayspor', 'Hatayspor', 'HAT', 'Turkish Super Lig', 70, 68, 18000000, 900000, 16, '#005CA1', '#FFFFFF',
    ['Super Lig survival', 'Stay up', 'Cup run'],
    'Yeni Hatay Stadium', [turNat], tsTeam, turAge),
  createClub('ts-pendikspor', 'Pendikspor', 'PEN', 'Turkish Super Lig', 69, 67, 15000000, 800000, 17, '#009640', '#FFFFFF',
    ['Super Lig survival', 'Stay up', 'Cup progress'],
    'Pendik Stadium', [turNat], tsTeam, turAge),
  createClub('ts-istanbulspor', 'Istanbulspor', 'IST', 'Turkish Super Lig', 68, 66, 12000000, 700000, 18, '#F4B500', '#000000',
    ['Super Lig survival', 'Stay up', 'Cup run'],
    'Necmi Kadıoglu Stadium', [turNat], tsTeam, turAge),
];

export const leagues: League[] = [
  { name: 'Premier League', country: 'England', reputation: 95, tier: 1, clubs: premierLeagueClubs },
  { name: 'LaLiga', country: 'Spain', reputation: 93, tier: 1, clubs: laLigaClubs },
  { name: 'Serie A', country: 'Italy', reputation: 90, tier: 1, clubs: serieAClubs },
  { name: 'Bundesliga', country: 'Germany', reputation: 88, tier: 1, clubs: bundesligaClubs },
  { name: 'Ligue 1', country: 'France', reputation: 85, tier: 1, clubs: ligue1Clubs },
  { name: 'Eredivisie', country: 'Netherlands', reputation: 78, tier: 2, clubs: eredivisieClubs },
  { name: 'Primeira Liga', country: 'Portugal', reputation: 80, tier: 2, clubs: primeiraLigaClubs },
  { name: 'MLS', country: 'United States', reputation: 72, tier: 2, clubs: mlsClubs },
  { name: 'Saudi Pro League', country: 'Saudi Arabia', reputation: 75, tier: 2, clubs: saudiProClubs },
  { name: 'Turkish Super Lig', country: 'Turkey', reputation: 74, tier: 2, clubs: turkishSuperLigClubs },
];

export function getClubsByLeague(leagueName: LeagueName): Club[] {
  const league = leagues.find((l) => l.name === leagueName);
  if (!league) return [];
  return [...league.clubs].sort((a, b) => b.rating - a.rating);
}

export function getClubById(id: string): Club | undefined {
  for (const league of leagues) {
    const club = league.clubs.find((c) => c.id === id);
    if (club) return club;
  }
  return undefined;
}
