import express from 'express';
import request from 'supertest';
import apiRoutes from '../api';

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('API Routes', () => {
  it('devrait avoir la route POST /api/analyze', async () => {
    const response = await request(app).post('/api/analyze');
    // On attend 400 car pas d'image, mais la route existe
    expect(response.status).not.toBe(404);
  });

  it('devrait avoir la route POST /api/analyze-text', async () => {
    const response = await request(app).post('/api/analyze-text').send({});
    // On attend 400 car pas de texte, mais la route existe
    expect(response.status).not.toBe(404);
  });

  it('ne devrait pas avoir de route GET /api/analyze', async () => {
    const response = await request(app).get('/api/analyze');
    expect(response.status).toBe(404);
  });
});
