# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Buyers (người mua):** readers who browse, search and buy books from many independent stores on one platform.
- **Sellers (người bán):** bookstores that register a store, submit KYC documents, and, once approved, list and sell their books.
- **Admins:** platform staff who review seller KYC submissions and approve or reject stores before they go live.

## Product Purpose

Thoth is a multi-vendor book marketplace. It brings many bookstores onto one platform so buyers get a wider and more varied range of books than any single store carries. Success means approved sellers list their catalogs and buyers find and buy books across stores in one checkout.

The project is also a learning vehicle for microservices architecture; implementation choices should follow industry practice.

## Positioning

Catalog variety comes from the stores themselves: what is available depends on which sellers join and what they list, not on a central inventory.

## Operating Context

- Seller onboarding: register store → submit KYC → admin review → store published.
- Buyers can add books from several stores to one cart; checkout splits it into a separate order per store.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4 (existing scaffold).
- Languages: Vietnamese (default) and English.
- Currency: VND.
- Open decisions: payment methods, shipping/fulfilment model, commission/fee model, KYC document requirements, returns and disputes.

## Brand Commitments

- Name: **Thoth**, after the Egyptian god of knowledge and writing.
- Logo: none yet; the user asked for one to be designed as part of the visual-world work.

## Evidence on Hand

None yet: no real stores, books, reviews, sales figures or partners. Future work must not fabricate testimonials, store counts, ratings or other claims; use clearly marked placeholder data.

## Product Principles

1. Trust first: KYC and admin approval exist so buyers can trust every store; surface that verification honestly.
2. Variety is the value: help buyers discover across stores, and make the store a book comes from visible.
3. One cart, clear splits: multi-store buying stays simple, while orders, shipping and status stay clear per store.
4. Bilingual by default: every surface works in Vietnamese and English from the start.
