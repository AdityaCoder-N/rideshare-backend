import jwt from 'jsonwebtoken'

export default fetchUser = (req,res,next)=>{

    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Invalid Authentication Token"});
    }
    try{
        jwt.verify(token,process.env.JWT_SECRET);
        req.user = data.user;

        next();
    }
    catch(error){
        res.status(401).send({error:error})
    }

}