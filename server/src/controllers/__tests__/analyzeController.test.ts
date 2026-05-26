import express from 'express';
import multer from 'multer';
import request from 'supertest';
import * as mistralService from '../../services/mistralService';
import { analyzeFoodImage, analyzeTextIngredients } from '../analyzeController';

// Mock du service Mistral
jest.mock('../../services/mistralService');

const app = express();
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/api/analyze', upload.single('image'), analyzeFoodImage);
app.post('/api/analyze-text', analyzeTextIngredients);

describe('analyzeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    const mockAnalysisResult = {
      success: true,
      extractedText: 'Eau, Sucre, Farine',
      analysis: {
        ingredients: [
          {
            name: 'Eau',
            category: 'natural',
            explanation: 'Ingrédient de base essentiel.',
            riskLevel: 'none',
          },
          {
            name: 'Sucre',
            category: 'sugar_added',
            explanation: 'À consommer avec modération.',
            riskLevel: 'medium',
          },
        ],
        score: 70,
        grade: 'C' as const,
        summary: {
          positives: ['Ingrédients naturels présents', 'Pas d\'additifs controversés'],
          warnings: ['Présence de sucre ajouté', 'Consommer avec modération'],
          recommendations: ['Limiter la fréquence de consommation', 'Privilégier des alternatives moins sucrées'],
        },
      },
    };

    it('devrait analyser une image avec succès', async () => {
      (mistralService.analyzeImageService as jest.Mock).mockResolvedValue(mockAnalysisResult);

      const response = await request(app)
        .post('/api/analyze')
        .field('healthProfile', JSON.stringify({
          id: 'default',
          name: 'Profil par défaut',
          diabetes: false,
          hypertension: false,
          obesity: false,
          allergens: [],
          diet: 'none',
          avoidAdditives: false,
          avoidPalmOil: false,
        }))
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('extractedText');
      expect(response.body.analysis).toHaveProperty('score', 70);
      expect(response.body.analysis).toHaveProperty('grade', 'C');
      expect(response.body.analysis.summary.positives).toHaveLength(2);
      expect(response.body.analysis.summary.warnings).toHaveLength(2);
      expect(response.body.analysis.summary.recommendations).toHaveLength(2);
    });

    it('devrait retourner une erreur 400 si aucune image n\'est fournie', async () => {
      const response = await request(app).post('/api/analyze');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Aucune image fournie');
    });

    it('devrait gérer les erreurs du service Mistral', async () => {
      (mistralService.analyzeImageService as jest.Mock).mockRejectedValue(
        new Error('Erreur API Mistral')
      );

      const response = await request(app)
        .post('/api/analyze')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('devrait analyser avec un profil santé personnalisé', async () => {
      const diabeticProfile = {
        id: 'diabetic',
        name: 'Profil diabétique',
        diabetes: true,
        hypertension: false,
        obesity: false,
        allergens: [],
        diet: 'none',
        avoidAdditives: false,
        avoidPalmOil: false,
      };

      const mockDiabeticResult = {
        ...mockAnalysisResult,
        analysis: {
          ...mockAnalysisResult.analysis,
          score: 25,
          grade: 'E' as const,
          summary: {
            positives: ['Aucun pour diabétiques'],
            warnings: ['⛔ INTERDIT pour diabétiques - Risque hyperglycémie sévère'],
            recommendations: ['⛔ PRODUIT STRICTEMENT INTERDIT', 'Alternatives sans sucre recommandées'],
          },
        },
      };

      (mistralService.analyzeImageService as jest.Mock).mockResolvedValue(mockDiabeticResult);

      const response = await request(app)
        .post('/api/analyze')
        .field('healthProfile', JSON.stringify(diabeticProfile))
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body.analysis.grade).toBe('E');
      expect(response.body.analysis.summary.warnings).toContain('⛔ INTERDIT pour diabétiques - Risque hyperglycémie sévère');
    });
  });

  describe('POST /api/analyze-text', () => {
    it('devrait accepter une analyse de texte', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .send({ text: 'Eau, Sucre, Farine de blé' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('devrait retourner une erreur 400 si le texte est manquant', async () => {
      const response = await request(app).post('/api/analyze-text').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Texte d\'ingrédients requis');
    });

    it('devrait retourner une erreur 400 si le texte n\'est pas une chaîne', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .send({ text: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Texte d\'ingrédients requis');
    });
  });
});
