import { expect, test } from '@playwright/test';

test('calculates the odds of two players with the native addon', async ({ page }) => {
  await page.goto('/');

  const combinations = page.locator('.combinations');
  const player1Results = page.locator('.player-1 .player-results');
  const player2Results = page.locator('.player-2 .player-results');
  const onePairRow = page.getByRole('row', { name: /One pair/ });

  await expect(combinations).toHaveText('Combinations: 0');
  await expect(player1Results).toBeHidden();

  for (const card of ['Ah', 'Ad', 'Kc', 'Ks']) {
    await page.getByRole('button', { name: card, exact: true }).click();
  }

  // All 5-card boards from the 48 remaining cards: C(48, 5).
  await expect(combinations).toHaveText('Combinations: 1712304');
  await expect(player1Results.locator('div')).toHaveText([
    'Win: 81.06%',
    'Lose: 18.55%',
    'Draw: 0.38%',
  ]);
  await expect(player2Results.locator('div')).toHaveText([
    'Win: 18.55%',
    'Lose: 81.06%',
    'Draw: 0.38%',
  ]);
  await expect(onePairRow.getByRole('cell').nth(0)).toHaveText('35.03%');
  await expect(page.getByRole('button', { name: 'Ah', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(combinations).toHaveText('Combinations: 0');
  await expect(player1Results).toBeHidden();
  await expect(onePairRow.getByRole('cell').nth(0)).toHaveText('0.00%');
  await expect(page.getByRole('button', { name: 'Ah', exact: true })).toBeVisible();
});
