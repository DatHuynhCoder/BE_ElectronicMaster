import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import cors from 'cors';

//import admin routes
import electronicRouter from './routes/admin/electronic.route.js';
import manageOrderRouter from './routes/admin/manageOrder.route.js';
import manageUserRouter from './routes/admin/manageUser.route.js';
import dashboardRouter from './routes/admin/dashboard.route.js';
//import customer routes
import manageAccountRouter from './routes/customer/manageAccount.route.js';
import commentRouter from './routes/customer/comment.route.js';
import orderRouter from './routes/customer/order.route.js';
import favoriteRouter from './routes/customer/favorite.route.js';
//import user routes
import accountActionRouter from './routes/user/accountAction.route.js';
import displayDataRouter from './routes/user/displayData.route.js';
import chatbotRouter from './routes/user/chatbot.route.js';

dotenv.config(); // You can access .env vars globally

//Initialize the express app
const app = express();

//Connect to database
connectDB();

//Add middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); //parse json
app.use(express.urlencoded({ extended: true })) //allow to handle url encoded data (form data)

if (process.env.NODE_ENV !== 'development') {
  app.use((req, res, next) => {
    req.url = req.url.replace(/^\/[^\/]+/, '');
    next();
  });
}

//ADMIN API
app.use('/admin/electronic', electronicRouter)
app.use('/admin/manageOrder', manageOrderRouter);
app.use('/admin/manageUser', manageUserRouter);
app.use('/admin/dashboard', dashboardRouter);
//CUSTOMER API
app.use('/customer/manageAccount', manageAccountRouter);
app.use('/customer/comment', commentRouter);
app.use('/customer/order', orderRouter);
app.use('/customer/favorite', favoriteRouter);
//USER API
app.use('/user/accountAction', accountActionRouter);
app.use('/user/displayData', displayDataRouter);
app.use('/user/chatbot', chatbotRouter);

//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});

//Mainpage
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Electronic Master Server</h1>");
});

//Export the express app for vercel (no longer needed)
export default app;
