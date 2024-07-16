import { NextFunction, Request, Response } from 'express';
import ev, { ValidationError } from 'express-validation';
import * as ej from 'express-jwt';
import Logger from "../utils/logger";
import { ServiceException } from '../utils/service-exceprions';

const logger = new Logger('exception-handler');

export default function exceptionHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    logger.log('%o', {});
  }

  // if (err instanceof MulterError) {
  //   const { field, message } = err;
  //   return res.status(400).json({
  //     message: 'Unable to upload file',
  //     details: { [field]: message }
  //   });
  // }

  if (err instanceof ValidationError) {
    const error = getValidationErrorMsg(err);
    logger.error('validation error', {
      reason: JSON.stringify(err.details)
    });
    return res.status(err.statusCode).json(error);
  }

  if (err.name === 'UnauthorizedError') {
    let error = err as ej.UnauthorizedError;
    logger.error("unauthorized error", { reason: error.message });
    return res.status(error.status).json({
      message: 'Session expired. Please login again',
    });
  }

  if (err instanceof ev.ValidationError) {
    logger.error('validation error', {
      reason: JSON.stringify(err.details)
    });
    return res.status(err.statusCode).json(err);
  }

  if (err instanceof ServiceException) {
    logger.error('error exception', { reason: err.message });
    return res.status(err.code).json({
      message: err.message,
      details: err?.details,
    });
  }

  logger.log(err.message, { path: req.path });
  logger.error("node error exception", { reason: err.message });
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    return res.status(500).send({
      message: 'Something went wrong while processing your request',
    });
  } else {
    return res.status(500).send({
      message: err.message,
    });
  }
}


const detailKeys = ['params', 'headers', 'query', 'cookies', 'signedCookies', 'body'];
const getValidationErrorMsg = (err: ValidationError) => {
  let details = {};

  if (Array.isArray(err.details)) {
    details = err.details.reduce((acc, cur) => ({ ...acc, ...cur }), {});
  } else {
    const keys = detailKeys.filter((key) => err.details[key] && err.details[key].length);
    details = keys.reduce((acc, key) => ({ ...acc, ...formatDetails(err, key) }), {});
  }

  return { message: err.message, details };
};

function formatDetails(err: ValidationError, key: string) {
  const getField = (cur: any) => cur.context.label || cur.context.key || cur.context.main;
  return err.details[key].reduce((acc, cur) => ({
    ...acc,
    [getField(cur)]: cur.message
  }), {});
}