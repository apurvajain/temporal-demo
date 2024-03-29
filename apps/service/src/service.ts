import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Client, Connection } from '@temporalio/client';
import { randomUUID } from 'node:crypto';
import { login } from '../../../packages/workflows/workflows';

const TEMPORAL_CLUSTER_URL = process.env.TEMPORAL_CLUSTER_URL || 'localhost:7233';

const app: Express = express();
const port = 3000;
app.use(bodyParser.json());

app.use('/login', async (req: Request, res: Response) => {
  console.log('IN LOGIN');
  console.log(req.query);
  const otp: string = req.query.otp as string;
  console.log('opt: ', otp);

  // create connection details
  const connection = await Connection.connect({ address: TEMPORAL_CLUSTER_URL });
  console.log('connection: , connection');
  // create the connection
  const client = new Client({
    connection,
  });
  console.log('CLIENT MADE');
  try {
    const result = await client.workflow.execute(login, {
      args: [otp],
      taskQueue: 'login-tasks',
      workflowId: 'workflow-' + randomUUID(),
    });
    console.log('Workflow executed successfully:', result);
  } catch (error) {
    console.error('Error executing workflow:', error);
  }

  res.status(200);
  res.send(`OTP Recieved: ${otp}!`);
});

app.use(notFound);
app.use(errorHandler);

function notFound(req: Request, res: Response) {
  res.status(404);
  res.send({ error: 'Not found!', status: 404, url: req.originalUrl });
}

function errorHandler(err: Error, req: Request, res: Response) {
  console.error('ERROR', err);
  res.status(500);
  res.send({ error: err.message, url: req.originalUrl });
}

app
  .listen(port)
  .on('error', (e) => console.error(e))
  .on('listening', () => console.log(`Listening on ${TEMPORAL_CLUSTER_URL}`));
