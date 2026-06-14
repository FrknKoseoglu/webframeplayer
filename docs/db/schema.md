# Database Schema

## Overview
- **Database:** PostgreSQL
- **ORM:** Prisma (`prisma/schema.prisma`)

## Core Entities
1. **SuperAdmin & ServiceProvider:** Represents platform administrators and reseller service providers. Providers have credits and can configure default magic links and support URLs.
2. **Customer:** Represents end users associated with a specific `ServiceProvider`. They have either `XTREAM` or `M3U` credentials, an expiry date, and are linked to a magic link.
3. **MagicLink & ShortLink:** `MagicLink` contains login credentials or M3U URLs wrapped in a short code. `ShortLink` handles the redirection mapping.
4. **CalendarEvent & Notification:** Events for EPG navigation and messages/notifications broadcasted to customers.
5. **CreditLog:** Keeps an audit trail of prepaid credit additions and deductions per ServiceProvider.
