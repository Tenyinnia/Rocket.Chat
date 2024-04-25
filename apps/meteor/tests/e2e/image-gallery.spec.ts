import { createAuxContext } from './fixtures/createAuxContext';
import { Users } from './fixtures/userStates';
import { HomeChannel } from './page-objects';
import { createTargetChannel, deleteChannel } from './utils';
import { expect, test } from './utils/test';

test.describe.parallel('Image Gallery', async () => {
	let poHomeChannel: HomeChannel;
	let targetChannel: string;
	const viewport = {
		width: 1280,
		height: 720,
	};
	// Using more than 5 images so that new images need to be loaded by the gallery
	const imageNames = ['number1.png', 'number2.png', 'number3.png', 'number4.png', 'number5.png', 'number6.png', 'test-large-image.jpeg'];

	test.use({ viewport });

	test.beforeAll(async ({ api, browser }) => {
		targetChannel = await createTargetChannel(api);
		const { page } = await createAuxContext(browser, Users.user1);
		poHomeChannel = new HomeChannel(page);

		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.content.btnJoinRoom.click();
		for await (const imageName of imageNames) {
			await poHomeChannel.content.sendFileMessage(imageName);
			await poHomeChannel.content.btnModalConfirm.click();
			await expect(poHomeChannel.content.lastUserMessage).toContainText(imageName);
		}

		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.content.btnJoinRoom.click();

		await poHomeChannel.content.sendFileMessage('test-large-image.jpeg');
		await poHomeChannel.content.btnModalConfirm.click();

		await expect(poHomeChannel.content.lastUserMessage).toContainText('test-large-image.jpeg');

		await poHomeChannel.content.lastUserMessage.locator('img.gallery-item').click();
	});

	test.afterAll(async ({ api }) => {
		await deleteChannel(api, targetChannel);
	});

	test('expect to have a large image not out of viewport bounds', async () => {
		expect(
			await poHomeChannel.content.imageGalleryImage.evaluate((el) => parseInt(window.getComputedStyle(el).getPropertyValue('width'))),
		).toBeLessThanOrEqual(viewport.width);

		expect(
			await poHomeChannel.content.imageGalleryImage.evaluate((el) => parseInt(window.getComputedStyle(el).getPropertyValue('height'))),
		).toBeLessThanOrEqual(viewport.height);
	});

	test('expect to zoom in image', async () => {
		await (await poHomeChannel.content.getGalleryButtonByName('zoom-in')).click();

		expect(parseInt((await poHomeChannel.content.imageGalleryImage.getAttribute('data-qa-zoom-scale')) as string)).toBeGreaterThan(1);
	});

	test('expect to zoom out image', async () => {
		await (await poHomeChannel.content.getGalleryButtonByName('zoom-out')).click();

		expect(parseInt((await poHomeChannel.content.imageGalleryImage.getAttribute('data-qa-zoom-scale')) as string)).toEqual(1);
	});

	test('expect to resize image to default ratio', async () => {
		await expect(await poHomeChannel.content.getGalleryButtonByName('zoom-out')).toBeDisabled();

		await (await poHomeChannel.content.getGalleryButtonByName('zoom-in')).dblclick();

		await expect(await poHomeChannel.content.getGalleryButtonByName('zoom-out')).toBeEnabled();

		await (await poHomeChannel.content.getGalleryButtonByName('resize')).click();

		expect(parseInt((await poHomeChannel.content.imageGalleryImage.getAttribute('data-qa-zoom-scale')) as string)).toEqual(1);
	});

	test('expect successfully move to older images by using the left arrow button', async () => {
		/* eslint-disable no-await-in-loop */
		for (let i = 0; i < imageNames.length - 1; i++) {
			await expect(poHomeChannel.content.nextSlideButton).toBeEnabled();
			await expect(poHomeChannel.content.currentGalleryImage).toHaveAttribute('src', new RegExp(`${imageNames[imageNames.length - (i + 1)]}$`));
			await poHomeChannel.content.nextSlideButton.click();
		}
		await expect(poHomeChannel.content.nextSlideButton).toBeDisabled();
	});

	test('expect successfully move to newer images by using the right arrow button', async () => {
		/* eslint-disable no-await-in-loop */
		for (let i = 0; i < imageNames.length - 1; i++) {
			await poHomeChannel.content.nextSlideButton.click();
		}

		for (let i = 0; i < imageNames.length - 1; i++) {
			await expect(poHomeChannel.content.previousSlideButton).toBeEnabled();
			await expect(poHomeChannel.content.currentGalleryImage).toHaveAttribute('src', new RegExp(`${imageNames[i]}$`));
			await poHomeChannel.content.previousSlideButton.click();
		}
		await expect(poHomeChannel.content.previousSlideButton).toBeDisabled();
	});

	test('expect to close gallery', async () => {
		await (await poHomeChannel.content.getGalleryButtonByName('close')).click();

		await expect(poHomeChannel.content.imageGalleryImage).not.toBeVisible();
	});
});
