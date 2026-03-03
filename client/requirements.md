## Packages
react-markdown | For formatting markdown responses in the AI Chat
remark-gfm | For table and extended markdown support in chat responses
recharts | For rendering beautiful analytics charts on the dashboard
lucide-react | Base icon set
date-fns | Date formatting

## Notes
- Ensure @shared/routes is exported correctly from the backend with the `api` and `buildUrl` constants.
- The chat uses Server-Sent Events (SSE) for streaming responses on `POST /api/conversations/:id/messages`.
- Tailwind configuration must be aware of the custom CSS variables for colors.
