import winston from 'winston';
import path from 'path';

const logFilePath = path.resolve(__dirname, 'backstage-plugins.log');

export const rootLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      // meta.file is optional, add it in your plugin logs
      return `[${timestamp}] [${level}]${meta.file ? ` [${meta.file}]` : ''} ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: logFilePath }),
  ],
});
