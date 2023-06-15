const router = require("express").Router();
const User = require ("../models/User");
const  CryptoJS = require("crypto-js");
const jwt=require ("jsonwebtoken");


//regjstrimi


router.post("/register",async (req,res) =>{
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password,process.env.SECRET_KEY).toString(),
    });

    try{

//dergimi ne databaze


const user = await newUser.save();
res.status(201).json(user);
    }catch (err){
        res.status(500).json(err);
    }
});

//LOGIMI

router.post("/login", async (req,res) =>{
    try{

        //kushtet pa if
      const user= await User.findOne({email:req.body.email});
        !user && res.status(401).json("wrong password or username");
//perdorimi i cryjs per kriptim te passwordave
        const bytes  = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword= bytes.toString(CryptoJS.enc.Utf8);
//perdorimii  webtokenave

          const accessToken=jwt.sign({id:user._id,isAdmin:user.isAdmin},process.env.SECRET_KEY,{expiresIn:"5d"})
        originalPassword !== req.body.password && res.status(401).json("wrong password or username");

        //desktruktorimi i passwordit

        const {password,...info}=user._doc;

        res.status(200).json({ ...info, accessToken });
    }catch(err){
        res.status(500).json(err);
    }
})



module.exports = router;