# Database Relationships

## Entity-Relationship Diagram (ERD) & Structure
The PostgreSQL database managed via Prisma relies heavily on one-to-many relationships cascading from `ServiceProvider`:

- **ServiceProvider -> Customers (1:N):** A provider manages many customers. Deleting a provider cascades to delete all their customers.
- **ServiceProvider -> ShortLinks/MagicLinks (1:N):** Providers generate magic links tailored with their own branding.
- **ServiceProvider -> CalendarEvents & Notifications (1:N):** Broadcast data is scoped per provider.
- **Customer <-> MagicLink (1:1):** A customer has a unique magic link assigned to them (`magicLinkId`).

All models index the `providerId` for multi-tenant query performance.
