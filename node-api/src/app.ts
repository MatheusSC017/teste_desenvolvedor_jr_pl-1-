import express, { Application } from 'express';
import tasksRoutes from './routes/tasksRoutes';
import home from './routes/home';

const app: Application = express();
app.use(express.json());

// Rotas
app.use('/', home);

app.use('/tasks', tasksRoutes);

export default app;