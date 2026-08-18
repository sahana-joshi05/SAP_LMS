# multitenancy

Reserved for multi-institute support (if SV LMS is ever sold/licensed to more than one
training institute and needs to isolate each institute's data). Typical contents would
be a TenantContext (thread-local current tenant), a TenantFilter (resolves tenant from
subdomain/header), and a tenant_id column added to the core entities.

Not used by the current MVP — SV LMS currently assumes a single institute.
