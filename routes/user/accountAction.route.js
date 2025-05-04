import express from 'express';
import { changepassbyOTP, createAccount, Login, sendOTP, verifyOTP } from '../../controllers/user/accountAction.controller.js';

const accountActionRouter = express.Router();

//Create an account
accountActionRouter.post('/register', createAccount)

//Login
accountActionRouter.post('/login', Login);

//send OTP
accountActionRouter.post('/sendOTP', sendOTP)

//verify OTP
accountActionRouter.post('/verifyOTP', verifyOTP)

//change pass by OTP
accountActionRouter.post('/changepassbyOTP', changepassbyOTP)

//Dont need logout yet because accessToken handle on Android

export default accountActionRouter;