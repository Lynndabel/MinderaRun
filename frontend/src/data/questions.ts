export interface QuizItem {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // 0-based index into options
  }
  
  export const questions: QuizItem[] = [
    // Hedera & Web3 (1–25)
    { id: '1', question: 'What consensus mechanism powers the Hedera network?', options: ['Hashgraph Consensus', 'Proof of Work', 'Proof of Stake', 'Byzantine Fault'], correctAnswer: 0 },
    { id: '2', question: 'What is the native token of Hedera?', options: ['HED', 'HDR', 'HBAR', 'HDC'], correctAnswer: 2 },
    { id: '3', question: 'Who co-founded Hedera Hashgraph?', options: ['Vitalik Buterin', 'Dr. Leemon Baird & Mance Harmon', 'Gavin Wood', 'Charles Hoskinson'], correctAnswer: 1 },
    { id: '4', question: 'Hedera uses a Directed Acyclic Graph (DAG) rather than a traditional blockchain.', options: ['True', 'False'], correctAnswer: 0 },
    { id: '5', question: 'What makes Hedera unique compared to other networks?', options: ['It is proof-of-work', 'It’s built on Ethereum', 'It uses hashgraph technology', 'It has the most miners'], correctAnswer: 2 },
    { id: '6', question: 'Which of these companies is part of the Hedera Governing Council?', options: ['Meta', 'OpenAI', 'Google', 'Binance'], correctAnswer: 2 },
    { id: '7', question: 'What is the average transaction fee on Hedera?', options: ['$0.01', '$0.10', '$0.0001', '$1'], correctAnswer: 2 },
    { id: '8', question: 'How many members can the Hedera Council have?', options: ['12', '25', '39', '50'], correctAnswer: 2 },
    { id: '9', question: 'What language can be used for Hedera smart contracts?', options: ['C++', 'Solidity', 'TypeScript', 'Python'], correctAnswer: 1 },
    { id: '10', question: 'What does HCS stand for in Hedera?', options: ['Hash Contract Setup', 'Hashgraph Control System', 'Hedera Chain Sync', 'Hedera Consensus Service'], correctAnswer: 3 },
    { id: '11', question: 'What service is used for token creation on Hedera?', options: ['HTS (Hedera Token Service)', 'HLS', 'HFS', 'HCS'], correctAnswer: 0 },
    { id: '12', question: 'What is the name of Hedera’s network explorer?', options: ['LedgerView', 'BlockScan', 'Etherscan', 'HashScan'], correctAnswer: 3 },
    { id: '13', question: 'When did Hedera mainnet launch?', options: ['2020', '2019', '2021', '2018'], correctAnswer: 1 },
    { id: '14', question: 'What is HBAR mainly used for?', options: ['Network fees & staking', 'Buying only NFTs', 'Advertising', 'Mining rewards'], correctAnswer: 0 },
    { id: '15', question: 'How can Hedera help Africa’s digital economy?', options: ['Ban crypto', 'Enable faster, cheaper transactions', 'Replace all banks', 'Increase inflation'], correctAnswer: 1 },
    { id: '16', question: 'Which wallet can store HBAR tokens?', options: ['Coinbase Wallet', 'Phantom', 'MetaMask', 'HashPack'], correctAnswer: 3 },
    { id: '17', question: 'What is staking in Hedera?', options: ['Burning tokens', 'Selling tokens', 'Locking tokens to help secure the network', 'Mining'], correctAnswer: 2 },
    { id: '18', question: 'What kind of ledger is Hedera built on?', options: ['Private Blockchain', 'Public Distributed Ledger', 'File System', 'SQL Database'], correctAnswer: 1 },
    { id: '19', question: 'How fast can Hedera process transactions?', options: ['1000 TPS', '1 TPS', '10,000+ TPS', '100 TPS'], correctAnswer: 2 },
    { id: '20', question: 'What is DLT short for?', options: ['Distributed Ledger Technology', 'Digital Line Token', 'Direct Link Technology', 'Data Log Table'], correctAnswer: 0 },
    { id: '21', question: 'Which Hedera service allows for storing data logs securely?', options: ['HTS', 'HFS', 'HashNet', 'HCS (Consensus Service)'], correctAnswer: 3 },
    { id: '22', question: 'What is the main goal of “Learn-to-Earn” programs?', options: ['Watch ads', 'Reward users for learning Web3 skills', 'Sell crypto', 'Stake HBAR'], correctAnswer: 1 },
    { id: '23', question: 'What African problem can Hedera help solve?', options: ['Transparency in elections', 'Importing electricity', 'Tourism', 'More mining'], correctAnswer: 0 },
    { id: '24', question: 'Which African initiative builds blockchain developers who could use Hedera?', options: ['Meta Africa', 'Digital Africa Forum', 'Web3Bridge', 'Binance Africa'], correctAnswer: 2 },
    { id: '25', question: 'What is a real-world use of Hedera in sustainability?', options: ['File compression', 'Carbon credit tracking', 'Meme coin creation', 'Gaming avatars'], correctAnswer: 1 },
  
    // Africa: History, Innovation & Culture (26–50)
    { id: '26', question: 'What is the largest country in Africa by land area?', options: ['Sudan', 'Egypt', 'Algeria', 'Nigeria'], correctAnswer: 2 },
    { id: '27', question: 'Which African country was never colonized?', options: ['Ghana', 'Ethiopia', 'Uganda', 'Kenya'], correctAnswer: 1 },
    { id: '28', question: 'Who was the first President of Ghana?', options: ['Kwame Nkrumah', 'Jomo Kenyatta', 'Jerry Rawlings', 'Nelson Mandela'], correctAnswer: 0 },
    { id: '29', question: 'What is the most populous country in Africa?', options: ['South Africa', 'Egypt', 'Ethiopia', 'Nigeria'], correctAnswer: 3 },
    { id: '30', question: 'What is Africa’s largest economy by GDP?', options: ['Nigeria', 'Egypt', 'South Africa', 'Kenya'], correctAnswer: 0 },
    { id: '31', question: 'What African leader was known as the “Lion of Judah”?', options: ['Haile Selassie', 'Julius Nyerere', 'Patrice Lumumba', 'Sam Nujoma'], correctAnswer: 0 },
    { id: '32', question: 'What is the traditional cloth from Ghana called?', options: ['Kente', 'Ankara', 'Shweshwe', 'Dashiki'], correctAnswer: 0 },
    { id: '33', question: 'What is the main staple food in East Africa?', options: ['Jollof Rice', 'Fufu', 'Couscous', 'Ugali'], correctAnswer: 3 },
    { id: '34', question: 'What is the official currency of South Africa?', options: ['Cedi', 'Shilling', 'Naira', 'Rand'], correctAnswer: 3 },
    { id: '35', question: 'What African nation is famous for M-Pesa mobile money?', options: ['Ghana', 'Kenya', 'Nigeria', 'Rwanda'], correctAnswer: 1 },
    { id: '36', question: 'Who was the first female president in Africa?', options: ['Joyce Banda', 'Ellen Johnson Sirleaf', 'Amina Mohammed', 'Ngozi Okonjo-Iweala'], correctAnswer: 1 },
    { id: '37', question: 'Which African country produces the most cocoa?', options: ['Ghana', 'Côte d’Ivoire', 'Cameroon', 'Nigeria'], correctAnswer: 1 },
    { id: '38', question: 'What desert is the largest in Africa?', options: ['Sahara', 'Kalahari', 'Namib', 'Danakil'], correctAnswer: 0 },
    { id: '39', question: 'Which African musician is known as the “King of Afrobeat”?', options: ['Youssou N\'Dour', 'Fela Kuti', 'Burna Boy', 'Angelique Kidjo'], correctAnswer: 1 },
    { id: '40', question: 'What is the name of the world’s second-longest river, located in Africa?', options: ['Nile', 'Niger River', 'Zambezi', 'Congo River'], correctAnswer: 3 },
    { id: '41', question: 'What country is home to Table Mountain?', options: ['South Africa', 'Namibia', 'Zimbabwe', 'Botswana'], correctAnswer: 0 },
    { id: '42', question: 'What African tech hub is nicknamed the “Silicon Savannah”?', options: ['Accra, Ghana', 'Nairobi, Kenya', 'Kigali, Rwanda', 'Lagos, Nigeria'], correctAnswer: 1 },
    { id: '43', question: 'Who was Nelson Mandela?', options: ['Ethiopian emperor', 'Anti-apartheid leader and South Africa’s first black president', 'Ghanaian musician', 'Kenyan activist'], correctAnswer: 1 },
    { id: '44', question: 'What is the main export product of Nigeria?', options: ['Cocoa', 'Crude oil', 'Gold', 'Cotton'], correctAnswer: 1 },
    { id: '45', question: 'What is Africa’s largest lake?', options: ['Lake Malawi', 'Lake Victoria', 'Lake Tanganyika', 'Lake Chad'], correctAnswer: 1 },
    { id: '46', question: 'Which African woman became WTO Director-General?', options: ['Ellen Sirleaf', 'Joyce Banda', 'Amina Mohammed', 'Ngozi Okonjo-Iweala'], correctAnswer: 3 },
    { id: '47', question: 'What country is home to the pyramids of Giza?', options: ['Sudan', 'Egypt', 'Ethiopia', 'Morocco'], correctAnswer: 1 },
    { id: '48', question: 'What African city hosted the 2010 FIFA World Cup?', options: ['Lagos', 'Johannesburg', 'Nairobi', 'Cairo'], correctAnswer: 1 },
    { id: '49', question: 'What African scientist is known as the father of modern Internet technology?', options: ['Salif Keita', 'Philip Emeagwali', 'John Magufuli', 'Wole Soyinka'], correctAnswer: 1 },
    { id: '50', question: 'What African innovation allows people to send money via phone without internet?', options: ['Paystack', 'Paga', 'Flutterwave', 'M-Pesa'], correctAnswer: 3 },
  ];
  