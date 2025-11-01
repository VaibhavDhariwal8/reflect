# Reflect: AI-Powered Personalized Newsletter Service

Reflect is a smart newsletter service that delivers personalized news summaries directly to your inbox. Users can select topics of interest and a preferred delivery schedule, and our AI-powered backend, built with Next.js and Google Gemini, curates and summarizes the latest news, sending it as a beautifully formatted email.

**This project was developed as part of my 3rd-year B.Tech in Computer Science and Engineering curriculum, showcasing a modern, full-stack application architecture.**

[//]: # (TODO: Add a screenshot or GIF of the application dashboard here)
![Reflect Dashboard](https://user-images.githubusercontent.com/your-username/your-repo/assets/placeholder.png)

---

## ✨ Key Features

-   **Secure Authentication**: Simple and secure user sign-up and login using Kinde.
-   **Personalized Dashboard**: Users can manage their newsletter topics (e.g., Technology, Business, Science) and delivery frequency.
-   **AI-Powered Content**: Leverages the Google Gemini API to generate concise, human-like summaries of news articles.
-   **Dynamic News Sourcing**: Fetches the latest articles from various sources using the News API.
-   **Reliable Background Jobs**: Uses Inngest for robust, scheduled newsletter generation and delivery, ensuring no user is missed.
-   **Email Delivery**: Sends newsletters via Resend, with custom HTML email templates.
-   **Responsive Design**: Built with Tailwind CSS and shadcn/ui for a clean, modern UI on all devices.

---

## 🏗️ Tech Stack & Architecture

This project is a full-stack Next.js application that demonstrates a sophisticated, event-driven architecture.

| Category          | Technology                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Framework**     | [Next.js](https://nextjs.org/) (React)                                                                 |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)                           |
| **Database**      | [Prisma](https://www.prisma.io/) (ORM) with PostgreSQL                                                 |
| **Authentication**| [Kinde](https://kinde.com/)                                                                            |
| **Background Jobs**| [Inngest](https://www.inngest.com/) (for cron scheduling and event-driven functions)                   |
| **AI Model**      | [Google Gemini](https://ai.google.dev/)                                                                |
| **Email Service** | [Resend](https://resend.com/)                                                                          |
| **News Source**   | [NewsAPI.org](https://newsapi.org/)                                                                    |

### How It Works

1.  **Scheduling**: A cron job, managed by Inngest ([`src/inngest/scheduler.ts`](src/inngest/scheduler.ts)), runs every 10 minutes to find users whose newsletters are due.
2.  **Queueing**: The scheduler locks the user's preference to prevent duplicate sends and enqueues a `scheduled.newsletter` event for each user.
3.  **Content Generation**: The `ReflectNewsletter` function ([`src/inngest/news.ts`](src/inngest/news.ts)) is triggered by the event. It:
    -   Fetches news articles from NewsAPI based on the user's topics.
    -   Uses the Google Gemini API to summarize the articles into a newsletter body.
4.  **Email Delivery**: The function then builds a custom HTML email ([`src/lib/newsletter_html.ts`](src/lib/newsletter_html.ts)) and sends it to the user via the Resend API.
5.  **Updating State**: Finally, it calculates and updates the `nextSendAt` timestamp in the database for the user's next scheduled newsletter.

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm
-   A PostgreSQL database

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/reflect.git
cd reflect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of the project by copying the example file:

```bash
cp .env .env.local
```

Now, fill in the required API keys and URLs in `.env.local`. You will need to get credentials from:
-   [Kinde](https://kinde.com/)
-   [NewsAPI.org](https://newsapi.org/)
-   [Google AI Studio (for Gemini)](https://ai.google.dev/)
-   [Resend](https://resend.com/)
-   Your PostgreSQL connection string (`DATABASE_URL`)

### 4. Set Up the Database

Run the Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📄 API Endpoints

The application exposes a few key API endpoints:

-   `POST /api/invoke`: Manually triggers a newsletter generation for the currently logged-in user.
-   `GET, POST, PUT /api/inngest`: The webhook endpoint for Inngest to communicate with the application and run background functions.
-   `GET, POST /api/preferences`: Handles fetching and updating user preferences from the dashboard.

---

## 🔮 Future Improvements

-   **More AI Models**: Integrate other models like Anthropic Claude or OpenAI GPT-4.
-   **Template Customization**: Allow users to choose from different email templates.
-   **Analytics**: Track email open rates and link clicks.
-   **Testing**: Add unit and integration tests for critical functions.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

-   [Vercel](https://vercel.com/) for Next.js
-   [Tailwind CSS](https://tailwindcss.com/) for styling
-   [Prisma](https://www.prisma.io/) for database access
-   [Kinde](https://kinde.com/) for authentication
-   [Inngest](https://www.inngest.com/) for background job processing
-   [Google Gemini](https://ai.google.dev/) for AI-powered content generation
-   [Resend](https://resend.com/) for email delivery
-   [NewsAPI.org](https://newsapi.org/) for news sourcing
