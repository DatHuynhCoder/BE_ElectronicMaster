import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';

//import admin routes
import electronicRouter from './routes/admin/electronic.route.js';
import manageOrderRouter from './routes/admin/manageOrder.route.js';
//import customer routes
import manageAccountRouter from './routes/customer/manageAccount.route.js';
import commentRouter from './routes/customer/comment.route.js';
import orderRouter from './routes/customer/order.route.js';
import favoriteRouter from './routes/customer/favorite.route.js';
//import user routes
import accountActionRouter from './routes/user/accountAction.route.js';
import displayDataRouter from './routes/user/displayData.route.js';


dotenv.config(); // You can access .env vars globally

const app = express();

//Add middleware
app.use(express.json()); //parse json
app.use(express.urlencoded({extended: true})) //allow to handle url encoded data (form data)

//server PORT
const PORT = process.env.PORT;

//ADMIN API
app.use('/admin/electronic', electronicRouter)
app.use('/admin/manageOrder', manageOrderRouter);
//CUSTOMER API
app.use('/customer/manageAccount', manageAccountRouter);
app.use('/customer/comment', commentRouter);
app.use('/customer/order', orderRouter);
app.use('/customer/favorite', favoriteRouter);
//USER API
app.use('/user/accountAction', accountActionRouter);
app.use('/user/displayData', displayDataRouter)

//Start server
app.listen(PORT, () => {
  //connect to database
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
})
