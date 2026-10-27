# Antigravity Build Prompt: EcoTrack --- Digital Waste Management System

Act as a senior full-stack engineer, UI/UX designer, and IoT systems
architect. Build a complete, polished, functional college project called
**EcoTrack --- Digital Waste Management System**.

## Project objective

Build a smart waste management web application that improves waste
collection efficiency through IoT-inspired bin monitoring, sensor-based
fill-level alerts, collection scheduling, worker assignment, route
management, and analytics.

The reference image shows the title "Digital Waste Management System"
and the concept of improving waste collection efficiency using IoT,
sensors, embedded systems, programming, and networking. Turn this
concept into a professional smart-city management platform, not a basic
static college-project website.

## Phase 1 --- Inspect the project

1.  Inspect the current workspace, project files, framework, package
    manager, existing architecture, and available dependencies.
2.  If a project already exists, preserve its working features and build
    on its existing stack. Do not replace configuration files or rewrite
    the project unnecessarily.
3.  If the workspace is empty, use React + TypeScript + Vite and
    Tailwind CSS. Use a suitable icon library, a chart library, and a
    map library if compatible.
4.  Before implementation, briefly outline the architecture and then
    proceed with implementation. Do not stop after producing a plan.
5.  Run the application, check for errors, and fix issues before
    finishing.

## Design direction

Create a premium, modern smart-city SaaS dashboard.

-   Product name: **EcoTrack**
-   Subtitle: **Digital Waste Management System**
-   Use forest green as the primary brand color, white surfaces, soft
    neutral backgrounds, and amber/red for warnings.
-   Use clean typography, preferably Inter.
-   Use a consistent spacing scale, subtle borders, restrained shadows,
    rounded cards, and polished icons.
-   Create a responsive application shell with a collapsible left
    sidebar, top header, page title, breadcrumbs where appropriate,
    notifications, and a profile menu.
-   Use clear visual hierarchy, realistic data density, well-designed
    tables, charts, filters, badges, and status indicators.
-   Avoid excessive gradients, oversized headings, emoji-based icons,
    clutter, and generic template styling.
-   Support desktop, tablet, and mobile screen sizes.
-   Include working light/dark mode if practical.
-   Every interactive control must perform a meaningful action. Do not
    leave placeholder buttons or dead navigation links.

## Application navigation

Create the following pages:

1.  Overview
2.  Smart Bins
3.  Collection Requests
4.  Collection Routes
5.  Workers & Vehicles
6.  Reports & Analytics
7.  Notifications
8.  Settings

## Page 1 --- Overview dashboard

Create a high-quality operational dashboard containing:

-   Total registered smart bins.
-   Bins requiring collection.
-   Critical and offline bins.
-   Pending collection requests.
-   Collections completed today.
-   Collection completion rate.
-   A waste collection activity chart with selectable date ranges.
-   Waste composition chart for organic, recyclable, general, and
    hazardous waste.
-   A bin fill-level distribution chart.
-   Recent collection activity.
-   Critical alerts requiring immediate attention.
-   Upcoming scheduled pickups.
-   A zone-level operational summary.
-   Quick actions for adding a bin, creating a collection request, and
    viewing alerts.

Use coherent demo data and calculate dashboard statistics from the
underlying data rather than hardcoding every KPI independently.

## Page 2 --- Smart bin management

Build a complete bin management module. Each bin should have:

-   Unique bin ID.
-   Bin name.
-   Waste category.
-   Zone and address.
-   Latitude and longitude where applicable.
-   Fill level from 0 to 100%.
-   Sensor connectivity status.
-   Last sensor update.
-   Battery level if relevant.
-   Assigned collection priority.
-   Last collection date.
-   Current operational status.

Features:

-   Search by bin ID, name, or location.
-   Filter by waste category, zone, fill level, and connectivity.
-   Sort table columns.
-   Display fill level with accessible progress bars.
-   Color-code critical fill levels.
-   Open a bin details drawer or page.
-   Add, edit, and delete bins with validation and confirmation.
-   Display a bin's recent sensor readings.
-   Show a useful empty state when filters return no results.
-   Export the filtered bin list to CSV.

Define sensible configurable thresholds, for example:

-   Below 50%: Normal
-   50--79%: Moderate
-   80--94%: High
-   95--100%: Critical

Generate a collection recommendation when a bin reaches the configured
threshold. Avoid generating duplicate active requests for the same bin.

## Page 3 --- Collection requests

Implement an end-to-end waste collection workflow. A request must
contain:

-   Request ID.
-   Bin or pickup location.
-   Waste category.
-   Priority.
-   Creation date.
-   Scheduled pickup time.
-   Assigned worker.
-   Assigned vehicle.
-   Current status.
-   Optional notes.

Statuses:

-   Pending
-   Assigned
-   In Progress
-   Completed
-   Cancelled

Features:

-   Create a collection request through a validated form.
-   View request details.
-   Assign or reassign a worker and vehicle.
-   Update the collection status.
-   Filter and search requests.
-   Sort by priority, creation date, and scheduled pickup.
-   Display overdue requests.
-   Confirm cancellation.
-   Maintain a simple activity timeline.
-   Show confirmation feedback after successful actions.
-   Update dashboard counts when request data changes.

Do not allow completed or cancelled requests to be accidentally reopened
without an explicit action.

## Page 4 --- Collection routes

Create a route planning and monitoring page.

-   Show pickup locations on an interactive map if a map library is
    available.
-   Provide a list of assigned stops alongside the map.
-   Display route name, assigned vehicle, driver, number of stops,
    progress, and route status.
-   Allow creation and editing of a collection route.
-   Allow adding or removing collection stops.
-   Allow the user to mark stops as completed.
-   Show estimated distance and duration only when they can be
    calculated from a real routing service or a clearly labeled
    approximation.
-   If map tiles or external routing APIs require credentials, provide a
    graceful fallback with a location list and schematic route
    visualization.
-   Never pretend GPS tracking or live vehicle positions exist when they
    are only simulated.

## Page 5 --- Workers & vehicles

Build worker and fleet management.

### Worker fields

-   Worker ID.
-   Full name.
-   Contact details using fictional demo information.
-   Assigned zone.
-   Availability.
-   Assigned route.
-   Completed collections.

### Vehicle fields

-   Vehicle ID or registration identifier.
-   Vehicle type.
-   Capacity.
-   Assigned worker.
-   Current status.
-   Assigned route.

Features:

-   Add and edit workers.
-   Add and edit vehicles.
-   Assign and unassign resources.
-   Filter by status and zone.
-   Prevent assigning an unavailable worker or vehicle to a new active
    route.
-   Use confirmation dialogs for destructive actions.
-   Include useful fictional sample data.

## Page 6 --- Reports & analytics

Create an analytics page with:

-   Daily, weekly, and monthly collection totals.
-   Collection completion trends.
-   Waste category distribution.
-   Bin fill-level distribution.
-   Collections by zone.
-   Average response time, when supported by timestamps.
-   Missed and overdue pickups.
-   Recycling and waste diversion indicators, clearly labeled as
    estimates if simulated.
-   Date-range and zone filters.
-   CSV export for relevant reports.

Charts must be responsive, readable, and derived from the application's
data. Display units, legends, and meaningful empty states. Do not invent
historical records and present them as actual operational data.

## Page 7 --- Notifications & alerts

Provide an alert center for:

-   Critical bin fill levels.
-   Offline sensors.
-   Low battery warnings.
-   Overdue collections.
-   Unassigned requests.

Features:

-   Severity indicators.
-   Read/unread state.
-   Filter by alert type and severity.
-   Mark as read.
-   Link an alert to its relevant bin or request.
-   Dismiss alerts with confirmation where appropriate.
-   Generate alerts from application state instead of hardcoding all
    alerts separately.

## Page 8 --- Settings

Include:

-   Organization name and display preferences.
-   Collection threshold configuration.
-   Waste categories.
-   Zones and location settings.
-   Notification preferences.
-   Theme selection.
-   Data reset for demo purposes, with a confirmation dialog.

## Backend and data architecture

First inspect whether a backend and database already exist. Preserve
them where possible.

If no backend exists:

-   Build a clean frontend using TypeScript and React.
-   Separate components, page views, domain types, business logic, and
    data-access logic.
-   Seed the application with realistic but fictional demo data.
-   Use localStorage or an existing lightweight persistence solution for
    a working demonstration.
-   Ensure user-created bins, requests, assignments, and status updates
    persist across page refreshes.
-   Keep data-access functions separate so a real REST API and database
    can replace local persistence later.
-   Include loading, success, error, and empty states.
-   Handle invalid or missing persisted data safely.
-   Do not claim that local demo storage is a secure production
    database.

If a backend already exists, integrate with its actual APIs and data
model. Do not silently replace real APIs with mock data.

## IoT and sensor simulation

This project demonstrates IoT concepts, but physical sensors may not be
available.

Create a modular sensor service that supports:

-   Simulated ultrasonic fill-level measurements.
-   Sensor online/offline status.
-   Simulated battery readings.
-   Last-seen timestamps.
-   Configurable update intervals.
-   Threshold-based alerts.
-   A sensor history view.
-   A clear **Simulation Mode** indicator.

Keep simulated sensor generation separate from real sensor integration.
Do not randomly overwrite a user's manual changes or create uncontrolled
timers. Clean up intervals when components unmount.

Document how a real ESP32 or Arduino with an ultrasonic distance sensor
could eventually send measurements to an API over Wi-Fi using HTTP or
MQTT. Explain that sensor readings must be calibrated against actual bin
dimensions. Do not require physical hardware for the demo.

## Authentication and roles

If feasible within the existing architecture, implement a simple demo
sign-in and role-aware navigation:

-   **Administrator:** manage the whole system.
-   **Collection Manager:** manage requests, routes, workers, and bins.
-   **Collection Worker:** view assigned work and update pickup
    statuses.

If authentication is only simulated, label it as a demo and do not claim
it provides production security. Do not store plaintext real passwords
or expose secrets in frontend code.

## Reusable components

Create reusable components for:

-   Sidebar and header.
-   KPI/statistic cards.
-   Data tables.
-   Search and filter controls.
-   Status badges.
-   Fill-level indicators.
-   Charts.
-   Forms and validation.
-   Dialogs and drawers.
-   Notifications and toast feedback.
-   Loading skeletons.
-   Empty states.
-   Pagination if necessary.

## Functional quality

-   All navigation items must open the correct pages.
-   Search and filters must operate on actual application state.
-   Forms must validate required fields and reasonable input ranges.
-   Mutations must update dependent tables, dashboard statistics, and
    alerts.
-   Use unique, stable IDs.
-   Use consistent date and number formatting.
-   Handle unavailable maps, missing data, and persistence errors
    gracefully.
-   Ensure the UI remains usable with keyboard navigation.
-   Add accessible labels and appropriate contrast.
-   Avoid unnecessary dependencies and duplicate implementations.

## Testing and final validation

1.  Install dependencies using the existing package manager.
2.  Run linting and type checking where available.
3.  Run the production build.
4.  Fix all build errors and significant console errors.
5.  Test adding a bin.
6.  Test creating and assigning a collection request.
7.  Test updating a request to Completed.
8.  Verify dashboard KPIs update accordingly.
9.  Verify data persists after refresh.
10. Test navigation, filters, and responsive layouts.
11. Check that all visible buttons work.
12. Add focused tests for critical business logic if the project
    supports testing.

## Deliverables

-   Fully implemented application in the current workspace.
-   A consistent, polished, responsive UI.
-   Working demo data and persistence.
-   IoT simulation and collection workflow.
-   README with project overview, features, architecture, prerequisites,
    installation commands, environment configuration, and run
    instructions.
-   A clear explanation of what works locally, what is simulated, and
    what requires external services or physical hardware.
-   A short list of future enhancements, including real sensor
    integration and production database/API deployment.

## Implementation rules

-   Do not only return sample code or a design description. Implement
    the project in the workspace.
-   Do not stop at the dashboard or leave secondary pages as empty
    placeholders.
-   Do not rewrite unrelated files.
-   Do not hardcode success messages for operations that fail.
-   Do not fabricate live GPS, sensor, or cloud data.
-   Prefer a working, maintainable project over excessive abstraction.
-   Make reasonable engineering decisions without asking unnecessary
    questions.
-   At the end, report the files changed, commands to run the app,
    tests/build results, demo credentials if applicable, and any
    remaining limitations.

**Start by inspecting the workspace, then implement and verify the
complete application.**
