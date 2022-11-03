import jwt from 'jsonwebtoken';

const requireAuth = (req, res) => {
  // const token = req.cookies.jwt
  const { token } = req.body;
  if (token) {
    jwt.verify(token, 'been working since the jump', (err, decodedToken) => {
      if (err) {
        //use decodedToks
        res.json({ message: 'invalid', decodedToken });
      } else {
        // console.log('ded',decodedToken)
        res.json({ message: 'valid', decodedToken });
      }
    });
  } else {
    res.json({ message: 'invalid', decodedToken: '' });
  }
};

export default requireAuth;
