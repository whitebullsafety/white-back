import pkg from "validator";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../db/Usermodel.js";

const { isEmail, isEmpty } = pkg;

const checkEmail = (email) => {
  let valid = true;
  if (isEmpty(email) || !isEmail(email)) {
    valid = false;
  }
  return valid;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (obj) => {
  //returns a token with a signature and headers are automatically applied
  return jwt.sign(obj, "been working since the jump", {
    expiresIn: maxAge,
  });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const msg = checkUserDetails({ name, email, password });
  try {
    if (msg.name !== "" || msg.email !== "" || msg.password !== "") {
      res.status(400).json({ msg });
    } else {
      const user = await User.create({
        name,
        email,
        password,
        deposit: 0,
        withdrawal: 0,
        balance: 0,
        profits: 0,
      });
      const token = createToken({ user: user._id });

      let msg = `Dear User, Welcome to .
                \nRegards, 
                        \nEnefti`;
      let html = `<div> <div> Dear User,<div/>
                <div>Welcome to .</div>
  
  
                  <div style="padding-top:70px">Regards,<div/>
                  <div>Enefti<div/> <div/>`;
      //sendMailx(msg, email, html, "Successful Registration");
      res.status(201).json({
        user: {
          name: user.name,
          email: user.email,
          password: user.password,
          deposit: 0,
          withdrawal: 0,
          balance: 0,
          profits: 0,
        },
        token,
      });
    }
  } catch (err) {
    console.log({ err });

    let msg = "error signing up";
    if (err.code == "11000") {
      msg = "email has been used by another user";
    }
    const errors = handleErrors(err);
    res.status(400).json({ status: "failed", msg });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });
  const validEmail = checkEmail(email);

  try {
    if (validEmail) {
      const user = await User.findOne({ email });

      if (user !== null && user.password === password) {
        const token = createToken({ user: user._id });

        res.status(201).json({
          user,
          token,
        });
      } else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    } else {
      throw Error;
    }
  } catch (err) {
    // console.log({ err });

    let msg = "error during login";
    console.log({ err });
    res.status(400).json({ status: "failed", msg });
  }
};

const editProfile = async (req, res) => {
  const { email, name, phone } = req.body;

  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { name, phone },
        {
          new: true,
        }
      );

      // sendingMsg('deposit', deposit, 'Update on Deposit', email);
      // sendingMsg('withdrawal', withdrawal, 'Update on Withdrawal', email);
      // sendingMsg('profit', profits, 'Update on Profit', email);

      res.json({ user, msg: "User Edit Successful" });
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const getProfile = async (req, res) => {
  if (!req.body.email) {
    res.json({ error: "User Not Found" });
  }

  const { email } = req.body;

  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      // sendingMsg('deposit', deposit, 'Update on Deposit', email);
      // sendingMsg('withdrawal', withdrawal, 'Update on Withdrawal', email);
      // sendingMsg('profit', profits, 'Update on Profit', email);

      res.json({ user, msg: "User retrieved" });
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const editAccount = async (req, res) => {
  const { email, btc } = req.body;
  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { btc },
        {
          new: true,
        }
      );

      // sendingMsg('deposit', deposit, 'Update on Deposit', email);
      // sendingMsg('withdrawal', withdrawal, 'Update on Withdrawal', email);
      // sendingMsg('profit', profits, 'Update on Profit', email);

      res.json({ user, msg: "User Edit Successful" });
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const handleErrors = (err) => {
  let msg = "error signing up";
};

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json("logout");
};

const checkUserDetails = (details) => {
  let message = { email: "", name: "", password: "" };
  if (!isEmail(details.email)) {
    if (isEmpty(details.email)) {
      message.email = "Email cannot be empty";
    } else {
      message.email = `${details.email} is not a valid email`;
    }
  }
  if (isEmpty(details.name)) message.name = `Name cannot be empty`;
  if (isEmpty(details.password)) {
    message.password = `Password cannot be empty`;
  } else if (details.password.length < 6) {
    message.password = "passord should be more than 6 characters";
  }

  return message;
};

const sendMailx = async (output, email, h, s) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "whitebullsafety.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "support@whitebullsafety.com",
        pass: "Reliefpill$23", // generated ethereal password
      },
    });

    let info = await transporter.sendMail({
      from: '"WhitebullSafety"  <support@whitebullsafety.com>', // sender address
      to: email, // list of receivers
      subject: s, // Subject line
      text: output, // plain text body
      html: h,
    });
  } catch (err) {
    console.log(err);
  }
};

export default { signup, login, logout, editAccount, editProfile, getProfile };
