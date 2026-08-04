# Icon library

63 monochrome line icons on a 24x24 grid, for labelling components inside a house diagram. Every symbol lives in `icons.svg`, sorted alphabetically by id. The tables below are grouped by category because that is how you pick one.

The set is deliberately one visual family: `stroke-width="1.75"`, round caps and joins, no baked colour, two to four marks of interior detail. Do not mix in an icon from anywhere else, and do not restyle one member. An icon that carries more detail than its neighbours reads as an error at 24px.

## Use them sparingly

The reference corpus is icon-light. A forensic pass over all 53 files found roughly fifteen distinct icon shapes in total: the style carries meaning through labelled boxes and the shape vocabulary in `tokens.md` (cylinder, stadium, diamond, cube) and reaches for an icon only where the shape channel cannot say it. This library is broader than that on purpose, so an icon exists when you need one, and it is not an invitation to use them.

Every member here was authored to fill out the categories, so the inventory reflects what technical diagrams generally need rather than what these decks have been measured to need. Treat an icon as a claim you have to justify, not as decoration.

An icon in every box is the tell the rubric bans under Gate 5 as icon-in-a-pastel-rounded-square. If two boxes sit side by side and only one carries an icon, that difference must mean something.

## Usage

The build engine inlines every SVG into the slide DOM and scopes ids, so a cross-file `<use href="icons.svg#i-server">` does not resolve. Each figure has to carry the symbols it uses.

Copy the `<symbol>` elements you need out of `icons.svg` into the figure's own `<defs>`, then reference them with `<use>`:

```xml
<defs>
  <symbol id="i-database" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="6" rx="7.5" ry="3"/>
    <path d="M4.5 6v12c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3V6"/>
    <path d="M4.5 10c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3"/>
    <path d="M4.5 14c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3"/>
  </symbol>
</defs>

<use href="#i-database" x="248" y="180" width="24" height="24" color="#3a414a"/>
```

`x`, `y`, `width` and `height` on the `<use>` place and size the icon. Keep `width` equal to `height` so nothing squashes.

Colour comes from `currentColor`, so set `color` on the `<use>` or on any ancestor `<g>`. Setting `fill` does nothing, because these are stroke drawings. Use the ink the rest of the figure uses, normally `#3a414a` for a component mark and `#000000` only when the icon is doing the same job as a box outline.

Size: 24 for an inline mark beside a label, 32 or 40 when the icon is the component itself and carries a caption underneath. Below 20 the denser members (`i-accelerator`, `i-subnet`, `i-worker`) start to fill in, so pick a plainer icon when you need that size.

An icon never replaces the label. It sits beside the name of the thing and speeds up scanning; a figure whose components are icons alone forces the reader to decode pictograms.

`icons-sheet.png` renders the whole set at 40px with ids underneath. Look at it before choosing.

## Compute

| id | depicts | use it to mean |
|---|---|---|
| `i-accelerator` | a pinned chip marked with a bolt | any non-CPU accelerator, NPU, TPU, FPGA, inference card |
| `i-container` | a ribbed shipping container | one container or image |
| `i-container-group` | three ribbed containers | a pod, a replica set, a group of containers scheduled together |
| `i-cpu` | a pinned chip with a single core | a processor, CPU allocation, host compute |
| `i-function` | a hexagon holding a bolt | a serverless function, a short-lived invocation |
| `i-gpu` | an expansion card with a fan and vents | a GPU or any physical accelerator card |
| `i-node` | a ringed dot | a generic member of a cluster or graph, when nothing more specific fits |
| `i-server` | two stacked rack units with status lamps | a physical or virtual host |
| `i-server-rack` | a three-tier cabinet | a rack, a chassis, physical capacity as a unit |
| `i-vm` | a machine drawn inside a machine | a virtual machine, a guest, a hypervisor tenant |
| `i-worker` | a box with a cog turning inside it | a worker process, an agent, a job runner |

## Storage

| id | depicts | use it to mean |
|---|---|---|
| `i-backup` | a lidded archive box | a backup target, a restore point, cold retention |
| `i-cache` | a store with speed lines running into it | a cache tier, a hot store in front of a slow one |
| `i-database` | a banded cylinder | a relational or document database |
| `i-disk` | a platter with a head arm | spinning disk, physical storage media, disk IO |
| `i-file-share` | a folder holding shared files | a shared filesystem, NFS, a mounted folder |
| `i-memory` | a memory module with contacts | RAM, memory allocation, an in-memory working set |
| `i-object-store` | a tapered bucket | object storage, a bucket, blob storage |
| `i-snapshot` | a duplicate taken off a stored volume | a point-in-time copy |
| `i-ssd` | a solid-state module with a flash chip | flash storage, an NVMe device, a fast local disk |
| `i-volume` | a cylinder lying on its side | a block volume, an attached disk, a persistent claim |

## Network

| id | depicts | use it to mean |
|---|---|---|
| `i-cdn-edge` | a node radiating to clients on both sides | an edge location, a point of presence, cached delivery near the user |
| `i-cloud` | a plain cloud outline | the public internet, or an external network you do not control |
| `i-dns` | a signpost | name resolution, service discovery |
| `i-firewall` | a brick wall | a firewall, a security group, packet filtering |
| `i-gateway` | a controlled opening between two walls | an API gateway, an ingress, the one sanctioned way in |
| `i-load-balancer` | one entry point fanning out to three backends | load balancing, traffic distribution across replicas |
| `i-network-port` | a keyed network jack with pins | a physical port, a NIC, a listening port |
| `i-proxy` | a relay a request passes through | a forward or reverse proxy, a sidecar, a relay |
| `i-router` | a device forwarding on all four sides | layer 3 routing, a routing decision |
| `i-subnet` | hosts sharing one bounded segment | a subnet, a VLAN, a network segment |
| `i-switch` | a box moving traffic both ways across ports | layer 2 switching, a fabric |
| `i-vpn-tunnel` | a tunnel mouth | an encrypted tunnel, a private link between two networks |

## Data and messaging

| id | depicts | use it to mean |
|---|---|---|
| `i-batch-job` | a stack of units with a run marker | a batch job, offline processing over a fixed set |
| `i-documents` | a written page with a folded corner, a second page behind it | a dataset, a corpus, a document collection |
| `i-event` | a lightning bolt | a single event, a trigger, an interrupt |
| `i-pipeline` | stages chained left to right | a processing pipeline, a DAG stage chain |
| `i-queue` | queued items draining out one end | a work queue, a buffer, backpressure |
| `i-scheduler` | a calendar with booked slots | a scheduler, cron, planned placement |
| `i-stream` | staggered parallel arrows | a continuous stream, a topic, a log of ongoing records |
| `i-sync` | two arrows chasing round a circle | replication, reconciliation, a retry loop |

## Security and identity

| id | depicts | use it to mean |
|---|---|---|
| `i-certificate` | a page with an award ribbon | a TLS certificate, a signed artefact, an attestation |
| `i-key` | a toothed key | a cryptographic key, a secret, a credential |
| `i-lock` | a closed padlock | encryption, a protected resource, restricted access |
| `i-role` | an identity card | a role, a service account, an assigned permission set |
| `i-shield` | a plain shield | a security control in general, a protected zone |
| `i-token` | a ticket with a tear-off stub | a bearer token, a session, a short-lived credential |
| `i-user` | one person | one end user, one caller, one human actor |
| `i-user-group` | two people, one behind the other | a group of users, a team, a tenant's population |

## Observability and state

| id | depicts | use it to mean |
|---|---|---|
| `i-alert` | a bell | a fired alert, a notification, paging |
| `i-clock` | a clock face | latency, a timeout, elapsed time |
| `i-failure` | a cross in a circle | a failed step, an unhealthy component |
| `i-health-check` | a pulse trace | a health probe, a liveness or readiness check |
| `i-log-lines` | bulleted lines of ragged length | logs, an audit trail, emitted records |
| `i-metric-chart` | a line rising on two axes | a metric, a time series, measured throughput |
| `i-success` | a tick in a circle | a passing step, a healthy component |
| `i-warning` | an exclamation in a triangle | a hazard, a degraded state, a caveat worth reading |

## Structure

| id | depicts | use it to mean |
|---|---|---|
| `i-availability-zone` | a dashed enclosure holding two racks | an availability zone, one failure domain inside a region |
| `i-boundary` | an empty dashed enclosure | a scope marker, a trust boundary, the edge of what is being discussed |
| `i-cluster` | a hub wired to four members | a cluster, a control plane with its members |
| `i-gear` | a toothed cog | configuration, a control loop, an operator |
| `i-region` | a globe | a geographic region, a global footprint |
| `i-tenant` | a bounded space with one occupant | one tenant and the resources isolated to it |

## Conventions inside the set

Dashed outlines appear on `i-availability-zone` and `i-boundary` only, where the dash means the enclosure is logical and has no hardware. Keep it that way; a dashed icon anywhere else breaks the read.

The lightning bolt appears on `i-event`, `i-function` and `i-accelerator`. It means the same thing each time: something happens fast or on demand.

`i-shield`, `i-lock` and `i-firewall` all say security. Pick by scope. `i-firewall` is a network control, `i-lock` is a property of one resource, `i-shield` is the general case when neither is specific enough.

`i-success`, `i-failure` and `i-warning` are the only members with an implied colour. Tint them only with the encoding the diagram already has, and check the colour budget in `tokens.md` first. Green and red added for their own sake spend the budget on nothing.

## Adding an icon on demand

The set is hand-authored and deliberately finite. It will not have the icon you want eventually, and that is expected: add one rather than substituting something that nearly fits or importing a foreign glyph.

**Step 1: check that you need an icon at all.** Does an existing symbol already say it, under a different name? Can the shape vocabulary in `tokens.md` carry it instead, so a cylinder means storage and a stadium means external without any glyph? Would the box's label alone do the job? The reference corpus answers yes to one of those almost every time. Only continue if the icon earns its place.

**Step 2: settle what the pictogram should look like.** You may browse existing icon sets to learn the convention for a concept, and it is worth doing, because a firewall that does not look like the firewall everyone else draws will not read. Iconify aggregates a couple of hundred sets in one searchable place and is the fastest way to see how ten designers each solved the same concept. Tabler, Lucide and Iconoir are the closest in spirit to this set: 24 grid, single stroke weight, round caps.

**Do not copy geometry from any of them.** Look, understand the convention, close the tab, draw it yourself. Every icon here is original work and the Provenance note below says so, which stays true only if it stays true. This is not merely a licence formality: a pasted icon will not match the house stroke weight and optical size anyway, so it would need redrawing regardless.

Licences differ if you were ever tempted: Tabler, Lucide, Iconoir, Heroicons and Bootstrap Icons are MIT, Material Symbols and IBM Carbon are Apache 2.0, and **Font Awesome Free is CC BY 4.0**, which carries an attribution obligation across every file it appears in. Iconify is an aggregator, so its contents carry whatever their upstream set carries, and a permissive licence on icon *code* never grants rights to a *trademark* the icon depicts.

**Step 3: draw it in the family.** Same 24x24 grid with about one unit of padding, `stroke-width="1.75"` with round caps and joins, `currentColor` on every stroke, solid fill reserved for marks under about 3 units across, two to four interior marks, no shading and no gradients. Aim for the same visual density as its neighbours, since a busier icon reads as more important and will pull the eye in a diagram where it should not.

**Step 4: prove it holds.** Add the symbol to `icons.svg` in alphabetical order, add a row to the table above naming what it depicts and what it should mean, regenerate `icons-sheet.png`, and look at the whole sheet. If the new icon draws the eye first, it is too heavy. Render it alone at 24px too, since detail that survives at 40 can fill in at 24.

**Step 5: keep the two files honest.** The doc and the sprite must agree exactly, one row per symbol. A symbol nobody can find in the index may as well not exist.

## Provenance

Every icon in this set is original work drawn for this repo. None is copied, traced, or otherwise derived from a third-party icon set, a stock library, or any diagramming tool's export, so no member carries an upstream licence, an attribution requirement, or any other third-party encumbrance. Keep it that way. A new member is drawn here, and anything that comes from outside falls under the next section.

## Vendor and product icons

This library is deliberately generic. It contains no company logo, product mark, or cloud-provider service icon, and none should be added: those carry trademark and redistribution terms, and `.claude/` is not git-crypt encrypted, so anything committed here is public on GitHub.

Most diagrams do not need them. The reference corpus draws storage as a cylinder and a managed queue as a plain box, and reserves real vendor art for the handful of figures whose subject genuinely is a named third-party product. Reach for a generic icon first.

When a figure genuinely calls for vendor art, the model is the standard cloud and hybrid network architecture diagram: official provider service icons sitting on the boxes they name, a provider's own icon set used consistently across the whole figure rather than mixed with hand-drawn substitutes, and everything else in the diagram staying in the house style around them.

How to use them:

- Fetch the official set from the vendor at authoring time. AWS publishes Architecture Icons, Azure and Google Cloud publish equivalent sets, and the CNCF projects publish their own marks. Use the vendor's current release, not a copy scraped from an existing diagram.
- Read the vendor's terms before using the art. They typically permit use in architecture diagrams while forbidding modification, recolouring, and any implication of endorsement or partnership. Do not restyle a vendor icon to match the house palette: use it as shipped or do not use it.
- Place the fetched file under the presentation's own `images/figures/` as a normal opaque `fNN` asset, which is inside the encrypted tree, and record what it is in that folder's `INDEX.md`. Do not add it to this library or anywhere else under `.claude/`.
- Follow the corpus convention for placement: a logo or service icon hangs outside or on top of the box it qualifies, at 28 to 43 units, never inside it and never as the box's own fill.
- One provider's icon set per figure. Mixing two vendors' visual languages, or mixing vendor icons with the generic set for the same class of thing, reads as inconsistency rather than as information.

If a figure would need vendor art only for decoration, leave it out and use the generic icon.
