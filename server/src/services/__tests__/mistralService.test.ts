import { analyzeImageService } from '../mistralService';

// Robust mock: define mockChatComplete at module scope so jest.mock factory can close over it


// Provide a factory to jest.mock so every new Mistral() has chat.complete = mockChatComplete
jest.mock('@mistralai/mistralai', () => {
  const mockChatComplete = jest.fn();
  return {
    Mistral: jest.fn().mockImplementation(() => ({
      chat: { complete: mockChatComplete },
    })),
    __mockChatComplete: mockChatComplete,
  };
});

// Retrieve the mock produced by the factory
const { __mockChatComplete: mockChatComplete } = jest.requireMock('@mistralai/mistralai');

describe('mistralService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChatComplete.mockReset();
  });

describe('mistralService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChatComplete.mockReset();
  });

  describe('analyzeImageService', () => {
    const mockBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

    it('devrait analyser une image avec succès', async () => {
      const mockMistralResponse = {
        extractedText: 'Eau, Sucre, Farine de blé, Sel',
        ingredients: [
          {
            name: 'Eau',
            category: 'natural',
            explanation: "L'eau est essentielle pour l'hydratation et ne présente aucun risque.",
            riskLevel: 'none',
          },
          {
            name: 'Sucre',
            category: 'sugar_added',
            explanation: "Le sucre ajouté en excès peut contribuer à l'obésité et au diabète.",
            riskLevel: 'medium',
          },
        ],
        score: 65,
        grade: 'C',
        summary: {
          positives: ["Contient des ingrédients naturels comme l'eau", "Pas d'additifs controversés détectés"],
          warnings: ['Présence de sucre ajouté', 'Consommer avec modération'],
          recommendations: ['Limiter la consommation à 2-3 fois par semaine', 'Privilégier des alternatives sans sucre ajouté'],
        },
      };

      mockChatComplete.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockMistralResponse) } }],
      });

      const result = await analyzeImageService(mockBase64Image);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('extractedText', 'Eau, Sucre, Farine de blé, Sel');
      expect(result.analysis).toHaveProperty('score', 65);
      expect(result.analysis).toHaveProperty('grade', 'C');
      expect(result.analysis.ingredients).toHaveLength(2);
      expect(result.analysis.summary.positives).toHaveLength(2);
      expect(result.analysis.summary.warnings).toHaveLength(2);
      expect(result.analysis.summary.recommendations).toHaveLength(2);

      expect(mockChatComplete).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les profils diabétiques', async () => {
      const diabeticProfile = {
        diabetes: true,
        hypertension: false,
        obesity: false,
        allergens: [],
        diet: 'none',
        avoidAdditives: false,
        avoidPalmOil: false,
      };

      const mockMistralResponse = {
        extractedText: 'Coca-Cola: Eau gazéifiée, Sucre (35g/100ml), Colorant E150d',
        ingredients: [
          {
            name: 'Sucre 35g/100ml',
            category: 'sugar_added',
            explanation: 'Teneur en sucre EXCESSIVE - Risque critique pour diabétiques.',
            riskLevel: 'critical',
          },
        ],
        score: 0,
        grade: 'E',
        summary: {
          positives: ['Emballage recyclable'],
          warnings: ['⛔ INTERDIT pour diabétiques - Risque hyperglycémie sévère'],
          recommendations: ['⛔ PRODUIT STRICTEMENT INTERDIT', 'Alternatives: Eau, thé non sucré'],
        },
      };

      mockChatComplete.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockMistralResponse) } }],
      });

      const result = await analyzeImageService(mockBase64Image, diabeticProfile);

      expect(result.analysis.score).toBe(0);
      expect(result.analysis.grade).toBe('E');
    });

    it('devrait gérer les réponses avec markdown', async () => {
      const mockMistralResponseWithMarkdown = {
        extractedText: 'Eau, Sucre, Farine de blé, Sel',
        ingredients: [
          {
            name: 'Eau',
            category: 'natural',
            explanation: "L'eau est essentielle pour l'hydratation et ne présente aucun risque.",
            riskLevel: 'none',
          },
          {
            name: 'Sucre',
            category: 'sugar_added',
            explanation: "Le sucre ajouté en excès peut contribuer à l'obésité et au diabète.",
            riskLevel: 'medium',
          },
        ],
        score: 65,
        grade: 'C',
        summary: {
          positives: ["Contient des ingrédients naturels comme l'eau", "Pas d'additifs controversés détectés"],
          warnings: ['Présence de sucre ajouté', 'Consommer avec modération'],
          recommendations: ['Limiter la consommation à 2-3 fois par semaine', 'Privilégier des alternatives sans sucre ajouté'],
        },
      };

      mockChatComplete.mockResolvedValue({
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockMistralResponseWithMarkdown) + '\n```',
            },
          },
        ],
      });

      const result = await analyzeImageService(mockBase64Image);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('extractedText', 'Eau, Sucre, Farine de blé, Sel');
      expect(result.analysis).toHaveProperty('score', 65);
      expect(result.analysis).toHaveProperty('grade', 'C');
      expect(result.analysis.ingredients).toHaveLength(2);
      expect(result.analysis.summary.positives).toHaveLength(2);
      expect(result.analysis.summary.warnings).toHaveLength(2);
      expect(result.analysis.summary.recommendations).toHaveLength(2);
    });
  });

   describe('edge cases and error branches', () => {
    it('devrait rejeter si choices est vide', async () => {
      mockChatComplete.mockResolvedValue({}); // pas de choices
      await expect(analyzeImageService('data:fake')).rejects.toThrow(
        "L'analyse IA a échoué. Vérifiez l'image ou la clé API.",
      );
    });

    it('devrait rejeter si la réponse JSON est malformée', async () => {
      // contenu string invalide => JSON.parse doit échouer
      mockChatComplete.mockResolvedValue({
        choices: [{ message: { content: '{"extractedText":"Eau", "ingredients": [' } }],
      });
      await expect(analyzeImageService('data:fake')).rejects.toThrow(
        "L'analyse IA a échoué. Vérifiez l'image ou la clé API.",
      );
    });

    it('devrait rejeter si content est d\'un type inattendu (non string/non object)', async () => {
      mockChatComplete.mockResolvedValue({
        choices: [{ message: { content: 42 as any } }],
      } as any);
      await expect(analyzeImageService('data:fake')).rejects.toThrow(
        "L'analyse IA a échoué. Vérifiez l'image ou la clé API.",
      );
    });

    it('devrait appliquer le fallback si extractedText est générique', async () => {
      const response = {
        extractedText: 'Liste complète des ingrédients',
        ingredients: [{ name: 'Ingrédients non détectés', category: 'other', explanation: 'fallback', riskLevel: 'none' }],
        score: 60,
        grade: 'C',
        summary: { positives: [], warnings: [], recommendations: [] },
      };
      mockChatComplete.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(response) } }],
      });
      const res = await analyzeImageService('data:fake');
      expect(res.extractedText).toMatch(/Texte non extrait/i);
      expect(res.analysis.summary.positives.length).toBeGreaterThan(0);
      expect(res.analysis.summary.recommendations.length).toBeGreaterThan(0);
    });
  });

});



})