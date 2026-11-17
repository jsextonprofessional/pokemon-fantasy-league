# S3.1.3 — CLI Webhook Debugger: `formflow webhooks`

## Acceptance Criteria

1. `formflow webhooks trigger --endpoint <id>` — sends test payload to form's webhookUrl, prints response
2. `formflow webhooks logs --endpoint <id>` — shows last 50 delivery attempts with status, response time, headers
3. `formflow webhooks replay <delivery-id>` — retries a specific delivery
4. All webhook log entries show exact request headers including signature header
5. `formflow webhooks listen --forward-to <url>` — SSE tunnel for live webhook deliveries
6. `formflow webhooks verify --secret <secret> --payload <file>` — prints VALID/INVALID with HMAC-SHA256

## Changes

### Schema migration (1 file)
- Add `webhookUrl String?` + `webhookSecret String?` to `Form`
- Add `requestHeaders Json?` + `responseBody String?` + `requestBody Json?` to `WebhookDeliveryLog`

### New API files
- `apps/api/src/services/webhookSignature.ts` — `computeWebhookSignature()`, `verifyWebhookSignature()`
- `apps/api/src/routes/webhooks.ts` — GET /webhooks/deliveries, POST /webhooks/trigger, POST /webhooks/replay/:id, GET /webhooks/tunnel/listen

### Updated API files
- `apps/api/src/services/webhookService.ts` — add signature header, store requestHeaders/responseBody/requestBody
- `apps/api/src/services/tunnelEventBus.ts` — add WebhookDeliveryTunnelEvent + emitWebhook/subscribeWebhook
- `apps/api/src/types/routeDependencies.ts` — add WebhooksRouteDependencies
- `apps/api/src/plugins/versioning.ts` — register webhook routes
- `apps/api/src/app.ts` — wire webhook deps

### New CLI files
- `packages/cli/src/commands/webhooks.ts` — all 5 subcommands

### Updated CLI files
- `packages/cli/src/program.ts` — register webhooks command

### Tests
- `apps/api/src/services/webhookSignature.test.ts`
- `apps/api/src/routes/webhooks.test.ts`
- `packages/cli/src/commands/webhooks.test.ts`

## Implementation Notes

- Signature algorithm: HMAC-SHA256, header: `X-Peachform-Signature: sha256=<hex>`
- Webhook tunnel uses separate `webhooks:user:${userId}` event channel
- All routes use Bearer JWT auth via `extractUserIdFromBearer()` pattern from tunnel.ts
- CLI reuses `parseSseStream` from `listen.ts`
- `replay` re-sends original `requestBody` from log with fresh signature
