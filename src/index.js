import 'dotenv/config';
import { app } from './api/index.js';
import { startBot } from './bot/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

startBot();
