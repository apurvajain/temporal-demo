import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from '../../../packages/activities/activities';
import { config } from 'dotenv';
config();

const TEMPORAL_CLUSTER_URL = process.env.TEMPORAL_CLUSTER_URL || 'localhost:7233';

async function run() {
  const connection = await NativeConnection.connect({
    address: TEMPORAL_CLUSTER_URL,
    // TLS and gRPC metadata configuration goes here.
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('../../../packages/workflows/workflows'),
    activities,
    taskQueue: 'login-tasks',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
