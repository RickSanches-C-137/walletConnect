import { Router } from 'express';
import { jwtGuard } from '../middlewares/auth-guard';
import usersRoutes from './user';
import rewardRoutes from './reward'

const apiRouter = Router();
const route = Router();

const jwt = jwtGuard({ credentialsRequired: true }).unless({
  path: [
    '/',
    '/v1/signup',
    '/v1/signin',
    '/v1/create-reward'
  ]
});

apiRouter.use(usersRoutes);
apiRouter.use(rewardRoutes);


route.use('/v1', jwt, apiRouter);

export default route;