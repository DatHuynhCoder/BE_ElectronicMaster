import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const AccountSchema = new mongoose.Schema({
  username: {type: String, required: true},
  name: {type: String},
  email: {type: String, required: true, unique: true},
  phone: {type: String, required:true, unique: true},
  password: {type: String, required: true},
  birthday: {type: Date, default: Date.now },
  gender: {
    type: String,
    enum: ['Nam','Nữ', 'Khác'],
    default: 'Khác'
  },
  avatar: {
    url: String,
    public_id: String
  },
  role: {
    type: String,
    enum: ['admin','customer'],
    default: 'customer'
  },
  addressList: [{
    name: String,
    address: String,
    phone: String
  }]
}, {
  timestamps: true
})

//Middleware to hash password when change in password property for security purpose
AccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Define matchPassword method to compare pass
AccountSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Account = mongoose.model('Account', AccountSchema);
