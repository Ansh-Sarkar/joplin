import Logger from '@joplin/lib/Logger';
import BaseService from './BaseService';
const cron = require('node-cron');

const logger = Logger.create('cron');

async function runCronTask(name: string, callback: Function) {
	const startTime = Date.now();
	logger.info(`Running task "${name}"`);
	try {
		await callback();
	} catch (error) {
		logger.error(`On task "${name}"`, error);
	}
	logger.info(`Completed task "${name}" in ${Date.now() - startTime}ms`);
}

export default class CronService extends BaseService {

	public async runInBackground() {
		cron.schedule('0 */6 * * *', async () => {
			await runCronTask('deleteExpiredTokens', async () => this.models.token().deleteExpiredTokens());
		});

		cron.schedule('0 * * * *', async () => {
			await runCronTask('updateTotalSizes', async () => this.models.item().updateTotalSizes());
		});

		cron.schedule('0 12 * * *', async () => {
			await runCronTask('handleBetaUserEmails', async () => this.models.user().handleBetaUserEmails());
		});

		cron.schedule('0 13 * * *', async () => {
			await runCronTask('handleFailedPaymentSubscriptions', async () => this.models.user().handleFailedPaymentSubscriptions());
		});

		cron.schedule('0 14 * * *', async () => {
			await runCronTask('handleOversizedAccounts', async () => this.models.user().handleOversizedAccounts());
		});
	}

}
