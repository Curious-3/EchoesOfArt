# EchoesOfArt

<div align="center">

EchoesOfArt is a creative social platform for artists, writers, and readers to share work, discover new creators, follow favorite profiles, save posts, and collaborate through comments, replies, likes, and bookmarks.

</div>

---

<div align="center">

![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-1E1E1E?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-004D40?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Socket.io Client](https://img.shields.io/badge/Socket.io%20Client-212121?style=for-the-badge&logo=socketdotio&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-311B92?style=for-the-badge&logo=axios&logoColor=white)
![Quill](https://img.shields.io/badge/Quill-1E1E1E?style=for-the-badge)
![Chart.js](https://img.shields.io/badge/Chart.js-B71C1C?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-1B5E20?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-1B5E20?style=for-the-badge&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-311B92?style=for-the-badge&logo=cloudinary&logoColor=white)

</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)


---

## Features

- **Authentication** - Register, log in, verify email with OTP, and manage your profile securely.
- **Creator Profiles** - Follow and unfollow creators, view their profile, and explore their published work.
- **Writing Platform** - Create, edit, publish, save,  like, report, and delete writings.
- **Community Interaction** - Comment on posts, reply to comments, react to discussions, and keep conversations active.
- **Content Discovery** - Explore posts, browse similar content, and view personalized feeds.
- **Saved and Liked Content** - Keep track of posts and writings you want to revisit later.
- **Media Uploads** - Upload post attachments and profile images with backend file handling and cloud storage support.
- **AI Assistance** - Generate tags for writings with AI-assisted tagging.
- **Analytics** - Track post likes over time with chart-based visualizations.
- **Responsive UI** - Built for a clean reading and browsing experience on desktop and mobile.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Fast frontend tooling and development server |
| **Tailwind CSS** | Utility-first styling |
| **React Router DOM** | Client-side routing |
| **Socket.io Client** | Real-time updates |
| **Axios** | API communication |
| **Quill / React-Quill** | Rich text writing editor |
| **Chart.js / react-chartjs-2** | Analytics charts |
| **Framer Motion** | Motion and UI transitions |
| **Lucide React / React Icons** | Icon sets |
| **react-hot-toast / react-toastify** | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB + Mongoose** | Database  |
| **Socket.io** | Real-time communication |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File upload middleware |
| **Cloudinary** | Cloud file storage |
| **Nodemailer** | Email and OTP delivery |
| **dotenv** | Environment configuration |

---

## Folder Structure

```text
EchoesOfArt/
├── Backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── postController.js
│   │   ├── userController.js
│   │   └── writingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── loggerMiddleware.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Liked.js
│   │   ├── Post.js
│   │   ├── Saved.js
│   │   ├── User.js
│   │   └── Writing.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── liked.js
│   │   ├── postRoutes.js
│   │   ├── savedRoutes.js
│   │   └── writingRoutes.js
│   ├── socket/
│   │   └── commentSocket.js
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── socket.js
│   │   └── utils/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── assets/
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/) local instance or Atlas connection
- [Cloudinary](https://cloudinary.com/) account for media uploads
- SMTP or email service credentials for OTP delivery

### Installation

1. Clone the repository.

	```bash
	git clone https://github.com/ultimatrix2/CampusConnect.git
	cd EchoesOfArt
	```

2. Install backend dependencies.

	```bash
	cd Backend
	npm install
	```

3. Install frontend dependencies.

	```bash
	cd ../frontend
	npm install
	```

4. Add the environment variables listed below to a `.env` file inside `Backend/`.

5. Start the backend server.

	```bash
	cd Backend
	npm run dev
	```

6. Start the frontend app in a second terminal.

	```bash
	cd frontend
	npm run dev
	```

---

## Environment Variables

Create a `.env` file in `Backend/` with values like these:

| Variable | Description |
|---|---|
| `PORT` | Backend port, usually `5001` |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | Email account used for OTP delivery |
| `EMAIL_PASS` | Email account password or app password |

---
![Landing](./screenshots/landing.png)
## Screenshots

| Home | Upload Artwork |
|------|----------------|
| ![Landing](./screenshots/landing.png) | ![Upload](screenshots/upload.png) |

| Creator Profile | Explore Gallery |
|-----------------|-----------------|
| ![Profile](screenshots/profile.png) | ![](screenshots/explore.png) |

| Writing Editor | Comments |
|----------------|----------|
| ![](screenshots/writing.png) | ![](screenshots/comments.png) |

| Saved Posts |
|-------------|
| ![](screenshots/saved.png) |


