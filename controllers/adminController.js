import pkg from "validator";
import nodemailer from "nodemailer";
import User from "../db/Usermodel.js";

const { isEmail, isEmpty } = pkg;

// Utility functions
const checkEmail = (email) => {
  let valid = true;
  if (isEmpty(email) || !isEmail(email)) {
    valid = false;
  }
  return valid;
};

const sendMailx = async (output, email, h, s) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "whitebullsafe",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "support@whitebullsafe.com",
        pass: "ethereal$12", // generated ethereal password
      },
    });

    let info = await transporter.sendMail({
      from: '"whitebullsafe" <support@whitebullsafe.com>', // sender address
      to: email, // list of receivers
      subject: s, // Subject line
      text: output, // plain text body
      html: h,
    });
  } catch (err) {
    console.log(err);
  }
};

const sendingMsg = (name, value, heading, email) => {
  edit;
  if (value > 0) {
    const themsg = `Your ${name} of ${value}USD has been approved for your account. 
    \nThank you for choosing whitebull safety . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@whitebull safety \n

    \nRegards, 
    \nwhitebull safety`;

    sendMailx(themsg, email, "", heading);
  }
};

// Controller functions
// get all users
export const allUsers = async (req, res) => {
  const users = await User.find({});

  const filtered = users.filter((user) => user.role !== "admin");

  res.json({ users: filtered, count: filtered.length });
};

// get all withdrawals
export const withdrawals = async (req, res) => {
  const users = await User.find({});
  const filtered = users.filter(
    (user) => user.withdrawal > 0 && user.role !== "admin"
  );

  res.json({ users: filtered, count: filtered.length });
};

// get all deposits
export const deposits = async (req, res) => {
  const users = await User.find({});

  const filtered = users.filter(
    (user) => user.deposit > 0 && user.role !== "admin"
  );

  res.json({
    users: filtered,
    count: filtered.length,
  });
};

export const editUser = async (req, res) => {
  const { email, name, withdrawal, deposit, balance, profits } = req.body;

  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { name, withdrawal, deposit, balance, profits },
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

export const deleteUser = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // console.log('user', user);

  if (!user) {
    // console.log('no user to delete');
    res.json({ msg: "email not found" });
  } else if (user.role !== "admin") {
    //if not the admin delete
    await User.findOneAndRemove({ email });
    res.json({ msg: "user deleted successfully" });
  }
};

export const deposit = async (req, res) => {
  const { email, deposit } = req.body;

  if (!email || !deposit) {
    return res.json({ msg: "Please provide necessary fields" });
  }

  if (checkEmail(email)) {
    let user = await User.findOne({ email });

    if (user) {
      user = await User.findOneAndUpdate(
        { email },
        { deposit },
        {
          new: true,
        }
      );

      let msg = `Your deposit of ${deposit}USD has been made. Login to access your profile.
      For further assistance, you can reach out to support.\n
      
      \nRegards,
      \nwhitebullsafe  Investment.`;

      // sendMailx(msg, email, 'Update on Deposit status.');
      return res.json({ user, msg: "Deposit made" });
    } else {
      return res.json({ err: "user not found" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

export const withdraw = async (req, res) => {
  const { email, withdrawal } = req.body;

  if (!email || !withdrawal) {
    return res.json({ msg: "Please provide necessary fields" });
  }

  if (checkEmail(email)) {
    let user = await User.findOne({ email });

    if (user) {
      user = await User.findOneAndUpdate(
        { email },
        { withdrawal },
        {
          new: true,
        }
      );

      let msg = `${email} just requested a ${withdrawal} withdrawal.

      \nRegards,
      \nwhitebullsafe `;

      // sendMailx(msg, 'support@whitebullsafe.com', 'Withdrawal Requested');

      res.json({ user, msg: "Withdrawal requested" });
    } else {
      res.json({ err: "user not found" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

export const approveDeposit = async (req, res) => {
  const { email, deposit } = req.body;

  try {
    let user = await User.findOne({ email });
    let { balance } = user;

    balance += deposit;

    user = await User.findOneAndUpdate(
      { email },
      { balance, deposit: 0 },
      {
        new: true,
      }
    );

    let msg = `Your Deposit of ${deposit}USD has been approved.
      \nThank you for choosing whitebullsafe. For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@whitebullsafe .com\n

      \nRegards,
      \nwhitebullsafe`;

    // sendMailx(msg, email, 'Update on Deposit status.');

    res.json({ user, msg: "Deposit approved" });
  } catch (err) {
    console.log("approve er", err);
    res.json({ err: "cant approve deposit at this time" });
  }
};

export const approveWithdrawal = async (req, res) => {
  //console.log('w');
  const { email, withdrawal } = req.body;

  try {
    let user = await User.findOne({ email });

    let { balance } = user;

    if (!(balance <= 0)) {
      balance -= withdrawal;
    } else {
      res.json({ error: "insufficient balance" });
    }

    user = await User.findOneAndUpdate(
      { email },
      { balance, withdrawal: 0 },
      {
        new: true,
      }
    );

    let msg = `Your withdrawal of ${withdrawal}USD has been approved.
      \nThank you for choosing whitebullsafe. For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@whitebullsafe .com\n

      \nRegards,
      \nwhitebullsafe`;

    // sendMailx(msg, email, 'Update on withdrawal status.');

    res.json({ user, msg: "Withdrawal approved" });
  } catch (err) {
    // console.log('approve er', err);
    res.json({ err: "cant approve withdrawal at this time" });
  }
};

export const declineDeposit = async (req, res) => {
  const { email, deposit } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { deposit: 0 },
      {
        new: true,
      }
    );

    let msg = `Your Deposit of ${deposit}USD has been declined.
      \nThank you for choosing whitebullsafe . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@whitebullsafe .com\n

      \nRegards,
      \nwhitebullsafe`;

    // sendMailx(msg, email, 'Update on Deposit status.');

    res.json({ user, msg: "Deposit declined" });
  } catch (err) {
    res.json({ err: "cant approve deposit at this time" });
  }
};

export const declineWithdrawal = async (req, res) => {
  const { email, withdrawal } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { withdrawal: 0 },
      {
        new: true,
      }
    );

    let msg = `Your withdrawal of ${withdrawal}USD has been declined.
      \nThank you for choosing whitebullsafe . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@whitebullsafe .com\n

      \nRegards,
      \nwhitebullsafe `;

    // sendMailx(msg, email, 'Update on withdrawal status.');

    res.json({ user, msg: "Withdrawal declined" });
  } catch (err) {
    res.json({ err: "cant approve withdrawal at this time" });
  }
};
