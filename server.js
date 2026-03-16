import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Realtime Chat App API Running...");
});

const PORT = process.env.PORT || 3000;

/* HTTP SERVER */
const httpServer = createServer(app);

/* SOCKET SERVER */
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET","POST"]
  }
});

/* STORE CONNECTED USERS */
const users = {};

/* SOCKET CONNECTION */
io.on("connection", (socket) => {

  console.log(`User Connected : ${socket.id}`);

  /* REGISTER USER */
  socket.on("register_user", (userId) => {

    users[userId] = socket.id;

    console.log("Connected Users:");
    console.log(users);

  });

  /* SEND MESSAGE */
  socket.on("send_message", async (data) => {

    try {

      const { sender, receiver, message } = data;

      const newMessage = await Message.create({
        sender,
        receiver,
        message
      });

      const receiverSocket = users[receiver];

      /* SEND ONLY TO RECEIVER */
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", newMessage);
      }

    } catch (error) {

      console.log("Message Error:", error.message);

    }

  });

  /* DISCONNECT USER */
  socket.on("disconnect", () => {

    console.log(`User Disconnected : ${socket.id}`);

    for (const userId in users) {

      if (users[userId] === socket.id) {
        delete users[userId];
      }

    }

    console.log("Updated Users:");
    console.log(users);

  });

});

/* START SERVER */
httpServer.listen(PORT, () => {
  console.log(`Express Server Running in the PORT ${PORT}`);
});