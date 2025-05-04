import { Account } from "../../models/account.model.js";
import jwt from 'jsonwebtoken'
import {OTP} from "../../models/otp.model.js";
import bcrypt from "bcrypt"
import sendMail from "../../utils/sendMail.js";

export const createAccount = async (req, res) => {
  try {
    //Get data from req.body
    const { username, email, birthday, phone, password } = req.body;

    //Check if account has email, username or phone exists
    const existedAccount = await Account.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existedAccount) {
      let duplicateFields = [];
      if (existedAccount.email === email) duplicateFields.push("email");
      if (existedAccount.username === username) duplicateFields.push("username");
      if (existedAccount.phone === phone) duplicateFields.push("phone");

      return res.status(400).json({
        success: false,
        message: `These fields already exist: ${duplicateFields.join(", ")}`
      });
    }

    //create Account
    const account = await Account.create({
      username,
      email,
      birthday,
      phone,
      password
    })

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error in create user", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const Login = async (req, res) => {
  try {
    //get email, passwrod
    const { email, password } = req.body;

    //find account
    const account = await Account.findOne({ email });

    // Check if account exist and match the password
    if (!account || !(await account.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    //Generate accessToken
    const accessToken = jwt.sign(
      {id: account._id, role: account.role},
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: "30d"}
    )

    res.status(200).json({success: true, data: account, accessToken})
  } catch (error) {
    console.error("Error in login", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const sendOTP = async (req, res) => {
  try {
    //Get email from req
    const { email } = req.body;

    //Check if account exist
    const accountCheck = await Account.findOne({ email: email });
    if (!accountCheck) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //Generate OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    //has OTP for security purpose
    const salt = 10;
    const hashOTP = await bcrypt.hash(otp, salt);

    //Create Otp document
    const Otp = new OTP({
      otp: hashOTP,
      email: email
    })

    //save Otp
    await Otp.save();

    //OTP HTML mail content
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Đây là mã <strong>OTP</strong>: <strong>${otp}</strong></p>

          <p>Mã OTP sẽ hết hạn sau <strong>15</strong> phút</p>

          <p style="margin-top: 20px;">Trân trọng,<br>Đội ngũ ElectronicMaster</p>
        </div>
      `;

    //Send email to user
    const emailContent = {
      to: email,
      subject: "Mã OTP quên mật khẩu từ ElectronicMaster",
      text: htmlContent
    };

    //send email to user
    const sendMailStatus = await sendMail(emailContent.to, emailContent.subject, emailContent.text);

    //Check if you succesfully sent OTP
    if (!sendMailStatus) {
      return res.status(500).json({ success: false, message: "Cannot send email" });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in send OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const verifyOTP = async (req, res) => {
  try {
    //Get email and otp
    const { email, otp } = req.body;

    //Check if OTP exist
    if (!otp) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Find Otp by email (latest)
    const otpfind = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

    //Check if otp exist in database
    if (!otpfind) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Check if otp expire
    if (otpfind.expiresAt < Date.now()) {
      //delete OTP record
      await OTP.deleteMany({ email: email })
      return res.status(404).json({ success: false, message: "OTP expire" });
    }

    //compare otp
    const isValid = await bcrypt.compare(otp, otpfind.otp);

    //Check if enter otp correct
    if (!isValid) {
      return res.status(404).json({ success: false, message: "Otp entered not correct!" });
    }

    res.status(200).json({ success: true, message: "OTP verify successfully" });
  } catch (error) {
    console.error("Error in verify OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const changepassbyOTP = async (req, res) => {
  try {
    //Get otp and email
    const { email, otp, newpass } = req.body;

    //Check if email and otp exist
    if (!email || !otp) {
      return res.status(404).json({ success: false, message: "Require OTP and Email" });
    }

    //Find Otp by email (latest)
    const otpfind = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

    //Check if otp exist in database
    if (!otpfind) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Check if expire
    if (otpfind.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    

    //compare otp
    const isValid = await bcrypt.compare(otp, otpfind.otp);

    //Check if enter otp correct
    if (!isValid) {
      return res.status(404).json({ success: false, message: "Otp not correct!" });
    }

    //Check if pass exist
    if (!newpass) {
      return res.status(404).json({ success: false, message: "Require new password" });
    }

    //get the account to update
    const account = await Account.findOne({ email: email });

    //Check if account exist
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //change pass
    account.password = newpass;

    //update account
    await account.save();

    res.status(200).json({ success: true, message: "Account updated sucessfully!" });
  } catch (error) {
    console.error("Error in change pass by OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}