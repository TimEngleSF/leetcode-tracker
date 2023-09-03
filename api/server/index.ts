import 'dotenv/config.js';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT: string | number = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes.authRouter);

app.use('/questions', routes.questionsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
