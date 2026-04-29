## Part 14: Testing Strategy

### 14.1 Unit Tests (Vitest)

```typescript
// src/lib/naming-convention-validator.test.ts
describe('validateAgainstConvention', () => {
  it('accepts valid snake_case values', () => {
    const convention = createMockConvention('snake_case');
    const result = validateAgainstConvention('product_launch', convention, 'utm_campaign');
    expect(result.valid).toBe(true);
    expect(result.transformed).toBe('product_launch');
  });
  
  it('rejects values with spaces', () => {
    const convention = createMockConvention('snake_case');
    const result = validateAgainstConvention('Product Launch', convention, 'utm_campaign');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Doesn\'t match pattern');
  });
  
  it('transforms to snake_case when rule requires', () => {
    const convention = createMockConvention('auto_transform');
    const result = validateAgainstConvention('Product Launch', convention, 'utm_campaign');
    expect(result.transformed).toBe('product_launch');
  });
});
```

### 14.2 Integration Tests (RTL + API Mocking)

```typescript
// src/components/organic/utm-generator-form.test.tsx
describe('UTM Generator Form (with API)', () => {
  it('creates link via API and shows result', async () => {
    // Mock API
    MSW.use(
      http.post('/api/v1/teams/:teamId/links', async ({ request }) => {
        return HttpResponse.json({
          id: 'link-123',
          full_url: 'https://...',
          created_at: '2026-04-12T...'
        });
      })
    );
    
    // Render form
    const { getByRole, getByText } = render(<UtmGeneratorForm teamId="team-1" />);
    
    // Fill form
    fireEvent.change(getByRole('textbox', { name: /base url/i }), {
      target: { value: 'https://example.com' }
    });
    fireEvent.click(getByRole('button', { name: /generate/i }));
    
    // Wait for API call
    await waitFor(() => {
      expect(getByText(/link created/i)).toBeInTheDocument();
    });
  });
});
```

### 14.3 E2E Tests (Playwright)

```typescript
// e2e/auth.spec.ts
test.describe('Authentication Flow', () => {
  test('user can sign up and create team', async ({ page }) => {
    // Navigate to signup
    await page.goto('/auth/signup');
    
    // Enter email
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button:has-text("Send Link")');
    
    // Wait for "Check your email" message
    await expect(page.locator('text=Check your email')).toBeVisible();
    
    // In real test: extract link from email, click it
    // For demo: navigate directly to callback with token
    // (in real flow, user would get link in email)
    
    // Complete signup (create team)
    await page.goto('/onboarding/team-creation');
    await page.fill('[name="team_name"]', 'My Test Team');
    await page.click('button:has-text("Create Team")');
    
    // Verify redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=My Test Team')).toBeVisible();
  });
});
```

### 14.4 Performance Tests

```typescript
// e2e/performance.spec.ts
test('link creation responds in <200ms p99', async ({ page }) => {
  // Setup: logged in, on organic page
  
  // Measure time to create link
  const start = performance.now();
  
  // Fill form, submit
  await page.fill('[name="base_url"]', 'https://example.com');
  await page.selectOption('[name="campaign"]', 'launch');
  await page.click('button:has-text("Generate")');
  
  // Wait for result
  await page.waitForSelector('text=Link created');
  
  const duration = performance.now() - start;
  console.log(`Link creation time: ${duration}ms`);
  expect(duration).toBeLessThan(200);
});
```

### 14.5 Security Tests

```typescript
// e2e/security.spec.ts
test('cannot access other team\'s data', async ({ page, context }) => {
  // Create 2 users with 2 teams
  const user1 = await signup({ email: 'user1@test.com' });
  const user2 = await signup({ email: 'user2@test.com' });
  
  // User 1: Create link in Team A
  await loginAsUser(page, user1);
  await page.goto('/organic');
  await createLink(page, 'user1-link');
  
  // User 2: Try to access User 1's link via direct API call
  const response = await fetch('/api/v1/teams/{teamA}/links', {
    headers: { Authorization: `Bearer ${user2.token}` }
  });
  
  // Should get 403 Forbidden or empty response (RLS filters it)
  expect(response.status).toBe(403);
  // OR expect response data to be empty (RLS silently filters)
});
```

---

