# Iftar Countdown App

A beautiful Next.js application that displays a countdown timer to Iftar (the time to break fast during Ramadan) based on the user's location. The app automatically detects the user's location using their IP address and calculates the Iftar time for their specific location.

## Features

- 🌙 Automatic location detection based on IP address
- ⏱️ Real-time countdown to Iftar (Maghrib prayer time)
- 🌃 Beautiful dark mode UI with animated elements
- 🌐 Works worldwide with accurate prayer times
- 📱 Fully responsive design for all devices

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS for styling
- Luxon for date/time handling
- Axios for API requests
- IP Geolocation API (ipinfo.io)
- Prayer Times API (aladhan.com)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/iftar-countdown.git
   cd iftar-countdown
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How It Works

1. The app uses the user's IP address to determine their geographical location (city, country, latitude, longitude).
2. It then uses the latitude and longitude to fetch accurate prayer times from the Aladhan API.
3. The Maghrib prayer time is used as the Iftar time.
4. A countdown timer displays the remaining time until Iftar.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Aladhan API](https://aladhan.com/prayer-times-api) for providing prayer times data
- [ipinfo.io](https://ipinfo.io/) for IP geolocation services
