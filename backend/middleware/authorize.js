//after authentication server checks role

const authorize = (...allowedroles)=> //spread operator shallow copy
{
    return(req,res,next)=>
    {
        if( !allowedroles.includes(req.user.role))
        {
            return res.status(403).json({message : "Access denied"});
        }
        next();
    }
}

export default authorize